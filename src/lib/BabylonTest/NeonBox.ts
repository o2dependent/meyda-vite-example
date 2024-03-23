import {
	Scene,
	MeshBuilder,
	Vector3,
	VertexBuffer,
	GlowLayer,
	StandardMaterial,
	Color3,
	Mesh,
} from "@babylonjs/core";

export class NeonBox {
	box: Mesh;

	constructor(scene: Scene) {
		// Create a box
		const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
		box.position.z = -5;
		box.position.y = 0.75;

		// Get the vertices of the box
		const vertices = box.getVerticesData(VertexBuffer.PositionKind);

		// Extract edge vertices
		const edges = [];
		for (let i = 0; i < vertices.length; i += 3) {
			const vertex = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
			const faces = box.getVerticesData(VertexBuffer.NormalKind);
			let count = 0;
			for (let j = 0; j < faces.length; j += 3) {
				const face = new Vector3(faces[j], faces[j + 1], faces[j + 2]);
				if (vertex.equalsWithEpsilon(face, 0.001)) {
					count++;
				}
			}
			edges.push(vertex);
		}

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
		console.log(edges);
		// Apply glow material to each edge vertex
		edges.forEach(function (vertex, i) {
			console.log(i);
			const neonEdges = MeshBuilder.CreateSphere(
				"neonEdges" + i,
				{ diameter: 0.25 },
				scene,
			);
			neonEdges.parent = box;
			neonEdges.material = neonMaterial;
			neonEdges.position = vertex;

			// gl.addExcludedMesh(neonLight); // Include the neon light mesh in the glow layer
		});

		this.box = box;
		const sides = [
			{
				position: new Vector3(1, 1, 0),
				rotation: new Vector3(Math.PI / 2, 0, 0),
			},
			{
				position: new Vector3(1, -1, 0),
				rotation: new Vector3(Math.PI / 2, 0, 0),
			},
			{
				position: new Vector3(-1, 1, 0),
				rotation: new Vector3(Math.PI / 2, 0, 0),
			},
			{
				position: new Vector3(-1, -1, 0),
				rotation: new Vector3(Math.PI / 2, 0, 0),
			},
			{
				position: new Vector3(1, 0, 1),
				rotation: new Vector3(0, 0, 0),
			},
			{
				position: new Vector3(1, 0, -1),
				rotation: new Vector3(0, 0, 0),
			},
			{
				position: new Vector3(-1, 0, 1),
				rotation: new Vector3(0, 0, 0),
			},
			{
				position: new Vector3(-1, 0, -1),
				rotation: new Vector3(0, 0, 0),
			},
			{
				position: new Vector3(0, -1, 1),
				rotation: new Vector3(0, 0, Math.PI / 2),
			},
			{
				position: new Vector3(0, -1, -1),
				rotation: new Vector3(0, 0, Math.PI / 2),
			},
			{
				position: new Vector3(0, 1, 1),
				rotation: new Vector3(0, 0, Math.PI / 2),
			},
			{
				position: new Vector3(0, 1, -1),
				rotation: new Vector3(0, 0, Math.PI / 2),
			},
		];
		for (let i = 0; i < sides.length; i++) {
			const side = sides[i];
			const neonTube = MeshBuilder.CreateCylinder(
				"neonTube" + i,
				{ height: box.scaling.x * 2, diameter: 0.1 },
				scene,
			);
			neonTube.parent = box;
			neonTube.position = side.position;
			neonTube.rotation = side.rotation;
			neonTube.material = neonMaterial;
			// neonTube.scaling = new Vector3(1, 1, vertex.subtract(next).length());
		}
	}

	update(elapsedTime: number) {
		// this.box.rotate(new Vector3(1, 1.25, 0.75), 0.01);
	}
}
