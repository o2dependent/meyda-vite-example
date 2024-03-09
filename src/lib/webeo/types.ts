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

interface WebEOVertexAttribute {
	location: number;
	args: WebEOVertexAttributesArgs;
}
export interface WebEOVertexAttributes {
	[key: string]: WebEOVertexAttribute;
}

export interface WebEOUniform {
	type: `${"1" | "2" | "3" | "4"}${"f" | "v" | "i" | "iv"}`;
	location: WebGLUniformLocation;
}
export interface WebEOUniforms {
	iResolution: WebEOUniform;
	iTime: WebEOUniform;
	// iMouse: WebEOUniform;
	modelViewMatrix: WebEOUniform;
	projectionMatrix: WebEOUniform;
	[key: string]: WebEOUniform;
}
//ANCHOR - Constructor Values
export interface ConstructorVertexBuffers {
	aVertexPosition?: number[];
	[key: string]: number[];
}
export interface ConstructorUniforms {
	[key: string]: {
		type: `${"1" | "2" | "3" | "4"}${"f" | "v" | "i" | "iv"}`;
		value: number[]; // number of elements must match type
	};
}
