import * as BABYLON from "babylonjs";
import { Entity } from "ecsy";
import { SceneComponent } from "../../ecsy-babylon/components/types/SceneComponent";

/**
 * @example
 * ```
 * entity.addComponent(ControllerInput, { onLeftTriggerPress: onTriggerPress });
 * function onTriggerPress(amount: number) {
 *   console.log("trigger pressed: " + amount);
 * }
 * ```
 */
export class ControllerInput implements SceneComponent {
  scene?: Entity;
  /** 
   * When left thumbstick is moved. 
   * @memberof XR
   */
  onLeftThumbstickMove?: ControllerInput.XRThumbstickInput;
  /** 
   * When left button is pressed. 
   * @memberof XR
   */
  onLeftButtonPress?: ControllerInput.XRButtonInput;
  /** 
   * When left trigger is pressed. 
   * @memberof XR
   */
  onLeftTriggerPress?: ControllerInput.XRTriggerInput;
  /** 
   * When left handle is squeezed. 
   * @memberof XR
   */
  onLeftSqueezePress?: ControllerInput.XRTriggerInput;
  /** 
   * When left thumbstick is moved. 
   * @memberof XR
   */
  onRightThumbstickMove?: ControllerInput.XRThumbstickInput;
  /** 
   * When right button is pressed. 
   * @memberof XR
   */
  onRightButtonPress?: ControllerInput.XRButtonInput;
  /** 
   * When right trigger is pressed. 
   * @memberof XR
   */
  onRightTriggerPress?: ControllerInput.XRTriggerInput;
  /** 
   * When right handle is squeezed. 
   * @memberof XR
   */
  onRightSqueezePress?: ControllerInput.XRTriggerInput;
  /** 
   * When trigger is pressed (enables XR pointer)
   * @memberof XR
   */
  onPointerInput?: ControllerInput.XRPointerInput;
  /** 
   * Options for WebXR Default Experience (BABYLON)
   * @memberof XR
   */
  xrOptions?: BABYLON.WebXRDefaultExperienceOptions;
}

namespace ControllerInput {
  export interface XRThumbstickInput {
    (x: number, y: number): void;
  }
  export interface XRButtonInput {
    (button: string): void;
  }
  export interface XRTriggerInput {
    (mesh: BABYLON.AbstractMesh): void;
  }
  export interface XRPointerInput {
    (): void;
  }
}