//ANCHOR - Interfaces and Types
//ANCHOR - Properties
export interface WebEOVertexBuffers {
	aVertexPosition: WebGLBuffer;
	[key: string]: WebGLBuffer;
}

export interface WebEOVertexAttributesArgs {
	numComponents: number;
	normalize: boolean;
	stride: number;
	offset: number;
}

export interface WebEOVertexAttributes {
	[key: string]: {
		location: number;
		args: WebEOVertexAttributesArgs;
	};
}
export interface WebEOUniformLocations {
	iResolution: WebGLUniformLocation;
	iTime: WebGLUniformLocation;
	// iMouse: WebGLUniformLocation;
	modelViewMatrix: WebGLUniformLocation;
	projectionMatrix: WebGLUniformLocation;
	[key: string]: WebGLUniformLocation;
}
//ANCHOR - Constructor Values
export interface ConstructorBuffers {
	aVertexPosition?: number[];
	[key: string]: number[];
}

//ANCHOR - Class Definition
export abstract class AWebEO {
	// --- Properties ---
	abstract gl: WebGLRenderingContext;
	abstract program: WebGLProgram;
	abstract vBuffers: WebEOVertexBuffers;
	abstract vAttrib: WebEOVertexAttributes;
	abstract uniformLocations: WebEOUniformLocations;

	// --- Private Methods ---
	abstract _loadShader(
		type:
			| WebGLRenderingContext["VERTEX_SHADER"]
			| WebGLRenderingContext["FRAGMENT_SHADER"],
		source: string,
	): WebGLShader;

	abstract _initShaderProgram(vsSource: string, fsSource: string): WebGLProgram;

	abstract _createAttributeBuffer(
		attributeName: string,
		data: number[],
		vertexAttribPointerArgs?: {
			numComponents: number;
			normalize: boolean;
			stride: number;
			offset: number;
		},
	): WebGLBuffer;

	abstract _initBuffers(_buffers: ConstructorBuffers): WebEOVertexBuffers;

	abstract _createUniformLocations();

	// --- Public Methods ---
	abstract setVertexAttributeBuffer(
		key: string,
		data: number[],
		newArgs?: Partial<WebEOVertexAttributesArgs>,
	): void;

	abstract drawScene(t: number): void;

	abstract setUniform(): void;
}
