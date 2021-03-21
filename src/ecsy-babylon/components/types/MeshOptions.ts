/**
 * Interface defined options of a Mesh component. 
 * @see https://doc.babylonjs.com/api/classes/babylon.meshbuilder 
 */
export interface MeshOptions {
  /** @memberof Box, Plane */
  size?: number;
  /** @memberof Box, Plane, Ground */
  width?: number;
  /** @memberof Box, Plane, Ground */
  height?: number;
  /** @memberof Box */
  depth?: number;
  /** @memberof Sphere */
  segments?: number;
  /** @memberof Sphere */
  diameter?: number;
  /** @memberof Sphere */
  diameterX?: number;
  /** @memberof Sphere */
  diameterY?: number;
  /** @memberof Sphere */
  diameterZ?: number;
  /** @memberof Sphere */
  arc?: number;
  /** @memberof Sphere */
  slice?: number;
  /** @memberof Ground */
  subdivisions?: number;
}