import { Behavior } from "@babylonjs/core/Behaviors/behavior"
import { AttachToBoxBehavior } from "@babylonjs/core/Behaviors/Meshes/attachToBoxBehavior"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { TransformNode } from "@babylonjs/core/Meshes/transformNode"
import { Container3D } from "@babylonjs/gui/3D/controls/container3D"
import { HolographicButton } from "@babylonjs/gui/3D/controls/holographicButton"
import { MeshButton3D } from "@babylonjs/gui/3D/controls/meshButton3D"
import { PlanePanel } from "@babylonjs/gui/3D/controls/planePanel"
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager"
import { degreeToRadians } from "../features/world/common/babylonUtils"

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

    constructor(private buttons: MenuButton[]) { }

    init() { }

    attach(target: Mesh) {
        if (!this.target) {
            const scene = target.getScene()
            this.manager = new GUI3DManager(scene)
            var appBar = new TransformNode("", scene)
            var toolbar = new PlanePanel()
            toolbar.margin = 0
            this.manager.addControl(toolbar)
            toolbar.linkToTransformNode(appBar)

            if (this.buttons.length < 5) {
                appBar.scaling.scaleInPlace(0.2)
                toolbar.rows = 1
                this.behavior = new AttachToBoxBehavior(appBar)
                target.addBehavior(this.behavior)
            } else {
                toolbar.columns = 10
                appBar.setParent(target)
                appBar.position.x = 0
                appBar.position.y = 0
                appBar.position.z = -1
                appBar.scaling.scaleInPlace(2)
            }

            toolbar.blockLayout = true;
            for (let { text, imageUrl, action } of this.buttons) {
                var button = new HolographicButton()
                if (text) {
                    button.text = text
                }
                if (imageUrl) {
                    if(imageUrl.indexOf(".glb")>-1){
                        button.imageUrl = "./textures/wire-box.png"
                    }else{
                        button.imageUrl = imageUrl
                    }
                }
                button.onPointerClickObservable.add(action)
                toolbar.addControl(button)
                button.content
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