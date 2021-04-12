import { ActionManager } from "@babylonjs/core/Actions/actionManager"
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions"
import { SceneLoader as BabylonSceneLoader } from "@babylonjs/core/Loading/sceneLoader"
import { StandardMaterial as BabylonStandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { CubeTexture as BabylonCubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture"
import { Texture as BabylonTexture } from "@babylonjs/core/Materials/Textures/texture"
import { Color3 as BabylonColor3 } from "@babylonjs/core/Maths/math"
import { AbstractMesh as BabylonMesh } from "@babylonjs/core/Meshes/abstractMesh"
import { MeshBuilder as BabylonMeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { AssetsManager as BabylonAssetsManager } from "@babylonjs/core/Misc/assetsManager"
import { Scene as BabylonScene } from "@babylonjs/core/scene"
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture"
import { Control } from "@babylonjs/gui/2D/controls/control"
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle"
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock"
import { Entity, System } from "ecsy"
import { disposeComponent, hexToColor3, updateTransform } from "../common/babylonUtils"
import { BabylonComponent } from "../components/BabylonComponent"
import { MaterialColorAttributes, Mesh, MeshTypes, TextureAttributes } from "../components/Mesh"
import { Transform } from "../components/Transform"
import { SceneSystem } from "./SceneSystem"

export class MeshSystem extends System {
    /** @hidden */
    static queries = {
        meshes: { components: [Mesh], listen: { added: true, removed: true } },
    }

    /** @hidden */
    queries: any

    private materialCache: { [id: string]: BabylonStandardMaterial } = {}

    /** @hidden */
    execute() {
        this.queries.meshes.added.forEach(async (entity: Entity) => {
            const mesh = entity.getMutableComponent(Mesh)!
            const sceneSystem = this.world.getSystem(SceneSystem)
            const assetManager = sceneSystem.getAssetManager()
            await this.createMesh(mesh, sceneSystem.activeScene, assetManager)
            //mesh.babylonComponent.onAfterWorldMatrixUpdateObservable.add((eventData)=>{
            //    //console.log('onAfterWorldMatrixUpdateObservable', eventData.position)
            //    const transform = entity.getMutableComponent(Transform)!
            //    transform.position = eventData.position
            //})d
            updateTransform(entity, mesh)
        })

        this.queries.meshes.removed.forEach((entity: Entity) => {
            const mesh = entity.getRemovedComponent(Mesh) as BabylonComponent<BabylonMesh>
            disposeComponent(mesh)
        })
    }

    private async createMesh(mesh: Mesh, scene: BabylonScene, assetManager: BabylonAssetsManager) {
        const options = mesh.options || {}
        if (mesh.type == MeshTypes.Box) {
            mesh.babylonComponent = BabylonMeshBuilder.CreateBox("", options, scene)
            mesh.babylonComponent.checkCollisions = true
            await this.applyMaterial(mesh, scene, assetManager)
        } else if (mesh.type == MeshTypes.Ground) {
            mesh.babylonComponent = BabylonMeshBuilder.CreateGround("Ground", options, scene)
            mesh.babylonComponent.checkCollisions = true
            await this.applyMaterial(mesh, scene, assetManager)
        } else if (mesh.type == MeshTypes.Sky) {
            mesh.babylonComponent = BabylonMeshBuilder.CreateBox("Sky", options, scene)
            var skyboxMaterial = new BabylonStandardMaterial("skyBox", scene)
            skyboxMaterial.backFaceCulling = false
            skyboxMaterial.reflectionTexture = new BabylonCubeTexture(mesh.url!, scene)
            skyboxMaterial.reflectionTexture.coordinatesMode = BabylonTexture.SKYBOX_MODE
            skyboxMaterial.diffuseColor = new BabylonColor3(0, 0, 0)
            skyboxMaterial.specularColor = new BabylonColor3(0, 0, 0)
            mesh.babylonComponent.material = skyboxMaterial
        } else if (mesh.type == MeshTypes.Plane) {
            mesh.babylonComponent = BabylonMeshBuilder.CreatePlane("", options, scene)
            mesh.babylonComponent.checkCollisions = true
            await this.applyMaterial(mesh, scene, assetManager)
        } else if (mesh.type == MeshTypes.Model) {
            mesh.babylonComponent = await this.loadMesh(mesh.url!, assetManager)
            mesh.babylonComponent.checkCollisions = true
            await this.applyMaterial(mesh, scene, assetManager)
        } else {
            throw new Error(`Unsupported mesh type: ${mesh.type}`)
        }
    }

    private async applyMaterial(mesh: Mesh, scene: BabylonScene, assetManager: BabylonAssetsManager) {
        if (mesh.material) {
            const material = this.createMaterial(mesh.material.id, scene)
            if (mesh.material.alpha) {
                material.alpha = mesh.material.alpha
            }
            if (mesh.material.backFaceCulling) {
                material.backFaceCulling = true
            }
            if (mesh.material.color) {
                this.setColorAttributes(material, mesh.material.color)
            }
            if (mesh.material.texture) {
                if (mesh.material.texture.diffuse) {
                    material.diffuseTexture = await this.loadMaterial(mesh.material.texture.diffuse.url, assetManager)
                    this.setTextureAttributes(material.diffuseTexture as BabylonTexture, mesh.material.texture.diffuse)
                }
                if (mesh.material.texture.specular) {
                    material.specularTexture = await this.loadMaterial(mesh.material.texture.specular.url, assetManager)
                    this.setTextureAttributes(material.specularTexture as BabylonTexture, mesh.material.texture.specular)
                }
                if (mesh.material.texture.emissive) {
                    material.emissiveTexture = await this.loadMaterial(mesh.material.texture.emissive.url, assetManager)
                    this.setTextureAttributes(material.emissiveTexture as BabylonTexture, mesh.material.texture.emissive)
                }
                if (mesh.material.texture.ambient) {
                    material.ambientTexture = await this.loadMaterial(mesh.material.texture.ambient.url, assetManager)
                    this.setTextureAttributes(material.ambientTexture as BabylonTexture, mesh.material.texture.ambient)
                }
                if (mesh.material.texture.bump) {
                    material.bumpTexture = await this.loadMaterial(mesh.material.texture.bump.url, assetManager)
                    this.setTextureAttributes(material.bumpTexture as BabylonTexture, mesh.material.texture.bump)
                }
                if (mesh.material.texture.lightmap) {
                    material.lightmapTexture = await this.loadMaterial(mesh.material.texture.lightmap.url, assetManager)
                    this.setTextureAttributes(material.lightmapTexture as BabylonTexture, mesh.material.texture.lightmap)
                }
                if (mesh.material.texture.opacity) {
                    material.opacityTexture = await this.loadMaterial(mesh.material.texture.opacity.url, assetManager)
                    this.setTextureAttributes(material.opacityTexture as BabylonTexture, mesh.material.texture.opacity)
                }
                if (mesh.material.texture.reflection) {
                    material.reflectionTexture = await this.loadMaterial(mesh.material.texture.reflection.url, assetManager)
                    this.setTextureAttributes(material.reflectionTexture as BabylonTexture, mesh.material.texture.reflection)
                }
                if (mesh.material.texture.refraction) {
                    material.refractionTexture = await this.loadMaterial(mesh.material.texture.refraction.url, assetManager)
                    this.setTextureAttributes(material.refractionTexture as BabylonTexture, mesh.material.texture.refraction)
                }
            }
            mesh.babylonComponent.material = material
        }
    }

    private createMaterial(id: string | undefined, scene: BabylonScene) {
        if (id && this.materialCache[id]) {
            return this.materialCache[id]
        } else {
            const material = new BabylonStandardMaterial("", scene)
            if (id) {
                this.materialCache[id] = material
            }
            return material
        }
    }

    static meshData: any[] = []

    private async loadMesh(url: string, assetManager: BabylonAssetsManager): Promise<BabylonMesh> {
        return new Promise((resolve, reject) => {
            const ext = url.substring(url.lastIndexOf("."), url.length)
            if (BabylonSceneLoader.IsPluginForExtensionAvailable(ext)) {
                const fileNameIndex = url.lastIndexOf("/") + 1
                const fileName = url.substring(fileNameIndex, url.length)
                const task = assetManager.addMeshTask(`loadMesh_${Date()}`, "", url.substring(0, fileNameIndex), fileName)
                task.onSuccess = ({ loadedMeshes }) => {
                    loadedMeshes[0].name = fileName.replace(ext, "")
                    loadedMeshes[0].position.setAll(0)
                    loadedMeshes[0].rotation.setAll(0)
                    loadedMeshes[0].scaling.setAll(1)
                    resolve(loadedMeshes[0])
                }
                task.onError = (_, message) => {
                    reject(`Error loading mesh: ${url}\n${message}`)
                }
                assetManager.load()
                assetManager.reset()
            } else {
                reject(`Unsupported mesh type: ${url}`)
            }
        })
    }

    private async loadMaterial(url: string, assetManager: BabylonAssetsManager): Promise<BabylonTexture> {
        return new Promise((resolve, reject) => {
            const task = assetManager.addTextureTask(`loadMaterial_${Date()}`, url)
            task.onSuccess = ({ texture }) => {
                resolve(texture)
            }
            task.onError = (_, message) => {
                reject(`Error loading material: ${url}\n${message}`)
            }
            assetManager.load()
            assetManager.reset()
        })
    }

    private setColorAttributes(material: BabylonStandardMaterial, attributes: MaterialColorAttributes) {
        if (attributes.ambient) {
            material.ambientColor = hexToColor3(attributes.ambient)
        }
        if (attributes.diffuse) {
            material.diffuseColor = hexToColor3(attributes.diffuse)
        }
        if (attributes.emissive) {
            material.emissiveColor = hexToColor3(attributes.emissive)
        }
        if (attributes.specular) {
            material.specularColor = hexToColor3(attributes.specular)
        }
    }

    private setTextureAttributes(texture: BabylonTexture, attributes: TextureAttributes) {
        if (attributes.uAng) {
            texture.uAng = attributes.uAng
        }
        if (attributes.uOffset) {
            texture.uOffset = attributes.uOffset
        }
        if (attributes.uScale) {
            texture.uScale = attributes.uScale
        }
        if (attributes.vAng) {
            texture.vAng = attributes.vAng
        }
        if (attributes.vOffset) {
            texture.vOffset = attributes.vOffset
        }
        if (attributes.vScale) {
            texture.vScale = attributes.vScale
        }
    }
}