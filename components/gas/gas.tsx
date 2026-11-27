"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { followPointer } from "./pointer";
import { createSimulation, type Simulation } from "./simulation";

const GasContext = createContext<Simulation | null>(null);

/**
 * The simulation behind the nearest `<Gas>`, for components that draw on it. It is null until the
 * gas has started, and stays null where it cannot run or the visitor asked for reduced motion.
 */
export function useGas(): Simulation | null {
  return useContext(GasContext);
}

/** A page-wide canvas of coloured gas that trails the pointer. Children can draw on it too. */
export function Gas({ children }: { children?: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [simulation, setSimulation] = useState<Simulation | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const created = createSimulation(canvas.current);
    if (!created) return;
    const unfollow = followPointer(canvas.current, created);
    setSimulation(created);

    return () => {
      setSimulation(null);
      unfollow();
      created.destroy();
    };
  }, []);

  return (
    <GasContext.Provider value={simulation}>
      <canvas ref={canvas} className="gas" aria-hidden="true" />
      {children}
    </GasContext.Provider>
  );
}
