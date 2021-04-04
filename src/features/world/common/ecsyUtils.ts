import { System as EcsySystem } from "ecsy/src/System";

export function getWorld(system: EcsySystem) {
    return system.world
}