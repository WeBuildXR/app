import { DebugLayer } from "@babylonjs/core/Debug";
import { SceneOptions as BabylonSceneOptions } from "@babylonjs/core/scene";
import "@babylonjs/inspector";
import { NotComponent as EcsyNotComponent, SystemConstructor as EcsySystemConstructor } from "ecsy";
import { Entity as EcsyEntity } from "ecsy/src/Entity";
import { World as EcsyWorld } from "ecsy/src/World";
import { logMessage } from "../../core/WorldLogger";
import { Scene } from "./components/Scene";
import { Transform } from "./components/Transform";
import { CameraSystem } from "./systems/CameraSystem";
import { MeshSystem } from "./systems/MeshSystem";
import { SceneSystem } from "./systems/SceneSystem";
import { TransformSystem } from "./systems/TransformSystem";

export class world extends EcsyWorld {

    private static _instance: world

    static instance() {
        return this._instance || (this._instance = new world())
    }

    public start(canvas: HTMLCanvasElement, systems: EcsySystemConstructor<any>[]): world {
        const getBabylonScene = () => this.getSystem(SceneSystem).activeScene
        const getBabylonAssetManager = () => this.getSystem(SceneSystem).getAssetManager()
        const worldProperties = {
            getBabylonScene,
            getBabylonAssetManager,
            logMessage
        }
        this.registerSystemAndComponents(SceneSystem, worldProperties)
            .registerSystemAndComponents(TransformSystem, worldProperties)
            .registerSystemAndComponents(CameraSystem, worldProperties)
            .registerSystemAndComponents(MeshSystem, worldProperties)
        systems.forEach(system => this.registerSystemAndComponents(system, worldProperties))
        const sceneSystem = this.getSystem(SceneSystem)
        sceneSystem.start(canvas);
        return this;
    }

    public createEntity(): EcsyEntity {
        return super.createEntity().addComponent(Transform);
    }

    public createScene(options?: BabylonSceneOptions): EcsyEntity {
        return super.createEntity().addComponent(Scene, { options });
    }

    public showDebugger() {
        const sceneSystem = this.getSystem(SceneSystem)
        new DebugLayer(sceneSystem.activeScene).show({
            embedMode: true
        })
    }

    private registerSystemAndComponents(system: EcsySystemConstructor<any>, worldProperties: any) {
        if (system.queries) {
            for (let query in system.queries) {
                for (let componentType of system.queries[query].components) {
                    if (isNotComponentType(componentType)) {
                        if (!this.hasRegisteredComponent(componentType.Component)) {
                            this.registerComponent(componentType.Component)
                        }
                    } else if (!this.hasRegisteredComponent(componentType)) {
                        this.registerComponent(componentType)
                    }
                }
            }
        }
        this.registerSystem(system, worldProperties)
        return this
    }

}

function isNotComponentType(componentType: any): componentType is EcsyNotComponent<any> {
    return componentType.type === "not"
}