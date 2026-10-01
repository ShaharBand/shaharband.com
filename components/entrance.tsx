"use client";

import { useEffect, useRef } from "react";

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
const GLOW_WIDTH = 13;
const CORE_WIDTH = 2.6;

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

function cutShake(elapsed: number, cutMs: number, gapMs: number) {
  const cutsEnd = (CUT_COUNT - 1) * gapMs + cutMs;
  if (elapsed <= 0 || elapsed >= cutsEnd) return "";
  const index = Math.min(CUT_COUNT - 1, Math.floor(elapsed / gapMs));
  const cut = cuts[index];
  if (!cut) return "";

  const local = (elapsed - index * gapMs) / cutMs;
  if (local >= 1) return "";
  const dx = cut.x2 - cut.x1;
  const dy = cut.y2 - cut.y1;
  const len = Math.hypot(dx, dy) || 1;
  const across = -dy / len;
  const along = dx / len;
  const nx = across * 0.9 + along * 0.28;
  const ny = dx / len * 0.9 + dy / len * 0.28;
  const normal = Math.hypot(nx, ny) || 1;
  const decay = Math.exp(-local * 4.4);
  const amp = (13 + cut.weight * 4) * decay * Math.sin(local * Math.PI * 7);
  const x = (nx / normal) * amp;
  const y = (ny / normal) * amp;
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${(amp * 0.04).toFixed(3)}deg)`;
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

export function Entrance({ children }: { children: React.ReactNode }) {
  const motionRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = motionRef.current;
    const overlay = overlayRef.current;
    const veil = veilRef.current;
    const flash = flashRef.current;
    if (!motion || !overlay || !veil || !flash) return;

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

    const tickMs = 10;
    const cutMs = 100;
    const gapMs = 90;
    const flashMs = 140;
    const revealMs = 160;
    const cutsEnd = (CUT_COUNT - 1) * gapMs + cutMs;
    const total = cutsEnd + flashMs + revealMs;
    let elapsed = 0;
    let timer = 0;
    let cancelled = false;

    const later = (run: () => void, ms: number) => {
      timer = window.setTimeout(() => {
        if (!cancelled) run();
      }, ms);
    };

    const tick = () => {
      elapsed += tickMs;

      pairs.forEach((pair, index) => {
        if (!pair.glow || !pair.core) return;
        const progress = clamp((elapsed - index * gapMs) / cutMs, 0, 1);
        for (const line of [pair.glow, pair.core]) {
          if (!line) continue;
          paintLine(line, cuts[index].length, progress);
        }
      });

      const fading = clamp((elapsed - cutsEnd) / flashMs, 0, 1);
      if (fading > 0) {
        pairs.forEach((pair) => {
          if (!pair.glow || !pair.core) return;
          const opacity = String(1 - smoothstep(fading));
          pair.glow.style.opacity = opacity;
          pair.core.style.opacity = opacity;
        });
      }

      let burst = 0;
      if (elapsed >= cutsEnd && elapsed <= cutsEnd + flashMs) {
        const flashT = (elapsed - cutsEnd) / flashMs;
        burst = flashT < 0.28 ? flashT / 0.28 : 1 - (flashT - 0.28) / 0.72;
      }
      flash.style.opacity = String(Math.max(0, burst));

      const reveal = smoothstep(clamp((elapsed - cutsEnd - 70) / revealMs, 0, 1));
      const shake = cutShake(elapsed, cutMs, gapMs);
      const rise = reveal >= 1 ? "" : `translateY(${((1 - reveal) * 14).toFixed(2)}px)`;
      motion.style.opacity = String(reveal);
      motion.style.transform = [shake, rise].filter(Boolean).join(" ");
      overlay.style.transform = shake;
      veil.style.opacity = String(1 - reveal);

      if (elapsed < total) {
        later(tick, tickMs);
        return;
      }

      motion.style.opacity = "1";
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
      <div ref={motionRef} className="stage-motion" style={{ opacity: 0 }}>
        {children}
      </div>
      <div ref={overlayRef} className="slice" aria-hidden="true">
        <div ref={veilRef} className="slice-veil" />
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
        <div ref={flashRef} className="slice-flash" />
      </div>
    </>
  );
}
