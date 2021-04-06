import { Angle as BabylonAngle, Color3 as BabylonColor3, Color4 as BabylonColor4, Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math";
import { BabylonComponent } from "../components/BabylonComponent";
import { Transform, TransformProperties } from "../components/Transform";
import { Entity as EcsyEntity } from "ecsy"

interface disposable {
    dispose(): void
}

interface movable {
    position: BabylonVector3
    rotation: BabylonVector3
    scaling: BabylonVector3
}

export function disposeComponent(component: BabylonComponent<disposable>): void {
    component && component.babylonComponent && component.babylonComponent.dispose()
}

export function hexToColor3(hexString: string): BabylonColor3 {
    return BabylonColor3.FromHexString(hexString);
}

export function hexToColor4(hexString: string): BabylonColor4 {
    return BabylonColor4.FromHexString(hexString);
}

export function updateTransform(entity: EcsyEntity, component: BabylonComponent<any>) {
    updateComponentTransform(entity.getComponent(Transform)!, component)
}

export function updateComponentTransform(transform: Transform, component: BabylonComponent<movable>): void {
    let babylonComponent = component.babylonComponent
    if (babylonComponent) {
        babylonComponent.position = applyVector3(babylonComponent.position, transform.position)
        babylonComponent.rotation = applyVector3Radians(babylonComponent.rotation, transform.rotation)
        babylonComponent.scaling = applyVector3(babylonComponent.scaling, transform.scale)
    }
}

function applyVector3(vector: BabylonVector3, { x, y, z }: TransformProperties): BabylonVector3 {
    if (vector) {
        vector.x = x
        vector.y = y
        vector.z = z
        return vector
    } else {
        return new BabylonVector3(x, y, z)
    }
}

function applyVector3Radians(vector: BabylonVector3, { x, y, z }: TransformProperties): BabylonVector3 {
    if (vector) {
        vector.x = degreeToRadians(x)
        vector.y = degreeToRadians(y)
        vector.z = degreeToRadians(z)
        return vector
    } else {
        return new BabylonVector3(degreeToRadians(x), degreeToRadians(y), degreeToRadians(z))
    }
}

export function degreeToRadians(degree: number): number {
    return BabylonAngle.FromDegrees(degree).radians()
}