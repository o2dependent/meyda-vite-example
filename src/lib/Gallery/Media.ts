import {
	Mesh,
	OGLRenderingContext,
	Plane,
	Program,
	Renderer,
	Texture,
	Transform,
} from "ogl";
import vertex from "./shaders/media/vertex.glsl?raw";
import fragment from "./shaders/media/fragment.glsl?raw";
import { map } from "../math";
import { Title } from "./Title";

interface ConstructorArgs {
	gl: OGLRenderingContext;
	scene: Transform;
	geometry: Plane;
	length: number;
	image: string;
	index: number;
	text: string;
	screen: {
		width: number;
		height: number;
	};
	viewport: {
		width: number;
		height: number;
	};
	renderer: Renderer;
}

export default class Media {
	gl: OGLRenderingContext;
	scene: Transform;
	program: Program;
	geometry: Plane;
	plane: Mesh;
	length: number;
	renderer: Renderer;
	image: string;
	index: number;
	text: string;
	scale: number;
	padding: number;
	width: number;
	widthTotal: number;
	x: number;
	screen: {
		width: number;
		height: number;
	};
	viewport: {
		width: number;
		height: number;
	};
	extra: number = 0;
	isBefore: boolean = false;
	isAfter: boolean = false;
	title: Title;

	constructor({
		geometry,
		gl,
		image,
		index,
		length,
		renderer,
		scene,
		screen,
		text,
		viewport,
	}: ConstructorArgs) {
		this.geometry = geometry;
		this.renderer = renderer;
		this.gl = gl;
		this.image = image;
		this.index = index;
		this.length = length;
		this.scene = scene;
		this.screen = screen;
		this.text = text;
		this.viewport = viewport;

		this.createShader();
		this.createMesh();

		this.onResize({ screen, viewport });

		this.createTitle();
	}

	createTitle() {
		this.title = new Title({
			gl: this.gl,
			plane: this.plane,
			renderer: this.renderer,
			text: this.text,
		});
	}

	createShader() {
		const texture = new Texture(this.gl, {
			generateMipmaps: false,
		});

		this.program = new Program(this.gl, {
			fragment,
			vertex,
			uniforms: {
				tMap: { value: texture },
				uPlaneSizes: { value: [0, 0] },
				uImageSizes: { value: [0, 0] },
				uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
				uSpeed: { value: 0 },
				uTime: { value: 0 },
			},
			transparent: true,
		});

		const image = new Image();

		image.src = this.image;
		image.onload = (_) => {
			texture.image = image;

			this.program.uniforms.uImageSizes.value = [
				image.naturalWidth,
				image.naturalHeight,
			];
		};
	}

	createMesh() {
		this.plane = new Mesh(this.gl, {
			geometry: this.geometry,
			program: this.program,
		});

		this.plane.setParent(this.scene);
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
		if (screen) {
			this.screen = screen;
		}

		if (viewport) {
			this.viewport = viewport;

			this.plane.program.uniforms.uViewportSizes.value = [
				this.viewport.width,
				this.viewport.height,
			];
		}

		this.scale = this.screen.height / 1500;

		this.plane.scale.y =
			(this.viewport.height * (900 * this.scale)) / this.screen.height;
		this.plane.scale.x =
			(this.viewport.width * (700 * this.scale)) / this.screen.width;

		this.plane.program.uniforms.uPlaneSizes.value = [
			this.plane.scale.x,
			this.plane.scale.y,
		];

		this.padding = 2;

		this.width = this.plane.scale.x + this.padding;
		this.widthTotal = this.width * this.length;

		this.x = this.width * this.index;
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
		this.program.uniforms.uTime.value += 0.04;

		this.plane.position.x = this.x - scroll.current - this.extra;

		this.plane.rotation.z = map(
			this.plane.position.x,
			-this.widthTotal,
			this.widthTotal,
			Math.PI,
			-Math.PI,
		);
		this.plane.position.y =
			Math.cos((this.plane.position.x / this.widthTotal) * Math.PI) * 25 - 25;

		const planeOffset = this.plane.scale.x / 2;
		const viewportOffset = this.viewport.width;

		this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
		this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

		if (direction === "right" && this.isBefore) {
			this.extra -= this.widthTotal;

			this.isBefore = false;
			this.isAfter = false;
		}

		if (direction === "left" && this.isAfter) {
			this.extra += this.widthTotal;

			this.isBefore = false;
			this.isAfter = false;
		}
	}
}
