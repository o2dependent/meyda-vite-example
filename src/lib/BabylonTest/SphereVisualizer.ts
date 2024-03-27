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
} from "@babylonjs/core";

export class SphereVisualizer {
	ribbon: Mesh;

	constructor(scene: Scene) {
		// Create a glow layer
		const gl = new GlowLayer("glow", scene, {
			mainTextureFixedSize: 1024,
			blurKernelSize: 64,
		});
		gl.intensity = 0.5;

		// Create neon light materials
		const neonMaterial = new StandardMaterial("neonMaterial", scene);
		neonMaterial.emissiveColor = Color3.Teal(); // Green emissive color
		neonMaterial.disableLighting = true;

		const paths = [];
		for (let t = 0; t < Math.PI; t += Math.PI / 60) {
			const path = [];
			for (let a = 0; a < 2 * Math.PI; a += Math.PI / 60) {
				let x = 4 * Math.cos(a) * Math.sin(t);
				let y = 4 * Math.sin(a) * Math.sin(t);
				let z = 4 * Math.cos(t);
				path.push(new Vector3(x, y, z));
			}
			path.push(path[0]); // close circle
			paths.push(path);
		}

		const ribbon = MeshBuilder.CreateRibbon("ribbon", {
			pathArray: paths,
			closePath: true,
			sideOrientation: Mesh.DOUBLESIDE,
		});
		ribbon.material = new StandardMaterial("");
		ribbon.material.wireframe = true;

		this.ribbon = ribbon;
	}

	setPosition(x: number, y: number, z: number) {}

	update(elapsedTime: number) {
		// this.lines.position.y = Math.sin(elapsedTime / 1000) * 0.25 + 0.75;
		// this.container.rotateAround(Vector3.Zero(), new Vector3(1, 0, 0), 0.01);
		// this.lines.rotateAround(Vector3.Zero(), new Vector3(1, 0, 0), 0.01);
		// this.setVertices(elapsedTime);
		// this.lines.rotation.x = elapsedTime / 1000;
		// this.numSections = Math.abs(Math.sin(elapsedTime / 1000) * 10) + 5;
		// this.setInstances(elapsedTime);
	}
}
