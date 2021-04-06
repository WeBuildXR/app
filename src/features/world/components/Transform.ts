import { Component as EcsyComponent, Types as EcsyTypes } from "ecsy";

export interface TransformProperties {
    x: number
    y: number
    z: number
}

const DefaultTransformProperties = () => ({
    x: 0,
    y: 0,
    z: 0
})

const ScaleTransformProperties = () => ({
    x: 1,
    y: 1,
    z: 1
})

export class Transform extends EcsyComponent<Transform> {
    /** @default 0,0,0 */
    position: TransformProperties = DefaultTransformProperties();
    /** @default 0,0,0 */
    rotation: TransformProperties = DefaultTransformProperties();
    /** @default 1,1,1 */
    scale: TransformProperties = ScaleTransformProperties();
}

Transform.schema = {
    position: { type: EcsyTypes.Ref },
    rotation: { type: EcsyTypes.Ref },
    scale: { type: EcsyTypes.Ref }
}