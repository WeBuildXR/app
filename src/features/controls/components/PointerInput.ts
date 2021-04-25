import { Types as EcsyTypes } from "ecsy";
import { InputComponent } from "./InputComponent";

export class PointerInput extends InputComponent<PointerInput> {
    onPointerMove: (x: number, y: number, z: number, facet: number, mesh: any) => void
    onPointerSelect: (x: number, y: number, z: number, facet: number) => void
}

PointerInput.schema = {
    onPointerMove: { type: EcsyTypes.Ref },
    onPointerSelect: { type: EcsyTypes.Ref }
}