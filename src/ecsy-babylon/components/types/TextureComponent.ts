import * as BABYLON from "babylonjs";
import { ObjectComponent } from "./ObjectComponent";

/** Interface defined texture of a component, which will also have an object property. */
export interface TextureComponent<T> extends ObjectComponent<BABYLON.Scene | BABYLON.Material | BABYLON.ParticleSystem> {
  /** Texture properties to be manipulated. */
  texture?: T;
}