import { AssetContainer } from "@babylonjs/core/assetContainer";
import { ISceneLoaderAsyncResult, ISceneLoaderPluginAsync, ISceneLoaderPluginExtensions, ISceneLoaderProgressEvent } from "@babylonjs/core/Loading/sceneLoader";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { IndicesArray } from "@babylonjs/core/types";
import * as WEBIFC from "web-ifc/web-ifc-api";
import img from '../../public/textures/Img_2021_03_26_14_15_38.jpg';

export class IfcLoader implements ISceneLoaderPluginAsync {

    name = "IfcLoader"
    extensions = {
        ".ifc": { isBinary: false }
    }

    async importMeshAsync(meshesNames: any, scene: Scene, data: any, rootUrl: string, onProgress?: (event: ISceneLoaderProgressEvent) => void, fileName?: string): Promise<ISceneLoaderAsyncResult> {
        const mesh = await this.load(fileName!, data, scene, true)
        return {
            meshes: [mesh],
            animationGroups: [],
            geometries: [],
            lights: [],
            particleSystems: [],
            skeletons: [],
            transformNodes: []
        }
    }

    async loadAsync(scene: Scene, data: any, rootUrl: string, onProgress?: (event: ISceneLoaderProgressEvent) => void, fileName?: string): Promise<void> {
        await this.load(fileName!, rootUrl, scene, true)
    }

    loadAssetContainerAsync(scene: Scene, data: any, rootUrl: string, onProgress?: (event: ISceneLoaderProgressEvent) => void, fileName?: string): Promise<AssetContainer> {
        throw new Error("IfcLoader loadAssetContainerAsync Method not implemented.");
    }

    static ifcAPI: WEBIFC.IfcAPI;

    private async load(name: string, file: string, scene: Scene, mergematerials: boolean) {

        if (!IfcLoader.ifcAPI) {
            IfcLoader.ifcAPI = new WEBIFC.IfcAPI();
            await IfcLoader.ifcAPI.Init();
        }

        var mToggle_YZ = [
            1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -1];

        var modelID = await IfcLoader.ifcAPI.OpenModel(name, file);
        await IfcLoader.ifcAPI.SetGeometryTransformation(modelID, mToggle_YZ);
        var flatMeshes = this.getFlatMeshes(modelID);

        scene.blockMaterialDirtyMechanism = true;
        //scene.useGeometryIdsMap = true;
        //scene.useMaterialMeshMap = true;

        var nodecount = 0;
        var currentnode = 0;
        var mainObject = new Mesh("custom", scene);
        //var meshnode = new TransformNode("node" + currentnode, scene);

        var meshmaterials = new Map<number, Mesh>();

        for (var i = 0; i < flatMeshes.size(); i++) {
            var placedGeometries = flatMeshes.get(i).geometries;
            if (nodecount++ % 100 == 0) {
                currentnode++;
                //meshnode = new TransformNode("node" + currentnode, scene);
                //meshnode.parent = mainObject;
                meshmaterials = new Map<number, Mesh>();
            }
            for (var j = 0; j < placedGeometries.size(); j++) {
                this.getPlacedGeometry(modelID, placedGeometries.get(j), scene, mainObject, meshmaterials, mergematerials)
            }
        }

        return mainObject
    }

    private getFlatMeshes(modelID: number) {
        var flatMeshes = IfcLoader.ifcAPI.LoadAllGeometry(modelID);
        return flatMeshes;
    }

    private async getPlacedGeometry(modelID: number, placedGeometry: WEBIFC.PlacedGeometry, scene: Scene, mainObject: TransformNode, meshmaterials: Map<number, Mesh>, mergematerials: any) {
        var meshgeometry = this.getBufferGeometry(modelID, placedGeometry, scene);
        if (meshgeometry != null) {
            var m = placedGeometry.flatTransformation;

            var matrix = new Matrix();
            matrix.setRowFromFloats(0, m[0], m[1], m[2], m[3]);
            matrix.setRowFromFloats(1, m[4], m[5], m[6], m[7]);
            matrix.setRowFromFloats(2, m[8], m[9], m[10], m[11]);
            matrix.setRowFromFloats(3, m[12], m[13], m[14], m[15]);

            // Some IFC files are not parsed correctly, leading to degenerated meshes
            try {
                meshgeometry.bakeTransformIntoVertices(matrix);
            }
            catch {
                console.warn("Unable to bake transform matrix into vertex array. Some elements may be in the wrong position.");
            }

            let color = placedGeometry.color;
            let colorid: number = Math.floor(color.x * 256) + Math.floor(color.y * 256 ** 2) + Math.floor(color.z * 256 ** 3) + Math.floor(color.w * 256 ** 4);

            if (mergematerials && meshmaterials.has(colorid)) {
                var tempmesh = meshmaterials.get(colorid)!;

                meshgeometry.material = tempmesh.material;
                var mergedmesh = Mesh.MergeMeshes([tempmesh, meshgeometry], true, true)!;
                mergedmesh.name = colorid.toString(16);

                mergedmesh.material!.freeze();
                //mergedmesh.freezeWorldMatrix();

                meshmaterials.set(colorid, mergedmesh);
                mergedmesh.parent = mainObject;

            }
            else {
                var newMaterial = this.getMeshMaterial(color, scene)
                meshgeometry.material = newMaterial;

                meshgeometry.material.freeze();
                //meshgeometry.freezeWorldMatrix();

                meshmaterials.set(colorid, meshgeometry);
                meshgeometry.parent = mainObject;
            }

            return meshgeometry;
        }
        else return null;
    }

