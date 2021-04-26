import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Entity } from "ecsy";
import leftIconUrl from "../assets/images/left-icon.png";
import removeIconUrl from "../assets/images/remove-icon.png";
import rightIconUrl from "../assets/images/right-icon.png";
import logoUrl from "../assets/images/webuild.png";
import { IfcLoader } from "./core/ifcloader";
import ifc from "./data/ifc";
import models from "./data/models";
import textures from "./data/textures";
import { AddBlock } from "./features/building/components/Block";
import { Drag } from "./features/building/components/Drag";
import { Menu } from "./features/building/components/Menu";
import { Select } from "./features/building/components/Select";
import { VoxelSettings } from "./features/building/components/VoxelSettings";
import { DragSystem } from "./features/building/systems/DragSystem";
import { MenuSystem } from "./features/building/systems/MenuSystem";
import { SelectionSystem } from "./features/building/systems/SelectionSystem";
import { VoxelSystem } from "./features/building/systems/VoxelSystem";
import { ShareSystem } from "./features/collaboration/systems/ShareSystem";
import { ControllerInput } from "./features/controls/components/ControllerInput";
import { HandInput } from "./features/controls/components/HandInput";
import { KeyboardInput } from "./features/controls/components/KeyboardInput";
import { PointerInput } from "./features/controls/components/PointerInput";
import { InputSystem } from "./features/controls/systems/InputSystem";
import { Camera } from "./features/world/components/Camera";
import { Mesh, MeshTypes } from "./features/world/components/Mesh";
import { Music } from "./features/world/components/Scene";
import { Transform } from "./features/world/components/Transform";
import { SceneSystem } from "./features/world/systems/SceneSystem";
import { world } from "./features/world/world";

const settings: any = {
  width: 80,
  height: 80,
  depth: 80,
  selectedTexture: textures[0].url,
  selectedIFC: ifc[0],
  selectedModel: "",
  selectedGroundTexture: "",
  enableSound: true
}

const ifcLoader = new IfcLoader()
ifcLoader.MaterialTexture = settings.selectedTexture
SceneLoader.RegisterPlugin(ifcLoader)

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = world.instance()

game.start(canvas, [InputSystem, MenuSystem, VoxelSystem, DragSystem, SelectionSystem, ShareSystem])

game.createScene()

const camera = game.createEntity().addComponent(Camera);
camera.getMutableComponent(Transform)!.position.y = 3.5
camera.getMutableComponent(Transform)!.position.z = -15
camera.getMutableComponent(Transform)!.rotation.x = -15

const ground = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Ground,
    options: {
      width: settings.width,
      height: settings.height
    },
    material: {
      useGridMaterial: true
    }
  })
ground.getMutableComponent(Transform)!.position.y = -.5;

const frontWall = addWall(0, 0, (settings.height / 2), 0)
const backWall = addWall(0, 0, -(settings.height / 2), 0)
const leftWall = addWall(-(settings.width / 2), 0, 0, 90)
const rightWall = addWall((settings.width / 2), 0, 0, -90)
addCeiling()
createTextureMenu(leftWall, "wall", "Select an image for the texture of your model")
createTextureMenu(backWall, "ground", "Select an image for the floor of your world")
createTextureMenu(rightWall, "block", "Select a block and place in the world")
createModelMenu(frontWall)

const logo = game.createEntity().addComponent(Mesh, {
  type: MeshTypes.Plane,
  options: {
    width: 20,
    height: 6
  },
  material: {
    texture: {
      diffuse: { url: logoUrl }
    },
    color: {
      diffuse: "#FFFFFF",
      ambient: "#FFFFFF"
    }
  }
})
logo.getMutableComponent(Transform)!.position.x = -5
logo.getMutableComponent(Transform)!.position.y = 22
logo.getMutableComponent(Transform)!.position.z = (settings.height / 2) - 1

loadLocalSettings()

const music = game.createEntity()
toggleSound()

game.createEntity().addComponent(VoxelSettings, settings)

game.createEntity().addComponent(ControllerInput)
game.createEntity().addComponent(HandInput)

