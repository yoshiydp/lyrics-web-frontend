uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

/* --- Utilities --- */

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = rand(i);
  float b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0));
  float d = rand(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

/* --- Glitch blocks --- */

vec2 glitchOffset(vec2 uv, float t) {
  float blockY  = floor(uv.y * 30.0);
  float trigger = rand(vec2(blockY, floor(t * 8.0)));
  float offset  = 0.0;

  if (trigger > 0.92) {
    offset = (rand(vec2(blockY, t)) - 0.5) * 0.06;
  }

  /* strong glitch burst every ~3 s */
  float burst = step(0.97, rand(vec2(floor(t * 0.5), 0.0)));
  offset += burst * (rand(vec2(uv.y * 50.0, t)) - 0.5) * 0.12;

  return vec2(offset, 0.0);
}

/* --- Scanlines --- */

float scanline(vec2 uv, float t) {
  float line = sin(uv.y * uResolution.y * 0.8 + t * 2.0) * 0.04;
  float roll = sin(uv.y * 3.0 - t * 0.4) * 0.015;
  return line + roll;
}

/* --- Gold accent glow --- */

float goldGlow(vec2 uv, float t) {
  float n = noise(uv * 4.0 + t * 0.3);
  float stripe = abs(sin((uv.x + uv.y * 0.5 + t * 0.05) * 6.28 * 2.0));
  return smoothstep(0.55, 0.75, stripe) * n;
}

/* --- Vignette --- */

float vignette(vec2 uv) {
  vec2 d = uv - 0.5;
  return 1.0 - dot(d, d) * 2.2;
}

/* --- Main --- */

void main() {
  vec2 uv = vUv;

  /* glitch horizontal shift */
  uv += glitchOffset(uv, uTime);

  /* base scanline brightness flicker */
  float scan = scanline(uv, uTime);

  /* --- base dark background --- */
  /* #0D0D0D = (0.051, 0.051, 0.051) */
  vec3 base = vec3(0.051, 0.051, 0.051);

  /* --- RGB chromatic aberration on noise layer --- */
  float splitAmt = 0.004 + 0.003 * sin(uTime * 1.3);
  float noiseR = noise(uv * 8.0 + vec2(uTime * 0.2,  0.0) + vec2( splitAmt, 0.0));
  float noiseG = noise(uv * 8.0 + vec2(uTime * 0.2,  0.0));
  float noiseB = noise(uv * 8.0 + vec2(uTime * 0.2,  0.0) + vec2(-splitAmt, 0.0));
  vec3 noiseColor = vec3(noiseR, noiseG, noiseB) * 0.06;

  /* --- gold (#FFD700 = 1.0, 0.843, 0.0) glow lines --- */
  float glow = goldGlow(uv, uTime);
  vec3 goldColor = vec3(1.0, 0.843, 0.0) * glow * 0.35;

  /* --- subtle purple accent (#6C3483 = 0.424, 0.204, 0.514) --- */
  float purpleNoise = noise(uv * 6.0 - vec2(uTime * 0.15, uTime * 0.1));
  vec3 purpleColor = vec3(0.424, 0.204, 0.514) * step(0.72, purpleNoise) * 0.2;

  /* --- digital scanline tint --- */
  vec3 scanTint = vec3(0.0, 0.8, 1.0) * (scan * 0.5 + 0.5) * 0.04;

  /* --- compose --- */
  vec3 color = base + noiseColor + goldColor + purpleColor + scanTint;

  /* vignette */
  color *= vignette(vUv);

  /* global flicker */
  float flicker = 1.0 - 0.015 * rand(vec2(uTime * 30.0, 0.0));
  color *= flicker;

  gl_FragColor = vec4(color, 1.0);
}
