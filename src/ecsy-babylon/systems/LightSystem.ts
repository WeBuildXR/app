import * as BABYLON from "babylonjs";
import { Entity, System } from "ecsy";
import { Light, LightTypes } from "../components/index";
import { LightColorProperties } from "../components/types/index";
import { getScene } from "../utils/gameUtils";
import { hexToColor3 } from "../utils/materialUtils";
import { degreeToRadians, xyzToVector3 } from "../utils/mathUtils";
import { updateObjectValue, updateObjectVector3, updateObjectsTransform, disposeObject } from "../utils/objectUtils";

/** System for Light component */
export class LightSystem extends System {
  /** @hidden */
  static queries = {
    light: { components: [Light], listen: { added: true, removed: true, changed: [Light] } },
  };
  /** @hidden */
  queries: any;

  /** @hidden */
  execute() {
    this.queries.light.added.forEach((entity: Entity) => {
      let light = entity.getComponent(Light);
      let direction = xyzToVector3(light.direction);
      let scene = getScene(this, light.scene);
      switch (light.type) {
        case LightTypes.Point:
          light.object = new BABYLON.PointLight(light.type, BABYLON.Vector3.Zero(), scene);
          break;
        case LightTypes.Directional:
          light.object = new BABYLON.DirectionalLight(light.type, direction, scene);
          break;
        case LightTypes.Spot:
          light.object = new BABYLON.SpotLight(light.type, BABYLON.Vector3.Zero(), direction, degreeToRadians(light.angle!), light.exponent!, scene);
          break;
        default:
          light.object = new BABYLON.HemisphericLight(LightTypes.Hemispheric, direction, scene);
          break;
      }
      this._updateLight(light);
      updateObjectsTransform(entity);
    });

    this.queries.light.changed.forEach((entity: Entity) => {
      this._updateLight(entity.getComponent(Light));
    });

    this.queries.light.removed.forEach((entity: Entity) => {
      disposeObject(entity.getComponent(Light));
    });
  }

  private _updateLight(light: Light) {
    for (let prop in light) {
      switch (prop) {
        case "direction":
          updateObjectVector3(light, prop);
          break;
        case "color":
          this._updateColor(light, light.color!);
          break;
        default:
          updateObjectValue(light, prop);
          break;
      }
    }
  }

  private _updateColor(light: Light, color: LightColorProperties) {
    for (let prop in color) {
      (light.object as any)[prop] = hexToColor3((color as any)[prop]);
    }
  }
}