game.createEntity().addComponent(PointerInput, {
  onPointerSelect: (x: number, y: number, z: number, facet: number) => {
    const dragSystem = game.getSystem(DragSystem)
    if (!dragSystem.isDragging) {
      const selectionSystem = game.getSystem(SelectionSystem)
      if (selectionSystem.isSelected) {
        addBlock(x, y, z, facet)
      } else {
        const sceneSystem = game.getSystem(SceneSystem)
        if (sceneSystem.activeScene.meshUnderPointer && sceneSystem.activeScene.meshUnderPointer.name === "Ground") {
          addBlock(x, y, z, 0)
        } else {
          addBlock(x, y, z, 0)
          console.log('meshUnderPointer', sceneSystem.activeScene.meshUnderPointer)
        }
      }
    }
  }
})

game.createEntity().addComponent(KeyboardInput, {
  onKeyDown: (key) => {
    const sceneSystem = game.getSystem(SceneSystem)
    const voxelSystem = game.getSystem(VoxelSystem)
    switch (key) {
      case "a":
        const { x, y, z } = sceneSystem.getPickedPoint()!
        addBlock(x, y, z, 0)
        break;
      case "c":
        clearLocalSettings()
        break;
      case "s":
        voxelSystem.save()
        break;
      case "l":
        voxelSystem.load()
        break;
      case "d":
        game.showDebugger()
        break;
    }
  }
})

function createModelMenu(entity: Entity) {
  entity.addComponent(Menu, {
    title: "Select a model and place it in the world",
    items: ifc.map((model) => ({
      imageUrl: "./models/preview/glb/decor/stairs_wide.png",
      action: () => {
        console.log('selectedIFC', model.name)
        settings.selectedIFC = model
        settings.selectedModel = undefined
        saveLocalSettings()
      }
    })).concat(models.map((model) => ({
      imageUrl: model.preview,
      action: () => {
        console.log('selectedModel', model.url)
        settings.selectedIFC = undefined
        settings.selectedModel = model.url
        saveLocalSettings()
      }
    }))).concat([
      {
        text: "Load World",
        action: () => {
          const voxelSystem = game.getSystem(VoxelSystem)
          voxelSystem.load()
        }
      },
      {
        text: "Toggle Sound",
        action: () => {
          settings.enableSound = !settings.enableSound
          toggleSound()
          saveLocalSettings()
        }
      },
      {
        text: "Save World",
        action: () => {
          const voxelSystem = game.getSystem(VoxelSystem)
          voxelSystem.save()
        }
      }
    ] as any)
  })
}

function toggleSound() {
  if (settings.enableSound) {
    music.addComponent(Music, {
      url: "./audio/tron.mp3"
    })
  } else if (music.hasComponent(Music)) {
    music.removeComponent(Music)
  }
}

function createTextureMenu(entity: Entity, group: "wall" | "ground" | "block", title: string) {
  entity.addComponent(Menu, {
    title,
    items: textures.filter(({ category }) => category === group).map(({ url }) => ({
      imageUrl: url,
      action: () => {
        if (group === "wall") {
          console.log('selectedTexture', url)
          settings.selectedTexture = url
          ifcLoader.MaterialTexture = url
          saveLocalSettings()
        }
        else if (group === "ground") {
          const mesh = ground.getMutableComponent(Mesh)!
          console.log('ground', url)
          mesh.material = {
            texture: {
              diffuse: { url }
            }
          }
          settings.selectedGroundTexture = url
          saveLocalSettings()
        }
        else if (group === "block") {
          settings.selectedTexture = url
          settings.selectedIFC = undefined
          settings.selectedModel = undefined
          saveLocalSettings()
        }
      }
    })).concat(group === "ground" ? [
      {
        text: "No Ground Texture",
        action: () => {
          const mesh = ground.getMutableComponent(Mesh)!
          mesh.material =  {
            useGridMaterial: true
          }
          settings.selectedGroundTexture = undefined
          saveLocalSettings()
        }
      }
    ] as any : [])
  })
}

