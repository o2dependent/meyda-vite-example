<script lang="ts">
	import { onMount } from "svelte";
	import { initBuffers } from "./initBuffers";
	import { gl } from "./gl.store";
	import { programInfo } from "./programInfo.store";
	import { buffers } from "./buffers.store";
	import { renderScene } from "./renderScene";
	import vertexShaderSource from "../vertexShaderSource.glsl?raw";
	import fragmentShaderSource from "../fragmentShaderSource.glsl?raw";

	let canvas: HTMLCanvasElement;

	// Vertex shader program
	// const vsSource = `
	//   attribute vec4 aVertexPosition;
	// 	attribute vec4 aVertexColor;

	//   uniform mat4 uModelViewMatrix;
	//   uniform mat4 uProjectionMatrix;

	// 	varying lowp vec4 vColor;

	//   void main() {
	//     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	// 		vColor = aVertexColor;
	//   }
	// `;

	// const fsSource = `
	// 	varying lowp vec4 vColor;

	//   void main() {
	//     gl_FragColor = vColor;
	//   }
	// `;

	//
	// Initialize a shader program, so WebGL knows how to draw our data
	//
	function initShaderProgram($gl, vsSource, fsSource) {
		const vertexShader = loadShader($gl, $gl.VERTEX_SHADER, vsSource);
		const fragmentShader = loadShader($gl, $gl.FRAGMENT_SHADER, fsSource);

		// Create the shader program

		const shaderProgram = $gl.createProgram();
		$gl.attachShader(shaderProgram, vertexShader);
		$gl.attachShader(shaderProgram, fragmentShader);
		$gl.linkProgram(shaderProgram);

		// If creating the shader program failed, alert

		if (!$gl.getProgramParameter(shaderProgram, $gl.LINK_STATUS)) {
			alert(
				`Unable to initialize the shader program: ${$gl.getProgramInfoLog(
					shaderProgram,
				)}`,
			);
			return null;
		}

		return shaderProgram;
	}

	//
	// creates a shader of the given type, uploads the source and
	// compiles it.
	//
	function loadShader($gl, type, source) {
		const shader = $gl.createShader(type);

		// Send the source to the shader object

		$gl.shaderSource(shader, source);

		// Compile the shader program

		$gl.compileShader(shader);

		// See if it compiled successfully

		if (!$gl.getShaderParameter(shader, $gl.COMPILE_STATUS)) {
			alert(
				`An error occurred compiling the shaders: ${$gl.getShaderInfoLog(shader)}`,
			);
			$gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	onMount(() => {
		if (!canvas) canvas = document.querySelector("#glcanvas-test");
		const _gl = canvas.getContext("webgl");
		gl.set(_gl);
		// Initialize a shader program; this is where all the lighting
		// for the vertices and so forth is established.
		const shaderProgram = initShaderProgram(
			$gl,
			vertexShaderSource,
			fragmentShaderSource,
		);

		programInfo.set({
			program: shaderProgram,
			attribLocations: {
				vertexPosition: $gl.getAttribLocation(shaderProgram, "aVertexPosition"),
				vertexColor: $gl.getAttribLocation(shaderProgram, "aVertexColor"),
			},
			uniformLocations: {
				iResolution: $gl.getUniformLocation(shaderProgram, "iResolution"),
				iTime: $gl.getUniformLocation(shaderProgram, "iTime"),
				// iMouse: $gl.getUniformLocation(shaderProgram, "iMouse"),
				modelViewMatrix: $gl.getUniformLocation(
					shaderProgram,
					"uModelViewMatrix",
				),
				projectionMatrix: $gl.getUniformLocation(
					shaderProgram,
					"uProjectionMatrix",
				),
			},
		});
		buffers.set(initBuffers($gl));

		renderScene(0);
		// drawScene($gl, programInfo, buffers, [0, 0, -10.0]);
	});
</script>

<canvas bind:this={canvas} id="glcanvas-test" width="640" height="480"></canvas>
