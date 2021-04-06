import { Scene as BabylonScene } from "@babylonjs/core/scene"

export interface WorldScene {
    getBabylonScene(): BabylonScene
}

export interface WorldLog {
    logMessage(message: string): void
}