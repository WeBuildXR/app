import { Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math.vector";
import { Types as EcsyTypes } from "ecsy";
import { InputComponent } from "./InputComponent";

export class HeadInput extends InputComponent<HeadInput> {
    onHeadMove: (position?: BabylonVector3, direction?: BabylonVector3) => void
}

HeadInput.schema = {
    onHeadMove: { type: EcsyTypes.Ref }
}