import * as BABYLON from "babylonjs";
import { Entity } from "ecsy";
import { ColorComponent, TextureComponent, MaterialColorProperties, MaterialTextureProperties, SceneComponent } from "./types/index";
import { materialColorHex } from "../utils/materialUtils";

/**
 * @example
 * ```
 * entity.addComponent(Mesh).addComponent(Material, { 
 *    alpha: 0.7,
 *    color: { diffuse: "#E74C3C" } 
 * });
 * entity.addComponent(Mesh).addComponent(Material, { 
 *    texture: { 
 *      diffuse: { url: "PATH_TO_TEXTURE", uScale: 4, vScale: 4 } 
 *    }
 * });
 * ```
 */
export class Material implements SceneComponent, ColorComponent<MaterialColorProperties>, TextureComponent<MaterialTextureProperties> {
  scene?: Entity;
  object: BABYLON.StandardMaterial;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#alpha */
  alpha?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#useparallax */
  useParallax?: boolean;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#useparallaxocclusion */
  useParallaxOcclusion?: boolean;
  /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#parallaxscalebias */
  parallaxScaleBias?: number;
  /** @default { diffuse: "#ffffff" } */
  color?: MaterialColorProperties = materialColorHex();
  texture?: MaterialTextureProperties;
}