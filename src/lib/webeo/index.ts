import { mat4 } from "gl-matrix";
import {
	WebEOVertexBuffers,
	WebEOVertexAttributes,
	WebEOUniformLocations,
	ConstructorBuffers,
	WebEOVertexAttributesArgs,
} from "./types";

export class WebEO {
	gl: WebGLRenderingContext;
	vBuffers: WebEOVertexBuffers;
	program: WebGLProgram;
	vAttrib: WebEOVertexAttributes;
	uniformLocations: WebEOUniformLocations;

	constructor(
		_gl: WebGLRenderingContext,
		vertexShader: string,
		fragmentShader: string,
		_vertexBuffers?: ConstructorBuffers,
	) {
		const DEFAULT_VERTEX_BUFFERS: ConstructorBuffers = {
			aVertexPosition: [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0],
		};

		this.gl = _gl;
		this.vBuffers = this._initBuffers({
			...DEFAULT_VERTEX_BUFFERS,
			...(_vertexBuffers ?? {}),
		});
		this.program = this._initShaderProgram(vertexShader, fragmentShader);
	}

	_loadShader(
		type:
			| WebGLRenderingContext["VERTEX_SHADER"]
			| WebGLRenderingContext["FRAGMENT_SHADER"],
		source: string,
	) {
		const shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		// See if it compiled successfully
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			alert(
				`An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(
					shader,
				)}`,
			);
			this.gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	_initShaderProgram(vsSource: string, fsSource: string) {
		const vertexShader = this._loadShader(this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this._loadShader(this.gl.FRAGMENT_SHADER, fsSource);

		const shaderProgram = this.gl.createProgram();
		this.gl.attachShader(shaderProgram, vertexShader);
		this.gl.attachShader(shaderProgram, fragmentShader);
		this.gl.linkProgram(shaderProgram);

		// If creating the shader program failed, alert
		if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
			alert(
				`Unable to initialize the shader program: ${this.gl.getProgramInfoLog(
					shaderProgram,
				)}`,
			);
			return null;
		}

		return shaderProgram;
	}

	_createAttributeBuffer(
		attributeName: string,
		data: number[],
		vertexAttribPointerArgs?: {
			numComponents: number;
			normalize: boolean;
			stride: number;
			offset: number;
		},
	) {
		const { normalize, numComponents, offset, stride } =
			vertexAttribPointerArgs ?? {
				numComponents: 2,
				normalize: false,
				stride: 0,
				offset: 0,
			};

		// Get attribute location in the vertex shader
		const attributeLocation = this.gl.getAttribLocation(
			this.program,
			attributeName,
		);

		// Create a buffer
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

		// Load data into the buffer
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(data),
			this.gl.STATIC_DRAW,
		);

		// Configure the attribute to use the buffer
		this.gl.vertexAttribPointer(
			attributeLocation,
			numComponents,
			this.gl.FLOAT,
			normalize,
			stride,
			offset,
		);
		this.gl.enableVertexAttribArray(attributeLocation);

		return buffer;
	}

	_initBuffers(_buffers: ConstructorBuffers) {
		const newBuffers = {} as WebEOVertexBuffers;
		Object.keys(_buffers).forEach((key) => {
			newBuffers[key] = this._createAttributeBuffer(key, _buffers[key]);
		});
		return newBuffers;
	}

	setVertexAttributeBuffer(
		key: string,
		data: number[],
		newArgs?: Partial<WebEOVertexAttributesArgs>,
	) {
		this.vAttrib[key].args = {
			...this.vAttrib[key].args,
			...newArgs,
		};
		const { args, location } = this.vAttrib[key];
		const buffer = this.vBuffers[key];
		const { numComponents, normalize, stride, offset } = args;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(data),
			this.gl.STATIC_DRAW,
		);
		this.gl.vertexAttribPointer(
			location,
			numComponents,
			this.gl.FLOAT,
			normalize,
			stride,
			offset,
		);
		this.gl.enableVertexAttribArray(location);
	}

	_createUniformLocations() {}

	setUniform(): void {}

	drawScene(t: number): void {
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL); // near things obscure far things

		// clear canvas
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Create a perspective matrix, a special matrix that is
		// used to simulate the distortion of perspective in a camera.
		// Our field of view is 45 degrees, with a width/height
		// ratio that matches the display size of the canvas
		// and we only want to see objects between 0.1 units
		// and 100 units away from the camera.

		const fieldOfView = (45 * Math.PI) / 180; // in radians
		// const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
		const aspect = this.gl.canvas.width / this.gl.canvas.height;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = mat4.create();

		// set perspective using values above
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

		// set draw pos to identity point at center of scene
		const modelViewMatrix = mat4.create();

		// move to draw the square
		mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -1.0]);

		// tell webgl to use out program when drawing
		this.gl.useProgram(this.program);

		this.gl.uniformMatrix4fv(
			this.uniformLocations.projectionMatrix,
			false,
			projectionMatrix,
		);
		this.gl.uniformMatrix4fv(
			this.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix,
		);

		{
			// no clue why I have this in a scope bracket, but i'mma leave it since I'm scared to remove it
			const offset = 0;
			const vertexCount = 4;
			this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
		}
	}
}
