import * as BABYLON from "babylonjs";
import { System, Entity } from "ecsy";
import { Material, Mesh, MeshTypes } from "../components/index";
import { MaterialColorProperties } from "../components/types/index";
import { getScene, getAssetManager } from "../utils/gameUtils";
import { updateObjectValue, disposeObject } from "../utils/objectUtils";
import { updateTexture, hexToColor3 } from "../utils/materialUtils";

/** System for Material component */
export class MaterialSystem extends System {
  /** @hidden */
  static queries = {
    meshMaterial: { components: [Mesh, Material], listen: { added: true, removed: true, changed: [Material] } },
  };
  /** @hidden */
  queries: any;

  /** @hidden */
  execute() {
    this.queries.meshMaterial.added.forEach((entity: Entity) => {
      if (!this._isUrlMesh(entity)) {
        let material = entity.getComponent(Material);
        material.object = new BABYLON.StandardMaterial(material.color!.diffuse!, getScene(this, material.scene));
        this._updateMaterial(material);
        let mesh = entity.getComponent(Mesh);
        mesh.object.material = material.object;
      }
    });

    this.queries.meshMaterial.changed.forEach((entity: Entity) => {
      this._isUrlMesh(entity) || this._updateMaterial(entity.getComponent(Material));
    });

    this.queries.meshMaterial.removed.forEach((entity: Entity) => {
      if (!this._isUrlMesh(entity)) {
        disposeObject(entity.getComponent(Material));
        entity.getComponent(Mesh).object.material = null;
      }
    });
  }

  private _isUrlMesh(entity: Entity): boolean {
    return entity.getComponent(Mesh).type === MeshTypes.Url;
  }

  private _updateMaterial(material: Material) {
    for (let prop in material) {
      switch (prop) {
        case "color":
          this._updateColor(material, material.color!);
          break;
        case "texture":
          updateTexture(material, material.texture, getAssetManager(this, material.scene));
          break;
        default:
          updateObjectValue(material, prop);
          break;
      }
    }
  }

  private _updateColor(material: Material, color: MaterialColorProperties) {
    for (let prop in color) {
      ((material.object as any)[`${prop}Color`] = hexToColor3((color as any)[prop]));
    }
  }
}