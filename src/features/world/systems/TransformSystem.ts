import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { updateComponentTransform } from "../common/babylonUtils"
import { MeshComponent } from "../components/Mesh"
import { Transform } from "../components/Transform"

export class TransformSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        transforms: { components: [MeshComponent, Transform], listen: { added: true, changed: [Transform] } },
    }
    /** @hidden */
    queries: any

    /** @hidden */
    execute() {
        this.queries.transforms.added.forEach((entity: EcsyEntity) => {
            const transform = entity.getComponent(Transform)!
            const mesh = entity.getComponent(MeshComponent)!
            updateComponentTransform(transform, mesh)
        })
        this.queries.transforms.changed.forEach((entity: EcsyEntity) => {
            const transform = entity.getComponent(Transform)!
            const mesh = entity.getComponent(MeshComponent)!
            updateComponentTransform(transform, mesh)
        })
    }
}