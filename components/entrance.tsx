"use client";

import { useEffect, useRef } from "react";
import {
  fanTriangles,
  outwardPush,
  polygonArea,
  polygonCentroid,
  splitPolygon,
  type Point,
} from "@/components/glass-shards";

const CUT_COUNT = 20;

type Edge = "top" | "right" | "bottom" | "left";

type Cut = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  weight: number;
};

const EDGES: Edge[] = ["top", "right", "bottom", "left"];

function createRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function pointOnEdge(edge: Edge, distance: number) {
  const along = distance * 100;
  if (edge === "top") return { x: along, y: 0 };
  if (edge === "right") return { x: 100, y: along };
  if (edge === "bottom") return { x: along, y: 100 };
  return { x: 0, y: along };
}

function createCuts(count: number): Cut[] {
  const random = createRandom(0x5f3759df);
  return Array.from({ length: count }, () => {
    const first = Math.floor(random() * EDGES.length);
    let second = Math.floor(random() * (EDGES.length - 1));
    if (second >= first) second += 1;

    const start = pointOnEdge(EDGES[first], 0.06 + random() * 0.88);
    const end = pointOnEdge(EDGES[second], 0.06 + random() * 0.88);
    return {
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      length: Math.hypot(end.x - start.x, end.y - start.y),
      weight: 0.68 + random() * 0.72,
    };
  });
}

const cuts = createCuts(CUT_COUNT);
const DOT = 2.4;
const GAP = 4.6;
const GLOW_WIDTH = 9.1;
const CORE_WIDTH = 1.82;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function easeOut(value: number) {
  const t = clamp(value, 0, 1);
  return 1 - (1 - t) ** 1.8;
}

function paintLine(line: SVGLineElement, length: number, progress: number) {
  if (progress <= 0) {
    line.style.opacity = "0";
    line.style.strokeDasharray = `0 ${length}`;
    line.style.strokeDashoffset = "0";
    return;
  }

  line.style.opacity = "1";
  line.style.strokeDashoffset = "0";

  if (progress >= 1) {
    line.style.strokeDasharray = `${length} 0`;
    return;
  }

  const drawn = length * easeOut(progress);
  const hidden = Math.max(0, length - drawn);
  const solidify = smoothstep(clamp((progress - 0.34) / 0.66, 0, 1));
  const gap = GAP * (1 - solidify);
  const dash = DOT + GAP * solidify;

  if (gap <= 0.08) {
    line.style.strokeDasharray = `${drawn.toFixed(2)} ${hidden.toFixed(2)}`;
    return;
  }

  const parts: number[] = [];
  let covered = 0;

  while (covered < drawn - 0.04 && parts.length < 120) {
    const dashLength = Math.min(dash, drawn - covered);
    parts.push(dashLength);
    covered += dashLength;
    if (covered >= drawn - 0.04) break;
    const gapLength = Math.min(gap, drawn - covered);
    if (gapLength <= 0.04) break;
    parts.push(gapLength);
    covered += gapLength;
  }

  const remainder = length - covered;
  if (remainder > 0.04) {
    if (parts.length % 2 === 1) parts.push(remainder);
    else if (parts.length > 0) parts[parts.length - 1] += remainder;
    else parts.push(0, remainder);
  }

  line.style.strokeDasharray = parts.map((part) => part.toFixed(2)).join(" ");
}

const SVG_NS = "http://www.w3.org/2000/svg";

type Shard = {
  points: Point[];
  cx: number;
  cy: number;
  falling: boolean;
  x: number;
  y: number;
  rot: number;
  vx: number;
  vy: number;
  vr: number;
  group: SVGGElement;
};

function placeShard(shard: Shard) {
  shard.group.setAttribute(
    "transform",
    `translate(${(shard.cx + shard.x).toFixed(2)} ${(shard.cy + shard.y).toFixed(2)}) rotate(${shard.rot.toFixed(2)})`,
  );
  shard.group.setAttribute("data-falling", shard.falling ? "1" : "0");
}

