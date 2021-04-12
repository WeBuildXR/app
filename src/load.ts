import { Camera } from "./features/world/components/Camera";
import { Mesh, MeshTypes } from "./features/world/components/Mesh";
import { Transform } from "./features/world/components/Transform";
import { world } from "./features/world/world";
import removeIconUrl from "../assets/textures/remove-icon.png";
import playerModelUrl from "../assets/models/webuild-player.glb";
import ChatBubbleUrl from "../assets/models/ChatBubble.glb";
import controllerModelUrl from "../assets/models/webuild-controller-small.glb";
import { InputSystem } from "./features/controls/systems/InputSystem";
import { ControllerInput } from "./features/controls/components/ControllerInput";
import { HandInput } from "./features/controls/components/HandInput";
import { VoxelSettings } from "./features/building/components/VoxelSettings";
import { AddBlock, Block, SelectedBlock } from "./features/building/components/Block";
import { VoxelSystem } from "./features/building/systems/VoxelSystem";
import { PointerInput } from "./features/controls/components/PointerInput";
import { SceneSystem } from "./features/world/systems/SceneSystem";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { InputSettings } from "./features/controls/components/InputSettings";
import { KeyboardInput } from "./features/controls/components/KeyboardInput";
import { MenuSystem } from "./features/menu/systems/MenuSystem";
import { Menu } from "./features/menu/components/Menu";
import { Entity } from "ecsy";
import { ShareSettings } from "./features/collaboration/components/ShareSettings";
import { ShareSystem } from "./features/collaboration/systems/ShareSystem";
import { Color3 } from "@babylonjs/core";

const models = [
  {
    width: 12,
    height: 25,
    depth: 30,
    url: "./models/building.glb",
    preview: "./models/preview/building.png"
  },
  {
    width: 20,
    height: 20,
    depth: 10,
    url: "./models/house.glb",
    preview: "./models/preview/house.png"
  },
  {
    width: 16,
    height: 16,
    depth: 15,
    url: "./models/untitled.glb",
    preview: "./models/preview/untitled.png"
  } ]
const textures = ["Wood_5.png", "block.jpg", "brick.jpg", "colors.png", "crate.png", "cube1.jpg", "cube2.jpg", "cube3.jpg", "cube4.jpg", "cube5.jpg", "Earth 1.png", "Earth 2.png", "Earth 3.png", "Floor_1.png", "Floor_2.png", "grass.jpg", "Grass_1.png", "Grass_2.png", "Grass_3.png", "Ground_1.png", "Ground_2.png", "Ground_3.png", "Ground_4.png", "Ground_5.png", "Ice.png", "Lava.png", "Metal wall.png", "Rock 1.png", "Rock 2.png", "Roof_1.png", "Roof_2.png", "Soil.png", "TreeBark.png", "vol_2_2_Base_Color.png", "vol_2_2_Height.png", "Vol_39_7_Height.png", "Vol_39_7_Roughness.png", "Wall 1.png", "Wall 2.png", "Wall_1.png", "Wall_2.png", "Wall_3.png", "Wood_1.png", "Wood_2.png", "Wood_3.png", "Wood_4.png"]

const settings = {
  width: 150,
  height: 150,
  depth: 100,
  selectedTexture: "Wood_5.jpg"
}

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = world.instance()

game.start(canvas, [InputSystem, MenuSystem, VoxelSystem, ShareSystem])

const scene = game.createScene()

const camera = game.createEntity().addComponent(Camera);
camera.getMutableComponent(Transform)!.position.x = 0;
camera.getMutableComponent(Transform)!.position.y = 5;
camera.getMutableComponent(Transform)!.position.z = -15;
camera.getMutableComponent(Transform)!.rotation.y = -3;
camera.getMutableComponent(Transform)!.rotation.x = 15;


const ground = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Ground,
    options: {
      width: settings.width,
      height: settings.height
    },
    material: {
      texture: {
        diffuse: { url: "./textures/wire-box.png", uScale: settings.width, vScale: settings.height },
      },
      color: {
        diffuse: Color3.Random().toHexString()
      }
    }
  })

ground.getMutableComponent(Transform)!.position.y = -.5;

const sky = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Sky,
    options: { size: settings.height },
    url: "./skybox/skybox"
  })

const sharing = game.createEntity()
  .addComponent(ShareSettings, {
    initiator: location.hash !== "#connect"
  })

const menu = game.createEntity().addComponent(Mesh, {
  type: MeshTypes.Box,
  options: {
    width: 25,
    height: 10
  },
  material: {
    color: {
      ambient: "#44CCCCCC"
    }
  }
})
menu.getMutableComponent(Transform)!.position.x = 1
menu.getMutableComponent(Transform)!.position.y = 5
menu.getMutableComponent(Transform)!.position.z = settings.height / 2
createTextureMenu(menu)

game.createEntity().addComponent(InputSettings, {
  teleportationFloorMesh: ground
})

game.createEntity().addComponent(VoxelSettings, settings)

