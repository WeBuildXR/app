import { Sound } from "@babylonjs/core/Audio/sound"
import { Engine as BabylonEngine } from "@babylonjs/core/Engines/engine"
import { EngineOptions as BabylonEngineOptions } from "@babylonjs/core/Engines/thinEngine"
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { Color4, Matrix, Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math"
import { AssetsManager as BabylonAssetsManager } from "@babylonjs/core/Misc/assetsManager"
import { Observable } from "@babylonjs/core/Misc/observable"
import { Scene as BabylonScene } from "@babylonjs/core/scene"
import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { disposeComponent } from "../common/babylonUtils"
import { BabylonComponent } from "../components/BabylonComponent"
import { Music, Scene } from "../components/Scene"

export class SceneSystem extends EcsySystem {

  /** @hidden */
  static queries = {
    scene: { components: [Scene], listen: { added: true, removed: true } },
    sound: { components: [Music], listen: { added: true, removed: true } },
  }
  /** @hidden */
  queries: any

  public getPickedPoint() {
    const scene = this.activeScene
    console.log('createPickingRay', scene.pointerX, scene.pointerY)
    const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), scene.activeCamera)
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
  private sound: Sound

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

      scene.babylonComponent.clearColor = new Color4(0, 0, 0, 1);

      var gl = new GlowLayer("glow", scene.babylonComponent, {
        mainTextureSamples: 4,
        blurKernelSize: 15
      })

      let assetManager = new BabylonAssetsManager(scene.babylonComponent)
      assetManager.useDefaultLoadingScreen = false
      this._assetManagers.set(scene.babylonComponent.uid, assetManager)
    })

    this.queries.scene.removed.forEach((entity: EcsyEntity) => {
      let scene = entity.getComponent(Scene)!
      disposeComponent(scene)
    })

    this.queries.sound.added.forEach((entity: EcsyEntity) => {
      let music = entity.getComponent(Music)!
      this.sound = new Sound("Music", music.url, this.activeScene, undefined, {
        autoplay: true,
        loop: true
      })
    })

    this.queries.sound.removed.forEach((entity: EcsyEntity) => {
      if (this.sound) {
        this.sound.stop()
        this.sound.dispose()
      }
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