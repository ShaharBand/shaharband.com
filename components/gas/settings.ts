// Every number that shapes how the gas looks and moves, in one place for tuning.

// Simulation grid sizes, in texels along the short side of the canvas.
export const SIM_RESOLUTION = 128;
export const DYE_RESOLUTION = 1024;
export const MAX_PIXEL_RATIO = 2;

// Fluid behaviour that stays fixed.
export const PRESSURE_ITERATIONS = 20;
export const PRESSURE_DECAY = 0.8;

// The knobs the nav menu changes. The simulation reads them on every frame and every stroke.
export const gas = {
  curl: 100,
  velocityDissipation: 1,
  dyeDissipation: 1.2,
  splatRadius: 0.003,
  splatForce: 6000,
  hueHoldMs: 250,
  brightness: 20,
};

// The simulation never advances further than this in one frame, so a slow frame cannot fling the
// fluid about. Whatever draws strokes over time should keep to the same limit.
export const MAX_STEP_SECONDS = 1 / 60;
// Two stroke points further apart than this are a jump, such as the pointer leaving the window
// and coming back somewhere else, so nothing is drawn between them.
export const MAX_TRAVEL = 0.2;
// The dye has fully faded by then, so the loop can sleep until the next stroke.
export const IDLE_MS = 11_000;

// Each new hue lands at least this far around the wheel from the last, so the change always shows.
export const MIN_HUE_STEP = 0.2;

// Dye is laid down at a steady rate while a stroke moves, so a slow stroke is as vivid as a
// fast one, plus a little more per unit of travel. One splat never adds more than MAX_DYE.
export const DYE_PER_TRAVEL = 4;
export const MAX_DYE = 0.4;
// Longest gap between two splats that still counts as one continuous stroke.
export const MAX_SPLAT_GAP = 1 / 30;
