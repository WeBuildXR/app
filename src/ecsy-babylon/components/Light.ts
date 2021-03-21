import * as BABYLON from "babylonjs";
import { Entity } from "ecsy";
import { SceneComponent, XYZProperties, ColorComponent, LightColorProperties } from "./types/index";
import { xyz } from "../utils/mathUtils";

export enum LightTypes {
  Point = "Point",
  Directional = "Directional",
  Spot = "Spot",
  Hemispheric = "Hemispheric"
}

/**
 * @example
 * ```
 * entity.addComponent(Light, { color: { diffuse: "#AAFFAA" } });
 * entity.addComponent(Light, { type: LightTypes.Point, intensity: 2 });
 * entity.addComponent(Light, { type: LightTypes.Directional, direction: { x: 0, y: 0, z: 1 } });
 * entity.addComponent(Light, { type: LightTypes.Spot, direction: { x: 0, y: 0, z: 1 }, angle: 30, exponent: 2 });
 * ```
 */
export class Light implements SceneComponent, ColorComponent<LightColorProperties> {
  scene?: Entity;
  object: BABYLON.HemisphericLight | BABYLON.ShadowLight;
  /** @default "Hemispheric" */
  type?: LightTypes = LightTypes.Hemispheric;
  color?: LightColorProperties;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.shadowlight#direction
   * @default 0,0,0 
   */
  direction: XYZProperties = xyz();
  /** @see https://doc.babylonjs.com/api/classes/babylon.light#intensity */
  intensity?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.light#radius */
  radius?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.light#range */
  range?: number;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.spotlight#angle
   * @memberof Spot
   */
  angle?: number;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.spotlight#exponent 
   * @memberof Spot
   */
  exponent?: number;
}