import {
	Scene,
	MeshBuilder,
	Vector3,
	VertexBuffer,
	GlowLayer,
	StandardMaterial,
	Color3,
	Mesh,
	Engine,
	Matrix,
	LinesMesh,
	CreateGreasedLine,
	GreasedLineMeshColorDistribution,
	FloatArray,
} from "@babylonjs/core";
import { lerp } from "../math";
import type Meyda from "meyda";

export class SphereVisualizer {
	ribbon: Mesh;
	paths: Vector3[][];
	vertexPosBuffer: FloatArray;

	analyser: Meyda.MeydaAnalyzer;

	constructor(scene: Scene) {
		// Create a glow layer
		const gl = new GlowLayer("glow", scene, {
			mainTextureFixedSize: 1024,
			blurKernelSize: 64,
		});
		gl.intensity = 0.25;

		// Create neon light materials
		const neonMaterial = new StandardMaterial("neonMaterial", scene);
		neonMaterial.emissiveColor = Color3.Teal();
		neonMaterial.disableLighting = true;

		this.paths = [];
		for (let t = 0; t < Math.PI; t += Math.PI / 60) {
			const path = [];
			for (let a = 0; a < 2 * Math.PI; a += Math.PI / 60) {
				let x = 4 * Math.cos(a) * Math.sin(t);
				let y = 4 * Math.sin(a) * Math.sin(t);
				let z = 4 * Math.cos(t);
				path.push(new Vector3(x, y, z));
			}
			path.push(path[0]); // close circle
			this.paths.push(path);
		}

		const ribbon = MeshBuilder.CreateRibbon("ribbon", {
			pathArray: this.paths,
			closePath: true,
			sideOrientation: Mesh.DOUBLESIDE,
			updatable: true,
		});
		ribbon.material = neonMaterial;
		ribbon.material.wireframe = true;

		ribbon.rotate(Vector3.Right(), Math.PI / 2);

		this.vertexPosBuffer = ribbon.getVerticesData(VertexBuffer.PositionKind);
		this.ribbon = ribbon;
	}

	setPosition(x: number, y: number, z: number) {}

	update(elapsedTime: number) {
		const vertexPosBuffer = [...this.vertexPosBuffer];

		for (let i = 0; i < vertexPosBuffer.length; i += 3) {
			const x = vertexPosBuffer[i];
			const y = vertexPosBuffer[i + 1];
			const z = vertexPosBuffer[i + 2];

			const radius = Math.sqrt(x * x + y * y + z * z);
			const theta = Math.atan2(y, x);
			const phi = Math.acos(z / radius);

			const newRadius = 4;
			const newX = newRadius * Math.cos(theta) * Math.sin(phi);
			//  +Math.cos(x * 4 + elapsedTime / 400) * 0.25;

			// const newX = lerp(
			// 	x,
			// 	newRadius * Math.cos(x * 4 + elapsedTime / 500) * 1.5,
			// 	0.01,
			// );

			const newY = newRadius * Math.sin(theta) * Math.sin(phi);
			// +Math.cos(y * 4 + elapsedTime / 200) * 0.25;

			// const newY = lerp(
			// 	y,
			// 	newRadius * Math.sin(y * 4 + elapsedTime / 100) * 1.5,
			// 	0.01,
			// );

			// const newZ =
			// 	newRadius * Math.cos(phi) +
			// 	Math.sin(
			// 		z * (4 * (Math.sin(elapsedTime / 2000) + 1)) + elapsedTime / 500,
			// 	) *
			// 		0.15;

			const newZ = lerp(
				z,
				newRadius * Math.cos(z * 4 + elapsedTime / 50) * 1.5,
				0.01,
			);

			vertexPosBuffer[i] = newX;
			vertexPosBuffer[i + 1] = newY;
			vertexPosBuffer[i + 2] = newZ;
		}

		this.ribbon.updateVerticesData(VertexBuffer.PositionKind, vertexPosBuffer);

		// console.log(this?.analyser?.get?.(["rms"]));
		console.log(this?.analyser?.get?.(["chroma"]));
		// this.ribbon.position.y =
		// 	this?.analyser?.get?.(["rms"])?.rms ?? this.ribbon.position.y;
	}

	setMeydaAnalyser(analyser: Meyda.MeydaAnalyzer) {
		this.analyser = analyser;
	}
}