    private getBufferGeometry(modelID: number, placedGeometry: { geometryExpressID: number; }, scene: any) {
        var geometry = IfcLoader.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        if (geometry.GetVertexDataSize() !== 0) {
            var vertices = IfcLoader.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
            var indices = IfcLoader.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());

            var mesh = new Mesh("custom", scene);

            var vertexData = this.getVertexData(vertices, indices);
            vertexData.applyToMesh(mesh, false);

            return mesh;
        }
        else return null;
    }

    private getVertexData(vertices: Float32Array, indices: IndicesArray) {
        var positions = new Array(Math.floor(vertices.length / 2));
        var normals = new Array(Math.floor(vertices.length / 2));
        for (var i = 0; i < vertices.length / 6; i++) {
            positions[i * 3 + 0] = vertices[i * 6 + 0];
            positions[i * 3 + 1] = vertices[i * 6 + 1];
            positions[i * 3 + 2] = vertices[i * 6 + 2];
            normals[i * 3 + 0] = vertices[i * 6 + 3];
            normals[i * 3 + 1] = vertices[i * 6 + 4];
            normals[i * 3 + 2] = vertices[i * 6 + 5];
        }
        var vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.normals = normals;
        vertexData.indices = indices;

        // calculate UVs (i believe this is calculation for plane geometry)

        var uvs = [];
        for (var p = 0; p < positions.length / 3; p++) {
            uvs.push((positions[3 * p] - (-4)), (positions[3 * p + 2] - (-4)))
        }

        //create new vertex data and apply it to mesh

        vertexData.uvs = uvs;

        var uvBuffer = vertexData.uvs;

        /*
            UPDATING UVs
        */
        var getVec3FromBuffer = function (buffer: { [x: string]: any; }, index: number) {
            return new Vector3(buffer[index], buffer[index + 1], buffer[index + 2]);
        }

        var vertexPositions = vertexData.positions;
        var vertexNormals = vertexData.normals

        var numberOfVertices = vertexPositions.length / 3;
        for (var i = 0; i < numberOfVertices; i++) {
            var normal = getVec3FromBuffer(vertexNormals, i * 3);
            var position = getVec3FromBuffer(vertexPositions, i * 3);
            var u = 0.0;
            var v = 0.0;

            if (normal.equalsWithEpsilon(Vector3.Up())) {
                u = position.x;
                v = position.z;
            } else if (normal.equalsWithEpsilon(Vector3.Down())) {
                u = position.x;
                v = position.z;
            } else if (normal.equalsWithEpsilon(Vector3.Left())) {
                u = position.y;
                v = position.z;
            } else if (normal.equalsWithEpsilon(Vector3.Right())) {
                u = position.y;
                v = position.z;
            } else if (normal.equalsWithEpsilon(Vector3.Forward())) {
                u = position.x;
                v = position.y;
            } else if (normal.equalsWithEpsilon(Vector3.Backward())) {
                u = position.x;
                v = position.y;
            } else {
                console.log("Cannot project position into u-v space.")
            }
            uvBuffer[i * 2] = u;
            uvBuffer[i * 2 + 1] = v;
        }

        vertexData.uvs = uvBuffer;

        return vertexData;
    }

    private getMeshMaterial(color: { x: any; y: any; z: any; w: number; }, scene: any) {
        var myMaterial = new StandardMaterial("myMaterial", scene);

        // if material has alpha - make it fully transparent for performance
        myMaterial.alpha = (color.w < 1.0 ? 0 : 1);
        myMaterial.sideOrientation = Mesh.DOUBLESIDE;
        myMaterial.backFaceCulling = false;
        //myMaterial.disableLighting = true;

        myMaterial.diffuseTexture = new Texture(img, scene);

        return myMaterial;
    }
}