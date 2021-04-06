import { Engine as BabylonEngine } from "@babylonjs/core/Engines/engine"
import { EngineOptions as BabylonEngineOptions } from "@babylonjs/core/Engines/thinEngine"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { Matrix, Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math"
import { AssetsManager as BabylonAssetsManager } from "@babylonjs/core/Misc/assetsManager"
import { Observable } from "@babylonjs/core/Misc/observable"
import { Scene as BabylonScene } from "@babylonjs/core/scene"
import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { disposeComponent } from "../common/babylonUtils"
import { BabylonComponent } from "../components/BabylonComponent"
import { Scene } from "../components/Scene"
import { DebugLayer } from "@babylonjs/core/Debug"
import "@babylonjs/inspector"

export class SceneSystem extends EcsySystem {

  /** @hidden */
  static queries = {
    scene: { components: [Scene], listen: { added: true, removed: true } },
  }
  /** @hidden */
  queries: any

  public getPickedPoint() {
    const scene = this.activeScene
    const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), null)
    const hit = scene.pickWithRay(ray)
    return hit?.pickedPoint
  }

  private _engine: BabylonEngine
  get renderingCanvas() { return this._engine.getRenderingCanvas() }
  get scenes() { return this._engine.scenes }

  private _activeScene: BabylonScene
  get activeScene() { return this._activeScene }

  /** <Scene UID, BABYLON.AssetsManager> */
  private _assetManagers: Map<String, BabylonAssetsManager> = new Map<String, BabylonAssetsManager>()

  /** Observable event when active scene is switched. */
  public onSceneSwitched: Observable<BabylonScene> = new Observable<BabylonScene>()

  /** @hidden */
  init() {
    this._render = this._render.bind(this)
  }

  /** @hidden */
  execute() {
    this.queries.scene.added.forEach((entity: EcsyEntity) => {
      let scene = entity.getMutableComponent(Scene)!
      let sceneComponent = scene as BabylonComponent<BabylonScene>
      sceneComponent.babylonComponent = new BabylonScene(this._engine, scene.options)
      this._engine.scenes.length === 1 && (this._activeScene = scene.babylonComponent)

      new HemisphericLight("", new BabylonVector3(0, 1, 0), this._activeScene)

      let assetManager = new BabylonAssetsManager(scene.babylonComponent)
      assetManager.useDefaultLoadingScreen = false
      this._assetManagers.set(scene.babylonComponent.uid, assetManager)
    })

    this.queries.scene.removed.forEach((entity: EcsyEntity) => {
      let scene = entity.getComponent(Scene)!
      disposeComponent(scene)
    })
  }

  /**
   * Start game system in the world can be used by other systems & components.
   * @see https://doc.babylonjs.com/api/classes/babylon.engine#constructor
   * @param canvas WebGL context to be used for rendering
   * @param antialias defines enable antialiasing (default: false)
   * @param options @see https://doc.babylonjs.com/api/interfaces/babylon.engineoptions
   * @param adaptToDeviceRatio defines whether to adapt to the device's viewport characteristics (default: false)
   */
  public start(canvas: HTMLCanvasElement, antialias?: boolean, options?: BabylonEngineOptions, adaptToDeviceRatio?: boolean): SceneSystem {
    this._engine = new BabylonEngine(canvas, antialias, options, adaptToDeviceRatio)
    this._engine.runRenderLoop(this._render)
    return this
  }

  /**
   * Switch to a scene by given scene entity.
   * @param scene Scene entity
   */
  public switchScene(scene: EcsyEntity): SceneSystem {
    this._activeScene = scene.getComponent(Scene)!.babylonComponent
    this.onSceneSwitched.notifyObservers(this._activeScene)
    return this
  }

  /**
   * Get scene AssetManager or return AssetManager in active scene.
   * @param scene Scene entity
   */
  public getAssetManager(scene?: EcsyEntity): BabylonAssetsManager {
    if (scene) {
      return this._assetManagers.get(scene.getComponent(Scene)!.babylonComponent.uid)!
    } else {
      return this._assetManagers.get(this._activeScene.uid)!
    }
  }

  private _render() {
    this.world.execute(this._engine.getDeltaTime(), performance.now())
    if (this._activeScene && this.world.enabled) {
      this._activeScene.render()
    }
  }
}