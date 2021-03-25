import * as BABYLON from "babylonjs";
import * as BABYLONGUI from "babylonjs-gui";
import { Entity, System } from "ecsy";
import { SceneColorProperties } from "../components/types/index";
import { Scene } from "../components/index";
import { getWorld } from "../utils/worldUtils";
import { disposeObject, updateObjectValue } from "../utils/objectUtils";
import { updateTexture, hexToColor4, hexToColor3 } from "../utils/materialUtils";

/** Core system of ecsy-babylon. */
export class GameSystem extends System {

  /** @hidden */
  static queries = {
    scene: { components: [Scene], listen: { added: true, removed: true, changed: [Scene] } },
  };
  /** @hidden */
  queries: any;

  private _engine: BABYLON.Engine;
  /** Get canvas used for rendering. */
  get renderingCanvas() { return this._engine.getRenderingCanvas(); }
  /** Get all scenes in engine. */
  get scenes() { return this._engine.scenes; }

  private _activeScene: BABYLON.Scene;
  /** Get active scene. */
  get activeScene() { return this._activeScene; }

  /** <Scene UID, BABYLON.AssetsManager> */
  private _assetManagers: Map<String, BABYLON.AssetsManager> = new Map<String, BABYLON.AssetsManager>();

  /** Observable event when active scene is switched. */
  public onSceneSwitched: BABYLON.Observable<BABYLON.Scene> = new BABYLON.Observable<BABYLON.Scene>();

  /** @hidden */
  init() {
    this._render = this._render.bind(this);
  }

  /** @hidden */
  execute() {
    this.queries.scene.added.forEach((entity: Entity) => {
      let scene = entity.getComponent(Scene);
      scene.object = new BABYLON.Scene(this._engine, scene.options);
      this._engine.scenes.length === 1 && (this._activeScene = scene.object);
      this._updateScene(entity);
      // add assetManager for each scenes 
      let assetManager = new BABYLON.AssetsManager(scene.object);
      assetManager.useDefaultLoadingScreen = false;
      this._assetManagers.set(scene.object.uid, assetManager);
      createSkybox(scene.object)
    });

    this.queries.scene.changed.forEach((entity: Entity) => {
      this._updateScene(entity);
    });

    this.queries.scene.removed.forEach((entity: Entity) => {
      let scene = entity.getComponent(Scene);
      disposeObject(scene);
    });
  }

  private _updateScene(entity: Entity) {
    let scene = entity.getComponent(Scene);
    for (let prop in scene) {
      switch (prop) {
        case "texture":
          updateTexture(scene, scene.texture!, this.getAssetManager(entity));
          break;
        case "color":
          this._updateColor(scene, scene.color!);
          break;
        default:
          updateObjectValue(scene, prop);
          break;
      }
    }
  }

  private _updateColor(scene: Scene, color: SceneColorProperties) {
    for (let prop in color) {
      switch (prop) {
        case "clear":
          (scene.object as any)[`${prop}Color`] = hexToColor4((color as any)[prop]);
          break;
        default:
          (scene.object as any)[`${prop}Color`] = hexToColor3((color as any)[prop]);
          break;
      }
    }
  }

  /**
   * Start game system in the world can be used by other systems & components.
   * @see https://doc.babylonjs.com/api/classes/babylon.engine#constructor
   * @param canvas WebGL context to be used for rendering
   * @param antialias defines enable antialiasing (default: false)
   * @param options @see https://doc.babylonjs.com/api/interfaces/babylon.engineoptions
   * @param adaptToDeviceRatio defines whether to adapt to the device's viewport characteristics (default: false)
   */
  public start(canvas: HTMLCanvasElement, antialias?: boolean, options?: BABYLON.EngineOptions, adaptToDeviceRatio?: boolean): GameSystem {
    this._engine = new BABYLON.Engine(canvas, antialias, options, adaptToDeviceRatio);
    this._engine.runRenderLoop(this._render);
    return this;
  }

  /**
   * Switch to a scene by given scene entity.
   * @param scene Scene entity
   */
  public switchScene(scene: Entity): GameSystem {
    this._activeScene = scene.getComponent(Scene).object;
    this.onSceneSwitched.notifyObservers(this._activeScene);
    return this;
  }

  /**
   * Get scene AssetManager or return AssetManager in active scene.
   * @param scene Scene entity
   */
  public getAssetManager(scene?: Entity): BABYLON.AssetsManager {
    if (scene) {
      return this._assetManagers.get(scene.getComponent(Scene).object.uid) as BABYLON.AssetsManager;
    } else {
      return this._assetManagers.get(this._activeScene.uid) as BABYLON.AssetsManager;
    }
  }

  private _messages: BABYLONGUI.Container;
  /**
   * Log a message to the screen
   * @param message text to display in a stack panel
   */
  public logMessage(message: string) {
    console.log('log', message)
    if (!this._messages) {
      this._messages = createTextPanel();
    }
    this._messages.addControl(createTextBlock(message));
  }

  private _render() {
    getWorld(this).execute(this._engine.getDeltaTime(), performance.now());
    getWorld(this).enabled && this._activeScene.render();
  }
}

function createTextPanel() {
  var advancedTexture = BABYLONGUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  var grid = new BABYLONGUI.Grid();
  grid.addColumnDefinition(1 / 3);
  grid.addColumnDefinition(1 / 3);
  grid.addColumnDefinition(1 / 3);
  advancedTexture.addControl(grid);

  var stack = new BABYLONGUI.StackPanel();
  stack.verticalAlignment = BABYLONGUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  grid.addControl(stack, 0, 2);

  return stack;
}

function createTextBlock(text: string, color: string = "red") {
  var textBlock = new BABYLONGUI.TextBlock();
  textBlock.text = text;
  textBlock.color = color;
  textBlock.fontSize = 12;
  textBlock.textHorizontalAlignment = BABYLONGUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  textBlock.height = "15px";
  return textBlock;
}

function createSkybox(scene: BABYLON.Scene) {
  var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
  var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
}