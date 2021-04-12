import { Component as EcsyComponent, Entity as EcsyEntity, Types as EcsyTypes } from "ecsy";

export class ShareConnect extends EcsyComponent<ShareConnect> {
    signal: string
}

ShareConnect.schema = {
    signal: { type: EcsyTypes.String }
}