import { Component as EcsyComponent, TagComponent as EcsyTagComponent, Types as EcsyTypes } from "ecsy";

export class SelectedBlock extends EcsyTagComponent {}
export class PreviewBlock extends EcsyTagComponent {}

export class Block extends EcsyComponent<Block> {
    voxelX: number
    voxelY: number
    voxelZ: number
    voxelWidth: number
    voxelHeight: number
    voxelDepth: number
}

Block.schema = {
    voxelX: { type: EcsyTypes.Number },
    voxelY: { type: EcsyTypes.Number },
    voxelZ: { type: EcsyTypes.Number },
    voxelWidth: { type: EcsyTypes.Number },
    voxelHeight: { type: EcsyTypes.Number },
    voxelDepth: { type: EcsyTypes.Number }
}

export class AddBlock extends EcsyComponent<AddBlock> {
    x: number
    y: number
    z: number
    width?: number = 1
    height?: number = 1
    depth?: number = 1
    facetAddDirection?: number = 0
    modelUrl?: string
    textureUrl?: string
}

AddBlock.schema = {
    x: { type: EcsyTypes.Number },
    y: { type: EcsyTypes.Number },
    z: { type: EcsyTypes.Number },
    width: { type: EcsyTypes.Number },
    height: { type: EcsyTypes.Number },
    depth: { type: EcsyTypes.Number },
    facetAddDirection: { type: EcsyTypes.Number },
    modelUrl: { type: EcsyTypes.String },
    textureUrl: { type: EcsyTypes.String }
}