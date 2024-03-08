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
