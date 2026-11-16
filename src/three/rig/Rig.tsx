"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type DirectionalLight, type Fog, MathUtils, type PerspectiveCamera, Vector3 } from "three";
import { palette } from "@/lib/palette";
import { type ScenePresetId, sceneFrame } from "@/lib/scene-store";
import { sceneConfig } from "../config";
import { scenePresets } from "../presets";
import { usePointerFrame } from "../usePointer";
import { type ShotSample, sampleShots, sunAt } from "./path";

/** Caps the step after a pause so damped values don't jump. */
const MAX_DELTA = 1 / 30;
const SUN_DISTANCE = 20;

/**
 * Moves the camera and the key light from global scroll state.
 *
 * - Scroll: the camera sits on the shot path at `sceneFrame.chapter`, which
 *   GSAP eases towards the scroll position (the scrub). It follows the path
 *   itself, so it can't cut through the arch wall on a fast scroll.
 * - Pointer: a small damped offset in the camera's own plane (parallax).
 * - Idle: the key light sways slowly, so shadows are never quite still.
 * - Haze: per shot, the air turns from clear cream to sand-coloured fog.
 */
export function Rig({ preset }: { preset: ScenePresetId }) {
  const sun = useRef<DirectionalLight>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scratch = useMemo(
    () => ({
      sample: { position: new Vector3(), target: new Vector3(), time: 0, light: 1, haze: 0 } satisfies ShotSample,
      cream: new Color(palette.cream),
      sand: new Color(palette.sand),
      air: new Color(),
      direction: new Vector3(),
      color: new Color(),
    }),
    [],
  );

  usePointerFrame();

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA);
    const { render, light, idle, parallax, haze } = sceneConfig;
    const { sample } = scratch;
    const camera = state.camera as PerspectiveCamera;
    const set = scenePresets[preset];
    // Footage pages have no camera to move; the canvas never mounts a rig for them.
    if (set.set === "footage") return;

    sampleShots(set.shots, sceneFrame.chapter, sample);

    // Narrow windows get a wider view so the arch keeps its margin of wall.
    const widen = Math.max(1, render.minAspect / state.viewport.aspect);
    const fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(render.fov) / 2) * widen));
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const offset = pointer.current;
    offset.x = MathUtils.damp(offset.x, sceneFrame.pointerX, parallax.damping, delta);
    offset.y = MathUtils.damp(offset.y, sceneFrame.pointerY, parallax.damping, delta);

    camera.position.copy(sample.position);
    camera.lookAt(sample.target);
    camera.translateX(offset.x * parallax.x);
    camera.translateY(offset.y * parallax.y);
    camera.lookAt(sample.target);

    const swing = Math.sin((state.clock.elapsedTime / idle.lightPeriod) * Math.PI * 2) * idle.lightSwing;
    sunAt(sample.time, swing, scratch.direction, scratch.color);

    const key = sun.current;
    if (key) {
      // In a long set the light, and with it the 26 m its shadow map covers,
      // travels with the camera: centred a little ahead of where it looks.
      const anchorZ = set.lightFollowsCamera ? sample.position.z - 5 : 0;
      key.target.position.set(0, 0, anchorZ);
      key.target.updateMatrixWorld();
      key.position.copy(scratch.direction).multiplyScalar(SUN_DISTANCE);
      key.position.z += anchorZ;
      key.color.copy(scratch.color);
      key.intensity = light.sun * sample.light;
    }
    state.scene.environmentIntensity = light.fill * sample.light;

    // Haze: the air and the page behind it turn from cream to sand, and the
    // fog closes in so the set recedes behind the products.
    scratch.air.lerpColors(scratch.cream, scratch.sand, sample.haze);
    const fog = state.scene.fog as Fog | null;
    if (fog) {
      fog.color.copy(scratch.air);
      fog.near = MathUtils.lerp(set.fog?.near ?? render.fogNear, haze.near, sample.haze);
      fog.far = MathUtils.lerp(set.fog?.far ?? render.fogFar, haze.far, sample.haze);
    }
    if (state.scene.background instanceof Color) state.scene.background.copy(scratch.air);
  });

  return (
    <directionalLight
      ref={sun}
      castShadow
      intensity={sceneConfig.light.sun}
      shadow-mapSize={[sceneConfig.light.shadowMapSize, sceneConfig.light.shadowMapSize]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-radius={sceneConfig.light.shadowRadius}
      shadow-blurSamples={16}
      shadow-camera-left={-13}
      shadow-camera-right={13}
      shadow-camera-top={13}
      shadow-camera-bottom={-13}
      shadow-camera-near={0.5}
      shadow-camera-far={50}
    />
  );
}
