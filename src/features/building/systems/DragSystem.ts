import { Behavior } from "@babylonjs/core/Behaviors/behavior"
import { MultiPointerScaleBehavior } from "@babylonjs/core/Behaviors/Meshes/multiPointerScaleBehavior"
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior"
import { SixDofDragBehavior } from "@babylonjs/core/Behaviors/Meshes/sixDofDragBehavior"
import { Mesh as BabylonMesh } from "@babylonjs/core/Meshes/mesh"
import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { Mesh } from "../../world/components/Mesh"
import { Transform } from "../../world/components/Transform"
import { Drag } from "../components/Drag"

export class DragSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        mesh: { components: [Mesh, Drag], listen: { added: true } },
        menu: { components: [Drag], listen: { removed: true } }
    }
    /** @hidden */
    queries: any

    /** @hidden */
    execute() {
        this.queries.mesh.added.forEach((entity: EcsyEntity) => {
            const drag = entity.getComponent(Drag)
            const mesh = entity.getComponent(Mesh)
            console.log('DragSystem added',drag,mesh!.babylonComponent)
            if (mesh && mesh.babylonComponent) {
                const behavior = mesh.babylonComponent.getBehaviorByName("DragSystem")
                if (!behavior) {
                    let behavior: Behavior<BabylonMesh> & { onDragEndObservable?: any }
                    if (navigator.platform !== "Win32") {
                        if (drag?.allowScaling) {
                            const multiPointerScaleBehavior = new MultiPointerScaleBehavior()
                            behavior = multiPointerScaleBehavior
                        } else {
                            const sixDofDragBehavior = new SixDofDragBehavior()
                            sixDofDragBehavior.rotateDraggedObject = false
                            behavior = sixDofDragBehavior
                        }
                    } else {
                        behavior = new PointerDragBehavior()
                    }
                    behavior.name = "DragSystem"
                    mesh.babylonComponent.addBehavior(behavior)
                    console.log('DragSystem',behavior)
                    if (behavior.onDragEndObservable) {
                        behavior.onDragEndObservable.add(() => {
                            const transform = entity.getMutableComponent(Transform)!
                            transform.position = {
                                x: mesh.babylonComponent.position.x,
                                y: mesh.babylonComponent.position.y,
                                z: mesh.babylonComponent.position.z
                            }
                        })
                    }
                }
            }
        })
        this.queries.menu.removed.forEach((entity: EcsyEntity) => {
            const mesh = entity.getComponent(Mesh)!
            const behavior = mesh.babylonComponent.getBehaviorByName("DragSystem")
            if (behavior) {
                mesh.babylonComponent.removeBehavior(behavior)
            }
        })
    }
}