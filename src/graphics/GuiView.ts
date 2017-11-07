import { adjust } from "../utils";

function create<T extends BABYLON.GUI.Control>(
    constructor: new () => T, 
    parent: BABYLON.GUI.Container | BABYLON.GUI.AdvancedDynamicTexture, 
    ...applyStyles: ((el: T) => void)[]
): T {
    return adjust(
        new constructor(), 
        ...applyStyles, 
        el => parent.addControl(el));
}



export class GuiView {
    constructor(
        private env: BABYLON.Scene
    ) {

    }

    root = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("", true, this.env);

    panel = create(
        BABYLON.GUI.StackPanel, 
        this.root, 
        el => {
            el.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            el.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            el.width = "200px";
        }
    );

    fpsLabel = create(
        BABYLON.GUI.TextBlock,
        this.panel,
        GuiView.defaultTextBlockStyle
    );

    bodyCountLabel = create(
        BABYLON.GUI.TextBlock,
        this.panel,
        GuiView.defaultTextBlockStyle
    );

    pauseButton = create(
        BABYLON.GUI.Button, 
        this.panel, 
        GuiView.defaultButtonStyle,
        el => {
            create(BABYLON.GUI.TextBlock, el, el => {
                el.text = "Pause"}
            );
        }
    );

    stepButton = create(
        BABYLON.GUI.Button, 
        this.panel, 
        GuiView.defaultButtonStyle,
        el => {
            create(BABYLON.GUI.TextBlock, el, el => {
                el.text = "Step"}
            );
        }
    );

    toggleGravityButton = create(
        BABYLON.GUI.Button, 
        this.panel, 
        GuiView.defaultButtonStyle,
        el => {
            create(BABYLON.GUI.TextBlock, el, el => {
                el.text = "Toggle Gravity"}
            );
        }
    );

    toggleWorldGuiButton = create(
        BABYLON.GUI.Button, 
        this.panel, 
        GuiView.defaultButtonStyle,
        el => {
            create(BABYLON.GUI.TextBlock, el, el => {
                el.text = "Toggle World GUI"}
            );
        }
    );





    static defaultButtonStyle(el: BABYLON.GUI.Button) {
        el.width = "100%"
        el.height = "20px";
        el.color = "white";
        el.cornerRadius = 20;
        el.background = "green";
    }

    static defaultTextBlockStyle(el: BABYLON.GUI.TextBlock) {
        el.width = "100%"
        el.height = "20px";
        el.color = "white";
    }
}
