import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AbstractMesh as BabylonMesh } from "@babylonjs/core/Meshes/abstractMesh"
import { Component as EcsyComponent, Types as EcsyTypes } from "ecsy";
import { BabylonComponent } from "./BabylonComponent"

export enum MeshTypes {
    Box = "Box",
    Plane = "Plane",
    Ground = "Ground",
    Sky = "Sky",
    Model = "Model"
}

export class Mesh extends EcsyComponent<Mesh> implements BabylonComponent<BabylonMesh> {
    babylonComponent: BabylonMesh
    /** @default "Box" */
    type?: MeshTypes = MeshTypes.Box
    url?: string
    options?: MeshOptions
    material?: Material
}

Mesh.schema = {
    type: { type: EcsyTypes.String },
    url: { type: EcsyTypes.String },
    options: { type: EcsyTypes.Ref },
    material: { type: EcsyTypes.Ref }
}

export interface Material {
    id?: string
    alpha?: number
    backFaceCulling?: boolean
    color?: MaterialColorAttributes
    texture?: MaterialTextureProperties
}

/**
 * Interface defined options of a Mesh component. 
 * @see https://doc.babylonjs.com/api/classes/babylon.meshbuilder 
 */
export interface MeshOptions {
    /** @memberof Box | Plane */
    size?: number
    /** @memberof Box | Plane | Ground */
    width?: number
    /** @memberof Box | Plane | Ground */
    height?: number
    /** @memberof Box */
    depth?: number
    /** @memberof Box */
    wrap?: boolean
    /** @memberof Ground */
    subdivisions?: number
    /** @memberof Mesh */
    opacity?: number
    /** @memberof Mesh */
    outlineColor?: Color3
}

/** Interface defined color properties of a Mesh material */
export interface MaterialColorAttributes {
    /** 
     * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#diffusecolor
     * @example #123ABC
     */
    diffuse?: string
    /** 
     * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#specularcolor
     * @example #123ABC
     */
    specular?: string
    /** 
     * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#emissivecolor
     * @example #123ABC
     */
    emissive?: string
    /** 
     * @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#ambientcolor
     * @example #123ABC
     */
    ambient?: string
}

/** Interface defined texture(s) of a Material component. */
export interface MaterialTextureProperties {
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#diffusetexture */
    diffuse?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#speculartexture */
    specular?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#emissivetexture */
    emissive?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#ambienttexture */
    ambient?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#bumptexture */
    bump?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#lightmaptexture */
    lightmap?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#opacitytexture */
    opacity?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#reflectiontexture */
    reflection?: TextureAttributes
    /** @see https://doc.babylonjs.com/api/classes/babylon.standardmaterial#refractiontexture */
    refraction?: TextureAttributes
}

/** 
 * Interface defined attribute(s) of a texture property. 
 * @see https://doc.babylonjs.com/api/classes/babylon.texture
 */
export interface TextureAttributes {
    /** @see https://doc.babylonjs.com/api/classes/babylon.texture#url */
    url: string
    /** @see https://doc.babylonjs.com/api/classes/babylon.texture#uoffset */
    uOffset?: number
    /** @see https://doc.babylonjs.com/api/classes/babylon.texture#voffset */
    vOffset?: number
    /** @see https://doc.babylonjs.com/api/classes/babylon.texture#uang */
    uAng?: number
    /** @see https://doc.babylonjs.com/api/classes/babylon.texture#vang */
    vAng?: number
    /** @see https://doc.babylonjs.com/api/classes/babylon.texture#uscale */
    uScale?: number
    /** @see https://doc.babylonjs.com/api/classes/babylon.texture#vscale */
    vScale?: number
}