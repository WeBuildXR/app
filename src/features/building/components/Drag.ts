import { Component as EcsyComponent, TagComponent as EcsyTagComponent, Types as EcsyTypes } from "ecsy";

export class Dragging extends EcsyTagComponent { }

export class Drag extends EcsyComponent<Drag> {
    showGizmos: boolean
    allowScaling: boolean
}

Drag.schema = {
    showGizmos: { type: EcsyTypes.Boolean },
    allowScaling: { type: EcsyTypes.Boolean }
}