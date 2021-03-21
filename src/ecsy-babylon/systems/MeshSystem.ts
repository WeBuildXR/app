import * as BABYLON from "babylonjs";
import { Entity, System } from "ecsy";
import { Mesh, MeshTypes } from "../components/index";
import { getScene, getAssetManager } from "../utils/gameUtils";
import { updateObjectsTransform, updateObjectValue } from "../utils/objectUtils";
import { disposeObject } from "../utils/objectUtils";

/** System for Mesh component */
export class MeshSystem extends System {
  /** @hidden */
  static queries = {
    mesh: { components: [Mesh], listen: { added: true, removed: true, changed: [Mesh] } },
  };
  /** @hidden */
  queries: any;

  /** @hidden */
  execute() {
    this.queries.mesh.added.forEach((entity: Entity) => {
      this._updateMesh(entity, entity.getComponent(Mesh));
    });

    this.queries.mesh.changed.forEach((entity: Entity) => {
      disposeObject(entity.getComponent(Mesh));
      this._updateMesh(entity, entity.getComponent(Mesh));
    });

    this.queries.mesh.removed.forEach((entity: Entity) => {
      disposeObject(entity.getComponent(Mesh));
    });
  }

  private _updateMesh(entity: Entity, mesh: Mesh) {
    switch (mesh.type) {
      case MeshTypes.Url:
        mesh.url && BABYLON.SceneLoader.IsPluginForExtensionAvailable(this._fileExt(mesh.url)) ?
          this._loadUrlMesh(entity, mesh, mesh.url) :
          this._unsupportedMesh(entity, mesh);
        break;
      default:
        mesh.object = (BABYLON.MeshBuilder as any)[`Create${mesh.type!}`].call(this, mesh.type!, mesh.options ? mesh.options : {}, getScene(this, mesh.scene));
        this._updateMeshValue(mesh);
        updateObjectsTransform(entity);
        break;
    }
  }

  private _fileExt(url: String): string {
    return url.substring(url.lastIndexOf("."), url.length);
  }

  private _loadUrlMesh(entity: Entity, mesh: Mesh, url: String) {
    let assetManager = getAssetManager(this, mesh.scene);
    let filenameIndex = url.lastIndexOf("/") + 1;
    let task = assetManager.addMeshTask(mesh.type!, "", url.substring(0, filenameIndex), url.substring(filenameIndex, url.length));
    task.onSuccess = (task) => {
      mesh.object = task.loadedMeshes[0] as BABYLON.Mesh;
      this._updateMeshValue(mesh);
      updateObjectsTransform(entity);
    }
    task.onError = () => { this._unsupportedMesh(entity, mesh); }
    assetManager.load();
    assetManager.reset();
  }

  private _updateMeshValue(mesh: Mesh) {
    for (let prop in mesh) {
      updateObjectValue(mesh, prop);
    }
  }

  private _unsupportedMesh(entity: Entity, mesh: Mesh) {
    let scene = getScene(this, mesh.scene);
    mesh.object = BABYLON.MeshBuilder.CreatePlane("", {}, scene);
    let material = new BABYLON.StandardMaterial("", scene);
    const errorData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURSgoKCgoKCgoKO88OVVpm6AAAAACdFJOU/LlgHlY8AAAAP9JREFUOMvN1MFtwzAMBVB3nU7RcQsSKDcI96EPvrPAZ0nZkRUZKXKMb36xPr+UxMvX8nB9LDRdy+fj/ff7gES4bKYUBPYDdLOQcEgDY1cx6AqIjUADQFYvUNohkAFBEbFP+Y1MRAPboU1JOKdUj8rgp1BLWo+jaQutQUdotDuqMS+eRxblzM8F3kHDkIAD8kNxcBbukCuidmADaILcITOheST/g2wDVIYEX+Gckj2q7NkjmyYMTRlU4K/+HJQNEWttGDtIwZZffgcH8rkJgtFBC2h44oYCHeCWoRztUBugQP0E15pCP32JyzT2AiZT0zyL2gvd4T3+YpeXwfy6+ANZO9QlB5svlAAAAABJRU5ErkJggg==";
    // BABYLON.Texture.BILINEAR_SAMPLINGMODE = 2
    material.diffuseTexture = new BABYLON.Texture("data:errorData", scene, false, false, 2, null, null, errorData, true);
    mesh.object.material = material;
    updateObjectsTransform(entity);
  }
}