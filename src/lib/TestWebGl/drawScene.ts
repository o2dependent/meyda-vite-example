import { mat4 } from "gl-matrix";
import { gl } from "./gl.store";
import { get } from "svelte/store";
import { programInfo } from "./programInfo.store";
import { buffers } from "./buffers.store";

const setTimeUniform = (t: number) => {
	const $gl = get(gl);
	const $programInfo = get(programInfo);
	const location = $programInfo.uniformLocations.iTime;
	$gl.uniform1f(location, t);
};

const setResolutionUniform = () => {
	const $gl = get(gl);
	const $programInfo = get(programInfo);
	const location = $programInfo.uniformLocations.iResolution;
	$gl.uniform3f(location, $gl.canvas.width, $gl.canvas.height, 0);
};

// Tell WebGL to pull out colors from color buffer into vertexColor attr
const setColorAttribute = () => {
	const $gl = get(gl);
	const $programInfo = get(programInfo);
	const $buffers = get(buffers);
	const numComponents = 4;
	const type = $gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	$gl.bindBuffer($gl.ARRAY_BUFFER, $buffers.color);
	$gl.vertexAttribPointer(
		$programInfo.attribLocations.vertexColor,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	$gl.enableVertexAttribArray($programInfo.attribLocations.vertexColor);
};

// Tell WebGL how to pull out the positions from the position
// buffer into the position attribute.
const setPositionAttribute = () => {
	const $gl = get(gl);
	const $programInfo = get(programInfo);
	const $buffers = get(buffers);
	const numComponents = 2; // pull out 2 values per iteration
	const type = $gl.FLOAT; // the data in the buffer is 32bit floats
	const normalize = false; // don't normalize
	const stride = 0; // how many bytes to get from one set of values to the next
	// 0 = use type and numComponents above
	const offset = 0; // how many bytes inside the buffer to start from
	$gl.bindBuffer($gl.ARRAY_BUFFER, $buffers.position);
	$gl.vertexAttribPointer(
		$programInfo.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	$gl.enableVertexAttribArray($programInfo.attribLocations.vertexPosition);
};

export const drawScene = (t: number) => {
	const $gl = get(gl);
	const $programInfo = get(programInfo);
	$gl.clearColor(0.0, 0.0, 0.0, 1.0);
	$gl.clearDepth(1.0);
	$gl.enable($gl.DEPTH_TEST);
	$gl.depthFunc($gl.LEQUAL); // near things obscure far things

	// clear canvas
	$gl.clear($gl.COLOR_BUFFER_BIT | $gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = (45 * Math.PI) / 180; // in radians
	// const aspect = $gl.canvas.clientWidth / $gl.canvas.clientHeight;
	const aspect = $gl.canvas.width / $gl.canvas.height;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();

	// set perspective using values above
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	// set draw pos to identity point at center of scene
	const modelViewMatrix = mat4.create();

	// move to draw the square
	mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -1.0]);

	// let webgl know how to pull positions from the pos buffer into position attribute
	setPositionAttribute();
	setColorAttribute();
	// tell webgl to use out program when drawing
	$gl.useProgram($programInfo.program);

	// set the shader uniforms
	setTimeUniform(t);
	setResolutionUniform();
	// setMouseUniform();

	$gl.uniformMatrix4fv(
		$programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix,
	);
	$gl.uniformMatrix4fv(
		$programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix,
	);

	{
		const offset = 0;
		const vertexCount = 4;
		$gl.drawArrays($gl.TRIANGLE_STRIP, offset, vertexCount);
	}
};
