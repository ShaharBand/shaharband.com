"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gas } from "@/components/gas/settings";

type Knob = keyof typeof gas;

// `view` and `store` remap the slider. `text` is the number with its unit.
const KNOBS: {
  key: Knob;
  label: string;
  min: number;
  max: number;
  step: number;
  view?: (stored: number) => number;
  store?: (shown: number) => number;
  text: (stored: number) => string;
}[] = [
  { key: "curl", label: "Swirl", min: 0, max: 200, step: 1, text: (n) => reading(n) },
  { key: "splatForce", label: "Throw", min: 500, max: 12000, step: 100, text: (n) => reading(n) },
  {
    key: "splatRadius",
    label: "Size",
    min: 0.0005,
    max: 0.008,
    step: 0.0001,
    text: (n) => `${(n * 100).toFixed(2)}%`,
  },
  { key: "brightness", label: "Brightness", min: 1, max: 20, step: 0.5, text: (n) => reading(n) },
  {
    key: "dyeDissipation",
    label: "Color fade",
    min: 0.2,
    max: 5,
    step: 0.1,
    text: (n) => `${reading(n)}/s`,
  },
  {
    key: "velocityDissipation",
    label: "Motion fade",
    min: 0,
    max: 4,
    step: 0.1,
    text: (n) => `${reading(n)}/s`,
  },
  {
    key: "hueHoldMs",
    label: "Color shift",
    min: 1,
    max: 25,
    step: 1,
    view: (ms) => Math.round(1000 / ms),
    store: (perSecond) => Math.round(1000 / perSecond),
    text: (ms) => `${Math.round(1000 / ms)}/s`,
  },
];

/** A short reading of a knob: whole numbers stay whole, the rest keep one to three digits. */
function reading(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 1000) / 1000);
}

/** The tornado button that opens the gas knobs. Sits where the name used to be. */
export function GasMenu() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(gas);
  const menu = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function change(key: Knob, value: number) {
    gas[key] = value;
    setValues({ ...gas });
  }

  return (
    <div className="nav-menu" ref={menu}>
      <button
        type="button"
        className="nav-link nav-menu-button"
        aria-label="Gas settings"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
          <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
          <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
        </svg>
      </button>
      {open && (
        <div className="nav-panel" id={panelId} role="dialog" aria-label="Gas settings">
          <p className="nav-panel-title">Gas</p>
          {KNOBS.map((knob) => (
            <label className="nav-setting" key={knob.key}>
              <span>{knob.label}</span>
              <input
                type="range"
                min={knob.min}
                max={knob.max}
                step={knob.step}
                value={knob.view ? knob.view(values[knob.key]) : values[knob.key]}
                onChange={(event) => {
                  const shown = Number(event.target.value);
                  change(knob.key, knob.store ? knob.store(shown) : shown);
                }}
              />
              <output>{knob.text(values[knob.key])}</output>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
