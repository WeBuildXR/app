import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { updateComponentTransform } from "../common/babylonUtils"
import { Transform } from "../components/Transform"

export class TransformSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        transforms: { components: [Transform], listen: { changed: [Transform] } },
    }
    /** @hidden */
    queries: any

    /** @hidden */
    execute() {
        this.queries.transforms.changed.forEach((entity: EcsyEntity) => {
            const transform = entity.getComponent(Transform)!
            const components = entity.getComponents()
            for (let componentName in components) {
                const component = components[componentName] as any
                updateComponentTransform(transform, component)
            }
        })
    }
}