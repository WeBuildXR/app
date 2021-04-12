import { Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh as BabylonAbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Types as EcsyTypes } from "ecsy";
import { InputComponent } from "./InputComponent";

export class ControllerInput extends InputComponent<ControllerInput> {
    onLeftThumbstickMove: (x?: number, y?: number, direction?: BabylonVector3) => void
    onRightThumbstickMove: (x?: number, y?: number, direction?: BabylonVector3) => void
    onLeftTriggerPress: (mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
    onRightTriggerPress: (mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
    onLeftSqueezePress: (mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
    onRightSqueezePress: (mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
    onLeftButtonPress: (button?: string, mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
    onRightButtonPress: (button?: string, mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
}

ControllerInput.schema = {
    onLeftThumbstickMove: { type: EcsyTypes.Ref },
    onRightThumbstickMove: { type: EcsyTypes.Ref },
    onLeftTriggerPress: { type: EcsyTypes.Ref },
    onRightTriggerPress: { type: EcsyTypes.Ref },
    onLeftSqueezePress: { type: EcsyTypes.Ref },
    onRightSqueezePress: { type: EcsyTypes.Ref },
    onLeftButtonPress: { type: EcsyTypes.Ref },
    onRightButtonPress: { type: EcsyTypes.Ref },
}