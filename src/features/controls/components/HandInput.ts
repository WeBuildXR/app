import { Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh as BabylonAbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Types as EcsyTypes } from "ecsy";
import { InputComponent } from "./InputComponent";

export class HandInput extends InputComponent<HandInput> {
    onLeftHandMove: (position?: BabylonVector3, direction?: BabylonVector3) => void
    onRightHandMove: (position?: BabylonVector3, direction?: BabylonVector3) => void
    onLeftPinchPress: (mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
    onRightPinchPress: (mesh?: BabylonAbstractMesh, direction?: BabylonVector3) => void
}

HandInput.schema = {
    onLeftHandMove: { type: EcsyTypes.Ref },
    onRightHandMove: { type: EcsyTypes.Ref },
    onLeftPinchPress: { type: EcsyTypes.Ref },
    onRightPinchPress: { type: EcsyTypes.Ref },
}