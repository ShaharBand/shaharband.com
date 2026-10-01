"use client";

import { useEffect, useRef } from "react";

const SPLIT = 34;

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
    const columns = Array.from(motion.querySelectorAll<HTMLElement>(".panel-col"));
    const leftCol = columns[0];
    const rightCol = columns[1];
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
      placeColumns(0);
      if (leftCol) leftCol.style.transform = "";
      if (rightCol) rightCol.style.transform = "";
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      clearCut();
      overlay.remove();
      return;
    }

    panel?.classList.add("is-cut");

    const drawFrames = 14;
    const slideFrames = 32;
    const total = drawFrames + slideFrames;
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
      const draw = Math.min(1, step / drawFrames);
      const slideT = Math.min(1, Math.max(0, (step - drawFrames) / slideFrames));
      const eased = 1 - Math.pow(1 - slideT, 3);
      const shift = eased * 118;

      left.style.transform = `translateX(-${shift}%)`;
      right.style.transform = `translateX(${shift}%)`;

      const lineOpacity = slideT < 0.62 ? 1 : Math.max(0, 1 - (slideT - 0.62) / 0.38);
      const dash = String(110 * (1 - draw));
      glow.style.strokeDashoffset = dash;
      seam.style.strokeDashoffset = dash;
      glow.style.opacity = String(lineOpacity);
      seam.style.opacity = String(lineOpacity);

      let burst = 0;
      if (step >= drawFrames && step <= drawFrames + 7) {
        const f = (step - drawFrames) / 7;
        burst = f < 0.25 ? f / 0.25 : 1 - (f - 0.25) / 0.75;
      }
      flash.style.opacity = String(Math.max(0, burst));

      const split = draw * SPLIT * 0.35 + eased * SPLIT * 0.65;
      placeColumns(Math.max(split, draw * 10));

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
        const remain = SPLIT * (1 - (1 - Math.pow(1 - t, 3)));
        placeColumns(remain);
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
      <noscript>
        <style>{`.slice{display:none}.panel.is-cut{background:rgba(8,9,12,0.72);border-color:rgba(255,255,255,0.16);clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px))}.panel.is-cut .panel-col{background:transparent;border:0;transform:none}`}</style>
      </noscript>
    </>
  );
}
