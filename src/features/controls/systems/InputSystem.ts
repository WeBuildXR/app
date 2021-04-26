import { Camera } from "@babylonjs/core/Cameras"
import { RayHelper } from "@babylonjs/core/Debug/rayHelper"
import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core/Events/keyboardEvents"
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { Color3 } from "@babylonjs/core/Maths/math.color"
import { Quaternion, Vector3 as BabylonVector3, Vector3 } from "@babylonjs/core/Maths/math.vector"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Scene as BabylonScene } from "@babylonjs/core/scene"
import { WebXRControllerPointerSelection } from "@babylonjs/core/XR/features/WebXRControllerPointerSelection"
import { IWebXRHandTrackingOptions, WebXRHandTracking } from "@babylonjs/core/XR/features/WebXRHandTracking"
import { WebXRAbstractMotionController } from "@babylonjs/core/XR/motionController/webXRAbstractMotionController"
import "@babylonjs/core/XR/webXRDefaultExperience"
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience"
import { WebXRFeatureName } from "@babylonjs/core/XR/webXRFeaturesManager"
import { Entity as EcsyEntity, System as EcsySystem } from "ecsy"
import controllerModel from "../../../../assets/models/webuild-controller-small.glb"
import { WorldLog, WorldScene } from "../../../core/WorldProperties"
import { ControllerInput } from "../components/ControllerInput"
import { HandInput } from "../components/HandInput"
import { HeadInput } from "../components/HeadInput"
import { KeyboardInput } from "../components/KeyboardInput"
import { PointerInput } from "../components/PointerInput"

export class InputSystem extends EcsySystem implements WorldScene {
    /** @hidden */
    static queries = {
        controllers: { components: [ControllerInput], listen: { added: true } },
        hands: { components: [HandInput], listen: { added: true } },
        head: { components: [HeadInput], listen: { added: true } },
        keyboard: { components: [KeyboardInput], listen: { added: true } },
        pointer: { components: [PointerInput], listen: { added: true } },
    }
    /** @hidden */
    queries: any

    public teleport(x: number, z: number) {
        if (this.xrHelper) {
            this.xrHelper.baseExperience.camera.position.x = x
            this.xrHelper.baseExperience.camera.position.z = z
        } else {
            this.getBabylonScene().cameras[0].position.x = x
            this.getBabylonScene().cameras[0].position.z = z
        }
    }

    private xrHelper: WebXRDefaultExperience;
    private controllerColor: Color3;

    getBabylonScene: () => BabylonScene
    logMessage: (message: string) => void

    init({ getBabylonScene, logMessage }: WorldScene & WorldLog) {
        this.getBabylonScene = getBabylonScene.bind(this)
        this.logMessage = logMessage.bind(this)
        this.controllerColor = Color3.Random()
    }

