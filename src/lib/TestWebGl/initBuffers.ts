const initPositionBuffer = (gl: WebGLRenderingContext) => {
	const positionBuffer = gl.createBuffer();

	// select po buffer to apply buffer operations from here on out
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	// pos arr of a square
	const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

	// pass pos to webgl to build out shape.
	// a float 32 array will need to be made to fill the buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	return positionBuffer;
};

export const initBuffers = (gl: WebGLRenderingContext) => {
	const positionBuffer = initPositionBuffer(gl);

	return {
		position: positionBuffer,
	};
};
