import type { Point, Simulation } from "./simulation";

/**
 * Draws a stroke on `gas` wherever the mouse or a finger moves over the page. Returns a function
 * that stops following.
 */
export function followPointer(canvas: HTMLCanvasElement, gas: Simulation): () => void {
  let last: Point | null = null;
  let drawing = false;

  function move(clientX: number, clientY: number) {
    const bounds = canvas.getBoundingClientRect();
    const point = {
      x: (clientX - bounds.left) / bounds.width,
      y: 1 - (clientY - bounds.top) / bounds.height,
    };
    if (last) gas.stroke(last, point);
    last = point;
  }

  /** Links, the menu button, and the sliders keep their own gestures. */
  function interactive(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest("a, button, input, label"));
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType !== "touch") move(event.clientX, event.clientY);
  }

  function onTouchStart(event: TouchEvent) {
    drawing = !interactive(event.target);
    if (!drawing) return;
    // A new touch starts a new stroke instead of joining up with where the last one ended.
    last = null;
    onTouchMove(event);
  }

  function onTouchMove(event: TouchEvent) {
    if (!drawing) return;
    if (event.cancelable) event.preventDefault();
    const touch = event.touches[0];
    if (touch) move(touch.clientX, touch.clientY);
  }

  function onTouchEnd() {
    drawing = false;
    last = null;
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("touchstart", onTouchStart, { passive: false });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchcancel", onTouchEnd);

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
  };
}
