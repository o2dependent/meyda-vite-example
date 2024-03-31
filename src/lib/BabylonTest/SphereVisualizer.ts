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
	Effect,
	ShaderMaterial,
} from "@babylonjs/core";
import { lerp } from "../math";
import type Meyda from "meyda";

export class SphereVisualizer {
	scene: Scene;
	shaderMaterial: ShaderMaterial;
	ribbon: Mesh;
	paths: Vector3[][];
	vertexPosBuffer: FloatArray;

	analyser: Meyda.MeydaAnalyzer;
	features: Record<string, any>;

	constructor(scene: Scene) {
		this.scene = scene;
		this.addShaders();
		this.setShaderMaterial();

		// Create a glow layer
		const gl = new GlowLayer("glow", scene, {
			mainTextureFixedSize: 1024,
			blurKernelSize: 64,
		});
		gl.intensity = 0.75;

		// Create neon light materials
		const neonMaterial = new StandardMaterial("neonMaterial", scene);
		neonMaterial.emissiveColor = Color3.Teal();
		// neonMaterial.disableLighting = true;

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
			// sideOrientation: Mesh.DOUBLESIDE,
			sideOrientation: Mesh.FLIP_TILE,
			updatable: true,
		});
		// ribbon.material = neonMaterial;

		gl.addIncludedOnlyMesh(ribbon);

		this.vertexPosBuffer = ribbon.getVerticesData(VertexBuffer.PositionKind);
		this.ribbon = ribbon;
		// this.ribbon.material = neonMaterial;
		this.ribbon.material = this.shaderMaterial;
		// this.ribbon.material.wireframe = true;
	}

	addShaders() {
		Effect.ShadersStore["customVertexShader"] = `
		precision highp float;
		attribute vec3 position;
		uniform mat4 worldViewProjection;

		varying vec4 vPosition;


		void main() {
				vec4 p = vec4(position, 1.);
				vPosition = p;

				gl_Position = worldViewProjection * p;
		}
`;

		Effect.ShadersStore["customFragmentShader"] = `
		precision highp float;
		uniform vec3 colorA;
		uniform vec3 colorB;
		uniform vec3 colorC;
		uniform vec3 colorD;
		uniform float iTime;

		varying vec4 vPosition;

		vec3 palette( float t ) {

			return colorA + colorB*cos( 6.28318*(colorC*t+colorD) );
	}

		void main() {
			vec3 finalColor = vec3(0.0);
			vec3 uv = vPosition.xyz;
			vec3 uv0 = uv;
			for (float i = 0.0; i < 4.0; i++) {
					uv = abs(uv) / dot(uv, uv);
					float d = length(uv) * exp(-length(uv));

					vec3 col = palette(length(uv) + i*.4 );

					d = sin(d*18.)/18.;
					d = abs(d);

					d = pow(0.01 / d, 1.1);

					finalColor += col * d;
			}

			gl_FragColor = vec4(finalColor, 1.0);
		}
`;
	}

	setShaderMaterial() {
		this.shaderMaterial = new ShaderMaterial("custom", this.scene, "custom", {
			attributes: ["position"],
			uniforms: [
				"worldViewProjection",
				"colorA",
				"colorB",
				"colorC",
				"colorD",
				"iTime",
			],
		});

		this.shaderMaterial.allowShaderHotSwapping = true;

		this.shaderMaterial.setColor3("colorA", new Color3(0.5, 0.5, 0.5));
		this.shaderMaterial.setColor3("colorB", new Color3(0.5, 0.5, 0.5));
		this.shaderMaterial.setColor3("colorC", new Color3(1.0, 1.0, 1.0));
		this.shaderMaterial.setColor3("colorD", new Color3(0.0, 0.33, 0.67));
		this.shaderMaterial.setFloat(
			"iTime",
			this.scene.getEngine().getDeltaTime() / 1000,
		); // Convert to seconds
	}

	setPosition(x: number, y: number, z: number) {}

	getInterpolatedValue(arr: number[], index: number, length: number) {
		const iPercent = index / length;
		const arrIndex = Math.floor(iPercent * (arr?.length || 0));
		const remainder = iPercent * (arr?.length || 0) - arrIndex;
		const val = arr?.[arrIndex] || 0;
		const nextVal = arr?.[arrIndex + 1] || 0;
		const interpolatedVal = lerp(val, nextVal, remainder);

		return interpolatedVal;
	}

	update(elapsedTime: number) {
		const vertexPosBuffer = [...this.vertexPosBuffer];
		const curVertPosBuf = this.ribbon.getVerticesData(
			VertexBuffer.PositionKind,
		);
		console.log(this.features);

		for (let i = 0; i < vertexPosBuffer.length; i += 3) {
			const x = vertexPosBuffer[i];
			const y = vertexPosBuffer[i + 1];
			const z = vertexPosBuffer[i + 2];

			const iPercent = i / vertexPosBuffer.length;
			const bufferIndex = Math.floor(
				iPercent * (this.features?.buffer?.length || 0),
				// iPercent * (this.features?.complexSpectrum?.real?.length || 0),
			);
			const bufferVal =
				this.getInterpolatedValue(
					this.features?.buffer,
					i,
					vertexPosBuffer.length,
				) || 1;
			const chromaVal =
				this.getInterpolatedValue(
					this.features?.chroma,
					i,
					vertexPosBuffer.length,
				) || 0;
			const loudnessVal = this.getInterpolatedValue(
				this.features?.loudness?.specific,
				i,
				vertexPosBuffer.length,
			);
			const epsilon = 0.0001; // small constant

			const radius = Math.sqrt(
				(x + epsilon) * (x + epsilon) +
					(y + epsilon) * (y + epsilon) +
					(z + epsilon) * (z + epsilon),
			);
			const theta = Math.atan2(y + epsilon, x + epsilon);
			const phi = Math.acos((z + epsilon) / radius);
			const amp = lerp(0.5, 4, (this.features?.energy || 0) / 100);

			const newRadius =
				radius +
				(Math.sin(
					(x + epsilon) *
						Math.sin(chromaVal) *
						((y + epsilon) * Math.sin(loudnessVal)) *
						((z + epsilon) * Math.sin(bufferVal)),
					// + elapsedTime / lerp(100, 1000, this.features?.spectralFlatness || 0),
				) +
					1) *
					amp;

			const newX = newRadius * Math.cos(theta) * Math.sin(phi);

			const newY = newRadius * Math.sin(theta) * Math.sin(phi);

			const newZ = newRadius * Math.cos(phi);

			vertexPosBuffer[i] = lerp(curVertPosBuf[i], newX, 0.1);
			vertexPosBuffer[i + 1] = lerp(curVertPosBuf[i + 1], newY, 0.1);
			vertexPosBuffer[i + 2] = lerp(curVertPosBuf[i + 2], newZ, 0.1);
		}

		const energy = (this.features?.energy || 0) / 100;
		const rmsPercent = (this.features?.rms || 0) / 100;
		const spectralCentroidPercent =
			(this.features?.spectralCentroid || 0) / 100;

		this.ribbon.updateVerticesData(VertexBuffer.PositionKind, vertexPosBuffer);

		this.ribbon.rotate(
			new Vector3(spectralCentroidPercent, rmsPercent, 1),
			0.05,
		);

		this.shaderMaterial.setFloat("iTime", elapsedTime / 1000); // Convert to seconds
	}

	setMeydaAnalyser(analyser: Meyda.MeydaAnalyzer) {
		this.analyser = analyser;
	}

	setMeydaFeatures(features: Record<string, any>) {
		this.features = features;
		// console.log(this.features);
	}
}
