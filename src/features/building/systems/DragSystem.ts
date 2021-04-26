import { Behavior } from "@babylonjs/core/Behaviors/behavior"
import { MultiPointerScaleBehavior } from "@babylonjs/core/Behaviors/Meshes/multiPointerScaleBehavior"
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior"
import { SixDofDragBehavior } from "@babylonjs/core/Behaviors/Meshes/sixDofDragBehavior"
import { Mesh as BabylonMesh } from "@babylonjs/core/Meshes/mesh"
import { Entity as EcsyEntity, Not, System as EcsySystem } from "ecsy"
import { MeshComponent } from "../../world/components/Mesh"
import { Transform } from "../../world/components/Transform"
import { Drag, Dragging } from "../components/Drag"
import { Selected } from "../components/Select"

export class DragSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        drag: { components: [MeshComponent, Drag, Not(Selected)], listen: { added: true } },
        dragging: { components: [Dragging] }
    }
    /** @hidden */
    queries: any

    public isDragging: boolean = false

    /** @hidden */
    execute() {
        this.queries.drag.added.forEach((entity: EcsyEntity) => {
            const drag = entity.getComponent(Drag)!
            const mesh = entity.getComponent(MeshComponent)!
            let behavior: Behavior<BabylonMesh> & { onDragStartObservable?: any; onDragEndObservable?: any }
            if (navigator.platform !== "Win32") {
                if (drag.allowScaling) {
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
            mesh.babylonComponent.addBehavior(behavior)
            if (behavior.onDragEndObservable) {
                behavior.onDragEndObservable.add(() => {
                    if (!entity.hasComponent(Dragging)) {
                        entity.addComponent(Dragging)
                        this.isDragging = true
                    }
                })
            }
            if (behavior.onDragEndObservable) {
                behavior.onDragEndObservable.add(() => {
                    const transform = entity.getMutableComponent(Transform)!
                    transform.position = {
                        x: mesh.babylonComponent.position.x,
                        y: mesh.babylonComponent.position.y,
                        z: mesh.babylonComponent.position.z
                    }
                    if (entity.hasComponent(Dragging)) {
                        entity.removeComponent(Dragging, true)
                        this.isDragging = false
                    }
                })
            }
        })
    }
}