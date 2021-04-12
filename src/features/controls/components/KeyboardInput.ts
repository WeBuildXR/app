import { Types as EcsyTypes } from "ecsy";
import { InputComponent } from "./InputComponent";

export class KeyboardInput extends InputComponent<KeyboardInput> {
    onKeyDown: (key: string) => void
    onKeyUp: (key: string) => void
}

KeyboardInput.schema = {
    onKeyDown: { type: EcsyTypes.Ref },
    onKeyUp: { type: EcsyTypes.Ref },
}