import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Entity } from "ecsy";
import removeIconUrl from "../assets/images/remove-icon.png";
import leftIconUrl from "../assets/images/left-icon.png";
import rightIconUrl from "../assets/images/right-icon.png";
import logoUrl from "../assets/images/webuild.png";
import { AddBlock, Block, SelectedBlock } from "./features/building/components/Block";
import { VoxelSettings } from "./features/building/components/VoxelSettings";
import { VoxelSystem } from "./features/building/systems/VoxelSystem";
import { ShareSystem } from "./features/collaboration/systems/ShareSystem";
import { ControllerInput } from "./features/controls/components/ControllerInput";
import { HandInput } from "./features/controls/components/HandInput";
import { KeyboardInput } from "./features/controls/components/KeyboardInput";
import { PointerInput } from "./features/controls/components/PointerInput";
import { InputSystem } from "./features/controls/systems/InputSystem";
import { Menu } from "./features/menu/components/Menu";
import { MenuSystem } from "./features/menu/systems/MenuSystem";
import { Camera } from "./features/world/components/Camera";
import { Mesh, MeshTypes } from "./features/world/components/Mesh";
import { Transform } from "./features/world/components/Transform";
import { world } from "./features/world/world";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { IfcLoader } from "./core/ifcloader";

import textures from "./data/textures"
import models from "./data/models"
import ifc from "./data/ifc"
import { Drag } from "./features/building/components/Drag";
import { DragSystem } from "./features/building/systems/DragSystem";

const webuild = {
  colors: {
    cyan: Color3.FromHexString("#00FFFF"),
    purple: Color3.Purple(),
    magenta: Color3.Magenta()
  }
}

const settings: any = {
  width: 80,
  height: 80,
  depth: 80,
  selectedTexture: textures[0].url,
  selectedIFC: ifc[0],
  selectedModel: ""
}

const ifcLoader = new IfcLoader()
ifcLoader.MaterialTexture = settings.selectedTexture
SceneLoader.RegisterPlugin(ifcLoader)

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = world.instance()

game.start(canvas, [InputSystem, MenuSystem, VoxelSystem, DragSystem, ShareSystem])

game.createScene()

const camera = game.createEntity().addComponent(Camera);
camera.getMutableComponent(Transform)!.position.y = 2
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
createTextureMenu(leftWall, "wall")
createTextureMenu(backWall, "floor")
createTextureMenu(rightWall, "block")
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
logo.getMutableComponent(Transform)!.position.x = -18
logo.getMutableComponent(Transform)!.position.y = 18
logo.getMutableComponent(Transform)!.position.z = (settings.height / 2) - 1

game.createEntity().addComponent(VoxelSettings, settings)

game.createEntity().addComponent(ControllerInput)
game.createEntity().addComponent(HandInput)

game.createEntity().addComponent(PointerInput, {
  onPointerSelect: (x: number, y: number, z: number, facet: number) => {
    const voxelSystem = game.getSystem(VoxelSystem)
    if (!voxelSystem.isDraggingBlock()) {
      addBlock(x, y, z, facet)
    }
  },
  onPointerMove: (x, y, z, facet, mesh) => {
    const voxelSystem = game.getSystem(VoxelSystem)
    if (!voxelSystem.isDraggingBlock()) {
      const block = mesh ? voxelSystem.findBlockFromMesh(mesh) : voxelSystem.findBlock(x - .5, y - .5, z - .5)
      if (block) {
        const selected = block.getComponent(SelectedBlock)
        if (!selected) {
          block.addComponent(SelectedBlock)
          addBlockMenu(block)
          console.log('SelectedBlock', block)
        }
      } else {
        const selectedBlock = voxelSystem.getSelectedBlock()
        if (selectedBlock) {
          voxelSystem.clearSelection()
        }
      }
    }
  }
})

game.createEntity().addComponent(KeyboardInput, {
  onKeyDown: (key) => {
    const voxelSystem = game.getSystem(VoxelSystem)
    switch (key) {
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
    items: ifc.map((model) => ({
      text: model.name,
      action: () => {
        console.log('selectedIFC', model.name)
        settings.selectedIFC = model
        settings.selectedModel = undefined
      }
    })).concat(models.map((model) => ({
      imageUrl: model.preview,
      text: model.category,
      action: () => {
        console.log('selectedModel', model.url)
        settings.selectedIFC = undefined
        settings.selectedModel = model.url
      }
    })))
  })
}

function createTextureMenu(entity: Entity, group: "wall" | "ground" | "floor" | "block") {
  entity.addComponent(Menu, {
    items: textures.filter(({ category }) => category === group).map(({ url }) => ({
      imageUrl: url,
      action: () => {
        if (group === "wall") {
          console.log('selectedTexture', url)
          settings.selectedTexture = url
          ifcLoader.MaterialTexture = url
        }
        else if (group === "ground" || group === "floor") {
          const mesh = ground.getMutableComponent(Mesh)!
          mesh.material = {
            texture: {
              diffuse: { url }
            }
          }
        }
        else if (group === "block") {
          settings.selectedTexture = url
          settings.selectedIFC = undefined
          settings.selectedModel = undefined
        }
      }
    }))
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
    addBlockMenu(entity)
  } else if (settings.selectedModel) {
    //add GLB model
    const entity = game.createEntity()
      .addComponent(Mesh, {
        type: MeshTypes.Model,
        url: settings.selectedModel
      })
      .addComponent(Drag, {
        allowScaling: true
      })
    const transform = entity.getMutableComponent(Transform)!
    transform.position.x = x
    transform.position.y = y
    transform.position.z = z
    transform.scale.x = 3
    transform.scale.y = 3
    transform.scale.z = 3
    //TODO: add drag behavior and model menu
    addBlockMenu(entity)
  } else {
    //add textured block
    game.createEntity().addComponent(AddBlock, {
      x, y, z, facetAddDirection,
      textureUrl: settings.selectedTexture
    })
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