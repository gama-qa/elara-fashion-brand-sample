"use client";

import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { NeutralToneMapping } from "three";
import { cn } from "@/lib/cn";
import { palette, setPalette } from "@/lib/palette";
import { getSceneState, setSceneState, useSceneState } from "@/lib/scene-store";
import { sceneConfig } from "./config";
import { FootagePass } from "./footage/FootagePass";
import { scenePresets } from "./presets";
import { Rig } from "./rig/Rig";
import { Corridor } from "./set/Corridor";
import { Studio } from "./set/Studio";

/**
 * Resolution steps tried, in order, when the frame rate is too low: the
 * configured maximum, then 1, then below native (the browser scales the
 * canvas up; soft, but the set is matte and forgiving).
 */
const DPR_STEPS = [sceneConfig.render.maxDpr, 1, 0.75];

/**
 * The only <Canvas> in the app. Mounted once by <SceneLayer> and kept across
 * routes; pages choose what it shows through the scene store.
 *
 * - Footage pages (home): one full-screen pass over the page's clips, nothing
 *   else. The canvas is clear wherever that pass has nothing to draw yet, so
 *   the posters underneath show through.
 * - Set pages (about, lookbook): the old procedural set with its camera rig.
 * - Loading: the layer is transparent over the cream page until the first
 *   frames have been drawn, then fades in.
 * - No preset (catalog routes): hidden, no frames rendered.
 * - Covered by an `occludes` section: frames paused, last frame kept.
 * - Too slow: resolution steps down first. Only if it is still slow at the
 *   lowest step, for several measurements in a row, does the site switch to
 *   the still fallback, once (never when `?scene=on` locked the mode).
 */
export default function SceneCanvas() {
  const preset = useSceneState((s) => s.preset);
  const occluded = useSceneState((s) => s.occluded);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const slowRuns = useRef(0);

  const visible = preset !== null;
  const rendering = visible && !occluded;
  const activePreset = preset ?? "home";
  const active = scenePresets[activePreset];
  // Initial camera only; <Rig> positions it every frame after that. The
  // footage pass ignores the camera.
  const [x, y, z] = active.set === "footage" ? [0, 0, 5] : active.shots[0].position;
  const cap = DPR_STEPS[step];

  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity ease-quiet",
        ready && visible ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDuration: `${sceneConfig.render.fadeIn}s` }}
    >
      <Canvas
        frameloop={rendering ? "always" : "never"}
        dpr={cap >= 1 ? [1, cap] : cap}
        // Variance shadow maps blur cleanly into the soft, wide penumbra of
        // daylight on plaster. Plain `shadows` would pick PCFSoftShadowMap,
        // which three has deprecated (console warning).
        shadows="variance"
        gl={{
          antialias: true,
          // Clear where nothing is drawn: a set paints an opaque background,
          // the footage pass leaves the canvas clear until it has a frame.
          alpha: true,
          powerPreference: "high-performance",
          // Keeps material colours close to their hex values. Background and
          // fog are not tone-mapped, so they match the page's cream exactly.
          toneMapping: NeutralToneMapping,
        }}
        camera={{ fov: sceneConfig.render.fov, near: 0.1, far: 60, position: [x, y, z] }}
        onCreated={({ gl }) => {
          gl.debug.checkShaderErrors = sceneConfig.render.checkShaders;
        }}
      >
        {active.set === "footage" ? (
          <FootagePass reel={active.reel} />
        ) : (
          <>
            <color attach="background" args={[palette.cream]} />
            <fog attach="fog" args={[palette.cream, sceneConfig.render.fogNear, sceneConfig.render.fogFar]} />

            {/* Ambient fill: a tiny environment drawn once from code. No HDR
                file, no network request. One soft panel up and to the
                front-left gives the fill a direction. */}
            <Environment resolution={64} frames={1}>
              <color attach="background" args={[setPalette.fill]} />
              <Lightformer
                form="rect"
                color={setPalette.fill}
                intensity={1.5}
                position={[-6, 7, 9]}
                scale={[14, 10, 1]}
                target={[0, 1, -2]}
              />
            </Environment>

            {/* One set at a time: the studio (about) or the corridor (lookbook). */}
            {active.set === "corridor" ? <Corridor /> : <Studio />}
            <Rig preset={activePreset} />
          </>
        )}

        {/*
          drei measures in windows of about 2.5 s and calls onDecline when
          most of a window was under the lower bound, onIncline when most of
          it was over the upper one.

          Do not use its `flipflops`/`onFallback` for the fallback: that
          counter goes up on every onIncline as well, so a machine running
          perfectly smoothly "falls back" after about ten seconds. The count
          of slow windows is kept here instead.
        */}
        <PerformanceMonitor
          bounds={() => [sceneConfig.performance.slowFps, sceneConfig.performance.fineFps]}
          onIncline={() => {
            slowRuns.current = 0;
          }}
          onDecline={(monitor) => {
            if (step < DPR_STEPS.length - 1) {
              slowRuns.current = 0;
              setStep(step + 1);
              return;
            }
            slowRuns.current += 1;
            if (slowRuns.current < sceneConfig.performance.patience || getSceneState().modeLocked) return;
            if (process.env.NODE_ENV !== "production") {
              console.info(
                `[scene] Still about ${monitor.fps} fps at the lowest resolution: switching to the still fallback. Use ?scene=on to keep WebGL.`,
              );
            }
            setSceneState({ mode: "poster" });
          }}
        />
        <FirstFrames onDrawn={() => setReady(true)} />
      </Canvas>
    </div>
  );
}

/**
 * Reports once a few frames have been drawn. The first frame compiles shaders
 * and builds the shadow map, so fading in before then would show a hitch.
 */
function FirstFrames({ onDrawn }: { onDrawn: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 3) return;
    frames.current += 1;
    if (frames.current === 3) onDrawn();
  });
  return null;
}
