import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Container } from "@babylonjs/gui/2D/controls/container";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Grid } from "@babylonjs/gui/2D/controls/grid";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

let _messages: Container

export function logMessage(message: string) {
    console.log('log', message)
    if (!_messages) {
        _messages = createTextPanel()
    }
    _messages.addControl(createTextBlock(message))
}

function createTextPanel() {
    var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var grid = new Grid();
    grid.addColumnDefinition(1 / 3);
    grid.addColumnDefinition(1 / 3);
    grid.addColumnDefinition(1 / 3);
    advancedTexture.addControl(grid);

    var stack = new StackPanel();
    stack.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    grid.addControl(stack, 0, 2);

    return stack;
}

function createTextBlock(text: string, color: string = "red") {
    var textBlock = new TextBlock();
    textBlock.text = text;
    textBlock.color = color;
    textBlock.fontSize = 12;
    textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.height = "15px";
    return textBlock;
}