"use client";

import { useEffect } from "react";
import { useGas } from "./gas";
import { MAX_STEP_SECONDS } from "./settings";
import type { Point, Simulation } from "./simulation";

/**
 * A stroke that draws itself: how long it takes, and where it is at `progress` (0 to 1) on a
 * canvas whose width divided by its height is `aspect`.
 */
type Movement = { seconds: number; at: (progress: number, aspect: number) => Point };

/** Slithers across the page from left to right, crossing behind the name. */
const snake: Movement = {
  seconds: 1.5,
  at: (progress) => ({
    x: 0.08 + 0.84 * progress,
    y: 0.5 + 0.16 * Math.sin(progress * Math.PI * 4),
  }),
};

const TORNADO_LOOPS = 3;
// How far the outermost loop reaches from the middle of the page, as a fraction of its short side.
const TORNADO_RADIUS = 0.36;

/** Spirals out from the middle of the page in round loops, like a tornado seen from above. */
const tornado: Movement = {
  seconds: 1,
  at: (progress, aspect) => {
    // Angle and radius both grow with the square root of progress, which spaces the loops evenly
    // and keeps the stroke at one speed all the way out.
    const reach = Math.sqrt(progress);
    const angle = reach * TORNADO_LOOPS * Math.PI * 2;
    const radius = reach * TORNADO_RADIUS;
    // The radius is measured on the short side, so the loops are circles on any screen shape.
    return {
      x: 0.5 + (radius * Math.cos(angle)) / Math.max(aspect, 1),
      y: 0.5 + radius * Math.sin(angle) * Math.min(aspect, 1),
    };
  },
};

const MOVEMENTS = [snake, tornado];

/** Draws one of the movements on `gas`, picked at random. Returns a function that cuts it short. */
function play(gas: Simulation): () => void {
  const movement = MOVEMENTS[Math.floor(Math.random() * MOVEMENTS.length)];
  let time = 0;
  let lastFrame = performance.now();

  function draw(now: number) {
    const from = movement.at(time / movement.seconds, gas.aspect);
    const dt = Math.min(Math.max((now - lastFrame) / 1000, 0), MAX_STEP_SECONDS);
    lastFrame = now;
    time = Math.min(time + dt, movement.seconds);
    gas.stroke(from, movement.at(time / movement.seconds, gas.aspect));
    frame = time < movement.seconds ? requestAnimationFrame(draw) : 0;
  }

  let frame = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(frame);
}

/** Opens the page with a stroke that draws itself. Render it inside `<Gas>`. */
export function GasIntro() {
  const gas = useGas();

  useEffect(() => {
    if (gas) return play(gas);
  }, [gas]);

  return null;
}
