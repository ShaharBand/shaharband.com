/** Shared by every pass: a quad over the whole target, with the four neighbouring texels. */
export const VERTEX = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEADER = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;`;

/** Adds a soft round puff of `color` to a field. */
const splat = `${HEADER}
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + exp(-dot(p, p) / radius) * color, 1.0);
}`;

/** Carries a field along the velocity field and fades it. */
const advection = `${HEADER}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
}`;

/** How strongly the velocity field spins at each texel. */
const curl = `${HEADER}
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

/** Pushes the velocity towards where it already spins, which keeps small swirls alive. */
const vorticity = `${HEADER}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
  gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}`;

/** How much the velocity field piles up or thins out at each texel. */
const divergence = `${HEADER}
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

/** Scales a field down by `value`. */
const decay = `${HEADER}
uniform sampler2D uTexture;
uniform float value;
void main () {
  gl_FragColor = value * texture2D(uTexture, vUv);
}`;

/** One relaxation step towards the pressure that cancels the divergence. */
const pressure = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

/** Removes the pressure gradient from the velocity, which leaves it free of divergence. */
const gradientSubtract = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

// The dye is light added over a transparent canvas: its brightest channel is its coverage, so
// thin smoke is a pale tint of the page ground and overlapping hues glow towards white.
const display = `${HEADER}
uniform sampler2D uTexture;
void main () {
  vec3 color = max(texture2D(uTexture, vUv).rgb, 0.0);

  // Light the dye as a relief: flat areas stay bright, steep edges darken.
  float dx = length(texture2D(uTexture, vR).rgb) - length(texture2D(uTexture, vL).rgb);
  float dy = length(texture2D(uTexture, vT).rgb) - length(texture2D(uTexture, vB).rgb);
  vec3 normal = normalize(vec3(dx, dy, length(vR - vL)));
  color *= clamp(normal.z + 0.7, 0.7, 1.0);

  // Half a level of noise hides the 8-bit steps that show as contour lines while the dye fades.
  float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  float alpha = max(color.r, max(color.g, color.b));
  gl_FragColor = max(vec4(color, alpha) + (noise - 0.5) / 255.0, 0.0);
}`;

/** The fragment shader of each pass. */
export const FRAGMENT = {
  splat,
  advection,
  curl,
  vorticity,
  divergence,
  decay,
  pressure,
  gradientSubtract,
  display,
};