    /** @hidden */
    execute() {
        this.queries.controllers.added.forEach(async (entity: EcsyEntity) => {
            const input = entity.getMutableComponent(ControllerInput)!
            const scene = this.getBabylonScene()
            const xrHelper = await this.createXRHelper(scene)
            xrHelper.input.onControllerAddedObservable.add((inputSource) => {

                const controllerMaterial = new StandardMaterial("", scene)
                controllerMaterial.emissiveColor = this.controllerColor
                inputSource.pointer.material = controllerMaterial

                const controllerInit = (controller: WebXRAbstractMotionController) => {
                    console.log('controllerInit')
                    //https://doc.babylonjs.com/divingDeeper/webXR/webXRInputControllerSupport#some-terms-and-classes-to-clear-things-up
                    //MotionControllerComponentType = "trigger" | "squeeze" | "touchpad" | "thumbstick" | "button"
                    if (controller.handedness === "left" || controller.handness === "left") {
                        this.logMessage('left controller ' + controller.profileId)

                        //SceneLoader.ImportMeshAsync("", controllerModel, "", scene).then(({ meshes }) => {
                        //    const [leftControllerMesh] = meshes
                        //    leftControllerMesh.name = "LeftController"
                        //    leftControllerMesh.setParent(inputSource.pointer)
                        //    leftControllerMesh.position = BabylonVector3.Zero()
                        //    leftControllerMesh.position.z = -0.06
                        //    leftControllerMesh.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, Math.PI)
                        //})
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
                        //SceneLoader.ImportMeshAsync("", controllerModel, "", scene).then(({ meshes }) => {
                        //    const [leftControllerMesh] = meshes
                        //    const rightControllerMesh = leftControllerMesh.clone("RightController", inputSource.pointer)!
                        //    rightControllerMesh.position = BabylonVector3.Zero()
                        //    rightControllerMesh.position.z = -0.06
                        //    rightControllerMesh.scaling.y = -1
                        //    rightControllerMesh.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, Math.PI)
                        //})
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
            const handJoint = MeshBuilder.CreateCapsule("HandJoint", { radius: 0.5, capSubdivisions: 6, subdivisions: 6, tessellation: 36, height: 1.5, orientation: Vector3.Forward() }, scene)
            const jointMaterial = new StandardMaterial("", scene)
            jointMaterial.emissiveColor = this.controllerColor
            handJoint.material = jointMaterial
            handJoint.position.y = -10
            const handTracking = xrHelper.baseExperience.featuresManager.enableFeature(
                WebXRFeatureName.HAND_TRACKING,
                "latest",
                {
                    xrInput: xrHelper.input,
                    jointMeshes: {
                        disableDefaultHandMesh: true,
                        sourceMesh: handJoint,
                        scaleFactor: 2
                    }
                } as IWebXRHandTrackingOptions,
                true,
                false
            ) as WebXRHandTracking
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
            const inputHandler = (camera: Camera) => {
                if (typeof (input.onHeadMove) === 'function') {
                    input.onHeadMove(camera.position, camera.getDirection(BabylonVector3.ZeroReadOnly))
                }
            }
            xrHelper.input.xrCamera.onViewMatrixChangedObservable.add(inputHandler)
        })

        this.queries.keyboard.added.forEach((entity: EcsyEntity) => {
            const input = entity.getMutableComponent(KeyboardInput)!
            const scene = this.getBabylonScene()
            const inputHandler = ({ type, event }: KeyboardInfo) => {
                if (type === KeyboardEventTypes.KEYDOWN && typeof (input.onKeyDown) === 'function') {
                    input.onKeyDown(event.key)
                } else if (type === KeyboardEventTypes.KEYUP && typeof (input.onKeyUp) === 'function') {
                    input.onKeyUp(event.key)
                }
            }
            scene.onKeyboardObservable.add(inputHandler)
        })

        this.queries.pointer.added.forEach((entity: EcsyEntity) => {
            const input = entity.getMutableComponent(PointerInput)!
            const scene = this.getBabylonScene()
            let moveTimer = performance.now()
            if (typeof (input.onPointerMove) === 'function') {
                scene.onPointerMove = (_, pick) => {
                    if (performance.now() - moveTimer >= 100 && !scene.isPointerCaptured() && pick.ray) {
                        const pickInfo = scene.pickWithRay(pick.ray, ({ name }) => name !== "Ground", false)
                        if (pickInfo && pickInfo.hit) {
                            const { x, y, z } = pickInfo.pickedPoint || BabylonVector3.ZeroReadOnly
                            const facet = (2 * Math.floor(pickInfo.faceId / 2))
                            input.onPointerMove(x, y, z, facet, pickInfo.pickedMesh)
                        }
                        moveTimer = performance.now()
                    }
                }
            }
            if (typeof (input.onPointerSelect) === 'function') {
                scene.onPointerPick = ({ button, pointerType, pointerId }, pick) => {
                    const { x, y, z } = pick.pickedPoint || BabylonVector3.ZeroReadOnly
                    if (pick.hit && !scene.isPointerCaptured()) {
                        if (pointerType === "xr") {
                            const controller = this.xrHelper.pointerSelection.getXRControllerByPointerId(pointerId)
                            if (controller?.inputSource?.handedness === "left") {
                                if (controller.inputSource.profiles.toString().indexOf('hand') > -1) {
                                    //teleport on left hand pointer selection
                                    this.teleport(x, z)
                                    return;
                                }
                            }
                        }
                        const facet = (2 * Math.floor(pick.faceId / 2))
                        input.onPointerSelect(x, y, z, facet)
                    }
                }
            }
        })
    }

    private async createXRHelper(scene: BabylonScene) {
        if (!this.xrHelper) {
            this.xrHelper = await WebXRDefaultExperience.CreateAsync(scene, {
                floorMeshes: [scene.getMeshByName("Ground")!]
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