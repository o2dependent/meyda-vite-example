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
	ParticleSystem,
	Texture,
	MeshParticleEmitter,
	HighlightLayer,
} from "@babylonjs/core";
import { lerp } from "../math";
import type Meyda from "meyda";
import { getInterpolatedValue } from "../getInterpolatedValue";
import { buffers } from "../TestWebGl/buffers.store";

export class SphereVisualizer {
	scene: Scene;
	shaderMaterial: ShaderMaterial;
	ribbon: Mesh;
	paths: Vector3[][];
	vertexPosBuffer: FloatArray;
	particleSystem: ParticleSystem;
	shaderColors = {
		colorA: new Color3(1, 0.1, 0.21),
		colorB: new Color3(1, 0.56, 0.1),
		colorC: new Color3(1, 0.2, 0.1),
		colorD: new Color3(0.1, 0.1, 0.1),
	};

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
		for (let t = 0; t < Math.PI; t += Math.PI / 180) {
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

		this.setParticleSystem();

		// const hl = new HighlightLayer("hl1", scene);
		// hl.addMesh(this.ribbon, this.shaderColors.colorA);
	}

	addShaders() {
		Effect.ShadersStore["sphereVisualizerVertexShader"] = `
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

		Effect.ShadersStore["sphereVisualizerFragmentShader"] = `
		precision highp float;
		uniform vec3 colorA;
		uniform vec3 colorB;
		uniform vec3 colorC;
		uniform vec3 colorD;
		uniform float iTime;
		uniform float uScaleFactor;
		uniform float uDivisorFactor;

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

					d = sin(d*uScaleFactor)/uDivisorFactor;
					d = abs(d);

					d = pow(0.01 / d, 1.1);

					finalColor += col * d;
			}

			gl_FragColor = vec4(finalColor, 1.0);
		}
