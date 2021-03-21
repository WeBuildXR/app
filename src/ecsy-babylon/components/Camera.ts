import * as BABYLON from "babylonjs";
import { Entity } from "ecsy";
import { SceneComponent, ObjectComponent } from "./types/index";

/**
 * @example
 * ```
 * entity.addComponent(Camera, { pointerLock: true });
 * ```
 */
export class Camera implements SceneComponent, ObjectComponent<BABYLON.FreeCamera> {
  scene?: Entity;
  object: BABYLON.FreeCamera;
  /**
   * Lock pointer when using the camera.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
   * @default false 
   */
  pointerLock?: boolean = false;
}