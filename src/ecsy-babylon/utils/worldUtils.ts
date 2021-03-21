import { System, World } from "ecsy";

/**
 * @hidden
 * Hack on ecsy to get World instance from system itself.
 * @param system A registered ecsy System class
 * @returns ecsy world
 */
export function getWorld(system: System): World {
  return (system as any)["world"] as World;
}