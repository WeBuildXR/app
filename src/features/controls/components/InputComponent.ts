import { Component as EcsyComponent, Types as EcsyTypes } from "ecsy";

export class InputComponent<T> extends EcsyComponent<T> {
    /** @hidden */
    inputHandler: (eventData: any) => void
}