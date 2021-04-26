import { ActionManager } from "@babylonjs/core/Actions/actionManager"
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions"
import { Entity as EcsyEntity, Not, System as EcsySystem } from "ecsy"
import { MeshComponent } from "../../world/components/Mesh"
import { Dragging } from "../components/Drag"
import { Select, Selected } from "../components/Select"

export class SelectionSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        select: { components: [MeshComponent, Select, Not(Dragging)], listen: { added: true } },
        selected: { components: [Selected] }
    }
    /** @hidden */
    queries: any

    public isSelected: boolean = false

    /** @hidden */
    execute() {
        this.queries.select.added.forEach((entity: EcsyEntity) => {
            const mesh = entity.getComponent(MeshComponent)!
            const scene = mesh.babylonComponent.getScene()
            mesh.babylonComponent.actionManager = new ActionManager(scene)
            mesh.babylonComponent.actionManager.registerAction(new ExecuteCodeAction({
                trigger: ActionManager.OnPointerOverTrigger
            }, (actionEvent) => {
                if (actionEvent.meshUnderPointer && !entity.hasComponent(Selected)) {
                    actionEvent.meshUnderPointer.showSubMeshesBoundingBox = true
                    entity.addComponent(Selected)
                    this.isSelected = true
                }
            }))
            mesh.babylonComponent.actionManager.registerAction(new ExecuteCodeAction({
                trigger: ActionManager.OnPointerOutTrigger
            }, (actionEvent) => {
                if (actionEvent.meshUnderPointer && entity.hasComponent(Selected)) {
                    actionEvent.meshUnderPointer.showSubMeshesBoundingBox = false
                    entity.removeComponent(Selected, true)
                    this.isSelected = false
                }
            }))
        })
    }
}