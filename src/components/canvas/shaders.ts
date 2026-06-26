export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  /* clip space 直接出力: カメラ・アスペクト比に関係なく常にフルスクリーン */
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
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

/* --- Simulated audio bands (bass 除去済み) --- */

float mid(float t) {
  return pow(abs(sin(t * 1.2)), 3.0);
}

float treble(float t) {
  return pow(abs(sin(t * 2.2 + 0.7)), 4.0);
}

/* --- Glitch blocks --- */

vec2 glitchOffset(vec2 uv, float t) {
  float blockY  = floor(uv.y * 30.0);
  float trigger = rand(vec2(blockY, floor(t * 2.5)));
  float offset  = 0.0;

  if (trigger > 0.95) {
    offset = (rand(vec2(blockY, t)) - 0.5) * 0.03;
  }

  float burst = step(0.985, rand(vec2(floor(t * 0.2), 0.0)));
  offset += burst * (rand(vec2(uv.y * 50.0, t)) - 0.5) * 0.06;

  return vec2(offset, 0.0);
}

/* --- Vignette --- */

float vignette(vec2 uv) {
  vec2 d = uv - 0.5;
  return 1.0 - dot(d, d) * 2.0;
}

/* --- Main --- */

void main() {
  vec2 uv = vUv;

  uv += glitchOffset(uv, uTime);

  float aspect   = uResolution.x / uResolution.y;
  vec2  centered = (uv - 0.5) * vec2(aspect, 1.0);
  float dist     = length(centered);

  float m  = mid(uTime);
  float tr = treble(uTime);

  /* --- concentric wave rings --- */
  float ring1 = sin(dist * 22.0 - uTime * 1.6) * 0.5 + 0.5;
  float ring2 = sin(dist * 13.0 - uTime * 1.1 + m  * 0.8) * 0.5 + 0.5;
  float ring3 = sin(dist * 34.0 - uTime * 2.4 + tr * 1.5) * 0.5 + 0.5;

  float ringFade = smoothstep(0.0, 0.15, dist) * smoothstep(0.95, 0.5, dist);
  float rings    = (ring1 * 0.4 + ring2 * m * 0.7 + ring3 * tr * 0.4) * ringFade;

  /* --- horizontal waveform --- */
  float wx   = uv.x;
  float wave = sin(wx * 40.0  + uTime * 0.07) * 0.008 * (0.3 + m  * 0.4)
             + sin(wx * 73.0  - uTime * 0.11) * 0.004 * (0.2 + m  * 0.3)
             + sin(wx * 137.0 + uTime * 0.17) * 0.002 * (0.15 + tr * 0.3);

  float waveCenter = 0.52;  /* 0.5 = 中央, 小さくするほど上 */
  float waveY    = abs(uv.y - waveCenter - wave);
  float waveform = smoothstep(0.008, 0.0, waveY);

  float wave2  = sin(wx * 29.0 - uTime * 0.05) * 0.010 * 0.5
               + sin(wx * 53.0 + uTime * 0.09) * 0.005 * m;
  float waveY2 = abs(uv.y - waveCenter - wave2);
  float waveform2 = smoothstep(0.005, 0.0, waveY2) * 0.5;

  /* --- purple palette --- */
  vec3 purpleDark  = vec3(0.16, 0.06, 0.24);
  vec3 purpleMid   = vec3(0.424, 0.204, 0.514);
  vec3 purpleLight = vec3(0.58, 0.32, 0.70);

  vec3 base = mix(purpleDark, purpleMid,  rings * 0.6);
  base      = mix(base,       purpleLight, rings * rings * 0.35);

  vec3 gold = vec3(1.0, 0.843, 0.0);
  base += gold * waveform  * (0.06 + m * 0.04);
  base += gold * waveform2 * (0.03 + m * 0.02);
  /* --- RGB chromatic aberration --- */
  float split  = 0.002 + 0.001 * sin(uTime * 0.6);
  float noiseR = noise(uv * 6.0 + vec2( split, 0.0) + uTime * 0.03);
  float noiseB = noise(uv * 6.0 + vec2(-split, 0.0) + uTime * 0.03);
  base.r += (noiseR - 0.5) * 0.02;
  base.b += (noiseB - 0.5) * 0.02;

  base *= vignette(vUv);

  gl_FragColor = vec4(base, 1.0);
}
`;
