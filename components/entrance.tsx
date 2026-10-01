"use client";

import { useEffect, useRef } from "react";

export function Entrance({ children }: { children: React.ReactNode }) {
  const motionRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const motion = motionRef.current;
    const overlay = overlayRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const seam = seamRef.current;
    if (!motion || !overlay || !left || !right || !seam) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      motion.style.opacity = "1";
      motion.style.transform = "none";
      overlay.remove();
      return;
    }

    const hold = 8;
    const move = 36;
    let step = -hold;
    let timer = 0;

    const tick = () => {
      step += 1;
      const p = Math.min(1, Math.max(0, step / move));
      const eased = 1 - Math.pow(1 - p, 3);
      const shift = eased * 115;
      left.style.transform = `translateX(-${shift}%)`;
      right.style.transform = `translateX(${shift}%)`;

      const cut = Math.min(1, Math.max(0, (step + hold) / 10));
      const seamOpacity = p < 0.35 ? cut : Math.max(0, 1 - (p - 0.35) / 0.3);
      seam.style.strokeDashoffset = String(110 * (1 - cut));
      seam.style.opacity = String(seamOpacity);

      if (step < move) {
        timer = window.setTimeout(tick, 28);
        return;
      }

      overlay.remove();
    };

    timer = window.setTimeout(tick, 36);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <div ref={motionRef} className="stage-motion">
        {children}
      </div>
      <div ref={overlayRef} className="slice" aria-hidden="true">
        <div ref={leftRef} className="slice-panel slice-left" />
        <div ref={rightRef} className="slice-panel slice-right" />
        <svg className="slice-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line ref={seamRef} x1="66" y1="0" x2="34" y2="100" />
        </svg>
      </div>
      <noscript>
        <style>{`.slice{display:none}.stage-motion{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>
    </>
  );
}