export function Entrance({ children }: { children: React.ReactNode }) {
  const motionRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const motion = motionRef.current;
    const overlay = overlayRef.current;
    const veil = veilRef.current;
    const glass = glassRef.current;
    if (!motion || !overlay || !veil || !glass) return;

    const pairs = Array.from(overlay.querySelectorAll<SVGGElement>("[data-cut]")).map(
      (group) => ({
        glow: group.querySelector<SVGLineElement>(".slice-glow"),
        core: group.querySelector<SVGLineElement>(".slice-core"),
      }),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      motion.style.opacity = "1";
      overlay.remove();
      return;
    }

    const width = overlay.clientWidth || window.innerWidth;
    const height = overlay.clientHeight || window.innerHeight;
    glass.replaceChildren();
    glass.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const random = createRandom(0xa11ce);

    const makeShard = (points: Point[]): Shard => {
      const center = polygonCentroid(points);
      const group = document.createElementNS(SVG_NS, "g");
      const polygon = document.createElementNS(SVG_NS, "polygon");
      polygon.setAttribute("class", "slice-shard");
      polygon.setAttribute(
        "points",
        points
          .map((point) => `${(point.x - center.x).toFixed(2)},${(point.y - center.y).toFixed(2)}`)
          .join(" "),
      );
      group.appendChild(polygon);
      glass.appendChild(group);
      const shard: Shard = {
        points,
        cx: center.x,
        cy: center.y,
        falling: false,
        x: 0,
        y: 0,
        rot: 0,
        vx: 0,
        vy: 0,
        vr: 0,
        group,
      };
      placeShard(shard);
      return shard;
    };

    const reshapeShard = (shard: Shard, points: Point[]) => {
      const center = polygonCentroid(points);
      shard.points = points;
      shard.cx = center.x;
      shard.cy = center.y;
      shard.x = 0;
      shard.y = 0;
      shard.rot = 0;
      const polygon = shard.group.querySelector("polygon");
      polygon?.setAttribute(
        "points",
        points
          .map((point) => `${(point.x - center.x).toFixed(2)},${(point.y - center.y).toFixed(2)}`)
          .join(" "),
      );
      placeShard(shard);
    };

    let shakeBorn = -1;
    let shakeX = 0;
    let shakeY = 0;

    const armShake = (push: Point) => {
      const length = Math.hypot(push.x, push.y) || 1;
      shakeBorn = elapsed;
      shakeX = push.x / length;
      shakeY = push.y / length;
    };

    const shakeTransform = () => {
      if (shakeBorn < 0) return "";
      const local = (elapsed - shakeBorn) / 120;
      if (local < 0 || local >= 1) return "";
      const decay = Math.exp(-local * 4.2);
      const amp = 15 * decay * Math.cos(local * Math.PI * 4);
      const x = shakeX * amp;
      const y = shakeY * amp;
      return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${(amp * 0.04).toFixed(3)}deg)`;
    };

    const releaseShard = (shard: Shard, push: Point, spin: number) => {
      shard.falling = true;
      shard.vx = push.x * (2.6 + random() * 1.8);
      shard.vy = 1.5 + random() * 1.6;
      shard.vr = spin;
      placeShard(shard);
      armShake(push);
    };

    let shards = [
      makeShard([
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height },
      ]),
    ];
    veil.style.display = "none";

    const openCut = (index: number) => {
      const cut = cuts[index];
      const a = { x: (cut.x1 / 100) * width, y: (cut.y1 / 100) * height };
      const b = { x: (cut.x2 / 100) * width, y: (cut.y2 / 100) * height };
      const next: Shard[] = [];
      for (const shard of shards) {
        if (shard.falling) {
          next.push(shard);
          continue;
        }
        const parts = splitPolygon(shard.points, a, b);
        if (!parts) {
          next.push(shard);
          continue;
        }
        const [first, second] = parts;
        const firstIsSmaller = Math.abs(polygonArea(first)) < Math.abs(polygonArea(second));
        const small = firstIsSmaller ? first : second;
        const large = firstIsSmaller ? second : first;
        reshapeShard(shard, large);
        const cutOut = makeShard(small);
        const origin = polygonCentroid(small);
        releaseShard(cutOut, outwardPush(a, b, origin, 1), (random() - 0.5) * 2.6);
        next.push(shard, cutOut);
      }
      shards = next;
    };

    const shatterRest = () => {
      const next: Shard[] = [];
      for (const shard of shards) {
        if (shard.falling) {
          next.push(shard);
          continue;
        }
        const origin = { x: shard.cx, y: shard.cy };
        shard.group.remove();
        for (const triangle of fanTriangles(shard.points)) {
          const piece = makeShard(triangle);
          const center = polygonCentroid(triangle);
          const dx = center.x - origin.x;
          const dy = center.y - origin.y;
          const length = Math.hypot(dx, dy) || 1;
          releaseShard(
            piece,
            { x: dx / length, y: dy / length },
            (random() - 0.5) * 3.4,
          );
          piece.vy += 0.8;
          next.push(piece);
        }
      }
      shards = next;
    };

    const tickMs = 10;
    const cutMs = 100;
    const cutsEnd = 1500;
    const gapMs = (cutsEnd - cutMs) / (CUT_COUNT - 1);
    const fallMs = 640;
    const total = cutsEnd + fallMs;
    const opened = Array.from({ length: CUT_COUNT }, () => false);
    const skipped = Array.from({ length: CUT_COUNT }, () => false);
    let shattered = false;
    let cutsHalted = false;
    let elapsed = 0;
    let timer = 0;
    let cancelled = false;

    const glassRemains = () => shards.some((shard) => !shard.falling);

    const cutHitsGlass = (index: number) => {
      const cut = cuts[index];
      const a = { x: (cut.x1 / 100) * width, y: (cut.y1 / 100) * height };
      const b = { x: (cut.x2 / 100) * width, y: (cut.y2 / 100) * height };
      return shards.some((shard) => !shard.falling && splitPolygon(shard.points, a, b));
    };

    const hideLine = (pair: { glow: SVGLineElement | null; core: SVGLineElement | null }) => {
      if (!pair.glow || !pair.core) return;
      pair.glow.style.opacity = "0";
      pair.core.style.opacity = "0";
    };

    const later = (run: () => void, ms: number) => {
      timer = window.setTimeout(() => {
        if (!cancelled) run();
      }, ms);
    };

    const tick = () => {
      elapsed += tickMs;

      if (!cutsHalted && !glassRemains()) cutsHalted = true;

      pairs.forEach((pair, index) => {
        if (!pair.glow || !pair.core) return;
        const start = index * gapMs;
        const age = elapsed - (start + cutMs);

        if (cutsHalted || skipped[index]) {
          if (!opened[index]) hideLine(pair);
          else if (age > 0) {
            const opacity = String(1 - clamp(age / 80, 0, 1));
            pair.glow.style.opacity = opacity;
            pair.core.style.opacity = opacity;
          }
          return;
        }

        if (elapsed >= start && !opened[index] && !cutHitsGlass(index)) {
          skipped[index] = true;
          hideLine(pair);
          if (!glassRemains()) cutsHalted = true;
          return;
        }

        const progress = clamp((elapsed - start) / cutMs, 0, 1);
        for (const line of [pair.glow, pair.core]) {
          if (!line) continue;
          paintLine(line, cuts[index].length, progress);
        }
        if (age > 0) {
          const opacity = String(1 - clamp(age / 80, 0, 1));
          pair.glow.style.opacity = opacity;
          pair.core.style.opacity = opacity;
        }
        if (!opened[index] && elapsed >= start + cutMs) {
          opened[index] = true;
          openCut(index);
          if (!glassRemains()) cutsHalted = true;
        }
      });

      if (!shattered && !cutsHalted && elapsed >= cutsEnd && glassRemains()) {
        shattered = true;
        shatterRest();
        cutsHalted = true;
      }

      for (const shard of shards) {
        if (!shard.falling) continue;
        shard.vy += 0.7;
        shard.x += shard.vx;
        shard.y += shard.vy;
        shard.rot += shard.vr;
        placeShard(shard);
      }

      const shake = shakeTransform();
      motion.style.transform = shake;
      overlay.style.transform = shake;

      if (elapsed < total) {
        later(tick, tickMs);
        return;
      }

      motion.style.transform = "";
      overlay.remove();
    };

    later(tick, tickMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div ref={motionRef} className="stage-motion">
        {children}
      </div>
      <div ref={overlayRef} className="slice" aria-hidden="true">
        <div ref={veilRef} className="slice-veil" />
        <svg ref={glassRef} className="slice-glass" />
        <svg className="slice-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
          {cuts.map((cut, index) => (
            <g key={index} data-cut={index}>
              <line
                className="slice-glow"
                x1={cut.x1}
                y1={cut.y1}
                x2={cut.x2}
                y2={cut.y2}
                style={{ strokeWidth: GLOW_WIDTH * cut.weight }}
              />
              <line
                className="slice-core"
                x1={cut.x1}
                y1={cut.y1}
                x2={cut.x2}
                y2={cut.y2}
                style={{ strokeWidth: CORE_WIDTH * cut.weight }}
              />
            </g>
          ))}
        </svg>
      </div>
    </>
  );
}
