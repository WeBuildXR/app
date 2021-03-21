import * as BABYLON from "babylonjs";
import { Entity, System } from "ecsy";
import { Camera } from "../components/index";
import { getScene, getRenderingCanvas, getSystem, getScenes } from "../utils/gameUtils";
import { updateObjectsTransform, disposeObject } from "../utils/objectUtils";
import { GameSystem } from "./GameSystem";

/** System for Camera component */
export class CameraSystem extends System {
  /** @hidden */
  static queries = {
    camera: { components: [Camera], listen: { added: true, removed: true } },
  };
  /** @hidden */
  queries: any;

  /** <BABYLON.Scene.uid, Camera component> */
  private _cameras: Map<String, Camera> = new Map<String, Camera>();

  /** @hidden */
  init() {
    getSystem(this, GameSystem).onSceneSwitched.add(scene => this._updateControl(scene));
    this._pointerLock = this._pointerLock.bind(this);
  }

  /** @hidden */
  execute() {
    this.queries.camera.added.forEach((entity: Entity) => {
      let camera = entity.getComponent(Camera);
      let scene = getScene(this, camera.scene);
      camera.object = new BABYLON.FreeCamera("", BABYLON.Vector3.Zero(), scene);
      updateObjectsTransform(entity);
      this._cameras.set(scene.uid, camera);
      this._updateControl(scene);
    });

    this.queries.camera.removed.forEach((entity: Entity) => {
      let camera = entity.getComponent(Camera);
      let scene = getScene(this, camera.scene);
      this._removeControl(scene);
      this._cameras.has(scene.uid) && this._cameras.delete(scene.uid);
      disposeObject(camera);
    });
  }

  private _updateControl(targetScene: BABYLON.Scene) {
    if (targetScene.uid === getScene(this).uid) {
      getScenes(this).forEach(scene => this._removeControl(scene));
      let camera = this._cameras.get(targetScene.uid)!;
      camera.object.attachControl(getRenderingCanvas(this));
      camera.pointerLock ? targetScene.onPointerObservable.add(this._pointerLock) : document.exitPointerLock();
    }
  }

  private _removeControl(scene: BABYLON.Scene) {
    this._cameras.forEach((camera, sceneUID) => sceneUID === scene.uid && camera.object.detachControl(getRenderingCanvas(this)));
    scene.onPointerObservable.removeCallback(this._pointerLock);
  }

  private _pointerLock(pointerInfo: BABYLON.PointerInfo) {
    pointerInfo.event.type === "pointerdown" && (document.pointerLockElement || getRenderingCanvas(this).requestPointerLock());
  }
}