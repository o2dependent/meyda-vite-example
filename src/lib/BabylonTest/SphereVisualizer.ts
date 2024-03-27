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
	paths: Vector3[][];

	constructor(scene: Scene) {
		// Create a glow layer
		const gl = new GlowLayer("glow", scene, {
			mainTextureFixedSize: 1024,
			blurKernelSize: 64,
		});
		gl.intensity = 0.25;

		// Create neon light materials
		const neonMaterial = new StandardMaterial("neonMaterial", scene);
		neonMaterial.emissiveColor = Color3.Teal(); // Green emissive color
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

		this.ribbon = ribbon;
	}

	setPosition(x: number, y: number, z: number) {}

	update(elapsedTime: number) {
		const vertexPosBuffer = this.ribbon.getVerticesData(
			VertexBuffer.PositionKind,
		);

		for (let i = 0; i < vertexPosBuffer.length; i += 3) {
			const x = vertexPosBuffer[i];
			const y = vertexPosBuffer[i + 1];
			const z = vertexPosBuffer[i + 2];

			const radius = Math.sqrt(x * x + y * y + z * z);
			const theta = Math.atan2(y, x);
			const phi = Math.acos(z / radius);

			const newRadius = 4 + Math.sin(elapsedTime / 1000);
			const newX = newRadius * Math.cos(theta) * Math.sin(phi);
			const newY = newRadius * Math.sin(theta) * Math.sin(phi);
			const newZ = newRadius * Math.cos(phi);

			vertexPosBuffer[i] = newX;
			vertexPosBuffer[i + 1] = newY;
			vertexPosBuffer[i + 2] = newZ;
		}

		this.ribbon.updateVerticesData(VertexBuffer.PositionKind, vertexPosBuffer);
	}
}
