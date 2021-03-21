/** Interface defined color properties of a Scene component. */
export interface SceneColorProperties {
  /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.scene#ambientcolor
   * @example #123ABC
   */
  ambient?: string;
    /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.scene#clearcolor
   * @example #123ABCFF
   */
  clear?: string;
    /** 
   * @see https://doc.babylonjs.com/api/classes/babylon.scene#fogcolor
   * @example #123ABC
   */
  fog?: string;
}