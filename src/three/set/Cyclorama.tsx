"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { setMaterials } from "./materials";

type CycloramaOptions = {
  width: number;
  /** z where the floor starts, in front of the camera. */
  floorFront: number;
  /** z where the floor begins to curve up. */
  floorBack: number;
  /** Radius of the cove between floor and wall. */
  radius: number;
  height: number;
  coveSegments: number;
};

/**
 * Floor and back wall joined by a quarter-circle cove, so there is no visible
 * corner: the studio backdrop. Built as one strip swept across the width.
 */
function createCyclorama({
  width,
  floorFront,
  floorBack,
  radius,
  height,
  coveSegments,
}: CycloramaOptions): BufferGeometry {
  // Profile in (z, y), front to top.
  const profile: Array<[number, number]> = [];
  const floorSteps = 6;
  for (let k = 0; k <= floorSteps; k++) {
    profile.push([floorFront + (floorBack - floorFront) * (k / floorSteps), 0]);
  }
  for (let k = 1; k <= coveSegments; k++) {
    const angle = (k / coveSegments) * (Math.PI / 2);
    profile.push([floorBack - radius * Math.sin(angle), radius - radius * Math.cos(angle)]);
  }
  profile.push([floorBack - radius, height]);

  const half = width / 2;
  const positions: number[] = [];
  for (const [z, y] of profile) positions.push(-half, y, z, half, y, z);

  const indices: number[] = [];
  for (let i = 0; i < profile.length - 1; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    // Wound so normals face up on the floor and forward on the wall.
    indices.push(a, b, c, b, d, c);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function Cyclorama() {
  const geometry = useMemo(
    () =>
      createCyclorama({
        width: 40,
        floorFront: 14,
        floorBack: -7,
        radius: 3.5,
        height: 14,
        coveSegments: 24,
      }),
    [],
  );

  // Casts as well as receives: variance shadow maps need receivers in the
  // depth pass to avoid light bleeding along the cove.
  return <mesh geometry={geometry} material={setMaterials.plaster} castShadow receiveShadow />;
}
