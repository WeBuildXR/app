import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { MenuBehavior } from "../../../core/MenuBehavior"
import { MeshComponent } from "../../world/components/Mesh"
import { Menu } from "../components/Menu"

export class MenuSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        mesh: { components: [MeshComponent, Menu], listen: { added: true } },
        menu: { components: [Menu], listen: { removed: true } }
    }
    /** @hidden */
    queries: any

    /** @hidden */
    execute() {
        this.queries.mesh.added.forEach((entity: EcsyEntity) => {
            const mesh = entity.getComponent(MeshComponent)!
            const menu = entity.getComponent(Menu)!
            const behavior = mesh.babylonComponent.getBehaviorByName("MenuSystem")
            if (!behavior) {
                const behavior = new MenuBehavior(menu.items, menu.title)
                behavior.name = "MenuSystem"
                mesh.babylonComponent.addBehavior(behavior)
            }
        })
        this.queries.menu.removed.forEach((entity: EcsyEntity) => {
            const mesh = entity.getComponent(MeshComponent)!
            const behavior = mesh.babylonComponent.getBehaviorByName("MenuSystem")
            if (behavior) {
                mesh.babylonComponent.removeBehavior(behavior)
            }
        })
    }
}