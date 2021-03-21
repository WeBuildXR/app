/** Interface defined color properties of a Material component. */
export interface MaterialColorProperties {
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#diffusecolor
   * @example #123ABC
   */
  diffuse?: string;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#specularcolor
   * @example #123ABC
   */
  specular?: string;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#emissivecolor
   * @example #123ABC
   */
  emissive?: string;
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#ambientcolor
   * @example #123ABC
   */
  ambient?: string;
}