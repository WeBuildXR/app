import { Game } from "./core/Game";
import { MeshSystem, LightSystem, MaterialSystem, InputSystem, Camera, Mesh, MeshTypes, Material, Transform, Light, Input, XYZProperties } from "./ecsy-babylon";

// start app by call game instance
const game = Game.instance();

// init game canvas, add systems, add scene T
game.start(document.getElementById("mainCanvas") as HTMLCanvasElement, [MeshSystem, LightSystem, MaterialSystem, InputSystem])

// add sceneZ
const sceneZ = game.createScene({ clear: "#4DD0D5D9" });

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

declare global { interface Window { game: Game; } }
window.game = game;