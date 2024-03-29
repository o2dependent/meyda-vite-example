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
	Color4,
} from "@babylonjs/core";
import { lerp } from "../math";
import type Meyda from "meyda";

export class SphereVisualizer {
	ribbon: Mesh;
	paths: Vector3[][];
	vertexPosBuffer: FloatArray;

	analyser: Meyda.MeydaAnalyzer;
	features: Record<string, any>;

	constructor(scene: Scene) {
		// Create a glow layer
		const gl = new GlowLayer("glow", scene, {
			mainTextureFixedSize: 1024,
			blurKernelSize: 64,
		});
		gl.intensity = 0.35;

		// Create neon light materials
		const neonMaterial = new StandardMaterial("neonMaterial", scene);
		neonMaterial.emissiveColor = Color3.Teal();
		neonMaterial.disableLighting = true;

		this.paths = [];
		const colors: Color4[] = [];
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
			var r = 0.5 + Math.random() * 0.2;
			var g = 0.5 + Math.random() * 0.4;
			var b = 0.5;
			colors.push(new Color4(r, g, b, 1));
		}

		const ribbon = MeshBuilder.CreateRibbon("ribbon", {
			pathArray: this.paths,
			closePath: true,
			sideOrientation: Mesh.DOUBLESIDE,
			updatable: true,
		});
		ribbon.material = neonMaterial;
		ribbon.material.wireframe = true;

		gl.addIncludedOnlyMesh(ribbon);

		// ribbon.rotate(Vector3.Right(), Math.PI / 2);

		this.vertexPosBuffer = ribbon.getVerticesData(VertexBuffer.PositionKind);
		this.ribbon = ribbon;
	}

	setPosition(x: number, y: number, z: number) {}

	getInterpolatedValue(arr: number[], index: number, length: number) {
		const iPercent = index / length;
		const arrIndex = Math.floor(iPercent * (arr?.length || 0));
		const remainder = iPercent * (arr?.length || 0) - arrIndex;
		const val = arr?.[arrIndex] || 0;
		const nextVal = arr?.[arrIndex + 1] || 0;
		const interpolatedVal = lerp(val, nextVal, remainder);
		// if (index > 5 && index < 10)
		// 	console.log({
		// 		iPercent,
		// 		arrIndex,
		// 		remainder,
		// 		val,
		// 		nextVal,
		// 		interpolatedVal,
		// 	});
		return val;
	}

	update(elapsedTime: number) {
		const vertexPosBuffer = [...this.vertexPosBuffer];
		console.log(this.features?.buffer);

		for (let i = 0; i < vertexPosBuffer.length; i += 3) {
			const x = vertexPosBuffer[i];
			const y = vertexPosBuffer[i + 1];
			const z = vertexPosBuffer[i + 2];

			const radius = Math.sqrt(x * x + y * y + z * z);
			const theta = Math.atan2(y, x);
			const phi = Math.acos(z / radius);

			const iPercent = i / vertexPosBuffer.length;
			const bufferIndex = Math.floor(
				iPercent * (this.features?.buffer?.length || 0),
				// iPercent * (this.features?.complexSpectrum?.real?.length || 0),
			);
			// const bufferVal = this.features?.buffer?.[bufferIndex] || 0;
			const bufferVal = this.getInterpolatedValue(
				this.features?.buffer,
				i,
				vertexPosBuffer.length,
			);
			// const bufferVal =
			// 	this.features?.complexSpectrum?.real?.[bufferIndex] || 0;

			// const amp = 0.15 + (this.features?.energy || 0) / 100;
			const amp = lerp(0.15, 1, (this.features?.energy || 0) / 100);
			const newRadius = 4 + Math.sin(x * y * z + elapsedTime / 1000) * amp;
			const newX = newRadius * Math.cos(theta) * Math.sin(phi);
			//  +Math.cos(x * 4 + elapsedTime / 400) * 0.25;

			// const xVal = bufferVal * Math.sign(x) || 0;
			// const newX = x + xVal;
			// const newX = lerp(x, x + Math.cos(theta) * Math.sin(phi) * 2.5, 1);
			// const newX = x;

			const newY = newRadius * Math.sin(theta) * Math.sin(phi);
			// +Math.cos(y * 4 + elapsedTime / 200) * 0.25;

			// const newY = lerp(
			// 	y,
			// 	newRadius * Math.sin(y * 4 + elapsedTime / 100) * amp,
			// 	0.01,
			// );

			// const yVal = bufferVal * Math.sign(y) || 0;
			// const newY = lerp(y, y + Math.sin(theta) * Math.sin(phi) * 2.5, 1);
			// const newY = y + yVal;

			const newZ = newRadius * Math.cos(phi);
			// 	+ Math.sin(
			// 		z * (4 * (Math.sin(elapsedTime / 2000) + 1)) + elapsedTime / 500,
			// 	) *
			// 		0.15;

			// const newZ = lerp(
			// 	z,
			// 	newRadius * Math.cos(z * 4 + elapsedTime / 50) * amp,
			// 	0.01,
			// );
			// const zVal = bufferVal * Math.sign(z) || 0;
			// const newZ = lerp(z, z + Math.cos(phi) * 2.5, 1);

			vertexPosBuffer[i] = newX;
			vertexPosBuffer[i + 1] = newY;
			vertexPosBuffer[i + 2] = newZ;
			const color = new Vector3(newX, newY, newZ).normalize();
			vertexPosBuffer[i] = newX;
			vertexPosBuffer[i + 1] = newY;
			vertexPosBuffer[i + 2] = newZ;
		}

		this.ribbon.updateVerticesData(VertexBuffer.PositionKind, vertexPosBuffer);
		// this.ribbon.updateVerticesData(
		// 	VertexBuffer.ColorInstanceKind,
		// 	vertexPosBuffer,
		// );

		// console.log(this?.analyser?.get?.(["rms"]));
		// this.ribbon.position.y =
		// 	this?.analyser?.get?.(["rms"])?.rms ?? this.ribbon.position.y;
	}

	setMeydaAnalyser(analyser: Meyda.MeydaAnalyzer) {
		this.analyser = analyser;
	}

	setMeydaFeatures(features: Record<string, any>) {
		this.features = features;
		// console.log(this.features);
	}
}
