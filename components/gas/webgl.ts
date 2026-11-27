export type GL = WebGLRenderingContext | WebGL2RenderingContext;
export type TextureFormat = { internal: number; type: number; filter: number };

/** A texture that can be rendered into. */
export type Target = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
};

/** A field that is updated from its own previous state: read one side, write the other, swap. */
export type DoubleTarget = { read: Target; write: Target };

export type Program = {
  handle: WebGLProgram;
  uniform: (name: string) => WebGLUniformLocation | null;
};

/** What a pass feeds its shader: a texture to sample, a float, or a vector of two or three floats. */
export type Uniforms = Record<string, Target | number | readonly number[]>;

/** A context that can render to half-float textures, or null where the device cannot. */
export function createContext(
  canvas: HTMLCanvasElement,
): { gl: GL; format: TextureFormat } | null {
  const attributes: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: true,
    depth: false,
    stencil: false,
    antialias: false,
  };
  const gl2 = canvas.getContext("webgl2", attributes);
  const gl: GL | null = gl2 ?? canvas.getContext("webgl", attributes);
  if (!gl) return null;

  let format: TextureFormat;
  if (gl2) {
    gl2.getExtension("EXT_color_buffer_float");
    gl2.getExtension("EXT_color_buffer_half_float");
    format = { internal: gl2.RGBA16F, type: gl2.HALF_FLOAT, filter: gl2.LINEAR };
  } else {
    const halfFloat = gl.getExtension("OES_texture_half_float");
    if (!halfFloat) return null;
    gl.getExtension("EXT_color_buffer_half_float");
    const linear = gl.getExtension("OES_texture_half_float_linear");
    format = {
      internal: gl.RGBA,
      type: halfFloat.HALF_FLOAT_OES,
      filter: linear ? gl.LINEAR : gl.NEAREST,
    };
  }

  gl.clearColor(0, 0, 0, 0);
  gl.disable(gl.BLEND);

  // Some devices accept half-float textures but cannot render into them.
  const probe = createTarget(gl, format, 4, 4);
  const renderable = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  deleteTarget(gl, probe);
  return renderable ? { gl, format } : null;
}

export function createTarget(
  gl: GL,
  format: TextureFormat,
  width: number,
  height: number,
): Target {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, format.filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, format.filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, gl.RGBA, format.type, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { texture, fbo, width, height };
}

export function deleteTarget(gl: GL, target: Target) {
  gl.deleteTexture(target.texture);
  gl.deleteFramebuffer(target.fbo);
}

export function createDoubleTarget(
  gl: GL,
  format: TextureFormat,
  width: number,
  height: number,
): DoubleTarget {
  return {
    read: createTarget(gl, format, width, height),
    write: createTarget(gl, format, width, height),
  };
}

export function deleteDoubleTarget(gl: GL, target: DoubleTarget) {
  deleteTarget(gl, target.read);
  deleteTarget(gl, target.write);
}

/** Makes what was just written the side that is read next. */
export function swap(target: DoubleTarget) {
  const { read } = target;
  target.read = target.write;
  target.write = read;
}

export function compileShader(gl: GL, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function createProgram(gl: GL, vertex: WebGLShader, fragmentSource: string): Program {
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const handle = gl.createProgram()!;
  gl.attachShader(handle, vertex);
  gl.attachShader(handle, fragment);
  gl.bindAttribLocation(handle, 0, "aPosition");
  gl.linkProgram(handle);
  gl.deleteShader(fragment);

  const locations = new Map<string, WebGLUniformLocation | null>();
  return {
    handle,
    uniform(name) {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(handle, name));
      return locations.get(name) ?? null;
    },
  };
}

/** The quad every pass draws, bound to vertex attribute 0 where the programs expect it. */
export function createQuad(gl: GL): WebGLBuffer {
  const quad = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return quad;
}

/** Runs `program` over every texel of `target`, or over the canvas when `target` is null. */
export function render(gl: GL, program: Program, target: Target | null, uniforms: Uniforms) {
  gl.useProgram(program.handle);
  let unit = 0;
  for (const [name, value] of Object.entries(uniforms)) {
    const location = program.uniform(name);
    if (typeof value === "number") {
      gl.uniform1f(location, value);
    } else if ("texture" in value) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, value.texture);
      gl.uniform1i(location, unit++);
    } else if (value.length === 2) {
      gl.uniform2f(location, value[0], value[1]);
    } else {
      gl.uniform3f(location, value[0], value[1], value[2]);
    }
  }

  if (target) {
    gl.viewport(0, 0, target.width, target.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
  } else {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/** Wipes the canvas back to fully transparent. */
export function clearCanvas(gl: GL) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
