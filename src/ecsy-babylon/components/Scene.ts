import * as BABYLON from "babylonjs";
import { ColorComponent, SceneColorProperties, TextureComponent, SceneTextureProperties } from "./types/index";

/**
 * @example
 * ```
 * entity.addComponent(Scene, { color: { clear: "123ABCFF" } });
 * ```
 */
export class Scene implements ColorComponent<SceneColorProperties>, TextureComponent<SceneTextureProperties>{
  object: BABYLON.Scene;
  /** @see https://doc.babylonjs.com/api/interfaces/babylon.sceneoptions */
  options?: BABYLON.SceneOptions;
  color?: SceneColorProperties;
  texture?: SceneTextureProperties;
}