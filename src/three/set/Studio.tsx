"use client";

import { sceneConfig } from "../config";
import { ArchWall } from "./ArchWall";
import { Cyclorama } from "./Cyclorama";
import { Dust } from "./Dust";
import { BlockPedestal, Column, RoundPedestal, Ring } from "./Forms";

/**
 * The whole set. Static apart from the dust: only the camera and the key
 * light move.
 *
 * Seen from the hero camera the arch shows exactly one thing, the form on its
 * round pedestal. Everything else stands wider than the opening reveals
 * (|x| over about 3 m) and only comes into view once the camera is inside.
 */
export function Studio() {
  return (
    <group>
      <Cyclorama />
      <ArchWall position={[0, 0, 2.2]} />

      <RoundPedestal form={sceneConfig.forms.shape} position={[0, 0, -4.2]} scale={0.85} />

      <Column position={[-3.6, 0, -2.2]} />
      <Column position={[3.6, 0, -2.2]} />
      <Column position={[-3.6, 0, -7]} />
      <Column position={[3.6, 0, -7]} />
      <BlockPedestal position={[4.6, 0, -5.4]} rotation={[0, 0.35, 0]} scale={0.9} />
      <Ring position={[-3.4, 0, -5.6]} scale={0.9} />

      <Dust />
    </group>
  );
}
