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
	GlowLayer,
	VertexBuffer,
	Matrix,
	FreeCamera,
	PointLight,
} from "@babylonjs/core";
import { Eye } from "./Eye";
import { NeonBox } from "./NeonBox";
import { Tunnel } from "./Tunnel";
import { SphereVisualizer } from "./SphereVisualizer";

export class BabylonTestApp {
	matricesData: Float32Array;
	colorData: Float32Array;
	instanceCount: number;
	box: Mesh;
	numPerSide: number;
	size: number;
	ofst: number;

	engine: Engine;
	scene: Scene;

	activeNodes: ("neonBox" | "tunnel" | "sphereVisualizer")[] = [
		"sphereVisualizer",
	];
	cameraType: "arcRotate" | "free" = "arcRotate";
	cameraLight: boolean = true;
	flashLight: PointLight;

	constructor(canvas: HTMLCanvasElement) {
		// initialize babylon scene and engine
		const engine = new Engine(canvas, true);
		const scene = new Scene(engine);

		if (this.cameraType === "arcRotate") {
			const camera: ArcRotateCamera = new ArcRotateCamera(
				"Camera",
				0,
				Math.PI / 2,
				20,
				Vector3.Zero(),
				scene,
			);
			camera.attachControl(canvas, true);
		} else if (this.cameraType === "free") {
			const camera = new FreeCamera("camera1", Vector3.Zero(), scene);
			camera.fov = 45;
			camera.setTarget(Vector3.Left());
			camera.attachControl(canvas, true);
		}

		if (this.cameraLight) {
			this.flashLight = new PointLight(
				"flashLight",
				new Vector3(0, 10, 0),
				scene,
			);
			this.flashLight.intensity = 0.25;
		}

		const light1: HemisphericLight = new HemisphericLight(
			"light1",
			new Vector3(1, 1, 0),
			scene,
		);
		light1.intensity = 0.2;

		// const plane = MeshBuilder.CreatePlane("plane", { size: 5 }, scene);
		// plane.rotation.x = Math.PI / 2;
		// plane.position.y = -1;
		// plane.position.z = -5;
		// plane.scaling.x = 5;
		// plane.scaling.y = 5;

		const nodes = [];
		// for (let i = 0; i < 10; i++) {
		// 	for (let j = 0; j < 10; j++) {
		// 		const neonBox = new NeonBox(scene, i * j);
		// 		neonBox.setPosition(15 * i, 0, -15 * j);
		// 		nodes.push(neonBox);
		// 	}
		// }

		if (this.activeNodes.includes("neonBox")) {
			const neonBox = new NeonBox(scene, 0);
			neonBox.setPosition(0, 0, 0);
			nodes.push(neonBox);
		}

		if (this.activeNodes.includes("tunnel")) {
			const tunnel = new Tunnel(scene);
			tunnel.setPosition(-50, -50, -50);
			nodes.push(tunnel);
		}

		if (this.activeNodes.includes("sphereVisualizer")) {
			const sphereVisualizer = new SphereVisualizer(scene);
			nodes.push(sphereVisualizer);
		}

		// this.makeBox(scene);

		// const eye1 = new Eye(scene);
		// eye1.setPosition(0.75, 0, -10);
		// nodes.push(eye1);

		// const eye2 = new Eye(scene);
		// eye2.setPosition(-0.75, 0, -10);
		// nodes.push(eye2);

		// hide/show the Inspector
		window.addEventListener("keydown", (ev) => {
			// Shift+Ctrl+Alt+I
			if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
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
			nodes.forEach((node) => node?.update?.(elapsedTime));

			if (this.cameraLight) {
				this.flashLight.position = scene.activeCamera.position;
			}

			scene.render();
		});

		this.engine = engine;
		this.scene = scene;
	}

	dispose() {
		this.engine.dispose();
		this.scene.dispose();

		this.engine = null;
		this.scene = null;
	}
}
