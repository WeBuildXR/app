import { Behavior } from "@babylonjs/core/Behaviors/behavior"
import { AttachToBoxBehavior } from "@babylonjs/core/Behaviors/Meshes/attachToBoxBehavior"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { TransformNode } from "@babylonjs/core/Meshes/transformNode"
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture"
import { Control } from "@babylonjs/gui/2D/controls/control"
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock"
import { Container3D } from "@babylonjs/gui/3D/controls/container3D"
import { HolographicButton } from "@babylonjs/gui/3D/controls/holographicButton"
import { PlanePanel } from "@babylonjs/gui/3D/controls/planePanel"
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager"

export interface MenuButton {
    text?: string
    imageUrl?: string
    action: () => void
}

export class MenuBehavior implements Behavior<Mesh> {
    name: string = "MenuBehavior"

    private manager: GUI3DManager
    private panel: Container3D
    private target: Mesh
    private behavior: AttachToBoxBehavior

    constructor(private buttons: MenuButton[], private title?: string) { }

    init() { }

    attach(target: Mesh) {
        if (!this.target) {
            const scene = target.getScene()
            this.manager = new GUI3DManager(scene)
            var appBar = new TransformNode("Menu", scene)
            var toolbar = new PlanePanel()
            this.manager.addControl(toolbar)
            toolbar.linkToTransformNode(appBar)
            this.behavior = new AttachToBoxBehavior(appBar)
            target.addBehavior(this.behavior)
            toolbar.margin = 0

            if (this.title) {
                var appBarTitle = new Mesh("MenuTitle", scene, target)
                var meshUI = AdvancedDynamicTexture.CreateForMesh(appBarTitle, undefined, undefined, false)
                meshUI.addControl(createTextBlock(this.title))
            }

            if (this.buttons.length < 5) {
                appBar.scaling.scaleInPlace(0.2)
                toolbar.rows = 1
            } else {
                appBar.scaling.scaleInPlace(3)
                toolbar.columns = 10
                this.behavior.distanceAwayFromBottomOfFace = 10
            }

            toolbar.blockLayout = true;
            for (let { text, imageUrl, action } of this.buttons) {
                var button = new HolographicButton()
                if (text) {
                    button.text = text
                }
                if (imageUrl) {
                    button.imageUrl = imageUrl
                }
                button.onPointerClickObservable.add(action)
                toolbar.addControl(button)
                button.tooltipText = this.title || ""
            }
            toolbar.blockLayout = false;

            this.target = target
            this.panel = toolbar

        } else {
            this.manager.addControl(this.panel)
            if (this.behavior) {
                target.addBehavior(this.behavior)
            }
        }
    }

    detach() {
        if (this.behavior) {
            this.target.removeBehavior(this.behavior)
        }
        if (this.target) {
            this.manager.removeControl(this.panel)
        }
    }
}

function createTextBlock(text: string, color: string = "white") {
    var textBlock = new TextBlock()
    textBlock.text = text
    textBlock.color = color
    textBlock.fontSize = 18
    textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    textBlock.height = "20px"
    return textBlock
}