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
} from "@babylonjs/core";
import { Eye } from "./Eye";
import { NeonBox } from "./NeonBox";
import { Tunnel } from "./Tunnel";

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

	activeNodes: ("neonBox" | "tunnel")[] = ["tunnel", "neonBox"];
	cameraType: "arcRotate" | "free" = "arcRotate";

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
			console.log(ev);
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

			this.updateBox(elapsedTime);

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

	makeBox(scene: Scene) {
		var box = MeshBuilder.CreateBox("root", { size: 1 });

		this.numPerSide = 40;
		this.size = 2;
		this.ofst = this.size / (this.numPerSide - 1);

		this.instanceCount = this.numPerSide * this.numPerSide * this.numPerSide;

		this.matricesData = new Float32Array(16 * this.instanceCount);
		this.colorData = new Float32Array(4 * this.instanceCount);

		let m = Matrix.Identity();
		let col = 0,
			index = 0;

		for (let x = 0; x < this.numPerSide; x++) {
			m.addAtIndex(12, -this.size / 2 + this.ofst * x);
			for (let y = 0; y < this.numPerSide; y++) {
				m.addAtIndex(13, -this.size / 2 + this.ofst * y);
				for (let z = 0; z < this.numPerSide; z++) {
					m.addAtIndex(14, -this.size / 2 + this.ofst * z);

					m.copyToArray(this.matricesData, index * 16);

					const coli = Math.floor(col);

					this.colorData[index * 4 + 0] = ((coli & 0xff0000) >> 16) / 255;
					this.colorData[index * 4 + 1] = ((coli & 0xffff00) >> 8) / 255;
					this.colorData[index * 4 + 2] = ((coli & 0x0000ff) >> 0) / 255;
					this.colorData[index * 4 + 3] = 1.0;

					index++;
					col += 0xffffff / this.instanceCount;
				}
			}
		}

		box.thinInstanceSetBuffer("matrix", this.matricesData, 16);
		box.thinInstanceSetBuffer("color", this.colorData, 4);

		const gl = new GlowLayer("glow", scene, {
			mainTextureFixedSize: 1024,
			blurKernelSize: 64,
		});
		gl.intensity = 0.75;

		const boxMaterial = new StandardMaterial("bmaterial", scene);
		boxMaterial.emissiveColor = Color3.Red();
		boxMaterial.disableLighting = true;
		box.material = boxMaterial;
		gl.addIncludedOnlyMesh(box);

		this.box = box;
	}

	updateBox(elapsedTime: number) {
		if (!this.box) return;
		this.size = Math.abs(Math.sin(elapsedTime / 1000) * 50);
		this.ofst = this.size / (this.numPerSide - 1);

		let m = Matrix.Identity();
		let col = 0,
			index = 0;

		for (let x = 0; x < this.numPerSide; x++) {
			m.addAtIndex(12, -this.size / 2 + this.ofst * x);
			for (let y = 0; y < this.numPerSide; y++) {
				m.addAtIndex(13, -this.size / 2 + this.ofst * y);
				for (let z = 0; z < this.numPerSide; z++) {
					m.addAtIndex(14, -this.size / 2 + this.ofst * z);

					m.copyToArray(this.matricesData, index * 16);

					const coli = Math.floor(col);

					this.colorData[index * 4 + 0] = ((coli & 0xff0000) >> 16) / 255;
					this.colorData[index * 4 + 1] = ((coli & 0xffff00) >> 8) / 255;
					this.colorData[index * 4 + 2] = ((coli & 0x0000ff) >> 0) / 255;
					this.colorData[index * 4 + 3] = 1.0;

					index++;
					col += 0xffffff / this.instanceCount;
				}
			}
		}

		this.box.thinInstanceSetBuffer("matrix", this.matricesData, 16);
		this.box.thinInstanceSetBuffer("color", this.colorData, 4);
	}
}
