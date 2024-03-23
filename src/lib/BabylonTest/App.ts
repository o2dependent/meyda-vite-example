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

		const sclera: Mesh = MeshBuilder.CreateSphere(
			"sclera",
			{ diameter: 1 },
			scene,
		);
		const iris: Mesh = MeshBuilder.CreateSphere(
			"iris",
			{ diameter: 0.5 },
			scene,
		);
		iris.parent = sclera;
		iris.position.x = 0.28;
		iris.scaling.y = 1.5;
		iris.scaling.z = 1.5;
		const irisMaterial = new StandardMaterial("irisMaterial", scene);
		irisMaterial.diffuseColor = Color3.Red();
		iris.material = irisMaterial;

		const pupil: Mesh = MeshBuilder.CreateSphere(
			"pupil",
			{ diameter: 0.45 },
			scene,
		);
		pupil.parent = sclera;
		pupil.position.x = 0.33;
		pupil.scaling.y = 1.5;
		pupil.scaling.z = 1.5;
		const pupilMaterial = new StandardMaterial("pupilMaterial", scene);
		pupilMaterial.diffuseColor = Color3.Black();
		pupil.material = pupilMaterial;

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
			pupil.scaling.y = (Math.sin(elapsedTime / 1000) + 1) * 0.25 + 1;
			pupil.scaling.z = (Math.sin(elapsedTime / 1000) + 1) * 0.25 + 1;
			sclera.rotation.y =
				(Math.cos(elapsedTime / 1000) + 1 + Math.sin(elapsedTime / 1000)) *
					0.25 +
				1;
			sclera.rotation.z =
				(Math.cos(elapsedTime / 1000) + 1 + Math.sin(elapsedTime / 1000)) *
					0.25 +
				1;
			scene.render();
		});
	}
}
