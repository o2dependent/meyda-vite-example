import { writable } from "svelte/store";

export interface ProgramInfo {
	program: WebGLProgram;
	attribLocations: {
		vertexPosition: number;
		vertexColor: number;
	};
	uniformLocations: {
		iResolution: WebGLUniformLocation;
		iTime: WebGLUniformLocation;
		// iMouse: WebGLUniformLocation;
		modelViewMatrix: WebGLUniformLocation;
		projectionMatrix: WebGLUniformLocation;
	};
}

export const programInfo = writable<ProgramInfo | null>(null);
