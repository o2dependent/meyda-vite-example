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
} from "@babylonjs/core";

export class Tunnel {
	box: Mesh;
	lines: LinesMesh;
	index: number;
	matricesData: Float32Array;
	colorData: Float32Array;
	instanceCount: number;
	numPerSide = 40;
	size = 2;
	offset = this.size / (this.numPerSide - 1);

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

		const sides = [
			{
				edge: new Vector3(1, 1, 1),
				position: new Vector3(1, 1, 0),
				rotation: new Vector3(Math.PI / 2, 0, 0),
			},
			{
				edge: new Vector3(1, -1, 1),
				position: new Vector3(1, -1, 0),
				rotation: new Vector3(Math.PI / 2, 0, 0),
			},
			{
				edge: new Vector3(1, -1, -1),
				position: new Vector3(1, 0, 1),
				rotation: new Vector3(0, 0, 0),
			},
			{
				edge: new Vector3(1, 1, -1),
				position: new Vector3(1, 0, -1),
				rotation: new Vector3(0, 0, 0),
			},
		];
		// const tubes = [] as Mesh[];
		// const edges = [] as Mesh[];
		// for (let i = 0; i < sides.length; i++) {
		// 	const side = sides[i];
		// 	const neonTube = MeshBuilder.CreateCylinder(
		// 		"neonTube" + i,
		// 		{ height: 2, diameter: 0.2 },
		// 		scene,
		// 	);
		// 	neonTube.position = side.position;
		// 	neonTube.rotation = side.rotation;
		// 	neonTube.material = neonMaterial;
		// 	// neonTube.scaling = new Vector3(1, 1, vertex.subtract(next).length());
		// 	tubes.push(neonTube);

		// 	const edge = MeshBuilder.CreateSphere(
		// 		"edge" + i,
		// 		{ diameter: 0.2 },
		// 		scene,
		// 	);
		// 	edge.position = side.edge;
		// 	edge.material = neonMaterial;
		// 	edges.push(edge);
		// }

		const tunnelLines = [
			new Vector3(0, 0, 0),
			new Vector3(0, 0.5, 0),
			new Vector3(0, 1, 0),
			new Vector3(0, 1, 0.5),
			new Vector3(0, 1, 1),
			new Vector3(0, 0.5, 1),
			new Vector3(0, 0, 1),
			new Vector3(0, 0, 0.5),
			new Vector3(0, 0, 0),
		];
		const lines = MeshBuilder.CreateLines("tunnel-lines", {
			points: tunnelLines,
			material: neonMaterial,
		});
		lines.scaling = new Vector3(25, 25, 25);
		this.lines = lines;

		// this.box.scaling = new Vector3(25, 25, 25);
		this.numPerSide = 40;
		this.size = 50;

		// this.setInstances();
	}

	setInstances() {
		this.offset = this.size / (this.numPerSide - 1);

		this.instanceCount = this.numPerSide * this.numPerSide * this.numPerSide;

		this.matricesData = new Float32Array(16 * this.instanceCount);
		this.colorData = new Float32Array(4 * this.instanceCount);

		let m = Matrix.Identity();
		let col = 0,
			index = 0;

		for (let x = 0; x < this.numPerSide; x++) {
			m.addAtIndex(12, -this.size / 2 + this.offset * x);
			for (let y = 0; y < this.numPerSide; y++) {
				m.addAtIndex(13, -this.size / 2 + this.offset * y);
				for (let z = 0; z < this.numPerSide; z++) {
					m.addAtIndex(14, -this.size / 2 + this.offset * z);

					m.copyToArray(this.matricesData, index * 16);

					const coli = Math.floor(col);

					this.colorData[index * 4 + 0] = ((coli & 0xff0000) >> 16) / 255;
					this.colorData[index * 4 + 1] = ((coli & 0xffff00) >> 8) / 255;
					this.colorData[index * 4 + 2] = ((coli & 0x0000ff) >> 0) / 255;
					this.colorData[index * 4 + 3] = 1.0;

					index++;
					col += 0xffffff / this.instanceCount;
				}
			}
		}

		this.box.thinInstanceSetBuffer("matrix", this.matricesData, 16);
	}

	setPosition(x: number, y: number, z: number) {
		this.lines.position.x = x;
		this.lines.position.y = y;
		this.lines.position.z = z;
	}

	update(elapsedTime: number) {
		this.lines.position.y = Math.sin(elapsedTime / 1000) * 0.25 + 0.75;

		const newVertices = [
			new Vector3(-0.5, -0.5, -0.5),
			new Vector3(-0.5, 0, -0.5),
			new Vector3(-0.5, 0.5, -0.5),
			new Vector3(-0.5, 0.5, 0),
			new Vector3(-0.5, 0.5, 0.5),
			new Vector3(-0.5, 0, 0.5),
			new Vector3(-0.5, -0.5, 0.5),
			new Vector3(-0.5, -0.5, 0),
			new Vector3(-0.5, -0.5, -0.5),
		];
		var positions = this.lines.getVerticesData(VertexBuffer.PositionKind);
		const mult = Math.sin(elapsedTime / 1000);
		for (var i = 0; i < newVertices.length; i++) {
			if ((i + 1) % 2 === 0) {
				positions[i * 3] = newVertices[i].x;
				positions[i * 3 + 1] = newVertices[i].y;
				positions[i * 3 + 2] =
					Math.max(0, mult) * newVertices[i].z + newVertices[i].z;
				continue;
			}
			positions[i * 3] = newVertices[i].x;
			positions[i * 3 + 1] = mult * newVertices[i].y + newVertices[i].y;
			positions[i * 3 + 2] = newVertices[i].z;
		}

		this.lines.setVerticesData(VertexBuffer.PositionKind, positions);
		this.lines._resetPointsArrayCache();
	}
}
