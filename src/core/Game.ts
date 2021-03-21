import { Entity, World } from "ecsy";
import { GameSystem, Transform, TransformSystem, CameraSystem, Scene, SceneColorProperties } from "../ecsy-babylon";

export class Game extends World {
  private static _game: Game;

  /** Get all Entity instances. */
  public get entities() {
    return (this as any)["entityManager"]._entities;
  }

  /** Get all System instances. */
  public get systems() {
    return (this as any)["systemManager"]._systems;
  }

  /** Get GameSystem instance. */
  public get gameSystem() {
    return this.getSystem(GameSystem) as GameSystem;
  }

  private constructor() {
    super();
  }

  /** Get singleton of Game instance. */
  public static instance(): Game {
    this._game || (this._game = new Game());
    return this._game;
  }

  /**
   * Start game with an empty scene.
   * @param canvas Canvas for webgl context
   * @param systems Systems going to used besides GameSystem, TransformSystem and CameraSystem
   */
  public start(canvas: HTMLCanvasElement, systems: any[]): Game {
    this
      .registerSystem(GameSystem)
      .registerSystem(TransformSystem)
      .registerSystem(CameraSystem);
    systems.forEach(system => this.registerSystem((system as any)));
    this.gameSystem.start(canvas);
    return this;
  }

  /** Create an entity with Transform component. */
  public createEntity(): Entity {
    return super.createEntity().addComponent(Transform);
  }

  /** Create a scene entity. */
  public createScene(color?: SceneColorProperties): Entity {
    return super.createEntity().addComponent(Scene, { color: color });
  }

  /** Show Babylon.js insepctor */
  public showDebugger() {
    this.gameSystem.activeScene.debugLayer.show();
  }
}