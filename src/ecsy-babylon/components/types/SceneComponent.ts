import { Entity } from "ecsy";
/** Interface defined the scene of a component. */
export interface SceneComponent {
  /** Scene Entity to add other entities. */
  scene?: Entity;
}