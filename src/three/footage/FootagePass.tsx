"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { MathUtils, NoBlending, type ShaderMaterial, type Texture, Vector2, Vector3, Vector4 } from "three";
import { clipProgress, clipRange, clipScale, createReelSample, getVideo, type Reel, sampleReel } from "@/lib/footage";
import { palette } from "@/lib/palette";
import { sceneFrame } from "@/lib/scene-store";
import { sceneConfig } from "../config";
import { usePointerFrame } from "../usePointer";
import { ClipPlayer } from "./player";
import { footageFragment, footageVertex } from "./shader";

/** A clip starts downloading this many chapters before it first shows. */
const LOAD_AHEAD = 0.35;
/** Caps the step after a pause so damped values don't jump. */
const MAX_DELTA = 1 / 30;
/** Scroll speed, in sections per second, beyond which the displacement stops growing. */
const MAX_SPEED = 1.5;

/** "#f4efe8" to display-space RGB, 0–1. Not THREE.Color: that converts to linear. */
function displayRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

const CREAM = displayRgb(palette.cream);
const SAND = displayRgb(palette.sand);

function createUniforms() {
  return {
    uA: { value: null as Texture | null },
    uB: { value: null as Texture | null },
    uFitA: { value: new Vector4(1, 1, 0, 0) },
    uFitB: { value: new Vector4(1, 1, 0, 0) },
    uViewA: { value: new Vector3(0.5, 0.5, 1) },
    uViewB: { value: new Vector3(0.5, 0.5, 1) },
    uMix: { value: 0 },
    uWash: { value: 0 },
    uPage: { value: new Vector3(...CREAM) },
    uOpacity: { value: 0 },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uPointer: { value: new Vector2() },
    uDisplace: { value: new Vector4() },
    uVignette: { value: new Vector3() },
    uGrain: { value: new Vector3() },
  };
}

type Uniforms = ReturnType<typeof createUniforms>;

/** How clip `index` sits in the window: the same result as `object-fit: cover` with an `object-position`, then a zoom. */
function place(fit: Vector4, view: Vector3, reel: Reel, index: number, chapter: number, picture: number, windowAspect: number) {
  const [fx, fy] = reel.clips[index].focus;
  const wide = windowAspect < picture;
  const sx = wide ? windowAspect / picture : 1;
  const sy = wide ? 1 : picture / windowAspect;
  fit.set(sx, sy, (1 - sx) * fx, (1 - sy) * fy);
  view.set(fx, fy, clipScale(reel, index, chapter));
}

/**
 * Footage pages: draws the page's reel as one full-screen pass. No meshes,
 * lights or camera work; the only geometry is the rectangle the picture is
 * painted on.
 *
 * - Scroll: `sceneFrame.chapter` (eased by GSAP, the same value the page tint
 *   uses) picks the clip, its time, its zoom and the dissolve into the next.
 * - Idle: the clip drifts a fraction of a second back and forth, so a wall
 *   with a tree's shadow on it is never a frozen photograph.
 * - Effects: displacement, vignette and grain, all in shader.ts and tuned in
 *   config.ts (`footage`).
 *
 * Until a clip's first frame is decoded this draws nothing and the poster
 * under the canvas shows instead.
 */
export function FootagePass({ reel }: { reel: Reel }) {
  const material = useRef<ShaderMaterial>(null);
  const players = useRef<ClipPlayer[]>([]);
  const live = useRef({ opacity: 0, pointerX: 0, pointerY: 0, speed: 0, chapter: sceneFrame.chapter });
  const sample = useRef(createReelSample());
  const [uniforms] = useState(createUniforms);

  usePointerFrame();

  useEffect(() => {
    const created = reel.clips.map((clip) => new ClipPlayer(getVideo(clip.video)));
    players.current = created;
    return () => {
      players.current = [];
      for (const player of created) player.dispose();
    };
  }, [reel]);

  useFrame((state, rawDelta) => {
    const shader = material.current;
    if (!shader) return;
    const u = shader.uniforms as Uniforms;
    const list = players.current;
    const now = live.current;

    if (list.length === 0) {
      now.opacity = 0;
      u.uOpacity.value = 0;
      return;
    }

    const { footage } = sceneConfig;
    const delta = Math.min(rawDelta, MAX_DELTA);
    const chapter = sceneFrame.chapter;
    const at = sampleReel(reel, chapter, sample.current);
    // Fully washed over: nothing of the footage shows, so stop decoding it.
    const hidden = at.wash > 0.995;
    const idle =
      Math.sin((state.clock.elapsedTime / footage.idle.period) * Math.PI * 2) * footage.idle.drift;

    for (let i = 0; i < list.length; i++) {
      const player = list[i];
      if (i === 0 || chapter >= clipRange(reel, i)[0] - LOAD_AHEAD) player.load();
      if (hidden || (i !== at.a && i !== at.b)) continue;
      const span = Math.max(player.duration - footage.margin * 2, 0);
      player.seek(footage.margin + clipProgress(reel, i, chapter) * span + idle);
    }

    // If one of the two clips has not arrived yet, show the other alone.
    let under = at.a;
    let over = at.b;
    let mix = at.mix;
    if (!list[over].hasFrame) {
      over = under;
      mix = 0;
    } else if (!list[under].hasFrame) {
      under = over;
      mix = 0;
    }
    const ready = list[under].hasFrame;

    const windowAspect = state.size.width / Math.max(state.size.height, 1);
    place(u.uFitA.value, u.uViewA.value, reel, under, chapter, list[under].aspect, windowAspect);
    place(u.uFitB.value, u.uViewB.value, reel, over, chapter, list[over].aspect, windowAspect);
    u.uA.value = list[under].texture;
    u.uB.value = list[over].texture;
    u.uMix.value = mix;

    u.uWash.value = at.wash;
    u.uPage.value.set(
      MathUtils.lerp(CREAM[0], SAND[0], at.haze),
      MathUtils.lerp(CREAM[1], SAND[1], at.haze),
      MathUtils.lerp(CREAM[2], SAND[2], at.haze),
    );

    // The picture leans a little against the pointer, and swells a little
    // more while the page is moving.
    now.pointerX = MathUtils.damp(now.pointerX, sceneFrame.pointerX, footage.parallax.damping, delta);
    now.pointerY = MathUtils.damp(now.pointerY, sceneFrame.pointerY, footage.parallax.damping, delta);
    u.uPointer.value.set(-now.pointerX * footage.parallax.amount, now.pointerY * footage.parallax.amount);

    const speed = Math.min(Math.abs(chapter - now.chapter) / Math.max(delta, 1e-4), MAX_SPEED);
    now.speed = MathUtils.damp(now.speed, speed, 4, delta);
    now.chapter = chapter;
    u.uDisplace.value.set(
      footage.displace.amount + now.speed * footage.displace.scroll,
      footage.displace.scale,
      footage.displace.speed,
      footage.displace.dissolve,
    );

    u.uVignette.value.set(footage.vignette.amount, footage.vignette.inner, footage.vignette.outer);
    u.uGrain.value.set(footage.grain.amount, footage.grain.fps, Math.max(footage.grain.size, 0.5));
    u.uTime.value = state.clock.elapsedTime;
    u.uAspect.value = windowAspect;

    if (ready) now.opacity = Math.min(1, now.opacity + delta / Math.max(footage.fadeIn, 0.01));
    u.uOpacity.value = now.opacity;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={footageVertex}
        fragmentShader={footageFragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        transparent
        blending={NoBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
