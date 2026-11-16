import { MeshStandardMaterial } from "three";
import { setPalette } from "@/lib/palette";

/**
 * Shared matte materials for the set. No textures: surfaces are fully rough
 * and non-metallic so light falls off softly, like plaster and stone.
 * Created once for the lifetime of the canvas.
 */
export const setMaterials = {
  plaster: new MeshStandardMaterial({ color: setPalette.plaster, roughness: 1, metalness: 0 }),
  plasterLight: new MeshStandardMaterial({ color: setPalette.plasterLight, roughness: 1, metalness: 0 }),
  travertine: new MeshStandardMaterial({ color: setPalette.travertine, roughness: 0.9, metalness: 0 }),
  stone: new MeshStandardMaterial({ color: setPalette.stone, roughness: 0.92, metalness: 0 }),
  /**
   * Honed stone floor of the corridor: smooth enough to carry a soft sheen
   * from the sky and a long highlight from the sun, without mirroring the room.
   * Lower the roughness for a wetter look; under about 0.25 it starts to read as glass.
   */
  floor: new MeshStandardMaterial({ color: setPalette.travertine, roughness: 0.4, metalness: 0 }),
};
