import { Color3, PointerDragBehavior } from "@babylonjs/core"
import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { Mesh, MeshTypes } from "../../world/components/Mesh"
import { Transform } from "../../world/components/Transform"
import { AddBlock, Block, SelectedBlock } from "../components/Block"
import { VoxelSettings } from "../components/VoxelSettings"

export class VoxelSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        settings: { components: [VoxelSettings], listen: { added: true } },
        create: { components: [AddBlock], listen: { added: true } },
        select: { components: [SelectedBlock], listen: { added: true, removed: true } },
        move: { components: [Block, Transform], listen: { changed: [Transform] } },
        blocks: { components: [Block], listen: { added: true, removed: true, changed: [Block] } },
    }
    /** @hidden */
    queries: any

    public save() {
        const data = []
        for (var xyz in this.blocks) {
            const [x, y, z] = xyz.split('-')
            const entity = this.blocks[xyz]
            const { width, height, depth, textureUrl, modelUrl } = entity.getComponent(AddBlock) as AddBlock
            data.push({ x, y, z, width, height, depth, textureUrl, modelUrl })
        }
        localStorage["VoxelSystem_1.0"] = JSON.stringify(data)
    }

    public load() {
        const json = localStorage["VoxelSystem_1.0"]
        if (json) {
            const data = JSON.parse(json)
            for (var add of data) {
                this.world.createEntity().addComponent(AddBlock, add)
            }
        }
    }

    public getSelectedBlock() {
        return this.selectedBlock
    }

    public clearSelection() {
        if (this.selectedBlock) {
            this.selectedBlock.removeComponent(SelectedBlock, true)
            this.selectedBlock = undefined
        }
    }

    public removeSelectedBlock() {
        if (this.selectedBlock) {
            this.selectedBlock.removeComponent(Block)
            this.selectedBlock = undefined
        }
    }

    public findBlock(x: number, y: number, z: number): EcsyEntity | undefined {
        let { voxelX, voxelY, voxelZ } = this.normalizeCoordinates(x, y, z)
        return this.getBlock(voxelX, voxelY, voxelZ)
    }

    public hasBlock(x: number, y: number, z: number) {
        let { voxelX, voxelY, voxelZ } = this.normalizeCoordinates(x, y, z)
        return this.getBlock(voxelX, voxelY, voxelZ) !== undefined
    }

    private maxWidth: number = 10
    private maxHeight: number = 10
    private blocks: any = {}
    private selectedBlock?: EcsyEntity

    private dragBehavior: PointerDragBehavior

    init() {
        this.dragBehavior = new PointerDragBehavior()
        //this.dragBehavior = new SixDofDragBehavior()
        //this.dragBehavior.rotateDraggedObject = false
        let draggingBlock: EcsyEntity | undefined
        this.dragBehavior.onDragStartObservable.add(() => {
            draggingBlock = this.selectedBlock
        })
        this.dragBehavior.onDragEndObservable.add(() => {
            if (draggingBlock) {
                const mesh = draggingBlock.getComponent(Mesh)
                if (mesh) {
                    const transform = draggingBlock.getMutableComponent(Transform)!
                    transform.position = mesh.babylonComponent.position
                }
            }
        })
    }

    /** @hidden */
    execute() {
        this.queries.settings.added.forEach((entity: EcsyEntity) => {
            const settings = entity.getComponent(VoxelSettings)!
            if (settings.width) this.maxWidth = settings.width
            if (settings.height) this.maxHeight = settings.height
        })

        //Adding Blocks
        this.queries.create.added.forEach((entity: EcsyEntity) => {
            this.clearSelection()
            const add = entity.getComponent(AddBlock)!
            const transform = entity.getComponent(Transform)!
            let { x, y, z } = add
            const block = this.addNewBlock(x, y, z, add.facetAddDirection!)
            if (block) {
                const key = this.getBlockName(block.voxelX, block.voxelY, block.voxelZ)
                this.blocks[key] = entity.addComponent(Block, {
                    ...block,
                    voxelWidth: add.width,
                    voxelHeight: add.height,
                    voxelDepth: add.depth
                })
                transform.position.x = block.voxelX
                transform.position.y = block.voxelY
                transform.position.z = block.voxelZ
                if (add.modelUrl) {
                    entity.addComponent(Mesh, {
                        type: MeshTypes.Model,
                        options: {
                            width: add.width,
                            height: add.height
                        },
                        url: add.modelUrl
                    })
                } else if (add.textureUrl) {
                    entity.addComponent(Mesh, {
                        type: MeshTypes.Box,
                        options: {
                            wrap: true,
                            width: add.width,
                            height: add.height
                        },
                        material: {
                            id: add.textureUrl,
                            backFaceCulling: true,
                            texture: {
                                diffuse: { url: add.textureUrl }
                            }
                        }
                    })
                } else {
                    entity.addComponent(Mesh, {
                        type: MeshTypes.Box,
                        options: {
                            outlineColor: Color3.Red(),
                            width: add.width,
                            height: add.height
                        }
                    })
                }
            }
            //TODO: AddBlock is only used once, but is kept around for saving
            //entity.removeComponent(AddBlock, true)
        })

        //Selecting Blocks
        this.queries.select.added.forEach((entity: EcsyEntity) => {
            this.clearSelection()
            const mesh = entity.getComponent(Mesh)!
            mesh.babylonComponent.showBoundingBox = true
            mesh.babylonComponent.addBehavior(this.dragBehavior)
            this.selectedBlock = entity
        })
        this.queries.select.removed.forEach((entity: EcsyEntity) => {
            const mesh = entity.getComponent(Mesh)!
            mesh.babylonComponent.showBoundingBox = false
            mesh.babylonComponent.removeBehavior(this.dragBehavior)
            //TODO: fix bug where selectedBlock becomes null which makes 2 simultaneous selections possible
            //this.selectedBlock = undefined
        })

        //Moving Blocks
        this.queries.move.changed.forEach((entity: EcsyEntity) => {
            const prev = entity.getMutableComponent(AddBlock)!
            const block = entity.getMutableComponent(Block)!
            const transform = entity.getComponent(Transform)!
            let { x, y, z } = transform.position
            const newPosition = this.clipBlockPosition(x, y, z)
            if (newPosition) {
                const old = this.getBlockName(block.voxelX, block.voxelY, block.voxelZ)
                delete this.blocks[old]
                prev.x = block.voxelX
                prev.y = block.voxelY
                prev.z = block.voxelZ
                const key = this.getBlockName(newPosition.voxelX, newPosition.voxelY, newPosition.voxelZ)
                this.blocks[key] = entity
                console.log('block moved', block, newPosition)
                block.voxelX = newPosition.voxelX
                block.voxelY = newPosition.voxelY
                block.voxelZ = newPosition.voxelZ
            }
        })

        //Changing / Removing Blocks
        this.queries.blocks.added.forEach((entity: EcsyEntity) => {
            //TODO: Add scaling to these world coordinates (for now its 1m)
            const block = entity.getComponent(Block)!
            const transform = entity.getMutableComponent(Transform)!
            transform.position.x = block.voxelX
            transform.position.y = block.voxelY
            transform.position.z = block.voxelZ
        })
        this.queries.blocks.changed.forEach((entity: EcsyEntity) => {
            //TODO: Add scaling to these world coordinates (for now its 1m)
            const block = entity.getComponent(Block)!
            const transform = entity.getMutableComponent(Transform)!
            transform.position.x = block.voxelX
            transform.position.y = block.voxelY
            transform.position.z = block.voxelZ
        })
        this.queries.blocks.removed.forEach((entity: EcsyEntity) => {
            this.clearSelection()
            //entity.removeComponent(AddBlock, true)
            //entity.removeComponent(Mesh)
            //TODO: figure out why removing the Mesh component doesn't work
            const block = entity.getRemovedComponent(Block)!
            const old = this.getBlockName(block.voxelX, block.voxelY, block.voxelZ)
            delete this.blocks[old]
            const mesh = entity.getComponent(Mesh)!
            mesh.babylonComponent.dispose()
            //entity.remove(true)
        })
    }

    private getBlockName(x: number, y: number, z: number) {
        return `${x}-${y}-${z}`
    }

    private getBlock(x: number, y: number, z: number) {
        const key = this.getBlockName(x, y, z)
        return this.blocks[key]
    }

    private normalizeCoordinates(x: number, y: number, z: number) {
        return {
            voxelX: Math.round(x),
            voxelY: Math.round(y),
            voxelZ: Math.round(z)
        }
    }

    private addNewBlock(x: number, y: number, z: number, facet: number) {
        let { voxelX, voxelY, voxelZ } = this.normalizeCoordinates(x, y, z)
        while (this.getBlock(voxelX, voxelY, voxelZ)) {
            switch (facet) {
                case 0:
                    voxelZ += 1
                    break;
                case 2:
                    voxelZ -= 1
                    break;
                case 4:
                    voxelX += 1
                    break;
                case 6:
                    voxelX -= 1
                    break;
                case 8:
                    voxelY += 1
                    break;
                case 10:
                    voxelY -= 1
                    break;
            }
        }
        return this.clipBlockPosition(voxelX, voxelY, voxelZ)
    }

    private clipBlockPosition(x: number, y: number, z: number) {
        let { voxelX, voxelY, voxelZ } = this.normalizeCoordinates(x, y, z)
        if (voxelX < -this.maxWidth) voxelX = -this.maxWidth
        if (voxelX > this.maxWidth) voxelX = this.maxWidth
        if (voxelY < 0) voxelY = 0
        if (voxelY > this.maxHeight * 2) voxelY = this.maxHeight * 2
        if (voxelZ < -this.maxWidth) voxelZ = -this.maxWidth
        if (voxelZ > this.maxWidth) voxelZ = this.maxWidth
        if (!this.getBlock(voxelX, voxelY, voxelZ)) {
            return {
                voxelX,
                voxelY,
                voxelZ
            }
        } else {
            return undefined
        }
    }
}