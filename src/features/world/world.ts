import { Entity as EcsyEntity } from "ecsy/src/Entity";
import { World as EcsyWorld } from "ecsy/src/World";
import { Camera } from "./components/Camera";
import { Mesh } from "./components/Mesh";
import { Scene } from "./components/Scene";
import { Transform } from "./components/Transform";
import { CameraSystem } from "./systems/CameraSystem";
import { MeshSystem } from "./systems/MeshSystem";
import { SceneSystem } from "./systems/SceneSystem";
import { TransformSystem } from "./systems/TransformSystem";
import { DebugLayer } from "@babylonjs/core/Debug"
import "@babylonjs/inspector"

export class world extends EcsyWorld {

    private static _instance: world

    static instance() {
        return this._instance || (this._instance = new world())
    }

    constructor() {
        super()
        this.registerComponent(Scene)
            .registerComponent(Transform)
            .registerComponent(Camera)
            .registerComponent(Mesh)
    }

    /**
     * Start game with an empty scene.
     * @param canvas Canvas for webgl context
     * @param systems Systems going to used besides SceneSystem, TransformSystem and CameraSystem
     */
    public start(canvas: HTMLCanvasElement, systems: any[]): world {
        this
            .registerSystem(SceneSystem)
            .registerSystem(TransformSystem)
            .registerSystem(CameraSystem)
            .registerSystem(MeshSystem)
        systems.forEach(system => this.registerSystem(system))
        const sceneSystem = this.getSystem(SceneSystem)
        sceneSystem.start(canvas);
        return this;
    }

    public createEntity(): EcsyEntity {
        return super.createEntity().addComponent(Transform);
    }

    public createScene(): EcsyEntity {
        return super.createEntity().addComponent(Scene);
    }

    public showDebugger() {
        const sceneSystem = this.getSystem(SceneSystem)
        new DebugLayer(sceneSystem.activeScene).show({
            embedMode: true
        })
    }
}