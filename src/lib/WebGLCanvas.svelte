<script lang="ts">
	import { onMount } from "svelte";
	import fragmentShaderSource from "./fragmentShaderSource.glsl?raw";
	import { vertexShaderSource } from "./vertexShaderSource";

	export let chromaHue: number;
	export let rms: number;

	// Vertex shader program
	const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

	let gl: WebGLRenderingContext;
	let chromaHueUniform: WebGLUniformLocation;
	let rmsUniform: WebGLUniformLocation;
	let iResolutionUniform: WebGLUniformLocation;
	let iTimeUniform: WebGLUniformLocation;
	let iMouseUniform: WebGLUniformLocation;
	let time = 0;
	$: {
		if (gl) {
			gl.uniform1f(chromaHueUniform, chromaHue);
			gl.uniform1f(rmsUniform, rms);
		}
	}

	function getUniformLocation(program: WebGLProgram, name: string) {
		let uniformLocation = gl?.getUniformLocation(program, name);
		if (uniformLocation === -1) {
			throw "Can not find uniform " + name + ".";
		}
		return uniformLocation;
	}

	function getAttribLocation(program: WebGLProgram, name: string) {
		let attributeLocation = gl?.getAttribLocation(program, name);
		if (attributeLocation === -1) {
			throw "Can not find attribute " + name + ".";
		}
		return attributeLocation;
	}
	onMount(() => {
		const canvas = document.getElementById("webglCanvas") as HTMLCanvasElement;
		gl = canvas.getContext("webgl");

		if (!gl) {
			console.error(
				"Unable to initialize WebGL. Your browser may not support it.",
			);
			return;
		}

		// Compile shaders

		// const fragmentShaderSource = `
		//   precision mediump float;
		//   uniform float u_chromaHue;
		//   uniform float u_rms;

		//   void main() {
		//     gl_FragColor = vec4(
		//       u_chromaHue, 100.0 * u_rms + 25.0, 50.0,
		//       1.0
		//     );
		//   }
		// `;

		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = compileShader(
			gl,
			gl.FRAGMENT_SHADER,
			fragmentShaderSource,
		);
		console.log({ fragmentShader });

		const program = createProgram(gl, vertexShader, fragmentShader);
		gl.useProgram(program);

		// Set up vertex buffer
		let vertexData = new Float32Array([
			-1.0,
			1.0, // top left
			-1.0,
			-1.0, // bottom left
			1.0,
			1.0, // top right
			1.0,
			-1.0, // bottom right
		]);
		let vertexDataBuffer = gl?.createBuffer();
		if (!vertexDataBuffer)
			throw new Error("Failed to create vertex data buffer");
		gl?.bindBuffer(gl?.ARRAY_BUFFER, vertexDataBuffer);
		gl?.bufferData(gl?.ARRAY_BUFFER, vertexData, gl?.STATIC_DRAW);

		let positionHandle = getAttribLocation(program, "position");
		if (typeof positionHandle === "undefined") positionHandle = 0;
		gl?.enableVertexAttribArray(positionHandle);
		gl?.vertexAttribPointer(
			positionHandle,
			2, // position is a vec2
			gl?.FLOAT, // each component is a float
			false, // don't normalize values
			2 * 4, // two 4 byte float components per vertex
			0, // offset into each span of vertex data
		);

		// const positionBuffer = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		// const BUFFER_POINTS = new Float32Array([
		// 	-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
		// ]);
		// gl.bufferData(gl.ARRAY_BUFFER, BUFFER_POINTS, gl.STATIC_DRAW);

		const positionAttrib = gl.getAttribLocation(program, "a_position");
		gl.vertexAttribPointer(positionAttrib, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(positionAttrib);

		// Set uniform values
		chromaHueUniform = gl.getUniformLocation(program, "u_chromaHue");
		gl.uniform1f(chromaHueUniform, chromaHue);

		rmsUniform = gl.getUniformLocation(program, "u_rms");
		gl.uniform1f(rmsUniform, rms);

		iResolutionUniform = gl.getUniformLocation(program, "iResolutionUniform");
		gl.uniform3i(iResolutionUniform, canvas.width, canvas.height, 0);
		// add event listener for resize
		window.addEventListener("resize", () => {
			gl.uniform3i(iResolutionUniform, canvas.width, canvas.height, 0);
		});

		iTimeUniform = gl.getUniformLocation(program, "iTimeUniform");
		gl.uniform1f(iTimeUniform, time);
		// add animation frame time increment
		const animate = () => {
			time += 0.01;
			gl.uniform1f(iTimeUniform, time);
			// -- Render
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl?.drawArrays(gl?.TRIANGLE_STRIP, 0, 4);
			requestAnimationFrame(animate);
		};

		iMouseUniform = gl.getUniformLocation(program, "iMouseUniform");
		gl.uniform1f(iMouseUniform, rms);
		// add event listener for mouse move
		window.addEventListener("mousemove", (e) => {
			gl.uniform4f(iMouseUniform, e.clientX, e.clientY, 0, 0);
		});

		// Clear the canvas
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Draw the buffer
		animate();

		// Function to compile shader
		function compileShader(
			gl: WebGLRenderingContext,
			type: number,
			source: string,
		) {
			const shader = gl.createShader(type);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error(gl.getShaderInfoLog(shader));
				gl.deleteShader(shader);
				return null;
			}

			return shader;
		}

		// Function to create program
		function createProgram(
			gl: WebGLRenderingContext,
			vertexShader: WebGLShader,
			fragmentShader: WebGLShader,
		) {
			const program = gl.createProgram();
			console.log({ vertexShader, fragmentShader });
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);

			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				console.error(gl.getProgramInfoLog(program));
				gl.deleteProgram(program);
				return null;
			}

			return program;
		}
	});
</script>

<canvas id="webglCanvas"></canvas>

<style>
	canvas {
		width: 100%;
		height: 100vh;
	}
</style>
