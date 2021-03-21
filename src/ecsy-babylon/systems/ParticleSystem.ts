import * as BABYLON from "babylonjs";
import { System, Entity } from "ecsy";
import { Particle, ParticleTypes } from "../components/index";
import { ParticleColorProperties } from "../components/types/index";
import { getScene, getAssetManager } from "../utils/gameUtils";
import { xyzToVector3 } from "../utils/mathUtils";
import { updateObjectValue, updateObjectVector3, updateObjectsTransform, disposeObject } from "../utils/objectUtils";
import { updateTexture, hexToColor4 } from "../utils/materialUtils";

/** System for Particle component */
export class ParticleSystem extends System {
  /** @hidden */
  static queries = {
    particle: { components: [Particle], listen: { added: true, removed: true, changed: [Particle] } },
  };
  /** @hidden */
  queries: any;

  /** @hidden */
  execute() {
    this.queries.particle.added.forEach((entity: Entity) => {
      let particle = entity.getComponent(Particle);
      particle.object = new BABYLON.ParticleSystem(particle.type!, particle.capacity!, getScene(this, particle.scene));
      let particleObject = particle.object;
      switch (particle.type) {
        case ParticleTypes.Point:
          particleObject.createPointEmitter(xyzToVector3(particle.direction1), xyzToVector3(particle.direction2));
          break;
        case ParticleTypes.Box:
          particleObject.createBoxEmitter(xyzToVector3(particle.direction1), xyzToVector3(particle.direction2), xyzToVector3(particle.minEmitBox), xyzToVector3(particle.maxEmitBox));
          break;
        case ParticleTypes.Sphere:
          particleObject.createSphereEmitter(particle.radius, particle.radiusRange);
          break;
        case ParticleTypes.DirectedSphere:
          particleObject.createDirectedSphereEmitter(particle.radius, xyzToVector3(particle.direction1), xyzToVector3(particle.direction2));
          break;
        case ParticleTypes.Hemisphere:
          particleObject.createHemisphericEmitter(particle.radius, particle.radiusRange);
          break;
        case ParticleTypes.Cylinder:
          particleObject.createCylinderEmitter(particle.radius, particle.height, particle.radiusRange, Math.random());
          break;
        case ParticleTypes.DirectedCylinder:
          particleObject.createDirectedCylinderEmitter(particle.radius, particle.height, particle.radiusRange, xyzToVector3(particle.direction1), xyzToVector3(particle.direction2));
          break;
        case ParticleTypes.Cone:
          particleObject.createConeEmitter(particle.radius, particle.angle);
          break;
      }
      this._updateParticle(particle);
      updateObjectsTransform(entity);
      particleObject.start();
    });

    this.queries.particle.changed.forEach((entity: Entity) => {
      this._updateParticle(entity.getComponent(Particle));
    });

    this.queries.particle.removed.forEach((entity: Entity) => {
      let particle = entity.getComponent(Particle);
      particle.object.stop();
      disposeObject(particle);
    });
  }

  private _updateParticle(particle: Particle) {
    for (let prop in particle) {
      switch (prop) {
        case "emitter":
        case "direction1":
        case "direction2":
        case "minEmitBox":
        case "maxEmitBox":
          updateObjectVector3(particle, prop);
          break;
        case "texture":
          updateTexture(particle, particle.texture!, getAssetManager(this, particle.scene));
          break;
        case "color":
          this._updateColor(particle, particle.color!);
          break;
        default:
          updateObjectValue(particle, prop);
          break;
      }
    }
  }

  private _updateColor(particle: Particle, color: ParticleColorProperties) {
    for (let prop in color) {
      (particle.object as any)[prop] = hexToColor4((color as any)[prop]);
    }
  }
}