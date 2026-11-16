"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  NormalBlending,
  type Points,
  ShaderMaterial,
} from "three";
import { setPalette } from "@/lib/palette";
import { sceneConfig } from "../config";

/** Hard ceiling, whatever the config says. */
const MAX_MOTES = 300;

/** Small seeded generator, so the dust field is identical on every load. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uViewportHeight;
  attribute vec4 aSeed;
  varying float vFade;

  void main() {
    // Each mote wanders on its own slow loop; nothing is updated on the CPU.
    vec3 p = position;
    p.x += sin(uTime * (0.5 + aSeed.x) + aSeed.y * 6.283) * 0.4;
    p.y += sin(uTime * (0.3 + aSeed.z) + aSeed.x * 6.283) * 0.3;
    p.z += cos(uTime * (0.4 + aSeed.y) + aSeed.z * 6.283) * 0.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    gl_Position = projectionMatrix * mv;

    // World-space diameter converted to pixels at this depth.
    float size = uSize * (0.5 + aSeed.w) * projectionMatrix[1][1] * uViewportHeight * 0.5 / depth;
    gl_PointSize = clamp(size, 1.0, 14.0);

    // Fade out close to the lens (no large blobs) and far away.
    vFade = smoothstep(0.6, 2.0, depth) * (1.0 - smoothstep(12.0, 20.0, depth));
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // Soft disc: opaque inside 0.12 of the centre, gone at the edge.
    float alpha = (1.0 - smoothstep(0.12, 0.5, d)) * vFade * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * A few hundred dust motes drifting in the light. Warm white, so they only
 * show where the surface behind them is in shade, as real dust does.
 */
export function Dust() {
  const { geometry, material } = useMemo(() => {
    const { count, center, volume } = sceneConfig.dust;
    const total = Math.min(Math.max(Math.round(count), 0), MAX_MOTES);
    const random = createRandom(7);
    const positions: number[] = [];
    const seeds: number[] = [];
    for (let i = 0; i < total; i++) {
      positions.push(
        center[0] + (random() - 0.5) * volume[0],
        center[1] + (random() - 0.5) * volume[1],
        center[2] + (random() - 0.5) * volume[2],
      );
      seeds.push(random(), random(), random(), random());
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 4));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: sceneConfig.dust.size },
        uViewportHeight: { value: 1 },
        uColor: { value: new Color(setPalette.fill) },
        uOpacity: { value: sceneConfig.dust.opacity },
      },
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
    });

    return { geometry, material };
  }, []);

  const points = useRef<Points<BufferGeometry, ShaderMaterial>>(null);

  useFrame((state) => {
    const uniforms = points.current?.material.uniforms;
    if (!uniforms) return;
    uniforms.uTime.value = state.clock.elapsedTime * sceneConfig.dust.speed;
    uniforms.uViewportHeight.value = state.size.height * state.viewport.dpr;
    uniforms.uSize.value = sceneConfig.dust.size;
    uniforms.uOpacity.value = sceneConfig.dust.opacity;
  });

  // The motes wander outside their start box, so skip bounds-based culling.
  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
