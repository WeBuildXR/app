import { AbstractMesh, MeshBuilder, SceneLoader, WebXRAbstractMotionController, WebXRControllerComponent, WebXRControllerPointerSelection, WebXRFeatureName, WebXRHandTracking } from "@babylonjs/core"
import { Camera } from "@babylonjs/core/Cameras"
import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core/Events/keyboardEvents"
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents"
import { Quaternion, Vector3 as BabylonVector3 } from "@babylonjs/core/Maths/math.vector"
import { Scene as BabylonScene } from "@babylonjs/core/scene"
import "@babylonjs/core/XR/webXRDefaultExperience"
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience"
import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import { WorldLog, WorldScene } from "../../../core/WorldProperties"
import { Mesh } from "../../world/components/Mesh"
import { ControllerInput } from "../components/ControllerInput"
import { HandInput } from "../components/HandInput"
import { HeadInput } from "../components/HeadInput"
import { InputSettings } from "../components/InputSettings"
import { KeyboardInput } from "../components/KeyboardInput"
import { PointerInput } from "../components/PointerInput"
import leftControllerModel from "../../../../assets/models/webuild-controller-small.glb"
import rightControllerModel from "../../../../assets/models/webuild-controller-small.glb"

export class InputSystem extends EcsySystem implements WorldScene {
    /** @hidden */
    static queries = {
        settings: { components: [InputSettings], listen: { added: true } },
        controllers: { components: [ControllerInput], listen: { added: true } },
        hands: { components: [HandInput], listen: { added: true } },
        head: { components: [HeadInput], listen: { added: true, removed: true } },
        keyboard: { components: [KeyboardInput], listen: { added: true, removed: true } },
        pointer: { components: [PointerInput], listen: { added: true, removed: true } },
    }
    /** @hidden */
    queries: any

    public teleport(position: BabylonVector3) {
        if (this.xrHelper) {
            this.xrHelper.baseExperience.camera.position.x = position.x
            this.xrHelper.baseExperience.camera.position.z = position.z
        }
    }

    private xrHelper: WebXRDefaultExperience;

    getBabylonScene: () => BabylonScene
    logMessage: (message: string) => void

    init({ getBabylonScene, logMessage }: WorldScene & WorldLog) {
        this.getBabylonScene = getBabylonScene.bind(this)
        this.logMessage = logMessage.bind(this)
    }

