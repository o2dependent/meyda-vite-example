import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
	Engine,
	Scene,
	ArcRotateCamera,
	Vector3,
	HemisphericLight,
	Mesh,
	MeshBuilder,
	Color3,
	StandardMaterial,
} from "@babylonjs/core";
import { Eye } from "./Eye";

export class BabylonTestApp {
	constructor(canvas: HTMLCanvasElement) {
		// initialize babylon scene and engine
		const engine = new Engine(canvas, true);
		const scene = new Scene(engine);

		const camera: ArcRotateCamera = new ArcRotateCamera(
			"Camera",
			Math.PI / 2,
			Math.PI / 2,
			2,
			Vector3.Zero(),
			scene,
		);
		camera.attachControl(canvas, true);
		const light1: HemisphericLight = new HemisphericLight(
			"light1",
			new Vector3(1, 1, 0),
			scene,
		);

		const nodes = [];

		const eye1 = new Eye(scene);
		eye1.setPosition(0.75, 0, -10);
		nodes.push(eye1);

		const eye2 = new Eye(scene);
		eye2.setPosition(-0.75, 0, -10);
		nodes.push(eye2);

		// hide/show the Inspector
		window.addEventListener("keydown", (ev) => {
			// Shift+Ctrl+Alt+I
			if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
				if (scene.debugLayer.isVisible()) {
					scene.debugLayer.hide();
				} else {
					scene.debugLayer.show();
				}
			}
		});

		// resize the babylon engine when the window is resized
		window.addEventListener("resize", () => {
			engine.resize();
		});

		// run the main render loop
		let elapsedTime = 0;
		engine.runRenderLoop(() => {
			const engine = scene.getEngine();
			elapsedTime += engine.getDeltaTime();
			nodes.forEach((node) => node.update(elapsedTime));
			scene.render();
		});
	}
}
