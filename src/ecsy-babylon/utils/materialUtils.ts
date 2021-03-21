import * as BABYLON from "babylonjs";
import { TextureComponent, TextureAttributes, MaterialColorProperties } from "../components/types/index";
import { disposeObject } from "./objectUtils";

/**
 * @hidden
 * Update texture object to a component for its texture properties.
 * @param component TextureComponent in the entity
 * @param textureProperties Texture properties to be update
 * @param assetManager AssetManager to process textures
 */
export function updateTexture<T>(component: TextureComponent<T>, textureProperties: T, assetManager: BABYLON.AssetsManager): void {
  for (let prop in textureProperties) {
    let textureAttributes = (textureProperties as any)[prop] as TextureAttributes;
    let task = assetManager.addTextureTask(prop, textureAttributes.url);
    task.onSuccess = (task) => {
      let textureObject = (task as BABYLON.TextureAssetTask).texture;
      for (let attr in textureAttributes) { attr !== "url" && ((textureObject as any)[attr] = (textureAttributes as any)[attr]); }
      let textureName = `${prop}Texture`;
      let componentObject = component.object;
      (componentObject as any)[textureName] && disposeObject((componentObject as any)[textureName]);
      (componentObject as any)[textureName] = textureObject;
    }
  }
  assetManager.load();
  assetManager.reset();
}

/**
 * @hidden
 * Create object of material color values or create a material color object with white diffuse.
 * @param diffuse Diffuse color in hex string. e.g., #123ABC
 * @returns Object matches MaterialColorProperties
 */
export function materialColorHex(diffuse?: string): MaterialColorProperties {
  if (diffuse) {
    return { diffuse: diffuse };
  } else {
    return { diffuse: "#ffffff" };
  }
}

/**
 * Convert hex color value to Color3. 
 * @param hexString Text of hex color value(e.g., #123ABC)
 */
export function hexToColor3(hexString: string): BABYLON.Color3 {
  return BABYLON.Color3.FromHexString(hexString);
}

/**
 * Convert hex color value to Color4 (has alpha). 
 * @param hexString Text of hex color value(e.g., #123ABCFF)
 */
export function hexToColor4(hexString: string): BABYLON.Color4 {
  return BABYLON.Color4.FromHexString(hexString);
}