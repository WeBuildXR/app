import { TextureAttributes } from "./TextureAttributes";

/** Interface defined texture(s) of a Material component. */
export interface MaterialTextureProperties {
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#diffusetexture */
  diffuse?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#speculartexture */
  specular?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#emissivetexture */
  emissive?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#ambienttexture */
  ambient?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#bumptexture */
  bump?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#lightmaptexture */
  lightmap?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#opacitytexture */
  opacity?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#reflectiontexture */
  reflection?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#refractiontexture */
  refraction?: TextureAttributes;
}