import { Camera as BabylonCamera } from "@babylonjs/core/Cameras";
import { TagComponent as EcsyTagComponent } from "ecsy";
import { BabylonComponent } from "./BabylonComponent";

export class Camera extends EcsyTagComponent implements BabylonComponent<BabylonCamera> {
    babylonComponent: BabylonCamera
}