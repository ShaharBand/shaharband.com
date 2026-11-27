import {
  DYE_PER_TRAVEL,
  DYE_RESOLUTION,
  IDLE_MS,
  MAX_DYE,
  MAX_PIXEL_RATIO,
  MAX_SPLAT_GAP,
  MAX_STEP_SECONDS,
  MAX_TRAVEL,
  MIN_HUE_STEP,
  PRESSURE_DECAY,
  PRESSURE_ITERATIONS,
  SIM_RESOLUTION,
  gas,
} from "./settings";
import { FRAGMENT, VERTEX } from "./shaders";
import {
  clearCanvas,
  compileShader,
  createContext,
  createDoubleTarget,
  createProgram,
  createQuad,
  createTarget,
  deleteDoubleTarget,
  deleteTarget,
  render,
  swap,
  type DoubleTarget,
  type Program,
  type Target,
  type Uniforms,
} from "./webgl";

/** A position on the canvas in fractions of its size, with the origin at the bottom left. */
export type Point = { x: number; y: number };

export type Simulation = {
  /** The width of the canvas divided by its height. */
  readonly aspect: number;
  /** Draws the stretch of a stroke that runs from one point to the next. */
  stroke(from: Point, to: Point): void;
  /** Stops the simulation and frees everything it holds. */
  destroy(): void;
};

type Color = [number, number, number];