`;
	}

	setShaderMaterial() {
		this.shaderMaterial = new ShaderMaterial(
			"sphereVisualizer",
			this.scene,
			"sphereVisualizer",
			{
				attributes: ["position"],
				uniforms: [
					"worldViewProjection",
					"colorA",
					"colorB",
					"colorC",
					"colorD",
					"iTime",
					"uScaleFactor",
					"uDivisorFactor",
				],
			},
		);

		this.shaderMaterial.allowShaderHotSwapping = true;

		// this.shaderMaterial.setColor3("colorA", new Color3(0.5, 0.5, 0.5));
		// this.shaderMaterial.setColor3("colorB", new Color3(0.5, 0.5, 0.5));
		// this.shaderMaterial.setColor3("colorC", new Color3(1.0, 1.0, 1.0));
		// this.shaderMaterial.setColor3("colorD", new Color3(0.0, 0.33, 0.67));

		// this.shaderMaterial.setColor3("colorA", new Color3(0.5, 0.5, 0.5));
		// this.shaderMaterial.setColor3("colorB", new Color3(0.5, 0.5, 0.5));
		// this.shaderMaterial.setColor3("colorC", new Color3(1.0, 1.0, 1.0));
		// this.shaderMaterial.setColor3("colorD", new Color3(0.0, 0.1, 0.2));

		this.shaderMaterial.setColor3("colorA", this.shaderColors.colorA);
		this.shaderMaterial.setColor3("colorB", this.shaderColors.colorB);
		this.shaderMaterial.setColor3("colorC", this.shaderColors.colorC);
		this.shaderMaterial.setColor3("colorD", this.shaderColors.colorD);

		this.shaderMaterial.setFloat("uScaleFactor", 18);
		this.shaderMaterial.setFloat("uDivisorFactor", 18);

		this.shaderMaterial.setFloat(
			"iTime",
			this.scene.getEngine().getDeltaTime() / 1000,
		); // Convert to seconds
	}

	setPosition(x: number, y: number, z: number) {}

	createSystem(color: Color4, type: number, name: string) {
		const particleSystem1 = new ParticleSystem(name, 2000, this.scene);

		//Texture of each particle
		particleSystem1.particleTexture = new Texture(
			"/textures/flare.png",
			this.scene,
		);
		if (type === 0) {
			particleSystem1.createConeEmitter(2);
		} else if (type === 1) {
			particleSystem1.createSphereEmitter(2);
		}

		// Colors of all particles
		particleSystem1.color1 = color;
		particleSystem1.color2 = color;
		particleSystem1.colorDead = new Color4(0, 0, 0.2, 0.0);

		particleSystem1.subEmitters = [];
		particleSystem1.minSize = 0.1;
		particleSystem1.maxSize = 0.5;
		particleSystem1.minLifeTime = 0.3;
		particleSystem1.maxLifeTime = 0.5;
		particleSystem1.manualEmitCount = 50;
		particleSystem1.disposeOnStop = true;
		particleSystem1.blendMode = ParticleSystem.BLENDMODE_ONEONE;
		particleSystem1.minAngularSpeed = 0;
		particleSystem1.maxAngularSpeed = Math.PI;
		particleSystem1.minEmitPower = 5;
		particleSystem1.maxEmitPower = 6;
		particleSystem1.updateSpeed = 0.005;
		return particleSystem1;
	}

	setParticleSystem() {
		// Create a particle system
		const engine = this.scene.getEngine();

		this.particleSystem = new ParticleSystem("particles", 10000, this.scene);
		this.particleSystem.particleTexture = new Texture(
			"/textures/flare.png",
			this.scene,
		);

		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

		this.particleSystem.customShader = this.shaderMaterial;

		this.particleSystem.minSize = 0.125;
		this.particleSystem.maxSize = 0.25;

		// Where the particles come from
		var meshEmitter = new MeshParticleEmitter(this.ribbon);
		meshEmitter.useMeshNormalsForDirection = true;
		this.particleSystem.particleEmitterType = meshEmitter;

		this.particleSystem.emitter = this.ribbon;

		// Life time of each particle (random between...
		this.particleSystem.minLifeTime = 0.25;
		this.particleSystem.maxLifeTime = 1.5;

		// Emission rate
		this.particleSystem.emitRate = 500;

		// Set the gravity of all particles
		this.particleSystem.gravity = new Vector3(0, -100, 0);

		// Speed
		this.particleSystem.minEmitPower = 10;
		this.particleSystem.maxEmitPower = 100;
		// this.particleSystem.updateSpeed = 1 / 120;

		// Start the particle system
		this.particleSystem.start();
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
				getInterpolatedValue(
					this.features?.buffer,
					i,
					vertexPosBuffer.length,
				) || 1;
			const chromaVal =
				getInterpolatedValue(
					this.features?.chroma,
					i,
					vertexPosBuffer.length,
				) || 0;
			const loudnessVal = getInterpolatedValue(
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
						Math.sin(bufferVal) *
						((y + epsilon) * Math.sin(loudnessVal)) *
						((z + epsilon) * Math.sin(chromaVal)),
					// + elapsedTime / lerp(100, 1000, this.features?.spectralFlatness || 0),
				) +
					1) *
					amp;

			const newX = newRadius * Math.cos(theta) * Math.sin(phi);

			const newY = newRadius * Math.sin(theta) * Math.sin(phi);

			const newZ = newRadius * Math.cos(phi);

			vertexPosBuffer[i] = lerp(curVertPosBuf[i], newX, 0.2);
			vertexPosBuffer[i + 1] = lerp(curVertPosBuf[i + 1], newY, 0.2);
			vertexPosBuffer[i + 2] = lerp(curVertPosBuf[i + 2], newZ, 0.2);
		}

		const energy = (this.features?.energy || 0) / 100;
		const rms = this.features?.rms || 0;
		const spectralCentroidPercent =
			(this.features?.spectralCentroid || 0) / 100;

		this.ribbon.updateVerticesData(VertexBuffer.PositionKind, vertexPosBuffer);

		this.ribbon.rotate(new Vector3(spectralCentroidPercent, rms, 1), 0.05);

		this.shaderMaterial.setFloat("iTime", elapsedTime / 1000); // Convert to seconds

		this.particleSystem.emitRate = rms > 0.25 ? 1000 * energy : 0;
		this.particleSystem.minEmitPower = 10 * energy;
		this.particleSystem.maxEmitPower = 100 * energy;

		this.shaderMaterial.setFloat("uScaleFactor", 2 + 8 * energy);
		this.shaderMaterial.setFloat("uDivisorFactor", 18);

		// this.ribbon.material.wireframe = rms > 0.5;
	}

	setMeydaAnalyser(analyser: Meyda.MeydaAnalyzer) {
		this.analyser = analyser;
	}

	setMeydaFeatures(features: Record<string, any>) {
		// multiply all highend buffer values by 5 and replace them to the buffer
		this.features = features;
		this.features.loudness.specific = this.features?.loudness?.specific?.map(
			(val: number, i: number) => (i >= 18 ? val * 5 : val),
		);

		// console.log(this.features);
	}
}
