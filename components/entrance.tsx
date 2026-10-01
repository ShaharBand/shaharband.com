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
    };
  });
}

const cuts = createCuts(CUT_COUNT);

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

    const framesPerCut = 8;
    const flashFrames = 8;
    const revealFrames = 10;
    const cutsEnd = CUT_COUNT * framesPerCut;
    const total = cutsEnd + flashFrames + revealFrames;
    let step = 0;
    let timer = 0;
    let cancelled = false;

    const later = (run: () => void, ms: number) => {
      timer = window.setTimeout(() => {
        if (!cancelled) run();
      }, ms);
    };

    const tick = () => {
      step += 1;

      pairs.forEach((pair, index) => {
        if (!pair.glow || !pair.core) return;
        const start = index * framesPerCut;
        const progress = Math.min(1, Math.max(0, (step - start) / framesPerCut));
        const length = cuts[index].length;
        const drawn = length * (1 - progress);
        for (const line of [pair.glow, pair.core]) {
          line.style.strokeDasharray = String(length);
          line.style.strokeDashoffset = String(progress === 0 ? length : drawn);
          line.style.opacity = progress === 0 ? "0" : "1";
        }
      });

      const fading = Math.min(1, Math.max(0, (step - cutsEnd) / flashFrames));
      if (fading > 0) {
        pairs.forEach((pair) => {
          if (!pair.glow || !pair.core) return;
          const opacity = String(1 - fading);
          pair.glow.style.opacity = opacity;
          pair.core.style.opacity = opacity;
        });
      }

      let burst = 0;
      if (step >= cutsEnd && step <= cutsEnd + flashFrames) {
        const flashT = (step - cutsEnd) / flashFrames;
        burst = flashT < 0.3 ? flashT / 0.3 : 1 - (flashT - 0.3) / 0.7;
      }
      flash.style.opacity = String(Math.max(0, burst));

      const reveal = Math.min(1, Math.max(0, (step - cutsEnd - 3) / revealFrames));
      motion.style.opacity = String(reveal);
      motion.style.transform = reveal >= 1 ? "" : `translateY(${(1 - reveal) * 14}px)`;
      veil.style.opacity = String(1 - reveal);

      if (step < total) {
        later(tick, 24);
        return;
      }

      motion.style.opacity = "1";
      motion.style.transform = "";
      overlay.remove();
    };

    later(tick, 40);
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
              <line className="slice-glow" x1={cut.x1} y1={cut.y1} x2={cut.x2} y2={cut.y2} />
              <line className="slice-core" x1={cut.x1} y1={cut.y1} x2={cut.x2} y2={cut.y2} />
            </g>
          ))}
        </svg>
        <div ref={flashRef} className="slice-flash" />
      </div>
    </>
  );
}