function addBlock(x: number, y: number, z: number, facetAddDirection: number) {
  if (settings.selectedIFC) {
    //add IFC model
    const entity = game.createEntity().addComponent(AddBlock, {
      x, y, z, facetAddDirection,
      width: settings.selectedIFC.width,
      height: settings.selectedIFC.height,
      depth: settings.selectedIFC.depth,
      modelUrl: settings.selectedIFC.url
    })
      .addComponent(Select)
      .addComponent(Drag)
    addBlockMenu(entity)
  } else if (settings.selectedModel) {
    //add GLB model
    const entity = game.createEntity()
      .addComponent(Mesh, {
        type: MeshTypes.Model,
        url: settings.selectedModel
      })
      .addComponent(Select)
      .addComponent(Drag)
    const transform = entity.getMutableComponent(Transform)!
    transform.position.x = x
    transform.position.y = y
    transform.position.z = z
    transform.scale.x = 4
    transform.scale.y = 4
    transform.scale.z = 4
    addBlockMenu(entity)
  } else {
    //add textured block
    const entity = game.createEntity().addComponent(AddBlock, {
      x, y, z, facetAddDirection,
      textureUrl: settings.selectedTexture
    })
      .addComponent(Select)
      .addComponent(Drag)
    addBlockMenu(entity)
  }
}

function addBlockMenu(entity: Entity) {
  if (!entity.hasComponent(Menu)) {
    entity.addComponent(Menu, {
      items: [
        {
          text: "Rotate Left",
          imageUrl: leftIconUrl,
          action: () => {
            const transform = entity.getMutableComponent(Transform)!
            transform.rotation.y += 15
            if (transform.rotation.y >= 360) {
              transform.rotation.y = 0
            }
          }
        },
        {
          text: "Remove",
          imageUrl: removeIconUrl,
          action: () => entity.removeComponent(Mesh)
        },
        {
          text: "Rotate Right",
          imageUrl: rightIconUrl,
          action: () => {
            const transform = entity.getMutableComponent(Transform)!
            if (transform.rotation.y === 0) {
              transform.rotation.y = 360
            }
            transform.rotation.y -= 15
          }
        }
      ]
    })
  }
}

function addWall(x: number, y: number, z: number, r: number) {
  const wall = game.createEntity().addComponent(Mesh, {
    type: MeshTypes.Box,
    options: {
      width: settings.width,
      height: settings.height,
      depth: 1
    },
    material: {
      useGridMaterial: true
    }
  })
  wall.getMutableComponent(Transform)!.position.x = x
  wall.getMutableComponent(Transform)!.position.y = y
  wall.getMutableComponent(Transform)!.position.z = z
  wall.getMutableComponent(Transform)!.rotation.y = r
  return wall
}

function addCeiling() {
  const wall = game.createEntity().addComponent(Mesh, {
    type: MeshTypes.Box,
    options: {
      width: settings.width,
      height: settings.height,
      depth: 1
    },
    material: {
      useGridMaterial: true
    }
  })
  wall.getMutableComponent(Transform)!.position.y = settings.height / 2
  wall.getMutableComponent(Transform)!.rotation.x = -90
}

function clearLocalSettings() {
  localStorage["WeBuildXR_1.0"] = null
}

function saveLocalSettings() {
  const state = {
    selectedTexture: settings.selectedTexture,
    selectedIFC: settings.selectedIFC,
    selectedModel: settings.selectedModel,
    selectedGroundTexture: settings.selectedGroundTexture,
    enableSound: settings.enableSound
  }
  localStorage["WeBuildXR_1.0"] = JSON.stringify(state)
}

function loadLocalSettings() {
  if (localStorage["WeBuildXR_1.0"]) {
    const json = localStorage["WeBuildXR_1.0"]
    const state = JSON.parse(json)
    ifcLoader.MaterialTexture = state.selectedTexture
    settings.selectedTexture = state.selectedTexture
    settings.selectedIFC = state.selectedIFC
    settings.selectedModel = state.selectedModel
    settings.selectedGroundTexture = state.selectedGroundTexture
    settings.enableSound = state.enableSound
    if (state.selectedGroundTexture) {
      const mesh = ground.getMutableComponent(Mesh)!
      mesh.material = {
        texture: {
          diffuse: { url: state.selectedGroundTexture }
        }
      }
    }
  }
}