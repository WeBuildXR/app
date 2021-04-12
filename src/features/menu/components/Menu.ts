import { Component as EcsyComponent, Entity as EcsyEntity, Types as EcsyTypes } from "ecsy";
import { MenuButton } from "../../../core/MenuBehavior";

export class Menu extends EcsyComponent<Menu> {
    items: MenuButton[]
}

Menu.schema = {
    items: { type: EcsyTypes.Ref }
}