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
	tunnelLength = 40;
	numSections = 2;
	offset = this.numSections / (this.tunnelLength - 1);
	container: Mesh;

	constructor(scene: Scene) {
		// create hollow box with left and right sides missing
		const containerRight = MeshBuilder.CreatePlane(
			"containerRight",
			{ size: 100 },
			scene,
		);
		containerRight.position.z = 50;
		const containerLeft = MeshBuilder.CreatePlane(
			"containerLeft",
			{ size: 100 },
			scene,
		);
		containerLeft.position.z = -50;
		containerLeft.rotation.y = Math.PI;
		const containerTop = MeshBuilder.CreatePlane(
			"containerTop",
			{ size: 100 },
			scene,
		);
		containerTop.position.y = 50;
		containerTop.rotation.x = -Math.PI / 2;
		const containerBottom = MeshBuilder.CreatePlane(
			"containerBottom",
			{ size: 100 },
			scene,
		);
		containerBottom.position.y = -50;
		containerBottom.rotation.x = Math.PI / 2;

		const container = Mesh.MergeMeshes(
			[containerRight, containerLeft, containerTop, containerBottom],
			true,
			false,
			undefined,
			false,
			true,
		);
		container.scaling.x = 15;

		this.container = container;

		// this.container = container;

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

		// this.setInstances();
	}

	setInstances(elapsedTime: number = 0) {
		this.offset = this.numSections / (this.tunnelLength - 1);

		this.instanceCount =
			this.tunnelLength * this.tunnelLength * this.tunnelLength;

		this.matricesData = new Float32Array(16 * this.instanceCount);
		this.colorData = new Float32Array(4 * this.instanceCount);

		let m = Matrix.Identity();
		let index = 0;

		for (let x = 0; x < this.tunnelLength; x++) {
			// set coords so that a circle is formed
			const cords = [
				Math.cos((x / this.tunnelLength) * Math.PI * 2) * 5,
				Math.sin((x / this.tunnelLength) * Math.PI * 2) / 2,
				0,
			];
			m.addAtIndex(12, cords[0]);
			m.addAtIndex(13, cords[1]);
			m.addAtIndex(14, cords[2]);

			m.copyToArray(this.matricesData, index * 16);

			index++;
		}

		this.lines.thinInstanceSetBuffer("matrix", this.matricesData, 16);
	}

	setPosition(x: number, y: number, z: number) {
		this.lines.position.x = x;
		this.lines.position.y = y;
		this.lines.position.z = z;
	}

	setVertices(elapsedTime: number) {
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

	update(elapsedTime: number) {
		// this.lines.position.y = Math.sin(elapsedTime / 1000) * 0.25 + 0.75;
		this.container.rotateAround(Vector3.Zero(), new Vector3(1, 0, 0), 0.01);

		// this.setVertices(elapsedTime);
		// this.lines.rotation.x = elapsedTime / 1000;
		// this.numSections = Math.abs(Math.sin(elapsedTime / 1000) * 10) + 5;
		this.setInstances(elapsedTime);
	}
}
