import * as BABYLON from "babylonjs";
import { ObjectComponent } from "./ObjectComponent";

/** Interface defined color of a component, which will also have an object property. */
export interface ColorComponent<T> extends ObjectComponent<BABYLON.Scene | BABYLON.Material | BABYLON.ParticleSystem | BABYLON.ShadowLight | BABYLON.HemisphericLight> {
  color?: T;
}