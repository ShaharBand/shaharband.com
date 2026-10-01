"use client";

import { useEffect, useRef } from "react";

const CUT_COUNT = 20;
const DASH = 8;
const GAP = 10;

type Cut = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function createRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createCuts(count: number): Cut[] {
  const random = createRandom(0x5f3759df);
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI;
    const length = 26 + random() * 58;
    const centerX = random() * 100;
    const centerY = random() * 100;
    const dx = Math.cos(angle) * (length / 2);
    const dy = Math.sin(angle) * (length / 2);
    return {
      x1: centerX - dx,
      y1: centerY - dy,
      x2: centerX + dx,
      y2: centerY + dy,
    };
  });
}

const cuts = createCuts(CUT_COUNT);

function dashPattern(progress: number) {
  const closed = Math.min(1, Math.max(0, progress));
  return `${DASH + GAP * closed} ${GAP * (1 - closed)}`;
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

    const appearFrames = 8;
    const waveFrames = 16;
    const closeFrames = 10;
    const flashFrames = 8;
    const revealFrames = 10;
    const solidFrame = appearFrames + waveFrames + closeFrames;
    const total = solidFrame + flashFrames + revealFrames;
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
        const start = appearFrames + (index / (CUT_COUNT - 1)) * waveFrames;
        const progress = Math.min(1, Math.max(0, (step - start) / closeFrames));
        const pattern = dashPattern(progress);
        const opacity = step < solidFrame ? 1 : Math.max(0, 1 - (step - solidFrame) / flashFrames);
        for (const line of [pair.glow, pair.core]) {
          line.style.strokeDasharray = pattern;
          line.style.opacity = String(opacity);
        }
      });

      let burst = 0;
      if (step >= solidFrame && step <= solidFrame + flashFrames) {
        const flashT = (step - solidFrame) / flashFrames;
        burst = flashT < 0.3 ? flashT / 0.3 : 1 - (flashT - 0.3) / 0.7;
      }
      flash.style.opacity = String(Math.max(0, burst));

      const reveal = Math.min(1, Math.max(0, (step - solidFrame - 3) / revealFrames));
      motion.style.opacity = String(reveal);
      motion.style.transform = reveal >= 1 ? "" : `translateY(${(1 - reveal) * 14}px)`;
      veil.style.opacity = String(1 - reveal);

      if (step < total) {
        later(tick, 28);
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
