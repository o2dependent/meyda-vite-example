<script lang="ts">
	import { onMount } from "svelte";
	import { getFragmentShaderSrc } from "../shaders/metaballs/fragmentShaderSource";
	import vertexShaderSrc from "../shaders/metaballs/vertexShaderSource.glsl?raw";

	let canvas: HTMLCanvasElement;
	let width: number = window.innerWidth;
	let height: number = window.innerHeight;

	let mouse = { x: -1000, y: -1000, down: false };

	interface MetaBall {
		x: number; // x coord
		y: number; // y coord
		vx: number; // velocity x
		vy: number; // velocity y
		r: number; // radius
		br: number; // base radius
	}
	let numMetaballs = Math.round(Math.max(height, width) / 5);
	// let numMetaballs = 10;
	let maxRadius = Math.max(height, width) / numMetaballs + 15;
	let minRadius = maxRadius / 4;
	let metaballs: MetaBall[] = [];
	let gl: WebGLRenderingContext | null = null;
	let metaballsHandle: WebGLUniformLocation | null | undefined;
	let program: WebGLProgram | null | undefined;
	let canAttract = false;

	let fragmentShaderSrc = getFragmentShaderSrc({ numMetaballs, height, width });

	function compileShader(shaderSource: string, shaderType: number) {
		let shader = gl?.createShader(shaderType);
		if (!shader) throw new Error("Failed to create shader");
		gl?.shaderSource(shader, shaderSource);
		gl?.compileShader(shader);

		if (!gl?.getShaderParameter(shader, gl?.COMPILE_STATUS)) {
			throw "Shader compile failed with: " + gl?.getShaderInfoLog(shader);
		}

		return shader;
	}
	let lt = 0;
	function loop(ct: number) {
		const dt = ct - lt;
		lt = ct;

		const dataToSendToGPU = new Float32Array(3 * numMetaballs);
		for (let i = 0; i < numMetaballs; i++) {
			const metaball = metaballs[i];
			// move all element toward to mouse if mouse is down and it is within a certain distance
			const dx = metaball.x - mouse.x;
			const dy = metaball.y - mouse.y;
			// let dist = Math.sqrt(dx * dx + dy * dy);
			// find distance in a circle
			const dist = Math.abs(dx) + Math.abs(dy);
			if (canAttract && dist < 300) {
				// move vx and vy towards the mouse
				metaball.vx +=
					(mouse.x - metaball.x) * ((mouse.down ? 0.5 : 0.125) / 2000);
				metaball.vy +=
					(mouse.y - metaball.y) * ((mouse.down ? 0.5 : 0.125) / 2000);
				// limit the velocity
				metaball.vx = Math.min(1.5, Math.max(-1.5, metaball.vx));
				metaball.vy = Math.min(1.5, Math.max(-1.5, metaball.vy));
			} else {
				// slow down the max velocity until it it 1
				if (Math.abs(metaball.vx) > 3) metaball.vx *= 0.99;
				if (Math.abs(metaball.vy) > 3) metaball.vy *= 0.99;
			}
			metaball.x += metaball.vx * dt;
			metaball.y += metaball.vy * dt;

			const mbrThreshold = metaball.r * 2;
			if (
				metaball.x + mbrThreshold < 0 ||
				metaball.x - mbrThreshold > width ||
				metaball.y + mbrThreshold < 0 ||
				metaball.y - mbrThreshold > height
			) {
				metaball.r *= 0.85;
				if (metaball.r < 0.25) {
					metaball.x = width / 2 - 2 * metaball.r + metaball.r;
					metaball.y = metaball.r * 2;
					metaball.vx = (Math.random() - 0.5) * 0.5;
					metaball.vy = Math.abs((Math.random() - 0.5) * 0.5);
					metaball.r = metaball.br;
				}
			}
			const baseIndex = 3 * i;
			const mb = metaballs[i];
			dataToSendToGPU[baseIndex + 0] = mb.x;
			dataToSendToGPU[baseIndex + 1] = mb.y;
			dataToSendToGPU[baseIndex + 2] = mb.r;
		}

		gl?.uniform3fv(metaballsHandle!, dataToSendToGPU);

		//Draw
		gl?.drawArrays(gl?.TRIANGLE_STRIP, 0, 4);

		requestAnimationFrame(loop);
	}

	$: gl?.viewport(0, 0, width, height);

	const initMetaballs = () => {
		gl = canvas.getContext("webgl2");
		for (let i = 0; i < numMetaballs; i++) {
			// let radius = Math.random() * Math.min(50, width / 50) + 10;
			// random radius between min and max
			let radius = Math.random() * (maxRadius - minRadius) + minRadius;
			metaballs.push({
				// x: Math.random() * (width - 2 * radius) + radius,
				// y: Math.random() * (height - 2 * radius) + radius,
				x: width / 2 - 2 * radius + radius,
				y: radius * 2,
				// weight the direction of the velocity based on width and height
				// vx: (Math.random() - 0.5) * 0.5 * (width / height) * 0.5,
				// vy: Math.abs((Math.random() - 0.5) * 0.5),
				vx: (Math.random() - 0.5) * 0.5,
				vy: Math.abs((Math.random() - 0.5) * 0.5),
				r: radius,
				br: radius,
			});
		}

		let vertexShader = compileShader(vertexShaderSrc, gl?.VERTEX_SHADER ?? 0);
		let fragmentShader = compileShader(
			fragmentShaderSrc,
			gl?.FRAGMENT_SHADER ?? 0,
		);

		program = gl?.createProgram();
		if (!program) throw new Error("Failed to create program");
		if (!vertexShader) throw new Error("Failed to create vertex shader");
		if (!fragmentShader) throw new Error("Failed to create fragment shader");
		gl?.attachShader(program, vertexShader);
		gl?.attachShader(program, fragmentShader);
		gl?.linkProgram(program);
		gl?.useProgram(program);

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

		metaballsHandle = getUniformLocation(program, "metaballs");

		requestAnimationFrame(loop);

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
		const onmousemove = function (e: MouseEvent) {
			const boundingRect = canvas.getBoundingClientRect();
			// find the x and y relative to the canvas position on the page
			// mouse.x = e.clientX - contentRect.left;
			// mouse.y = -1 * e.clientY - contentRect.top + contentRect.height;
			// mouse.x = e.x - contentRect.left + window.scrollX;
			// mouse.y = -1 * e.y - contentRect.top + window.scrollY;
			mouse.x = e.pageX - boundingRect.left + window.scrollX;
			mouse.y =
				-1 * e.pageY + boundingRect.top + boundingRect.height + window.scrollY;
		};
		const onmousedown = (e: MouseEvent) => {
			mouse.down = true;
			const x = e.pageX;
			const y = e.pageY;
			// if the canvas is clicked, prevent the user from selecting text
			// if (
			// 	x > canvas.offsetLeft &&
			// 	x < canvas.offsetLeft + canvas.width &&
			// 	y > canvas.offsetTop &&
			// 	y < canvas.offsetTop + canvas.height
			// )
			// 	document.body.style.userSelect = "none";
		};
		const onmouseup = (e: MouseEvent) => {
			mouse.down = false;
			// document.body.style.userSelect = "auto";
		};
		window.addEventListener("mousemove", onmousemove);
		window.addEventListener("mousedown", onmousedown);
		window.addEventListener("mouseup", onmouseup);
		setTimeout(() => {
			canAttract = true;
		}, 2000);
		return () => {
			window.removeEventListener("mousemove", onmousemove);
			window.removeEventListener("mousedown", onmousedown);
			window.removeEventListener("mouseup", onmouseup);
		};
	};
	onMount(initMetaballs);
</script>

<!-- <div class="absolute top-0 left-0 bg-dark-noise w-full h-full">
</div> -->
<canvas {height} {width} bind:this={canvas} />

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
