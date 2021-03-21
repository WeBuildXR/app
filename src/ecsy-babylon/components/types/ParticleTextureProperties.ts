import { TextureAttributes } from "./TextureAttributes";

/** Interface defined texture(s) of a Particle component. */
export interface ParticleTextureProperties {
  /** @see https://doc.babylonjs.com/api/classes/babylon.particlesystem#particletexture */
  particle?: TextureAttributes;
  /** @see https://doc.babylonjs.com/api/classes/babylon.particlesystem#noisetexture */
  noise?: TextureAttributes;
}