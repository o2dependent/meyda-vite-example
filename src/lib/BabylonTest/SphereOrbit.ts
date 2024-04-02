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
} from "@babylonjs/core";
import { lerp } from "../math";
import type Meyda from "meyda";

export class SphereOrbit {
	scene: Scene;
	shaderMaterial: ShaderMaterial;
	spheres: Mesh[];
	gl: GlowLayer;
	neonMaterial: StandardMaterial;

	analyser: Meyda.MeydaAnalyzer;
	features: Record<string, any>;

	constructor(scene: Scene) {
		this.scene = scene;

		// Create a glow layer
		const gl = new GlowLayer("glow", scene, {
			mainTextureFixedSize: 1024,
			blurKernelSize: 64,
		});
		gl.intensity = 0.75;
		this.gl = gl;

		// Create neon light materials
		const neonMaterial = new StandardMaterial("neonMaterial", scene);
		neonMaterial.emissiveColor = Color3.Teal();
		// neonMaterial.disableLighting = true;
		this.neonMaterial = neonMaterial;

		const spheres = [] as Mesh[];
		for (let t = 0; t < Math.PI; t += Math.PI / 8) {
			const sphere = MeshBuilder.CreateSphere("sphere" + t, {
				// sideOrientation: Mesh.DOUBLESIDE,
				sideOrientation: Mesh.FLIP_TILE,
				updatable: true,
			});

			sphere.position = new Vector3(
				0,
				Math.cos(t * 2) * 10,
				Math.sin(t * 2) * 10,
			);
			sphere.material = neonMaterial;

			gl.addIncludedOnlyMesh(sphere);

			spheres.push(sphere);
		}

		this.spheres = spheres;
	}

	setPosition(x: number, y: number, z: number) {}

	update(elapsedTime: number) {
		const energy = (this.features?.energy || 0) / 100;

		this.gl.intensity = 1 * Math.sin(elapsedTime * 0.001);
		this.neonMaterial.emissiveColor = new Color3(
			0.5 + Math.sin(elapsedTime * 0.001),
			0.5 + Math.cos(elapsedTime * 0.001),
			0.5 + Math.sin(elapsedTime * 0.001),
		);
		const engine = this.scene.getEngine();
		const d = engine.getDeltaTime();

		this.spheres.forEach((sphere, i) => {
			sphere.position = new Vector3(
				0,
				lerp(
					sphere.position.y,
					Math.cos(
						(i * 2 * Math.PI) / this.spheres.length + elapsedTime * 0.001,
					) *
						(10 + energy * 2),
					0.25,
				),
				lerp(
					sphere.position.z,
					Math.sin(
						(i * 2 * Math.PI) / this.spheres.length + elapsedTime * 0.001,
					) *
						(10 + energy * 2),
					0.25,
				),
			);
		});
	}

	setMeydaAnalyser(analyser: Meyda.MeydaAnalyzer) {
		this.analyser = analyser;
	}

	setMeydaFeatures(features: Record<string, any>) {
		this.features = features;
		// console.log(this.features);
	}
}
