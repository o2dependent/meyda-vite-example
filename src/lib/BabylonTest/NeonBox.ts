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
} from "@babylonjs/core";

export class NeonBox {
	box: Mesh;
	index: number;
	matricesData: Float32Array;
	colorData: Float32Array;
	instanceCount: number;
	numPerSide = 10;
	size = 10;
	offset = this.size / (this.numPerSide - 1);

	constructor(scene: Scene, index: number) {
		this.index = index;
		// Create a box
		const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
		box.position.z = -5;
		box.position.y = 0.75;

		const boxMaterial = new StandardMaterial("boxMaterial", scene);
		boxMaterial.diffuseColor = Color3.Teal();
		// boxMaterial.alpha = 0.95;
		// boxMaterial.alphaMode = Engine.ALPHA_PREMULTIPLIED_PORTERDUFF;
		box.material = boxMaterial;

		// // Get the vertices of the box
		// const vertices = box.getVerticesData(VertexBuffer.PositionKind);

		// // Extract edge vertices
		// const edges = [];
		// for (let i = 0; i < vertices.length; i += 3) {
		// 	const vertex = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
		// 	const faces = box.getVerticesData(VertexBuffer.NormalKind);
		// 	let count = 0;
		// 	for (let j = 0; j < faces.length; j += 3) {
		// 		const face = new Vector3(faces[j], faces[j + 1], faces[j + 2]);
		// 		if (vertex.equalsWithEpsilon(face, 0.001)) {
		// 			count++;
		// 		}
		// 	}
		// 	edges.push(vertex);
		// }

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

		// Apply glow material to each edge vertex
		// const neonEdge = MeshBuilder.CreateSphere(
		// 	"neonEdges",
		// 	{ diameter: 0.25 },
		// 	scene,
		// );
		// neonEdge.parent = box;
		// neonEdge.material = neonMaterial;
		// edges.forEach(function (vertex, i) {
		// 	console.log(i);
		// 	const neonEdges = neonEdge.createInstance("neonEdges" + i);
		// 	neonEdges.position = vertex;
		// 	neonEdges.parent = box;
		// 	neonEdges.material = neonMaterial;
		// });
		// gl.addIncludedOnlyMesh(neonEdge); // Include the neon light mesh in the glow layer

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
		const tubes = [] as Mesh[];
		for (let i = 0; i < sides.length; i++) {
			const side = sides[i];
			const neonTube = MeshBuilder.CreateCylinder(
				"neonTube" + i,
				{ height: box.scaling.x, diameter: 0.1 },
				scene,
			);
			neonTube.parent = box;
			neonTube.position = side.position.multiply(
				new Vector3(box.scaling.x / 2, box.scaling.y / 2, box.scaling.z / 2),
			);
			neonTube.rotation = side.rotation;
			neonTube.material = neonMaterial;
			// neonTube.scaling = new Vector3(1, 1, vertex.subtract(next).length());
			tubes.push(neonTube);
		}

		this.box = Mesh.MergeMeshes(
			[box, ...tubes],
			true,
			false,
			undefined,
			false,
			true,
		);

		this.setInstances();
	}

	setInstances() {
		this.offset = this.size / (this.numPerSide - 1);

		this.instanceCount = this.numPerSide * this.numPerSide * this.numPerSide;

		this.matricesData = new Float32Array(16 * this.instanceCount);
		this.colorData = new Float32Array(4 * this.instanceCount);

		let m = Matrix.Identity();
		let index = 0;

		for (let x = 0; x < this.numPerSide; x++) {
			// m.addAtIndex(12, this.offset * x);
			m.addAtIndex(12, x);
			m.addAtIndex(13, 0);
			m.addAtIndex(14, 0);
			// for (let y = 0; y < this.numPerSide; y++) {
			// for (let z = 0; z < this.numPerSide; z++) {
			// 	// m.addAtIndex(14, -this.size / 2 + this.offset * z);
			// 	m.addAtIndex(14, z);

			// 	m.copyToArray(this.matricesData, index * 16);

			// 	index++;
			// }
			// }
			m.copyToArray(this.matricesData, index * 16);

			index++;
		}

		this.box.thinInstanceSetBuffer("matrix", this.matricesData, 16);
	}

	setPosition(x: number, y: number, z: number) {
		this.box.position.x = x;
		this.box.position.y = y;
		this.box.position.z = z;
	}

	update(elapsedTime: number) {
		// this.box.position.y = Math.sin(elapsedTime / 1000) * 0.25 + 0.75;
	}
}
