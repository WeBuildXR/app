import { Component as EcsyComponent, Entity as EcsyEntity, Types as EcsyTypes } from "ecsy";
import { MenuButton } from "../../../core/MenuBehavior";

export class Menu extends EcsyComponent<Menu> {
    title: string
    items: MenuButton[]
}

Menu.schema = {
    title: { type: EcsyTypes.String },
    items: { type: EcsyTypes.Ref }
}