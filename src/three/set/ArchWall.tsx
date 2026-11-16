"use client";

import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { setMaterials } from "./materials";

const WALL_DEPTH = 0.4;
/** Half the opening width; also the radius of the arch. */
export const ARCH_RADIUS = 1.4;
/** Height where the curve of the arch starts. */
export const ARCH_SPRING = 3;

/**
 * A plaster wall with a round-headed opening. The outline runs around the
 * opening as one polygon, so there is no hole touching the floor edge to
 * triangulate.
 */
function createArchWall(width: number, height: number): ExtrudeGeometry {
  const w = width / 2;
  const shape = new Shape();
  shape.moveTo(-w, 0);
  shape.lineTo(-ARCH_RADIUS, 0);
  shape.lineTo(-ARCH_RADIUS, ARCH_SPRING);
  shape.absarc(0, ARCH_SPRING, ARCH_RADIUS, Math.PI, 0, true);
  shape.lineTo(ARCH_RADIUS, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, height);
  shape.lineTo(-w, height);
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: WALL_DEPTH,
    bevelEnabled: false,
    curveSegments: 48,
  });
  geometry.translate(0, 0, -WALL_DEPTH / 2);
  return geometry;
}

type ArchWallProps = ThreeElements["group"] & {
  width?: number;
  height?: number;
  /**
   * Extra wall above `height` that neither casts nor receives shadow. The
   * studio uses it so the top edge stays out of frame in portrait windows
   * without the taller wall shading the back wall. 0 leaves it off.
   */
  extension?: number;
};

export function ArchWall({ width = 16, height = 8, extension = 8, ...props }: ArchWallProps) {
  const geometry = useMemo(() => createArchWall(width, height), [width, height]);
  return (
    <group {...props}>
      <mesh geometry={geometry} material={setMaterials.plasterLight} castShadow receiveShadow />
      {extension > 0 && (
        // Neither casts nor receives. With variance shadow maps a receiver is
        // also drawn into the shadow map, and a 16 m wall would put the whole
        // back wall in shade. Nothing can shade this part anyway.
        <mesh material={setMaterials.plasterLight} position={[0, height + extension / 2, 0]}>
          <boxGeometry args={[width, extension, WALL_DEPTH]} />
        </mesh>
      )}
    </group>
  );
}
