import {
	Color,
	Mesh,
	type OGLRenderingContext,
	Geometry,
	Program,
	Renderer,
	Text,
	Texture,
	Transform,
} from "ogl";
import fragment from "./shaders/text/fragment.glsl?raw";
import vertex from "./shaders/text/vertex.glsl?raw";

const font_src = "fonts/DelaGothicOne-Regular.png";

interface ConstructorArgs {
	gl: OGLRenderingContext;
	plane: Mesh;
	text: string;
	renderer: Renderer;
}

export class IndexTitle {
	gl: OGLRenderingContext;
	scene: Transform | null = null;
	plane: Mesh;
	text: string;
	renderer: Renderer;
	program: Program | null = null;
	mesh: Mesh | null = null;

	constructor({ gl, plane, renderer, text }: ConstructorArgs) {
		this.gl = gl;
		this.plane = plane;
		this.renderer = renderer;
		this.text = text;

		this.createShader();
		this.createMesh();
	}

	createShader() {
		const texture = new Texture(this.gl, { generateMipmaps: false });
		const textureImage = new Image();

		textureImage.onload = () => (texture.image = textureImage);
		textureImage.src = font_src;

		const vertex100 = `${vertex}`;

		const fragment100 = `
			#extension GL_OES_standard_derivatives : enable

			precision highp float;

			${fragment}
		`;

		const vertex300 = `#version 300 es

			#define attribute in
			#define varying out

			${vertex}
		`;

		const fragment300 = `#version 300 es

			precision highp float;

			#define varying in
			#define texture2D texture
			#define gl_FragColor FragColor

			out vec4 FragColor;

			${fragment}
		`;

		let fragmentShader = fragment100;
		let vertexShader = vertex100;

		if (this.renderer.isWebgl2) {
			fragmentShader = fragment300;
			vertexShader = vertex300;
		}

		this.program = new Program(this.gl, {
			cullFace: null,
			depthTest: false,
			depthWrite: false,
			transparent: true,
			fragment: fragmentShader,
			vertex: vertexShader,
			uniforms: {
				uColor: { value: new Color("#ffffff") },
				tMap: { value: texture },
			},
		});
	}

	async createMesh() {
		const font = await (await fetch("fonts/DelaGothicOne-Regular.json")).json();

		const text = new Text({
			align: "center",
			font,
			// letterSpacing: -0.05,
			width: 4,
			size: 0.045,
			text: this.text,
			wordSpacing: 0,
		});

		const geometry = new Geometry(this.gl, {
			position: { size: 3, data: text.buffers.position },
			uv: { size: 2, data: text.buffers.uv },
			id: { size: 1, data: text.buffers.id },
			index: { data: text.buffers.index },
		});

		// geometry.computeBoundingBox();
		if (!this.program) throw new Error("Program is not defined");
		this.mesh = new Mesh(this.gl, { geometry, program: this.program });
		this.mesh.position.y = -0.525;
		this.mesh.setParent(this.plane);
	}
}
