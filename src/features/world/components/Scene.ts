import { Scene as BabylonScene, SceneOptions as BabylonSceneOptions } from "@babylonjs/core/scene";
import { Component as EcsyComponent, Types as EcsyTypes } from "ecsy";
import { BabylonComponent } from "./BabylonComponent";

export class Scene extends EcsyComponent<Scene> implements BabylonComponent<BabylonScene> {
    babylonComponent: BabylonScene
    /** @see https://doc.babylonjs.com/api/interfaces/babylon.sceneoptions */
    options?: BabylonSceneOptions;
}

Scene.schema = {
    options: { type: EcsyTypes.Ref }
}