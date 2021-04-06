import { Component as EcsyComponent, Entity as EcsyEntity, Types as EcsyTypes } from "ecsy";

export class ShareSettings extends EcsyComponent<ShareSettings> {
    initiator?: boolean
}

ShareSettings.schema = {
    initiator: { type: EcsyTypes.Boolean }
}