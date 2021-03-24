import * as BABYLON from "babylonjs";
import { Entity, System } from "ecsy";
import { ControllerInput } from "../components/ControllerInput";
import { getScene, logMessage } from "../../ecsy-babylon/utils/gameUtils";

/** System for ControllerInput component */
export class ControllerInputSystem extends System {
  /** @hidden */
  static queries = {
    input: { components: [ControllerInput], listen: { added: true, removed: true } },
  };
  /** @hidden */
  queries: any;

  private _xrHelper: BABYLON.WebXRDefaultExperience;

  /** @hidden */
  execute() {
    this.queries.input.added.forEach((entity: Entity) => {
      let input = entity.getComponent(ControllerInput);
      let scene = getScene(this, input.scene);
      this.createXRHelper(input, scene);
    });

    this.queries.input.removed.forEach((entity: Entity) => {
      let input = entity.getComponent(ControllerInput);
      let scene = getScene(this, input.scene);
      if (this._xrHelper) {
        this._xrHelper.dispose();
      }
    });
  }

  private async createXRHelper(input: ControllerInput, scene: BABYLON.Scene) {
    if (!this._xrHelper) {
      this._xrHelper = await scene.createDefaultXRExperienceAsync(input.xrOptions || {
        disableTeleportation: false
      })
      logMessage(this, 'xrHelper created')
      this._xrHelper.input.onControllerAddedObservable.add((inputSource) => {
        inputSource.onMotionControllerInitObservable.add((controller) => {
          //https://doc.babylonjs.com/divingDeeper/webXR/webXRInputControllerSupport#some-terms-and-classes-to-clear-things-up
          //MotionControllerComponentType = "trigger" | "squeeze" | "touchpad" | "thumbstick" | "button"
          if (controller.handness == "left") {
            logMessage(this, 'left controller ' + controller.profileId)
            const leftThumbstick = input.onLeftThumbstickMove && controller.getComponentOfType("thumbstick");
            if (leftThumbstick) {
              leftThumbstick.onAxisValueChangedObservable.add(({ x, y }) => {
                logMessage(this, 'onLeftThumbstickMove ' + x + ',' + y)
                input.onLeftThumbstickMove(x, y);
              });
            }
            const leftButtons = input.onLeftButtonPress && controller.getAllComponentsOfType("button");
            if (leftButtons && leftButtons.length > 0) {
              for (const button of leftButtons) {
                button.onButtonStateChangedObservable.add((buttonComponent) => {
                  console.log('onLeftButtonPress', buttonComponent)
                  if (buttonComponent.pressed) {
                    logMessage(this, 'onLeftButtonPress ' + buttonComponent.value)
                    input.onLeftButtonPress(buttonComponent.id);
                  }
                });
              }
            }
            const squeezeButton = input.onLeftSqueezePress && controller.getComponentOfType("squeeze");
            if (squeezeButton) {
              squeezeButton.onButtonStateChangedObservable.add((buttonComponent) => {
                console.log('onLeftSqueezePress', buttonComponent)
                if (buttonComponent.pressed) {
                  logMessage(this, 'onLeftSqueezePress ' + buttonComponent.value)
                  const mesh = this._xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                  input.onLeftSqueezePress(mesh);
                }
              });
            }
            const triggerButton = input.onLeftTriggerPress && controller.getComponentOfType("trigger");
            if (triggerButton) {
              triggerButton.onButtonStateChangedObservable.add((buttonComponent) => {
                console.log('onLeftTriggerPress', buttonComponent)
                if (buttonComponent.pressed) {
                  logMessage(this, 'onLeftTriggerPress ' + buttonComponent.value)
                  const mesh = this._xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                  input.onLeftTriggerPress(mesh);
                }
              });
            }
          }
          else if (controller.handness == "right") {
            logMessage(this, 'right controller ' + controller.profileId)
            const rightThumbstick = input.onRightThumbstickMove && controller.getComponentOfType("thumbstick");
            if (rightThumbstick) {
              rightThumbstick.onAxisValueChangedObservable.add(({ x, y }) => {
                logMessage(this, 'onRightThumbstickMove ' + x + ',' + y)
                input.onRightThumbstickMove(x, y);
              });
            }
            const rightButtons = input.onRightButtonPress && controller.getAllComponentsOfType("button");
            if (rightButtons && rightButtons.length > 0) {
              for (const button of rightButtons) {
                button.onButtonStateChangedObservable.add((buttonComponent) => {
                  console.log('onRightButtonPress', buttonComponent)
                  if (buttonComponent.pressed) {
                    logMessage(this, 'onRightButtonPress ' + buttonComponent.value)
                    input.onRightButtonPress(buttonComponent.id);
                  }
                });
              }
            }
            const squeezeButton = input.onRightSqueezePress && controller.getComponentOfType("squeeze");
            if (squeezeButton) {
              squeezeButton.onButtonStateChangedObservable.add((buttonComponent) => {
                console.log('onRightSqueezePress', buttonComponent)
                if (buttonComponent.pressed) {
                  logMessage(this, 'onRightSqueezePress ' + buttonComponent.value)
                  const mesh = this._xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                  input.onRightSqueezePress(mesh);
                }
              });
            }
            const triggerButton = input.onRightTriggerPress && controller.getComponentOfType("trigger");
            if (triggerButton) {
              triggerButton.onButtonStateChangedObservable.add((buttonComponent) => {
                console.log('onRightTriggerPress', buttonComponent)
                if (buttonComponent.pressed) {
                  logMessage(this, 'onRightTriggerPress ' + buttonComponent.value)
                  const mesh = this._xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                  input.onRightTriggerPress(mesh);
                }
              });
            }
          } else {
            console.log('onMotionControllerInit', controller)
            logMessage(this, 'onMotionControllerInit ' + controller.profileId)
          }
        });
      });
    }
  }
}