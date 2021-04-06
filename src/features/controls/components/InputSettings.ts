import { Component as EcsyComponent, TagComponent as EcsyTagComponent, Entity as EcsyEntity, Types as EcsyTypes } from "ecsy";

export class InputControllerMesh extends EcsyTagComponent {}

export class InputSettings extends EcsyComponent<InputSettings> {
    teleportationFloorMesh?: EcsyEntity
    leftControllerMesh?: EcsyEntity
    rightControllerMesh?: EcsyEntity
}

InputSettings.schema = {
    teleportationFloorMesh: { type: EcsyTypes.Ref },
    leftControllerMesh: { type: EcsyTypes.Ref },
    rightControllerMesh: { type: EcsyTypes.Ref }
}