import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { MenuBehavior } from "../../../core/MenuBehavior"
import { Mesh } from "../../world/components/Mesh"
import { Menu } from "../components/Menu"

export class MenuSystem extends EcsySystem {
    /** @hidden */
    static queries = {
        menu: { components: [Mesh, Menu], listen: { added: true, removed: true } }
    }
    /** @hidden */
    queries: any

    /** @hidden */
    execute() {
        this.queries.menu.added.forEach((entity: EcsyEntity) => {
            const mesh = entity.getComponent(Mesh)
            if (mesh && mesh.babylonComponent) {
                const menu = entity.getComponent(Menu)!
                const behavior = mesh.babylonComponent.getBehaviorByName("MenuSystem")
                if (!behavior) {
                    const behavior = new MenuBehavior(menu.items)
                    behavior.name = "MenuSystem"
                    mesh.babylonComponent.addBehavior(behavior)
                }
            }
        })
        this.queries.menu.removed.forEach((entity: EcsyEntity) => {
            const mesh = entity.getComponent(Mesh)!
            const behavior = mesh.babylonComponent.getBehaviorByName("MenuSystem")
            if (behavior) {
                mesh.babylonComponent.removeBehavior(behavior)
            }
        })
    }
}