/** A fully saturated colour at `hue` (0 to 1 around the wheel). */
function neon(hue: number): Color {
  const channel = (offset: number) => {
    const k = (offset + hue * 6) % 6;
    return 1 - Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [channel(5), channel(3), channel(1)];
}

/** Hands out the colour to draw with at a given time: a run of hues, each held for a moment. */
function createPalette(): (now: number) => Color {
  let hue = Math.random();
  let color = neon(hue);
  let changedAt = 0;
  return (now) => {
    if (now - changedAt > 1000 / gas.colorShift) {
      hue = (hue + MIN_HUE_STEP + Math.random() * (1 - 2 * MIN_HUE_STEP)) % 1;
      color = neon(hue);
      changedAt = now;
    }
    return color;
  };
}

/** Starts the fluid on `canvas`, or returns null where the device cannot run it. */
export function createSimulation(canvas: HTMLCanvasElement): Simulation | null {
  const context = createContext(canvas);
  if (!context) return null;
  const { gl, format } = context;

  const quad = createQuad(gl);
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX);
  const program = (fragment: string): Program => createProgram(gl, vertex, fragment);
  const programs = {
    splat: program(FRAGMENT.splat),
    advection: program(FRAGMENT.advection),
    curl: program(FRAGMENT.curl),
    vorticity: program(FRAGMENT.vorticity),
    divergence: program(FRAGMENT.divergence),
    decay: program(FRAGMENT.decay),
    pressure: program(FRAGMENT.pressure),
    gradientSubtract: program(FRAGMENT.gradientSubtract),
    display: program(FRAGMENT.display),
  };

  // The fields. They are reallocated whenever the canvas changes size.

  let velocity!: DoubleTarget;
  let dye!: DoubleTarget;
  let pressure!: DoubleTarget;
  let divergence!: Target;
  let curl!: Target;
  let allocated = false;

  function release() {
    if (!allocated) return;
    for (const field of [velocity, dye, pressure]) deleteDoubleTarget(gl, field);
    for (const field of [divergence, curl]) deleteTarget(gl, field);
    allocated = false;
  }

  /** `base` texels on the short side, scaled up along the long side. */
  function gridSize(base: number): [number, number] {
    const aspect = canvas.width / canvas.height;
    const long = Math.round(base * (aspect < 1 ? 1 / aspect : aspect));
    return aspect < 1 ? [base, long] : [long, base];
  }

  /** Matches the canvas and the fields to the size the canvas is shown at. */
  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (allocated && canvas.width === width && canvas.height === height) return;

    canvas.width = width;
    canvas.height = height;
    release();
    const coarse = gridSize(SIM_RESOLUTION);
    const fine = gridSize(Math.min(DYE_RESOLUTION, width, height));
    velocity = createDoubleTarget(gl, format, ...coarse);
    pressure = createDoubleTarget(gl, format, ...coarse);
    divergence = createTarget(gl, format, ...coarse);
    curl = createTarget(gl, format, ...coarse);
    dye = createDoubleTarget(gl, format, ...fine);
    allocated = true;
  }

  // The passes.

  /** Pushes the fluid at `point` and adds `amount` of `color` dye there. */
  function splat(point: Point, force: [number, number], color: Color, amount: number) {
    const aspect = canvas.width / canvas.height;
    const puff = {
      aspectRatio: aspect,
      point: [point.x, point.y],
      // Distances are measured in canvas heights, so the puff is widened on landscape screens
      // and narrowed on portrait ones to stay in proportion with the short side.
      radius: gas.size * aspect,
    };

    render(gl, programs.splat, velocity.write, {
      ...puff,
      uTarget: velocity.read,
      color: [force[0], force[1], 0],
    });
    swap(velocity);

    render(gl, programs.splat, dye.write, {
      ...puff,
      uTarget: dye.read,
      color: color.map((channel) => channel * amount),
    });
    swap(dye);
  }

  /** Moves the fluid on by `dt` seconds. */
  function step(dt: number) {
    const texelSize = [1 / velocity.read.width, 1 / velocity.read.height];
    const pass = (program: Program, target: Target, uniforms: Uniforms) =>
      render(gl, program, target, { texelSize, ...uniforms });

    pass(programs.curl, curl, { uVelocity: velocity.read });

    pass(programs.vorticity, velocity.write, {
      uVelocity: velocity.read,
      uCurl: curl,
      swirl: gas.swirl,
      dt,
    });
    swap(velocity);

    pass(programs.divergence, divergence, { uVelocity: velocity.read });

    pass(programs.decay, pressure.write, { uTexture: pressure.read, value: PRESSURE_DECAY });
    swap(pressure);

    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      pass(programs.pressure, pressure.write, {
        uPressure: pressure.read,
        uDivergence: divergence,
      });
      swap(pressure);
    }

    pass(programs.gradientSubtract, velocity.write, {
      uPressure: pressure.read,
      uVelocity: velocity.read,
    });
    swap(velocity);

    pass(programs.advection, velocity.write, {
      uVelocity: velocity.read,
      uSource: velocity.read,
      dt,
      dissipation: gas.motionFade,
    });
    swap(velocity);

    pass(programs.advection, dye.write, {
      uVelocity: velocity.read,
      uSource: dye.read,
      dt,
      dissipation: gas.colorFade,
    });
    swap(dye);
  }

  /** Shows the dye on the canvas. */
  function display() {
    render(gl, programs.display, null, {
      uTexture: dye.read,
      texelSize: [1 / dye.read.width, 1 / dye.read.height],
    });
  }

  // The loop. It runs while dye is still fading and sleeps otherwise.

  let frame = 0;
  let lastFrame = 0;
  let lastSplat = -Infinity;
  // Set for good once the context is lost or the simulation is destroyed.
  let stopped = false;

  const fading = (now: number) => now - lastSplat <= IDLE_MS;

  function tick(now: number) {
    frame = 0;
    if (!fading(now)) {
      clearCanvas(gl);
      return;
    }
    resize();
    const dt = Math.min(Math.max((now - lastFrame) / 1000, 0), MAX_STEP_SECONDS);
    lastFrame = now;
    step(dt);
    display();
    frame = requestAnimationFrame(tick);
  }

  function run() {
    if (frame || stopped || document.hidden) return;
    lastFrame = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function pause() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function onVisibilityChange() {
    if (document.hidden) pause();
    else if (fading(performance.now())) run();
  }

  function onContextLost() {
    stopped = true;
    pause();
  }

  // Strokes.

  const palette = createPalette();

  function stroke(from: Point, to: Point) {
    if (stopped) return;
    resize();
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    const aspect = canvas.width / canvas.height;
    if (aspect < 1) dx *= aspect;
    else dy /= aspect;
    const travel = Math.hypot(dx, dy);
    if (travel === 0 || travel > MAX_TRAVEL) return;

    const now = performance.now();
    const elapsed = Math.min((now - lastSplat) / 1000, MAX_SPLAT_GAP);
    const amount = Math.min(elapsed * gas.brightness + travel * DYE_PER_TRAVEL, MAX_DYE);
    splat(to, [dx * gas.throw, dy * gas.throw], palette(now), amount);
    lastSplat = now;
    run();
  }

  function destroy() {
    stopped = true;
    pause();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    release();
    for (const { handle } of Object.values(programs)) gl.deleteProgram(handle);
    gl.deleteShader(vertex);
    gl.deleteBuffer(quad);
  }

  resize();
  document.addEventListener("visibilitychange", onVisibilityChange);
  canvas.addEventListener("webglcontextlost", onContextLost);

  return {
    get aspect() {
      return canvas.width / canvas.height;
    },
    stroke,
    destroy,
  };
}
