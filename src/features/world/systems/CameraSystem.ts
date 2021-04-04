import { Camera as BabylonCamera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math";
import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { disposeComponent, updateTransform } from "../common/babylonUtils";
import { BabylonComponent } from "../components/BabylonComponent";
import { Camera } from "../components/Camera";
import { Transform } from "../components/Transform";
import { SceneSystem } from "./SceneSystem";

export class CameraSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        cameras: { components: [Camera, Transform], listen: { added: true, removed: true } },
    }
    /** @hidden */
    queries: any

    /** @hidden */
    execute() {
        this.queries.cameras.added.forEach((entity: EcsyEntity) => {
            const camera = entity.getMutableComponent(Camera)! as BabylonComponent<BabylonCamera>
            const sceneSystem = this.world.getSystem(SceneSystem)
            camera.babylonComponent = new FreeCamera("", BabylonVector3.Zero(), sceneSystem.activeScene)
            camera.babylonComponent.attachControl()
            updateTransform(entity, camera)
        })

        this.queries.cameras.removed.forEach((entity: EcsyEntity) => {
            const camera = entity.getComponent(Camera)! as BabylonComponent<BabylonCamera>
            disposeComponent(camera)
        })
    }
}