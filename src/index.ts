import { Camera } from "./features/world/components/Camera";
import { Mesh, MeshTypes } from "./features/world/components/Mesh";
import { Transform } from "./features/world/components/Transform";
import { world } from "./features/world/world";

import grassTextureUrl from "../assets/textures/grass.jpg";
import blockTextureUrl from "../assets/textures/block.png";
import playerModelUrl from "../assets/glb/webuild-player.glb";
import controllerModelUrl from "../assets/glb/webuild-controller.glb";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = world.instance()

game.start(canvas, [])

const scene = game.createScene()

const camera = game.createEntity().addComponent(Camera);
camera.getMutableComponent(Transform)!.position.y = 4;
camera.getMutableComponent(Transform)!.position.z = 4;
camera.getMutableComponent(Transform)!.position.x = -4;
camera.getMutableComponent(Transform)!.rotation.y = 135;
camera.getMutableComponent(Transform)!.rotation.x = 15;

const ground = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Ground,
    options: { width: 10, height: 10 },
    material: {
      texture: {
        diffuse: { url: grassTextureUrl, uScale: 10, vScale: 10 }
      }
    }
  })

ground.getMutableComponent(Transform)!.position.y = .5;

const block = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Box,
    options: { width: 1, height: 1 },
    material: {
      id: 'BlockMaterial',
      backFaceCulling: true,
      texture: {
        diffuse: { url: blockTextureUrl }
      }
    }
  })

  block.getMutableComponent(Transform)!.position.y = 1;
  block.getMutableComponent(Transform)!.position.z = -2;
  block.getMutableComponent(Transform)!.position.x = 2;

const player1 = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Url,
    options: { url: playerModelUrl }
  })

player1.getMutableComponent(Transform)!.position.y = 3;
player1.getMutableComponent(Transform)!.rotation.y = -45;
player1.getMutableComponent(Transform)!.scale.y = .02;
player1.getMutableComponent(Transform)!.scale.z = .02;
player1.getMutableComponent(Transform)!.scale.x = .02;

const controllerL = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Url,
    options: { url: controllerModelUrl }
  })

controllerL.getMutableComponent(Transform)!.position.y = 2;
controllerL.getMutableComponent(Transform)!.position.z = -.5;
controllerL.getMutableComponent(Transform)!.position.x = -.5;
controllerL.getMutableComponent(Transform)!.rotation.y = 150;
controllerL.getMutableComponent(Transform)!.scale.y = .05;
controllerL.getMutableComponent(Transform)!.scale.z = .05;
controllerL.getMutableComponent(Transform)!.scale.x = .05;

const controllerR = game.createEntity()
  .addComponent(Mesh, {
    type: MeshTypes.Url,
    options: { url: controllerModelUrl }
  })

controllerR.getMutableComponent(Transform)!.position.y = 2;
controllerR.getMutableComponent(Transform)!.position.z = .5;
controllerR.getMutableComponent(Transform)!.position.x = .5;
controllerR.getMutableComponent(Transform)!.rotation.y = 150;
controllerR.getMutableComponent(Transform)!.scale.y = .05;
controllerR.getMutableComponent(Transform)!.scale.z = .05;
controllerR.getMutableComponent(Transform)!.scale.x = .05;