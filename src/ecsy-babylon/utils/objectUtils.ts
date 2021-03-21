import * as BABYLON from "babylonjs";
import { Entity } from "ecsy";
import { Transform } from "../components/Transform";
import { ObjectComponent } from "../components/types";
import { xyzToVector3, xyzToVector3Radians } from "./mathUtils";

/**
 * @hidden
 * Update value of Babylon.js object's property from a property in component with same name.
 * @param component Component contains Babylon.js object
 * @param name Name of property in the component 
 */
export function updateObjectValue<T extends ObjectComponent<any>>(component: T, name: string): void {
  (component.object as any)[name] = (component as any)[name];
}

/**
 * @hidden
 * Update Vector3 of Babylon.js object's property from property in component with same name.
 * @param component Component contains Babylon.js object
 * @param name Name of property in the component, value of property should matches XYZProperties  
 */
export function updateObjectVector3<T extends ObjectComponent<any>>(component: T, name: string): void {
  (component.object as any)[name] = xyzToVector3((component as any)[name]);
}

/**
 * @hidden
 * Get ObjectComponents in an Entity.
 * @param entity Entity to filter ObjectComponents
 */
export function getObjectComponents(entity: Entity): Array<ObjectComponent<BABYLON.Node>> {
  let components = entity.getComponents();
  let objectComponents: Array<ObjectComponent<BABYLON.Node>> = [];
  for (let prop in components) {
    let component = ((components as any)[prop] as any);
    component.object && objectComponents.push(component);
  }
  return objectComponents;
}

/**
 * @hidden
 * Update transformation of ObjectComponents in entity.
 * @param entity Entity to be updated
 */
export function updateObjectsTransform(entity: Entity): void {
  let components = entity.getComponents();
  for (let prop in components) {
    let component = ((components as any)[prop] as any);
    (component.object && entity.hasComponent(Transform)) && updateObjectTransform(entity.getMutableComponent(Transform), component);
  }
}

/**
 * @hidden
 * Update transformation to an ObjectComponent.
 * @param transform Transfrom component in the entity
 * @param component A component has Babylon.js object
 */
export function updateObjectTransform(transform: Transform, component: ObjectComponent<any>): void {
  let object = component.object;
  object.position && (object.position = xyzToVector3(transform.position));
  object.rotation && (object.rotation = xyzToVector3Radians(transform.rotation));
  object.scaling && (object.scaling = xyzToVector3(transform.scale));
}

/**
 * @hidden
 * Dispose Babylon.js object in the component. 
 * @param object Component contains Babylon.js object
 */
export function disposeObject(component: ObjectComponent<BABYLON.Scene | BABYLON.Node | BABYLON.Material | BABYLON.ParticleSystem | BABYLON.Camera>): void {
  component.object && component.object.dispose();
}