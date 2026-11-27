import type { Point, Simulation } from "./simulation";

/**
 * Draws a stroke on `gas` wherever the mouse or a finger moves over the page. Returns a function
 * that stops following.
 */
export function followPointer(canvas: HTMLCanvasElement, gas: Simulation): () => void {
  let last: Point | null = null;

  function move(clientX: number, clientY: number) {
    const bounds = canvas.getBoundingClientRect();
    const point = {
      x: (clientX - bounds.left) / bounds.width,
      y: 1 - (clientY - bounds.top) / bounds.height,
    };
    if (last) gas.stroke(last, point);
    last = point;
  }

  function onPointerMove(event: PointerEvent) {
    // Touch is handled by the touch listeners, which keep firing while the browser pans.
    if (event.pointerType !== "touch") move(event.clientX, event.clientY);
  }

  function onTouchStart(event: TouchEvent) {
    // A new touch starts a new stroke instead of joining up with where the last one ended.
    last = null;
    onTouchMove(event);
  }

  function onTouchMove(event: TouchEvent) {
    const touch = event.touches[0];
    if (touch) move(touch.clientX, touch.clientY);
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
  };
}
