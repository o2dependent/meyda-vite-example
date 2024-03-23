import {
	Color3,
	Mesh,
	MeshBuilder,
	Scene,
	StandardMaterial,
} from "@babylonjs/core";

export class Eye {
	scene: Scene;
	sclera: Mesh;
	iris: Mesh;
	irisMaterial: StandardMaterial;
	pupilMaterial: StandardMaterial;
	pupil: Mesh;

	constructor(scene: Scene) {
		this.scene = scene;

		this.createMesh();
	}

	setPosition(x: number, y: number, z: number) {
		this.sclera.position.x = x;
		this.sclera.position.y = y;
		this.sclera.position.z = z;
	}

	createMesh() {
		this.sclera = MeshBuilder.CreateSphere(
			"sclera",
			{ diameter: 1 },
			this.scene,
		);
		this.iris = MeshBuilder.CreateSphere("iris", { diameter: 0.5 }, this.scene);
		this.iris.parent = this.sclera;
		this.iris.position.x = 0.28;
		this.iris.scaling.y = 1.5;
		this.iris.scaling.z = 1.5;
		this.irisMaterial = new StandardMaterial("irisMaterial", this.scene);
		this.irisMaterial.diffuseColor = Color3.Red();
		this.iris.material = this.irisMaterial;

		this.pupil = MeshBuilder.CreateSphere(
			"pupil",
			{ diameter: 0.45 },
			this.scene,
		);
		this.pupil.parent = this.sclera;
		this.pupil.position.x = 0.33;
		this.pupil.scaling.y = 1.5;
		this.pupil.scaling.z = 1.5;
		this.pupilMaterial = new StandardMaterial("pupilMaterial", this.scene);
		this.pupilMaterial.diffuseColor = Color3.Black();
		this.pupil.material = this.pupilMaterial;
	}

	update(elapsedTime: number) {
		this.pupil.scaling.y = (Math.sin(elapsedTime / 1000) + 1) * 0.25 + 1;
		this.pupil.scaling.z = (Math.sin(elapsedTime / 1000) + 1) * 0.25 + 1;
		this.sclera.rotation.x = (Math.sin(elapsedTime / 1000) + 1) * 0.25 + 1;
		this.sclera.rotation.z =
			(Math.cos(elapsedTime / 1000) + 1 + Math.sin(elapsedTime / 1000)) * 0.25 +
			1;
	}
}
