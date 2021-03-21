import * as BABYLON from "babylonjs";
import { Entity } from "ecsy";
import { XYZProperties, ParticleTextureProperties, TextureComponent, ColorComponent, ParticleColorProperties, SceneComponent } from "./types/index";
import { xyz } from "../utils/mathUtils";

export enum ParticleTypes {
  Point = "Point",
  Box = "Box",
  Sphere = "Sphere",
  DirectedSphere = "DirectedSphere",
  Hemisphere = "Hemisphere",
  Cylinder = "Cylinder",
  DirectedCylinder = "DirectedCylinder",
  Cone = "Cone"
}

/**
 * @example
 * ```
 * entity.addComponent(Particle, {
 *    emitter: { x: 0, y: 0, z: 1 },
 *    texture: {
 *      diffuse: { url: "PATH_TO_PARTICLE_TEXTURE" }
 *    }
 * });
 * ```
 */
export class Particle implements SceneComponent, ColorComponent<ParticleColorProperties>, TextureComponent<ParticleTextureProperties> {
  scene?: Entity;
  object: BABYLON.ParticleSystem;
  /** @default "Point" */
  type?: ParticleTypes = ParticleTypes.Point;
  texture?: ParticleTextureProperties;
  color?: ParticleColorProperties;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.particlesystem#constructor
   * @default 100 
   */
  capacity?: number = 100;
  /** @see https://doc.babylonjs.com/api/classes/babylon.particlesystem#emitrate */
  emitRate?: number;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.particlesystem#emitter 
   * @default 0,0,0
   */
  emitter: XYZProperties = xyz();
  /** 
   * @memberof Point, Box, DirectedSphere, Cylinder
   * @default 0,0,0
   */
  direction1: XYZProperties = xyz();
  /** 
   * @memberof Point, Box, DirectedSphere, Cylinder
   * @default 10,10,10
   */
  direction2: XYZProperties = xyz(10, 10, 10);
  /** 
   * @memberof Box 
   * @default 0,0,0
   */
  minEmitBox: XYZProperties = xyz();
  /** 
   * @memberof Box 
   * @default 0,0,0
   */
  maxEmitBox: XYZProperties = xyz();
  /** @memberof Sphere, DirectedSphere, Hemispheric, Cylinder, Cone */
  radius?: number;
  /** @memberof Hemispheric, Cylinder */
  radiusRange?: number;
  /** @memberof Cylinder */
  height?: number;
  /** @memberof Cone */
  angle?: number;
}