game.createEntity().addComponent(ControllerInput, {
  onLeftButtonPress: teleportToPointer,
  onLeftTriggerPress: teleportToPointer,
  onRightButtonPress: toggleSelectedBlock,
  onLeftSqueezePress: teleportToPointer,
  onRightSqueezePress: teleportToPointer
})

game.createEntity().addComponent(HandInput, {
  onLeftPinchPress: teleportToPointer,
  onRightPinchPress: toggleSelectedBlock
})

game.createEntity().addComponent(PointerInput, {
  onPointerSelect: onSelect,
  onPointerMove: (mesh, facet) => {
    const voxelSystem = game.getSystem(VoxelSystem)
    if (mesh.name !== "Ground" && mesh.name !== "Sky") {
      const { x, y, z } = mesh.position
      const block = voxelSystem.findBlock(x, y, z)
      if (block) {
        const selected = block.getComponent(SelectedBlock)
        if (!selected) {
          block.addComponent(SelectedBlock)
          addBlockMenu(block)
        }
      }
    } else {
      const selectedBlock = voxelSystem.getSelectedBlock()
      if (selectedBlock) {
        selectedBlock.removeComponent(Menu)
        voxelSystem.clearSelection()
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
      case "t":
        teleportToPointer()
        break;
    }
  }
})

function teleportToPointer() {
  const sceneSystem = game.getSystem(SceneSystem)
  const pickedPoint = sceneSystem.getPickedPoint()
  if (pickedPoint) {
    const inputSystem = game.getSystem(InputSystem)
    inputSystem.teleport(pickedPoint)
  }
}

function toggleSelectedBlock() {
  const sceneSystem = game.getSystem(SceneSystem)
  const pickedPoint = sceneSystem.getPickedPoint()
  if (pickedPoint) {
    const { x, y, z } = pickedPoint
    const voxelSystem = game.getSystem(VoxelSystem)
    const block = voxelSystem.findBlock(x, y, z)
    if (block) {
      const selected = block.getComponent(SelectedBlock)
      if (selected) {
        block.removeComponent(SelectedBlock)
      } else {
        block.addComponent(SelectedBlock)
      }
    }
  }
}

function addBlock(x: number, y: number, z: number, facetAddDirection: number) {
  if (settings.selectedTexture.indexOf(".glb") > -1) {
    game.createEntity().addComponent(AddBlock, {
      x, y, z, facetAddDirection,
      width: settings.width,
      height: settings.height,
      depth: settings.depth,
      modelUrl: settings.selectedTexture
    })
  } else {
    game.createEntity().addComponent(AddBlock, {
      x, y, z, facetAddDirection,
      textureUrl: `./textures/all/${settings.selectedTexture}`
    })
  }
}

function addBlockMenu(entity: Entity) {
  if (!entity.hasComponent(Menu)) {
    entity.addComponent(Menu, {
      items: [
        {
          text: "Remove",
          imageUrl: removeIconUrl,
          action: () => entity.removeComponent(Block)
        }
      ]
    })
  }
}

function createTextureMenu(entity: Entity) {
  entity.addComponent(Menu, {
    items: models.map(({width,height,depth,url,preview}) => ({
      imageUrl: preview,
      action: () => {
        settings.width = width
        settings.height = height
        settings.depth = depth
        settings.selectedTexture = url
      }
    })).concat(textures.map(t => ({
      imageUrl: `./textures/all/${t}`,
      action: () => settings.selectedTexture = t
    })))
  })
}

function onSelect(mesh: AbstractMesh, facet: number, button?: number) {
  const { x, y, z } = mesh.position
  if (button === 0) {
    const voxelSystem = game.getSystem(VoxelSystem)
    const block = voxelSystem.findBlock(x, y, z)
    if (block) {
      addBlock(x, y, z, facet)
    } else {
      const sceneSystem = game.getSystem(SceneSystem)
      const pickedPoint = sceneSystem.getPickedPoint()
      if (pickedPoint) {
        addBlock(pickedPoint.x, pickedPoint.y, pickedPoint.z, 0)
      }
    }
  } else {//Right-Click
    const voxelSystem = game.getSystem(VoxelSystem)
    voxelSystem.removeSelectedBlock()
  }
}

//const leftControllerMesh = game.createEntity()
//  .addComponent(Mesh, {
//    type: MeshTypes.Model,
//    url: controllerModelUrl
//  })
//
//leftControllerMesh.getMutableComponent(Transform)!.position.y = -5;
//
//const rightControllerMesh = game.createEntity()
//  .addComponent(Mesh, {
//    type: MeshTypes.Model,
//    url: controllerModelUrl
//  })
//
//rightControllerMesh.getMutableComponent(Transform)!.position.y = -5;

// const player1 = game.createEntity()
//   .addComponent(Mesh, {
//     type: MeshTypes.Model,
//     url: playerModelUrl
//   })

// player1.getMutableComponent(Transform)!.position.y = 3;
// player1.getMutableComponent(Transform)!.rotation.y = -45;
// player1.getMutableComponent(Transform)!.scale.y = .02;
// player1.getMutableComponent(Transform)!.scale.z = .02;
// player1.getMutableComponent(Transform)!.scale.x = .02;
