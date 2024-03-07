export interface ProgramInfo {}

export interface VertexBuffers {
	aVertexPosition: WebGLBuffer;
	[key: string]: WebGLBuffer;
}

export interface ConstructorBuffers {
	aVertexPosition?: number[];
	[key: string]: number[];
}

export class WebEO {
	gl: WebGLRenderingContext;
	programInfo: ProgramInfo;
	vertexBuffers: VertexBuffers;
	program: WebGLProgram;
	attribLocations: {
		[key: string]: number;
	};
	uniformLocations: {
		iResolution: WebGLUniformLocation;
		iTime: WebGLUniformLocation;
		// iMouse: WebGLUniformLocation;
		modelViewMatrix: WebGLUniformLocation;
		projectionMatrix: WebGLUniformLocation;
		[key: string]: WebGLUniformLocation;
	};

	constructor(
		_gl: WebGLRenderingContext,
		vertextShader: string,
		fragmentShader: string,
		_vertexBuffers?: ConstructorBuffers,
	) {
		const DEFAULT_VERTEX_BUFFERS: ConstructorBuffers = {
			aVertexPosition: [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0],
		};

		this.gl = _gl;
		this.vertexBuffers = this._initBuffers({
			...DEFAULT_VERTEX_BUFFERS,
			...(_vertexBuffers ?? {}),
		});
		this.program = this._initShaderProgram(vertextShader, fragmentShader);
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
		// Create a buffer
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

		// Load data into the buffer
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(data),
			this.gl.STATIC_DRAW,
		);

		// Get attribute location in the vertex shader
		const attributeLocation = this.gl.getAttribLocation(
			this.program,
			attributeName,
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
		const newBuffers = {} as VertexBuffers;
		Object.keys(_buffers).forEach((key) => {
			newBuffers[key] = this._createAttributeBuffer(key, _buffers[key]);
		});
		return newBuffers;
	}

	setAttribute() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(
			this.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		);
		this.gl.enableVertexAttribArray(this.attribLocations.vertexPosition);
	}
}
