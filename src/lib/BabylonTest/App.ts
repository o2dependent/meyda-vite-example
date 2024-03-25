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
} from "@babylonjs/core";
import { Eye } from "./Eye";
import { NeonBox } from "./NeonBox";

export class BabylonTestApp {
	constructor(canvas: HTMLCanvasElement) {
		// initialize babylon scene and engine
		const engine = new Engine(canvas, true);
		const scene = new Scene(engine);

		const camera: ArcRotateCamera = new ArcRotateCamera(
			"Camera",
			-Math.PI / 5,
			Math.PI / 3,
			200,
			Vector3.Zero(),
			scene,
		);
		camera.attachControl(canvas, true);
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

		var box = MeshBuilder.CreateBox("root", { size: 1 });

		var numPerSide = 40,
			size = 50,
			ofst = size / (numPerSide - 1);

		var m = Matrix.Identity();
		var col = 0,
			index = 0;

		let instanceCount = numPerSide * numPerSide * numPerSide;

		let matricesData = new Float32Array(16 * instanceCount);
		let colorData = new Float32Array(4 * instanceCount);

		for (var x = 0; x < numPerSide; x++) {
			m.addAtIndex(12, -size / 2 + ofst * x);
			for (var y = 0; y < numPerSide; y++) {
				m.addAtIndex(13, -size / 2 + ofst * y);
				for (var z = 0; z < numPerSide; z++) {
					m.addAtIndex(14, -size / 2 + ofst * z);

					m.copyToArray(matricesData, index * 16);

					var coli = Math.floor(col);

					colorData[index * 4 + 0] = ((coli & 0xff0000) >> 16) / 255;
					colorData[index * 4 + 1] = ((coli & 0xffff00) >> 8) / 255;
					colorData[index * 4 + 2] = ((coli & 0x0000ff) >> 0) / 255;
					colorData[index * 4 + 3] = 1.0;

					index++;
					col += 0xff0000 / instanceCount;
				}
			}
		}

		box.thinInstanceSetBuffer("matrix", matricesData, 16);
		box.thinInstanceSetBuffer("color", colorData, 4);

		box.material = new StandardMaterial("bmaterial");
		box.material.disableLighting = true;
		box.material.emissiveColor = Color3.White();

		// const eye1 = new Eye(scene);
		// eye1.setPosition(0.75, 0, -10);
		// nodes.push(eye1);

		// const eye2 = new Eye(scene);
		// eye2.setPosition(-0.75, 0, -10);
		// nodes.push(eye2);

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
			nodes.forEach((node) => node?.update?.(elapsedTime));

			scene.render();
		});
	}
}
