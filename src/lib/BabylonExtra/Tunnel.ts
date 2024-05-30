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

export class Tunnel {
	box: Mesh;
	lines: LinesMesh;
	index: number;
	matricesData: Float32Array;
	colorData: Float32Array;
	instanceCount: number;
	tunnelLength = 10;
	numSections = 2;
	offset = this.numSections / (this.tunnelLength - 1);
	tube: Mesh;

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

		const points1 = [];
		const colors1 = [
			Color3.Red(),
			Color3.Green(),
			Color3.Blue(),
			Color3.Yellow(),
		];
		for (let x = 0; x < 10; x += 0.25) {
			points1.push(new Vector3(x, Math.cos(x / 2), 0));
		}
		const width = 0.3;

		const line1 = CreateGreasedLine(
			"basic-line-1",
			{
				points: points1,
			},
			{
				colors: colors1,
				useColors: true,
				width,
				colorDistribution:
					GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_START, // Default
			},
			scene,
		);
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

	setPosition(x: number, y: number, z: number) {}

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
		// this.container.rotateAround(Vector3.Zero(), new Vector3(1, 0, 0), 0.01);
		// this.lines.rotateAround(Vector3.Zero(), new Vector3(1, 0, 0), 0.01);
		// this.setVertices(elapsedTime);
		// this.lines.rotation.x = elapsedTime / 1000;
		// this.numSections = Math.abs(Math.sin(elapsedTime / 1000) * 10) + 5;
		// this.setInstances(elapsedTime);
	}
}
