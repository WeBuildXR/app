import { Component as EcsyComponent, Types as EcsyTypes } from "ecsy";

export class VoxelSettings extends EcsyComponent<VoxelSettings> {
    width?: number = 10
    height?: number = 10
}

VoxelSettings.schema = {
    width: { type: EcsyTypes.Number },
    height: { type: EcsyTypes.Number }
}