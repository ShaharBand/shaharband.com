"use client";

import { useEffect, useRef } from "react";

const SPLIT = 34;
const DASH = 8;
const GAP = 10;

function dashPattern(progress: number) {
  const closed = Math.min(1, Math.max(0, progress));
  const dash = DASH + GAP * closed;
  const gap = GAP * (1 - closed);
  return `${dash} ${gap}`;
}

export function Entrance({ children }: { children: React.ReactNode }) {
  const motionRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<SVGLineElement>(null);
  const seamRef = useRef<SVGLineElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = motionRef.current;
    const overlay = overlayRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const glow = glowRef.current;
    const seam = seamRef.current;
    const flash = flashRef.current;
    if (!motion || !overlay || !left || !right || !glow || !seam || !flash) return;

    const panel = motion.querySelector<HTMLElement>(".panel");
    const leftCol = motion.querySelector<HTMLElement>('[data-cut-side="start"]');
    const rightCol = motion.querySelector<HTMLElement>('[data-cut-side="end"]');
    const stacked = window.matchMedia("(max-width: 879px)").matches;

    const placeColumns = (amount: number) => {
      if (!leftCol || !rightCol) return;
      if (stacked) {
        leftCol.style.transform = `translateY(-${amount}px)`;
        rightCol.style.transform = `translateY(${amount}px)`;
        return;
      }
      leftCol.style.transform = `translateX(-${amount}px)`;
      rightCol.style.transform = `translateX(${amount}px)`;
    };

    const clearCut = () => {
      panel?.classList.remove("is-cut");
      if (leftCol) leftCol.style.transform = "";
      if (rightCol) rightCol.style.transform = "";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearCut();
      overlay.remove();
      return;
    }

    panel?.classList.add("is-cut");

    const lines = [glow, seam];
    const holdFrames = 8;
    const closeFrames = 12;
    const slideFrames = 28;
    const total = holdFrames + closeFrames + slideFrames;
    let step = 0;
    let timer = 0;
    let cancelled = false;

    const later = (run: () => void, ms: number) => {
      timer = window.setTimeout(() => {
        if (!cancelled) run();
      }, ms);
    };

    const paintLine = (progress: number, opacity: number) => {
      const pattern = dashPattern(progress);
      for (const line of lines) {
        line.style.strokeDasharray = pattern;
        line.style.strokeDashoffset = "0";
        line.style.opacity = String(opacity);
      }
    };

    const tick = () => {
      step += 1;

      const closeT = Math.min(1, Math.max(0, (step - holdFrames) / closeFrames));
      const slideT = Math.min(1, Math.max(0, (step - holdFrames - closeFrames) / slideFrames));
      const eased = 1 - Math.pow(1 - slideT, 3);
      const shift = eased * 118;

      left.style.transform = `translateX(-${shift}%)`;
      right.style.transform = `translateX(${shift}%)`;

      const lineOpacity = slideT < 0.62 ? 1 : Math.max(0, 1 - (slideT - 0.62) / 0.38);
      paintLine(closeT, lineOpacity);

      let burst = 0;
      const flashStart = holdFrames + closeFrames;
      if (step >= flashStart && step <= flashStart + 7) {
        const flashT = (step - flashStart) / 7;
        burst = flashT < 0.25 ? flashT / 0.25 : 1 - (flashT - 0.25) / 0.75;
      }
      flash.style.opacity = String(Math.max(0, burst));

      const split = closeT * SPLIT * 0.35 + eased * SPLIT * 0.65;
      placeColumns(split);

      if (step < total) {
        later(tick, 30);
        return;
      }

      overlay.remove();
      let back = 0;
      const settleFrames = 12;
      const settle = () => {
        back += 1;
        const t = Math.min(1, back / settleFrames);
        placeColumns(SPLIT * Math.pow(1 - t, 3));
        if (back < settleFrames) {
          later(settle, 26);
          return;
        }
        clearCut();
      };
      later(settle, 26);
    };

    later(tick, 40);
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
        <div ref={leftRef} className="slice-panel slice-left" />
        <div ref={rightRef} className="slice-panel slice-right" />
        <div ref={flashRef} className="slice-flash" />
        <svg className="slice-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line ref={glowRef} className="slice-glow" x1="66" y1="0" x2="34" y2="100" />
          <line ref={seamRef} className="slice-core" x1="66" y1="0" x2="34" y2="100" />
        </svg>
      </div>
    </>
  );
}
