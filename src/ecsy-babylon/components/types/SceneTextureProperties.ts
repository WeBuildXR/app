import { TextureAttributes } from "./TextureAttributes";

/** Interface defined texture(s) of a Scene component. */
export interface SceneTextureProperties {
  /** @see https://doc.babylonjs.com/api/classes/babylon.scene#environmenttexture */
  environment?: TextureAttributes;
}