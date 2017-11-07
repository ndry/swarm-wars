import { GuiView } from "./GuiView";
import { adjust } from "../utils";

export class GraphicsEnvionment {
    constructor(
        private env: {
            canvas: HTMLCanvasElement
        } 
    ) {
    }

    engine = new BABYLON.Engine(this.env.canvas, true);

    scene = adjust(new BABYLON.Scene(this.engine), scene => {
        scene.clearColor = new BABYLON.Color4(0.1, 0, 0.1, 1);
    });


    camera = (() => {
        const camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, 0, 100, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 50000;
        camera.attachControl(this.env.canvas, false);
        return camera;
    })();

    guiView = new GuiView(this.scene);

    isWorldGuiOn = true;
    worldGuiRoot = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("", true, this.scene);
    
}
