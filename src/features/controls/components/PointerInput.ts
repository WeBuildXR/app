import { AbstractMesh as BabylonAbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Types as EcsyTypes } from "ecsy";
import { InputComponent } from "./InputComponent";

export class PointerInput extends InputComponent<PointerInput> {
    onPointerMove: (mesh: BabylonAbstractMesh, facet: number) => void
    onPointerSelect: (mesh: BabylonAbstractMesh, facet: number, button: number | undefined) => void
}

PointerInput.schema = {
    onPointerMove: { type: EcsyTypes.Ref },
    onPointerSelect: { type: EcsyTypes.Ref }
}