    /** @hidden */
    execute() {
        this.queries.settings.added.forEach(async (entity: EcsyEntity) => {
            const scene = this.getBabylonScene()
            const settings = entity.getComponent(InputSettings)!
            const floorMesh = settings.teleportationFloorMesh?.getComponent(Mesh)
            if (floorMesh?.babylonComponent) {
                const xrHelper = await this.createXRHelper(scene)
                xrHelper.teleportation.addFloorMesh(floorMesh.babylonComponent)
                console.log('teleportationFloorMesh')
                //TODO: support adding/removing floors for indoor navigation
            } else {
                //temporary fix for teleportation
                const ground = MeshBuilder.CreateGround("Ground", {
                    width: 50,
                    height: 50
                }, scene)
                const xrHelper = await this.createXRHelper(scene)
                xrHelper.teleportation.addFloorMesh(ground)
            }
            const leftControllerMesh = settings.leftControllerMesh?.getComponent(Mesh)
            const rightControllerMesh = settings.rightControllerMesh?.getComponent(Mesh)
            if (leftControllerMesh?.babylonComponent || rightControllerMesh?.babylonComponent) {
                //TODO: meshes are not loaded yet, this needs some work
                //const xrHelper = await this.createXRHelper(scene)
                //xrHelper.input.onControllerAddedObservable.add((inputSource) => {
                //    inputSource.onMotionControllerInitObservable.add((controller) => {
                //    })
                //})
            }
        })

        this.queries.controllers.added.forEach(async (entity: EcsyEntity) => {
            const input = entity.getMutableComponent(ControllerInput)!
            const scene = this.getBabylonScene()
            const xrHelper = await this.createXRHelper(scene)
            xrHelper.input.onControllerAddedObservable.add((inputSource) => {
                const controllerInit = (controller: WebXRAbstractMotionController) => {
                    //if (inputSource.grip) {
                    //    if (controller.handedness == "left") {
                    //        const leftControllerMesh = await SceneLoader.ImportMeshAsync("leftController", "", leftControllerModel, scene)
                    //        leftControllerMesh.meshes[0].setParent(inputSource.pointer)
                    //        leftControllerMesh.meshes[0].position = BabylonVector3.Zero()
                    //        leftControllerMesh.meshes[0].position.z = -0.06
                    //        leftControllerMesh.meshes[0].rotationQuaternion = Quaternion.FromEulerAngles(0, 0, Math.PI)
                    //    }
                    //    if (controller.handedness == "right") {
                    //        const rightControllerMesh = await SceneLoader.ImportMeshAsync("rightController", "", rightControllerModel, scene)
                    //        rightControllerMesh.meshes[0].setParent(inputSource.pointer)
                    //        rightControllerMesh.meshes[0].position = BabylonVector3.Zero()
                    //        rightControllerMesh.meshes[0].position.z = -0.06
                    //        rightControllerMesh.meshes[0].rotationQuaternion = Quaternion.FromEulerAngles(0, 0, Math.PI)
                    //    }
                    //}
                    //https://doc.babylonjs.com/divingDeeper/webXR/webXRInputControllerSupport#some-terms-and-classes-to-clear-things-up
                    //MotionControllerComponentType = "trigger" | "squeeze" | "touchpad" | "thumbstick" | "button"
                    if (controller.handedness === "left" || controller.handness === "left") {
                        this.logMessage('left controller ' + controller.profileId)
                        const leftThumbstick = typeof (input.onLeftThumbstickMove) === 'function' && controller.getComponentOfType("thumbstick");
                        if (leftThumbstick) {
                            leftThumbstick.onAxisValueChangedObservable.add(({ x, y }) => {
                                this.logMessage('onLeftThumbstickMove ' + x + ',' + y)
                                input.onLeftThumbstickMove(x, y);
                            });
                        }
                        const leftButtons = typeof (input.onLeftButtonPress) === 'function' && controller.getAllComponentsOfType("button");
                        if (leftButtons && leftButtons.length > 0) {
                            for (const button of leftButtons) {
                                button.onButtonStateChangedObservable.add((buttonComponent) => {
                                    console.log('onLeftButtonPress', buttonComponent)
                                    if (buttonComponent.pressed) {
                                        this.logMessage('onLeftButtonPress ' + buttonComponent.value)
                                        input.onLeftButtonPress(buttonComponent.id);
                                    }
                                });
                            }
                        }
                        const squeezeButton = typeof (input.onLeftSqueezePress) === 'function' && controller.getComponentOfType("squeeze");
                        if (squeezeButton) {
                            squeezeButton.onButtonStateChangedObservable.add((buttonComponent) => {
                                console.log('onLeftSqueezePress', buttonComponent)
                                if (buttonComponent.pressed) {
                                    this.logMessage('onLeftSqueezePress ' + buttonComponent.value)
                                    const mesh = this.xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                                    input.onLeftSqueezePress(mesh!);
                                }
                            });
                        }
                        const triggerButton = typeof (input.onLeftTriggerPress) === 'function' && controller.getComponentOfType("trigger");
                        if (triggerButton) {
                            triggerButton.onButtonStateChangedObservable.add((buttonComponent) => {
                                console.log('onLeftTriggerPress', buttonComponent)
                                if (buttonComponent.pressed) {
                                    this.logMessage('onLeftTriggerPress ' + buttonComponent.value)
                                    const mesh = this.xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                                    input.onLeftTriggerPress(mesh!);
                                }
                            });
                        }
                    }
                    else if (controller.handedness === "right" || controller.handness == "right") {
                        this.logMessage('right controller ' + controller.profileId)
                        const rightThumbstick = typeof (input.onRightThumbstickMove) === 'function' && controller.getComponentOfType("thumbstick");
                        if (rightThumbstick) {
                            rightThumbstick.onAxisValueChangedObservable.add(({ x, y }) => {
                                this.logMessage('onRightThumbstickMove ' + x + ',' + y)
                                input.onRightThumbstickMove(x, y);
                            });
                        }
                        const rightButtons = typeof (input.onRightButtonPress) === 'function' && controller.getAllComponentsOfType("button");
                        if (rightButtons && rightButtons.length > 0) {
                            for (const button of rightButtons) {
                                button.onButtonStateChangedObservable.add((buttonComponent) => {
                                    console.log('onRightButtonPress', buttonComponent)
                                    if (buttonComponent.pressed) {
                                        this.logMessage('onRightButtonPress ' + buttonComponent.value)
                                        input.onRightButtonPress(buttonComponent.id);
                                    }
                                });
                            }
                        }
                        const squeezeButton = typeof (input.onRightSqueezePress) === 'function' && controller.getComponentOfType("squeeze");
                        if (squeezeButton) {
                            squeezeButton.onButtonStateChangedObservable.add((buttonComponent) => {
                                console.log('onRightSqueezePress', buttonComponent)
                                if (buttonComponent.pressed) {
                                    this.logMessage('onRightSqueezePress ' + buttonComponent.value)
                                    const mesh = this.xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                                    input.onRightSqueezePress(mesh!);
                                }
                            });
                        }
                        const triggerButton = typeof (input.onRightTriggerPress) === 'function' && controller.getComponentOfType("trigger");
                        if (triggerButton) {
                            triggerButton.onButtonStateChangedObservable.add((buttonComponent) => {
                                console.log('onRightTriggerPress', buttonComponent)
                                if (buttonComponent.pressed) {
                                    this.logMessage('onRightTriggerPress ' + buttonComponent.value)
                                    const mesh = this.xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                                    input.onRightTriggerPress(mesh!);
                                }
                            });
                        }
                    } else {
                        console.log('onMotionControllerInit', controller)
                        this.logMessage('onMotionControllerInit ' + controller.profileId)
                    }
                }
                if (inputSource.motionController) {
                    controllerInit(inputSource.motionController)
                } else {
                    inputSource.onMotionControllerInitObservable.add(controllerInit)
                }
            })
        })

        this.queries.hands.added.forEach(async (entity: EcsyEntity) => {
            const input = entity.getMutableComponent(HandInput)!
            const scene = this.getBabylonScene()
            const xrHelper = await this.createXRHelper(scene)
            const handTracking = xrHelper.baseExperience.featuresManager.enableFeature(
                WebXRFeatureName.HAND_TRACKING,
                "latest",
                {
                    xrInput: xrHelper.input
                },
                true,
                false
            ) as WebXRHandTracking;
            handTracking?.onHandAddedObservable.add((handInput) => {
                handInput.xrController.onMotionControllerInitObservable.add((controller) => {
                    controller.getMainComponent().onButtonStateChangedObservable.add((eventData) => {
                        if (eventData.hasChanges && eventData.pressed) {
                            if (controller.handedness === "left" && typeof (input.onLeftPinchPress) === 'function') {
                                const direction = controller.rootMesh?.getDirection(BabylonVector3.ZeroReadOnly)
                                input.onLeftPinchPress(scene.meshUnderPointer!, direction)
                            }
                            else if (controller.handedness === "right" && typeof (input.onRightPinchPress) === 'function') {
                                const direction = controller.rootMesh?.getDirection(BabylonVector3.ZeroReadOnly)
                                input.onRightPinchPress(scene.meshUnderPointer!, direction)
                            }
                        }
                    })
                })
            })
        })

        this.queries.head.added.forEach(async (entity: EcsyEntity) => {
            const input = entity.getMutableComponent(HeadInput)!
            const scene = this.getBabylonScene()
            const xrHelper = await this.createXRHelper(scene)
            input.inputHandler = (camera: Camera) => {
                if (typeof (input.onHeadMove) === 'function') {
                    input.onHeadMove(camera.position, camera.getDirection(BabylonVector3.ZeroReadOnly))
                }
            }
            xrHelper.input.xrCamera.onViewMatrixChangedObservable.add(input.inputHandler)
        })
        this.queries.head.removed.forEach(async (entity: EcsyEntity) => {
            const input = entity.getComponent(KeyboardInput)!
            const scene = this.getBabylonScene()
            const xrHelper = await this.createXRHelper(scene)
            xrHelper.input.xrCamera.onViewMatrixChangedObservable.removeCallback(input.inputHandler)
        })

        this.queries.keyboard.added.forEach((entity: EcsyEntity) => {
            const input = entity.getMutableComponent(KeyboardInput)!
            const scene = this.getBabylonScene()
            input.inputHandler = ({ type, event }: KeyboardInfo) => {
                if (type === KeyboardEventTypes.KEYDOWN && typeof (input.onKeyDown) === 'function') {
                    input.onKeyDown(event.key)
                } else if (type === KeyboardEventTypes.KEYUP && typeof (input.onKeyUp) === 'function') {
                    input.onKeyUp(event.key)
                }
            }
            scene.onKeyboardObservable.add(input.inputHandler)
        })
        this.queries.keyboard.removed.forEach((entity: EcsyEntity) => {
            const input = entity.getComponent(KeyboardInput)!
            const scene = this.getBabylonScene()
            scene.onKeyboardObservable.removeCallback(input.inputHandler)
        })

        this.queries.pointer.added.forEach((entity: EcsyEntity) => {
            const input = entity.getMutableComponent(PointerInput)!
            const scene = this.getBabylonScene()
            let moveTimer = performance.now()
            let dragTimer = performance.now()
            let isPointerDown = false
            scene.onPointerDown = () => {
                isPointerDown = true
            }
            scene.onPointerUp = () => {
                isPointerDown = false
            }
            if (typeof (input.onPointerMove) === 'function') {
                scene.onPointerMove = (pointer, _, type) => {
                    if (performance.now() - moveTimer >= 100 && !isPointerDown) {
                        const pickInfo = scene.pick(pointer.x, pointer.y)
                        if (pickInfo && pickInfo.hit && pickInfo.pickedMesh) {
                            const facet = (2 * Math.floor(pickInfo.faceId / 2))
                            input.onPointerMove(pickInfo.pickedMesh, facet)
                        }
                        moveTimer = performance.now()
                    }
                }
            }
            if (typeof (input.onPointerSelect) === 'function') {
                scene.onPointerPick = (pointer, pick) => {
                    console.log('pointer', pointer)
                    if (pick.hit && pick.pickedMesh) {
                        const facet = (2 * Math.floor(pick.faceId / 2))
                        input.onPointerSelect(pick.pickedMesh, facet, pointer.button)
                    }
                }
            }
        })
        this.queries.pointer.removed.forEach((entity: EcsyEntity) => {
            const input = entity.getComponent(PointerInput)!
            const scene = this.getBabylonScene()
            scene.onPointerObservable.removeCallback(input.inputHandler)
        })
    }

