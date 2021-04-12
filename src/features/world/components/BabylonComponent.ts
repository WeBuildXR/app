import { Camera as BabylonCamera } from "@babylonjs/core/Cameras/camera";
import { Material as BabylonMaterial } from "@babylonjs/core/Materials/material";
import { Node as BabylonNode } from "@babylonjs/core/node";
import { ParticleSystem as BabylonParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Scene as BabylonScene } from "@babylonjs/core/scene";

export interface BabylonComponent<T = BabylonScene | BabylonNode | BabylonMaterial | BabylonParticleSystem | BabylonCamera> {
    babylonComponent: T;
}