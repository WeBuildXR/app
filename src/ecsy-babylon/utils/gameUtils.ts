import * as BABYLON from "babylonjs";
import { System, Entity, SystemConstructor } from "ecsy";
import { getWorld } from "./worldUtils";
import { GameSystem } from "../systems/GameSystem";
import { Scene } from "../components/Scene";

/** @hidden */
export function getSystem<T extends System>(self: System, target: SystemConstructor<T>): T {
  return getWorld(self).getSystem(target) as T;
}

/**
 * @hidden
 * Get canvas used for rendering. 
 * @param system A registered ecsy System class
 */
export function getRenderingCanvas(system: System): HTMLCanvasElement {
  return getSystem(system, GameSystem).renderingCanvas as HTMLCanvasElement;
}

/**
 * @hidden
 * Get all scenes in engine.
 * @param system A registered ecsy System class
 */
export function getScenes(system: System): BABYLON.Scene[] {
  return getSystem(system, GameSystem).scenes;
}

/**
 * Get a scene or return active scene.
 * @param system A registered ecsy System class
 * @param scene Scene entity
 */
export function getScene(system: System, scene?: Entity): BABYLON.Scene {
  if (scene) {
    return scene.getComponent(Scene).object;
  } else {
    return getSystem(system, GameSystem).activeScene;
  }
}

/**
 * Get scene AssetManager or return AssetManager in active scene.
 * @param system A registered ecsy System class
 * @param scene Scene entity
 */
export function getAssetManager(system: System, scene?: Entity): BABYLON.AssetsManager {
  return getSystem(system, GameSystem).getAssetManager(scene);
}

/**
 * Log a message to the screen
 * @param system A registered ecsy System class
 * @param scene Scene entity
 */
export function logMessage(system: System, message: string) {
  return getSystem(system, GameSystem).logMessage(message);
}