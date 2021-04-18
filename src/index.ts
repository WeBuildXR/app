import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Entity } from "ecsy";
import removeIconUrl from "../assets/textures/remove-icon.png";
import leftIconUrl from "../assets/textures/left-icon.png";
import rightIconUrl from "../assets/textures/right-icon.png";
import ModelData from "./core/ModelDataA";
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

const textures = ["Wood_5.png", "block.jpg", "brick.jpg", "colors.png", "crate.png", "cube1.jpg", "cube2.jpg", "cube3.jpg", "cube4.jpg", "cube5.jpg", "Earth 1.png", "Earth 2.png", "Earth 3.png", "Floor_1.png", "Floor_2.png", "grass.jpg", "Grass_1.png", "Grass_2.png", "Grass_3.png", "Ground_1.png", "Ground_2.png", "Ground_3.png", "Ground_4.png", "Ground_5.png", "Ice.png", "Lava.png", "Metal wall.png", "Rock 1.png", "Rock 2.png", "Roof_1.png", "Roof_2.png", "Soil.png", "TreeBark.png", "vol_2_2_Base_Color.png", "vol_2_2_Height.png", "Vol_39_7_Height.png", "Vol_39_7_Roughness.png", "Wall 1.png", "Wall 2.png", "Wall_1.png", "Wall_2.png", "Wall_3.png", "Wood_1.png", "Wood_2.png", "Wood_3.png", "Wood_4.png"]

const webuild = {
  colors: {
    cyan: Color3.FromHexString("#00FFFF"),
    purple: Color3.Purple(),
    magenta: Color3.Magenta()
  }
}

const settings = {
  width: 80,
  height: 80,
  depth: 80,
  selectedTexture: "block.jpg"
}

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = world.instance()

game.start(canvas, [InputSystem, MenuSystem, VoxelSystem, ShareSystem])

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

addWall(0, 0, (settings.height / 2), 0, webuild.colors.cyan)
addWall(0, 0, -(settings.height / 2), 0, webuild.colors.purple)
addWall(-(settings.width / 2), 0, 0, 90, webuild.colors.magenta)
addWall((settings.width / 2), 0, 0, -90, webuild.colors.magenta)
addCeiling()

const menu = game.createEntity().addComponent(Mesh, {
  type: MeshTypes.Plane,
  options: {
    width: settings.width * .3,
    height: 8
  },
  material: {
    color: {
      diffuse: webuild.colors.cyan.toHexString()
    }
  }
})
menu.getMutableComponent(Transform)!.position.x = -14
menu.getMutableComponent(Transform)!.position.y = 6
menu.getMutableComponent(Transform)!.position.z = (settings.height / 2) - 2
createTextureMenu(menu)

const menu2 = game.createEntity().addComponent(Mesh, {
  type: MeshTypes.Plane,
  options: {
    width: settings.width * .3,
    height: 8
  },
  material: {
    color: {
      diffuse: webuild.colors.magenta.toHexString()
    }
  }
})
menu2.getMutableComponent(Transform)!.position.x = 12
menu2.getMutableComponent(Transform)!.position.y = 12
menu2.getMutableComponent(Transform)!.position.z = (settings.height / 2) - 2
createModelMenu(menu2)

const logo = game.createEntity().addComponent(Mesh, {
  type: MeshTypes.Plane,
  options: {
    width: 20,
    height: 6
  },
  material: {
    texture: {
      diffuse: { url: "./textures/webuild.png" }
    },
    color: {
      diffuse: "#FFFFFF"
    }
  }
})
logo.getMutableComponent(Transform)!.position.x = -15
logo.getMutableComponent(Transform)!.position.y = 15
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
    items: ModelData.map(({ width, height, depth, url, name }) => ({
      imageUrl: url,
      text: name,
      action: () => {
        settings.width = width
        settings.height = height
        settings.depth = depth
        settings.selectedTexture = url
        console.log('selectedModel', url)
      }
    }))
  })
}

function createTextureMenu(entity: Entity) {
  entity.addComponent(Menu, {
    items: textures.map((filename) => ({
      imageUrl: `./textures/all/${filename}`,
      action: () => {
        console.log('selectedTexture', filename)
        settings.selectedTexture = filename
      }
    }))
  })
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
          action: () => entity.removeComponent(Block)
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

function addWall(x: number, y: number, z: number, r: number, c: Color3) {
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