import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { AddBlock, Block } from "../../building/components/Block"
import { VoxelSystem } from "../../building/systems/VoxelSystem"
import { ShareConnect } from "../components/ShareConnect"
import { ShareSettings } from "../components/ShareSettings"

declare class SimplePeer {
    connected: boolean
    constructor(initiator?: boolean, trickle?: boolean)
    on(event: "error" | "signal" | "connect" | "data", callback: (data?: any) => void): void
    signal(data: string): void
    send(data: string): void
}

export class ShareSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        settings: { components: [ShareSettings], listen: { added: true } },
        connect: { components: [ShareConnect], listen: { added: true } },
        shared: { components: [AddBlock, Block], listen: { added: true, removed: true, changed: [Block] } }
    }
    /** @hidden */
    queries: any

    private peerClient: SimplePeer
    private cpmm: SimplePeer

    /** @hidden */
    execute() {
        this.queries.settings.added.forEach((entity: EcsyEntity) => {
            const settings = entity.getComponent(ShareSettings)!
            this.peerClient = new SimplePeer(settings.initiator)
            this.peerClient.on('error', err => console.log('SimplePeer Error', err))
            this.peerClient.on('signal', (signal) => console.log('SimplePeer Signal', signal))
            this.peerClient.on('connect', () => console.log('SimplePeer Connected'))
            this.peerClient.on('data', (json) => {
                const data = JSON.parse(json) as AddBlock & Block & { type: "add" | "change" | "remove" }
                if (data.type === "add") {
                    this.world.createEntity().addComponent(AddBlock, data)
                } else if (data.type === "change") {
                    const voxelSystem = this.world.getSystem(VoxelSystem)
                    const blockEntity = voxelSystem.findBlock(data.x, data.y, data.z)
                    if (blockEntity) {
                        const block = blockEntity.getMutableComponent(Block)!
                        block.voxelX = data.voxelX
                        block.voxelY = data.voxelY
                        block.voxelZ = data.voxelZ
                    }
                } else if (data.type === "remove") {
                    const voxelSystem = this.world.getSystem(VoxelSystem)
                    const blockEntity = voxelSystem.findBlock(data.x, data.y, data.z)
                    if (blockEntity) {
                        blockEntity.removeComponent(Block)
                    }
                }
            })
        })
        this.queries.connect.added.forEach((entity: EcsyEntity) => {
            const connect = entity.getComponent(ShareConnect)!
            this.peerClient?.signal(connect.signal)
        })
        this.queries.shared.added.forEach((entity: EcsyEntity) => {
            const add = entity.getComponent(AddBlock)!
            const block = entity.getComponent(Block)!
            const { width, height, depth, textureUrl, modelUrl } = add
            const { voxelX, voxelY, voxelZ } = block
            const data = { type: "add", x: voxelX, y: voxelY, z: voxelZ, width, height, depth, textureUrl, modelUrl }
            if (this.peerClient?.connected) {
                this.peerClient.send(JSON.stringify(data))
            }
        })
        this.queries.shared.changed.forEach((entity: EcsyEntity) => {
            const prev = entity.getComponent(AddBlock)!
            const block = entity.getComponent(Block)!
            const { x, y, z } = prev
            const { voxelX, voxelY, voxelZ } = block
            const data = { type: "change", x, y, z, voxelX, voxelY, voxelZ }
            if (this.peerClient?.connected) {
                this.peerClient.send(JSON.stringify(data))
            }
        })
        this.queries.shared.removed.forEach((entity: EcsyEntity) => {
            const block = entity.getRemovedComponent(Block)
            if (block) {
                const { voxelX, voxelY, voxelZ } = block
                const data = { type: "remove", x: voxelX, y: voxelY, z: voxelZ }
                if (this.peerClient?.connected) {
                    this.peerClient.send(JSON.stringify(data))
                }
            }
        })
    }
}