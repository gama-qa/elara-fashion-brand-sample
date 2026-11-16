/*
  The whole effect layer: one full-screen triangle pair that draws the footage
  with a soft displacement, a wash of page colour, a vignette and film grain.

  All colour maths is in display space (the values the browser would paint),
  so the result matches the CSS version underneath: poster, then a layer of
  page colour at `wash` opacity.

  Coordinates: `uv` in main() runs 0–1 from the top left, like CSS.
*/

export const footageVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const footageFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uA;
  uniform sampler2D uB;
  // xy: the part of the picture the window shows (object-fit: cover). zw: where that part starts.
  uniform vec4 uFitA;
  uniform vec4 uFitB;
  // xy: the point the zoom holds still. z: zoom.
  uniform vec3 uViewA;
  uniform vec3 uViewB;
  uniform float uMix;

  uniform float uWash;
  uniform vec3 uPage;
  uniform float uOpacity;

  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uPointer;
  // x amount, y scale, z speed, w unevenness of the dissolve
  uniform vec4 uDisplace;
  // x amount, y inner, z outer
  uniform vec3 uVignette;
  // x amount, y changes per second, z size in pixels
  uniform vec3 uGrain;

  varying vec2 vUv;

  // Simplex noise, 2D (Ian McEwan, Ashima Arts; MIT licence).
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // One random value per pixel (Dave Hoskins, "hash without sine").
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec3 footage(sampler2D map, vec4 fit, vec3 view, vec2 uv) {
    vec2 zoomed = (uv - view.xy) / view.z + view.xy;
    vec2 at = fit.zw + zoomed * fit.xy;
    return texture2D(map, vec2(at.x, 1.0 - at.y)).rgb;
  }

  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

    // Displacement: two slow fields of swells push the picture a few pixels.
    vec2 field = vec2(uv.x * uAspect, uv.y) * uDisplace.y;
    float drift = uTime * uDisplace.z;
    vec2 flow = vec2(
      snoise(field + vec2(drift, -drift * 0.7)),
      snoise(field + vec2(31.7 - drift * 0.6, 12.3 + drift))
    );
    vec2 at = uv + flow * uDisplace.x + uPointer;

    // The same swells make the dissolve arrive unevenly, like light moving
    // across a wall, instead of as a flat fade. Both clips are always sampled:
    // a texture read inside a branch makes the Direct3D compiler complain.
    float mixed = clamp(uMix + flow.x * uDisplace.w * sin(uMix * 3.14159265), 0.0, 1.0);
    vec3 color = mix(footage(uA, uFitA, uViewA, at), footage(uB, uFitB, uViewB, at), mixed);

    // Vignette and grain belong to the footage: they fade out with it, so a
    // fully washed page is exactly the flat page colour.
    float film = 1.0 - smoothstep(0.7, 1.0, uWash);

    vec2 fromCentre = (uv - 0.5) * vec2(mix(1.0, uAspect, 0.35), 1.0) * 2.0;
    float edge = smoothstep(uVignette.y, uVignette.z, length(fromCentre) / 1.4142);
    color *= 1.0 - edge * uVignette.x * film;

    color = mix(color, uPage, uWash);

    float tick = floor(uTime * uGrain.y);
    float noise = hash(floor(gl_FragCoord.xy / uGrain.z) + tick * 17.0) - 0.5;
    color += noise * uGrain.x * film;

    // Premultiplied alpha: where the footage has not arrived yet the canvas is
    // clear and the poster underneath shows.
    gl_FragColor = vec4(clamp(color, 0.0, 1.0) * uOpacity, uOpacity);
  }
`;
