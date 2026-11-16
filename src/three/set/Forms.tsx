"use client";

import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { sceneFrame } from "@/lib/scene-store";
import { sceneConfig } from "../config";
import { setMaterials } from "./materials";

type GroupProps = ThreeElements["group"];

/**
 * Turns its children about the vertical axis with scroll: `forms.turn`
 * radians per chapter, on top of a resting angle. A direction of -1 turns
 * the other way. Tied to scroll, not to time, so the forms are still
 * whenever the page is.
 */
function Turning({
  rest = 0,
  direction = 1,
  children,
  ...props
}: GroupProps & { rest?: number; direction?: 1 | -1 }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = rest + direction * sceneFrame.chapter * sceneConfig.forms.turn;
    }
  });
  return (
    <group ref={group} {...props}>
      {children}
    </group>
  );
}

/** Plain column on a square plinth, slightly narrower at the top. */
export function Column({ height = 7, ...props }: GroupProps & { height?: number }) {
  return (
    <group {...props}>
      <mesh material={setMaterials.travertine} position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.2, 0.95]} />
      </mesh>
      <mesh material={setMaterials.travertine} position={[0, 0.2 + height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.34, height, 48]} />
      </mesh>
    </group>
  );
}

const PEDESTAL_HEIGHT = 1.05;
const SPHERE_RADIUS = 0.46;
/** Width of the cut through the sphere. */
const SPHERE_GAP = 0.035;
const TORUS_RADIUS = 0.4;
const TORUS_TUBE = 0.13;

/** One half of the split sphere: a hemisphere closed with a flat face. */
function HalfSphere(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={setMaterials.plasterLight} castShadow receiveShadow>
        <sphereGeometry args={[SPHERE_RADIUS, 96, 64, 0, Math.PI]} />
      </mesh>
      <mesh material={setMaterials.plasterLight} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
        <circleGeometry args={[SPHERE_RADIUS, 96]} />
      </mesh>
    </group>
  );
}

/**
 * The centrepiece: a cylindrical travertine pedestal carrying one carved
 * form that turns with scroll. `sphere` is a sphere cut cleanly in two, a
 * hand's width apart: a plain sphere looks the same from every side, so
 * turning it would show nothing. `torus` is an upright ring.
 */
export function RoundPedestal({ form, ...props }: GroupProps & { form: "sphere" | "torus" }) {
  return (
    <group {...props}>
      <mesh material={setMaterials.travertine} position={[0, PEDESTAL_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, PEDESTAL_HEIGHT, 96]} />
      </mesh>
      {form === "sphere" ? (
        // Sunk a centimetre so it reads as resting, not hovering on a point.
        <Turning rest={0.7} position={[0, PEDESTAL_HEIGHT + SPHERE_RADIUS - 0.01, 0]}>
          <HalfSphere position={[0, 0, SPHERE_GAP / 2]} />
          <HalfSphere position={[0, 0, -SPHERE_GAP / 2]} rotation={[0, Math.PI, 0]} />
        </Turning>
      ) : (
        <Turning rest={0.5} position={[0, PEDESTAL_HEIGHT + TORUS_RADIUS + TORUS_TUBE - 0.01, 0]}>
          <mesh material={setMaterials.plasterLight} castShadow receiveShadow>
            <torusGeometry args={[TORUS_RADIUS, TORUS_TUBE, 48, 160]} />
          </mesh>
        </Turning>
      )}
    </group>
  );
}

/** Low block pedestal with a shallow carved dome. */
export function BlockPedestal(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={setMaterials.travertine} position={[0, 0.275, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.55, 1.3]} />
      </mesh>
      <mesh material={setMaterials.stone} position={[0, 0.55, 0]} scale={[1, 0.72, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.58, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

/** A standing ring resting on the floor. It turns with scroll, opposite to the centrepiece. */
export function Ring(props: GroupProps) {
  const radius = 0.62;
  const tube = 0.11;
  return (
    <group {...props}>
      <Turning rest={0.5} direction={-1} position={[0, radius + tube, 0]}>
        <mesh material={setMaterials.stone} castShadow receiveShadow>
          <torusGeometry args={[radius, tube, 48, 160]} />
        </mesh>
      </Turning>
    </group>
  );
}
