import {
	Color,
	Mesh,
	OGLRenderingContext,
	Plane,
	Program,
	Renderer,
	Transform,
} from "ogl";
import fragment from "./shaders/background/fragment.glsl?raw";
import vertex from "./shaders/background/vertex.glsl?raw";
import { random } from "lodash";

interface ConstructorArgs {
	gl: OGLRenderingContext;
	scene: Transform;
	renderer: Renderer;
	viewport: { width: number; height: number };
	screen: { width: number; height: number };
}

export class Background {
	gl: OGLRenderingContext;
	plane: Mesh;
	renderer: Renderer;
	scene: Transform;
	viewport: { width: number; height: number };
	screen: { width: number; height: number };
	geometry: Plane;
	program: Program;
	items: {
		mesh: Mesh;
		speed: number;
		xExtra: number;
		x: number;
		y: number;
		isBefore: boolean;
		isAfter: boolean;
	}[];

	constructor({ gl, scene, viewport, renderer }: ConstructorArgs) {
		this.gl = gl;
		this.scene = scene;
		this.viewport = viewport;
		this.renderer = renderer;

		this.geometry = new Plane(this.gl);
		this.program = new Program(this.gl, {
			vertex,
			fragment,
			uniforms: {
				uResolution: { value: [this.viewport.width, this.viewport.height] },
				uColor: { value: new Color("#ff0000") },
				metaballs: { value: this.makeMetaballUniformData() },
			},
			transparent: true,
		});

		this.items = [];
		for (let i = 0; i < 50; i++) {
			const mesh = new Mesh(this.gl, {
				geometry: this.geometry,
				program: this.program,
			});

			const scale = random(0.75, 1);

			mesh.scale.z = 2;
			mesh.position.z = -1;

			mesh.scale.x = 0.9 * scale;
			mesh.scale.y = 1.9 * scale;

			const speed = random(0.75, 1);

			const xExtra = 0;

			const x = (mesh.position.x = random(
				-this.viewport.width * 0.5,
				this.viewport.width * 0.5,
			));
			const y = (mesh.position.y = random(
				-this.viewport.height * 0.5,
				this.viewport.height * 0.5,
			));

			this.items.push({
				mesh,
				speed,
				xExtra,
				x,
				y,
				isAfter: false,
				isBefore: false,
			});

			this.scene.addChild(mesh);
		}

		const metaballData = this.makeMetaballUniformData();
		this.program.uniforms.metaballs.value = metaballData;
	}

	makeMetaballUniformData() {
		const dataToSendToGPU = new Float32Array(3 * 50);
		for (let i = 0; i < 50; i++) {
			const mb = this?.items?.[i] ?? null;
			const baseIndex = 3 * i;

			if (!mb) {
				dataToSendToGPU[baseIndex + 0] = 0;
				dataToSendToGPU[baseIndex + 1] = 0;
				dataToSendToGPU[baseIndex + 2] = 0;
				continue;
			}

			dataToSendToGPU[baseIndex + 0] = mb.x;
			dataToSendToGPU[baseIndex + 1] = mb.y;
			dataToSendToGPU[baseIndex + 2] = mb.mesh.scale.x;
		}

		return dataToSendToGPU;
	}

	onResize({
		screen,
		viewport,
	}: {
		screen?: {
			width: number;
			height: number;
		};
		viewport?: {
			width: number;
			height: number;
		};
	} = {}) {
		if (viewport) {
			this.viewport = viewport;
		}
		if (screen) {
			this.screen = screen;
			this.program.uniforms.uResolution.value = [
				this.screen.width,
				this.screen.height,
			];
		}
	}

	update(
		scroll: {
			ease: number;
			position: number;
			current: number;
			target: number;
			last: number;
		},
		direction: "left" | "right",
	) {
		this.items.forEach((item) => {
			item.mesh.position.x = item.x - scroll.current * item.speed - item.xExtra;

			const viewportOffset = this.viewport.width * 0.5;
			const widthTotal = this.viewport.width + item.mesh.scale.x;

			item.isBefore = item.mesh.position.x < -viewportOffset;
			item.isAfter = item.mesh.position.x > viewportOffset;

			if (direction === "right" && item.isBefore) {
				item.xExtra -= widthTotal;

				item.isBefore = false;
				item.isAfter = false;
			}

			if (direction === "left" && item.isAfter) {
				item.xExtra += widthTotal;

				item.isBefore = false;
				item.isAfter = false;
			}

			item.mesh.position.y -= 0.05 * item.speed;

			if (
				item.mesh.position.y <
				-this.viewport.height * 0.5 - item.mesh.scale.y
			) {
				item.mesh.position.y +=
					this.viewport.height + item.mesh.scale.y + this.viewport.height * 0.1;
			}
		});

		const metaballData = this.makeMetaballUniformData();
		this.program.uniforms.metaballs.value = metaballData;
	}
}