    private async createXRHelper(scene: BabylonScene) {
        if (!this.xrHelper) {
            //const isARSupported = await (navigator as any).xr?.isSessionSupported("immersive-ar")
            this.xrHelper = await WebXRDefaultExperience.CreateAsync(scene, {
                //optionalFeatures: [
                //    WebXRFeatureName.POINTER_SELECTION,
                //    WebXRFeatureName.TELEPORTATION,
                //    WebXRFeatureName.BACKGROUND_REMOVER,
                //    WebXRFeatureName.PLANE_DETECTION
                //],
                //inputOptions: {
                //    doNotLoadControllerMeshes: true
                //},
                //uiOptions: {
                //    sessionMode: isARSupported ? "immersive-ar" : "immersive-vr",
                //    referenceSpaceType: isARSupported ? "unbounded" : "local-floor"
                //}
            })
            this.xrHelper.pointerSelection = this.xrHelper.baseExperience.featuresManager.enableFeature(
                WebXRControllerPointerSelection,
                "latest",
                {
                    xrInput: this.xrHelper.input,
                    enablePointerSelectionOnAllControllers: true,
                    preferredHandedness: "right",
                    disableSwitchOnClick: true
                }) as WebXRControllerPointerSelection
        }
        return this.xrHelper
    }
}