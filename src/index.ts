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
  .addComponent(Material, { scene: sceneZ, color: { diffuse: "#330099" } });
boxZ.getMutableComponent(Transform).position.y = 1;
boxZ.getMutableComponent(Transform).position.z = 1;
boxZ.getMutableComponent(Transform).position.x = 1;

// create light of scene Z
const lightB = game.createEntity().addComponent(Light, { scene: sceneZ });
lightB.getMutableComponent(Light).direction.y = 1;

// create zebra skin texture ground for scene T
const ground = game.createEntity()
  .addComponent(Mesh, { scene: sceneZ, type: MeshTypes.Ground, options: { width: 10, height: 10 } })
  .addComponent(Material, {
    scene: sceneZ,
    texture: {
      diffuse: { url: "https://i0.wp.com/www.sharetextures.com/wp-content/uploads/2018/09/zebra_skin.jpg-diffuse.jpg?ssl=1", uScale: 5, vScale: 5 },
      bump: { url: "https://i2.wp.com/www.sharetextures.com/wp-content/uploads/2018/09/zebra_skin.jpg-normal.jpg?ssl=1", uScale: 5, vScale: 5 },
      specular: { url: "https://i1.wp.com/www.sharetextures.com/wp-content/uploads/2018/09/zebra_skin.jpg-specular.jpg?ssl=1", uScale: 5, vScale: 5 }
    }
  });

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
    onLeftThumbstickMove: () => {
    },
    onRightThumbstickMove: () => {
    },
    onLeftButtonPress: () => {
      createRandomBox()
    },
    onLeftTriggerPress: (mesh: BABYLON.AbstractMesh) => {
      mesh.material.alpha = mesh.material.alpha < 1 ? .9 : .3
      createRandomBox()
    },
    onLeftSqueezePress: (mesh: BABYLON.AbstractMesh) => {
      mesh.material.alpha = mesh.material.alpha < 1 ? .9 : .3
      createRandomBox()
    },
    onRightButtonPress: () => {
      createRandomBox()
    },
    onRightTriggerPress: (mesh: BABYLON.AbstractMesh) => {
      mesh.material.alpha = mesh.material.alpha < 1 ? .9 : .3
      createRandomBox()
    },
    onRightSqueezePress: (mesh: BABYLON.AbstractMesh) => {
      mesh.material.alpha = mesh.material.alpha < 1 ? .9 : .3
      createRandomBox()
    }
  })

function createRandomBox() {
  const boxR = game.createEntity()
    .addComponent(Mesh, { scene: sceneZ })
    .addComponent(Material, { scene: sceneZ, color: { diffuse: randomColor() } });
  boxR.getMutableComponent(Transform).position.y = Math.round(Math.random() * 10);
  boxR.getMutableComponent(Transform).position.z = Math.round(Math.random() * 10);
  boxR.getMutableComponent(Transform).position.x = Math.round(Math.random() * 10);
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