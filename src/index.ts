import { Game } from "./core/Game";
import { MeshSystem, LightSystem, MaterialSystem, InputSystem, Camera, Mesh, MeshTypes, Material, Transform, Light, Input, XYZProperties } from "./ecsy-babylon";
import { ControllerInput } from "./webuild-xr/components/ControllerInput";
import { ControllerInputSystem } from "./webuild-xr/systems/ControllerInputSystem";

// start app by call game instance
const game = Game.instance();

// init game canvas, add systems, add scene T
game.start(document.getElementById("mainCanvas") as HTMLCanvasElement, [MeshSystem, LightSystem, MaterialSystem, InputSystem, ControllerInputSystem])

// add sceneZ
const sceneZ = game.createScene({
  ambient: "#CCCCCC",
  clear: "#CCCCCCFF"
});

// create camera of scene Z
const cameraZ = game.createEntity().addComponent(Camera, { scene: sceneZ, pointerLock: false });
cameraZ.getMutableComponent(Transform).position.y = 3;
cameraZ.getMutableComponent(Transform).position.z = -3;
cameraZ.getMutableComponent(Transform).position.x = -3;
cameraZ.getMutableComponent(Transform).rotation.y = 45;
cameraZ.getMutableComponent(Transform).rotation.x = 15;

// create a box in scene Z can be moved by WASD
const boxZ = game.createEntity()
  .addComponent(Mesh, { scene: sceneZ })
  .addComponent(Material, {
    scene: sceneZ,
    texture: {
      diffuse: { url: "textures/block.jpg" }
    }
  });
boxZ.getMutableComponent(Transform).position.y = 1;
boxZ.getMutableComponent(Transform).position.z = 1;
boxZ.getMutableComponent(Transform).position.x = 1;

// create light of scene Z
const lightB = game.createEntity().addComponent(Light, { scene: sceneZ });
lightB.getMutableComponent(Light).direction.y = 1;

// create zebra skin texture ground for scene T
const ground = game.createEntity()
  .addComponent(Mesh, { scene: sceneZ, type: MeshTypes.Ground, options: { width: 50, height: 50 } })
  .addComponent(Material, {
    scene: sceneZ,
    texture: {
      diffuse: { url: "textures/floor.jpg", uScale: 5, vScale: 5 }
    }
  });
const groundMesh = ground.getComponent(Mesh).object

game.createEntity()
  .addComponent(Input, {
    onKey: (key: string, down: boolean, up: boolean) => {
      if (key == "d") {
        game.showDebugger()
      } else if (key == "b") {
        createRandomBox()
      }
    }
  })

game.createEntity()
  .addComponent(ControllerInput, {
    floor: groundMesh,
    onLeftThumbstickMove: (x, y) => {
    },
    onRightThumbstickMove: (x, y) => {
    },
    onLeftButtonPress: () => {
      createRandomBox()
    },
    onRightButtonPress: () => {
      createRandomBox()
    },
    //onLeftTriggerPress: (mesh: BABYLON.AbstractMesh) => {
    //  if (mesh) {
    //    let { x, y, z } = mesh.position
    //    while (getBlock(x, y, z)) {
    //      y += 1
    //    }
    //    const block = createBlock(x, y, z, randomColor())
    //    setBlock(x, y, z, block)
    //  }
    //},
    //onLeftSqueezePress: (mesh: BABYLON.AbstractMesh) => {
    //  if (mesh) {
    //    let { x, y, z } = mesh.position
    //    while (getBlock(x, y, z)) {
    //      y -= 1
    //    }
    //    const block = createBlock(x, y, z, randomColor())
    //    setBlock(x, y, z, block)
    //  }
    //},
    //onRightTriggerPress: (mesh: BABYLON.AbstractMesh) => {
    //  if (mesh) {
    //    let { x, y, z } = mesh.position
    //    while (getBlock(x, y, z)) {
    //      z -= 1
    //    }
    //    const block = createBlock(x, y, z, randomColor())
    //    setBlock(x, y, z, block)
    //  }
    //},
    //onRightSqueezePress: (mesh: BABYLON.AbstractMesh) => {
    //  if (mesh) {
    //    let { x, y, z } = mesh.position
    //    while (getBlock(x, y, z)) {
    //      x -= 1
    //    }
    //    const block = createBlock(x, y, z, randomColor())
    //    setBlock(x, y, z, block)
    //  }
    //},
    onPointerInput: (mesh: BABYLON.AbstractMesh, facet: number) => {
      let { x, y, z } = mesh.position
      while (getBlock(x, y, z)) {
        switch (facet) {
          case 0:
            z += 1
            break;
          case 2:
            z -= 1
            break;
          case 4:
            x += 1
            break;
          case 6:
            x -= 1
            break;
          case 8:
            y += 1
            break;
          case 10:
            y -= 1
            break;
        }
      }
      const block = createBlock(x, y, z, randomColor())
      setBlock(x, y, z, block)
    }
  })

function createRandomBox() {
  createBlock(Math.round(Math.random() * 10), Math.round(Math.random() * 10), Math.round(Math.random() * 10), randomColor())
}

let blocks = { '1-1-1': true }
function getBlock(x, y, z): Mesh {
  const key = `${x}-${y}-${z}`
  return blocks[key]
}

function setBlock(x, y, z, b) {
  const key = `${x}-${y}-${z}`
  blocks[key] = b
}

function createBlock(x, y, z, color) {
  const block = game.createEntity()
    .addComponent(Mesh, { scene: sceneZ })
    .addComponent(Material, {
      scene: sceneZ,
      texture: {
        diffuse: { url: "textures/block.jpg" }
      }
    });
  const transform = block.getMutableComponent(Transform)
  transform.position.y = y;
  transform.position.z = z;
  transform.position.x = x;
  return block.getComponent(Mesh)
}

const randomColor = () => {
  let color = '#';
  for (let i = 0; i < 6; i++) {
    const random = Math.random();
    const bit = (random * 16) | 0;
    color += (bit).toString(16);
  };
  return color;
};