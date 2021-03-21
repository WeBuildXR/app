import * as BABYLON from "babylonjs";
import { XYZProperties } from "../components/types/index";

/**
 * Translate degree to radians.
 * @param degree Degree
 */
export function degreeToRadians(degree: number): number {
  return BABYLON.Angle.FromDegrees(degree).radians();
}

/**
 * Convert XYZProperties value to Vector3. 
 * @param properties XYZProperties value
 */
export function xyzToVector3(properties: XYZProperties): BABYLON.Vector3 {
  return new BABYLON.Vector3(properties.x, properties.y, properties.z);
}

/**
 * Convert XYZProperties degree value to Vector3 in radians. 
 * @param properties XYZProperties value in degrees
 */
export function xyzToVector3Radians(properties: XYZProperties): BABYLON.Vector3 {
  return new BABYLON.Vector3(degreeToRadians(properties.x), degreeToRadians(properties.y), degreeToRadians(properties.z));
}

/**
 * @hidden
 * Create object by XYZ values or create all zero object.
 * @param x value
 * @param y value
 * @param z value
 * @returns Object matches XYZProperties
 */
export function xyz(x?: number, y?: number, z?: number): XYZProperties {
  if (x && y && z) {
    return { x: x, y: y, z: z };
  } else {
    return { x: 0, y: 0, z: 0 };
  }
}
