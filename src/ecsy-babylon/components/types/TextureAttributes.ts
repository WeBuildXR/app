/** 
 * Interface defined attribute(s) of a texture property. 
 * @see https://doc.babylonjs.com/api/classes/babylon.texture
 */
export interface TextureAttributes {
  /** @see https://doc.babylonjs.com/api/classes/babylon.texture#url */
  url: string;
  /** @see https://doc.babylonjs.com/api/classes/babylon.texture#uoffset */
  uOffset?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.texture#voffset */
  vOffset?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.texture#uang */
  uAng?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.texture#vang */
  vAng?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.texture#uscale */
  uScale?: number;
  /** @see https://doc.babylonjs.com/api/classes/babylon.texture#vscale */
  vScale?: number;
}