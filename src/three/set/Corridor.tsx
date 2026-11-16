"use client";

import type { ThreeElements } from "@react-three/fiber";
import type { ReactNode } from "react";
import { corridor } from "../presets";
import { ArchWall } from "./ArchWall";
import { BlockPedestal, Column, Ring, RoundPedestal } from "./Forms";
import { setMaterials } from "./materials";

type GroupProps = ThreeElements["group"];

/** Three drums of stone, each smaller than the one below. */
function StackedDrums(props: GroupProps) {
  const drums = [
    { radius: 0.62, height: 0.42 },
    { radius: 0.46, height: 0.5 },
    { radius: 0.3, height: 0.62 },
  ];
  let y = 0;
  return (
    <group {...props}>
      {drums.map((drum, index) => {
        const centre = y + drum.height / 2;
        y += drum.height;
        return (
          <mesh
            key={index}
            material={index === 1 ? setMaterials.stone : setMaterials.travertine}
            position={[0, centre, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[drum.radius, drum.radius, drum.height, 96]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** A four-sided tapering shaft. */
function Obelisk(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={setMaterials.plasterLight} position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.42, 2.6, 4]} />
      </mesh>
    </group>
  );
}

/** A tall slab leaning a few degrees, as if set against the wall. */
function LeaningSlab(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={setMaterials.stone} position={[0, 1.2, 0]} rotation={[0.1, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 2.4, 0.14]} />
      </mesh>
    </group>
  );
}

/** Half a ring standing on its two ends: a small arch. */
function HalfRing(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={setMaterials.travertine} rotation={[0, 0.5, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.85, 0.15, 48, 120, Math.PI]} />
      </mesh>
    </group>
  );
}

/** Two spheres of different size resting together. */
function TwoSpheres(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={setMaterials.plasterLight} position={[0, 0.55, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.55, 96, 64]} />
      </mesh>
      <mesh material={setMaterials.stone} position={[0.72, 0.26, 0.42]} castShadow receiveShadow>
        <sphereGeometry args={[0.26, 64, 48]} />
      </mesh>
    </group>
  );
}

/**
 * One carved form per room, each different, each on its own. Add or reorder
 * here; rooms beyond the list repeat it.
 */
const forms: Array<(props: GroupProps) => ReactNode> = [
  (props) => <StackedDrums {...props} />,
  (props) => <Ring {...props} scale={1.15} />,
  (props) => <Obelisk {...props} />,
  (props) => <BlockPedestal {...props} />,
  (props) => <LeaningSlab {...props} />,
  (props) => <RoundPedestal form="sphere" {...props} scale={0.8} />,
  (props) => <HalfRing {...props} />,
  (props) => <TwoSpheres {...props} />,
];

/** Size of the carved forms. They are company for the photograph, not the subject. */
const FORM_SCALE = 0.8;

/**
 * The lookbook's set: a gallery corridor. Rooms divided by arched walls, a
 * pair of columns inside each arch, side walls open to the sky, a honed floor
 * that carries a soft sheen, and one carved form per room standing to
 * alternate sides, clear of the centre where the look's photograph sits.
 * Dimensions come from `corridor` in presets.ts, which also drives the camera.
 */
export function Corridor() {
  const { rooms, depth, width, wallHeight } = corridor;
  const length = rooms * depth;

  return (
    <group>
      {/* Floor: runs well past both ends, so the entrance and the exit open onto it. */}
      <mesh
        material={setMaterials.floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -length / 2]}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[70, length + 90]} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          material={setMaterials.plaster}
          position={[side * (width / 2 + 0.2), wallHeight / 2, -length / 2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, wallHeight, length + 0.4]} />
        </mesh>
      ))}

      {/* One arch at the entrance, one between each pair of rooms, one at the
          exit. The first and last are wide façades; the rest span the corridor. */}
      {Array.from({ length: rooms + 1 }, (_, index) => {
        const facade = index === 0 || index === rooms;
        return (
          <ArchWall
            key={index}
            width={facade ? 22 : width + 0.8}
            height={wallHeight}
            extension={0}
            position={[0, 0, -index * depth]}
          />
        );
      })}

      {Array.from({ length: rooms }, (_, room) => {
        const z = -room * depth;
        const side = room % 2 === 0 ? 1 : -1;
        const form = forms[room % forms.length];
        return (
          <group key={room}>
            <Column height={wallHeight - 1} position={[-(width / 2 - 0.6), 0, z - 0.9]} />
            <Column height={wallHeight - 1} position={[width / 2 - 0.6, 0, z - 0.9]} />
            {/* Beside the next arch, far enough in and back to sit whole in the frame. */}
            <group position={[side * 1.95, 0, z - 7.1]} rotation={[0, -side * 0.35, 0]} scale={FORM_SCALE}>
              {form({})}
            </group>
          </group>
        );
      })}
    </group>
  );
}
