import { Renderer, Camera, Transform, OGLRenderingContext } from "ogl";

export default class GalleryApp {
	screen: {
		width: number;
		height: number;
	};
	viewport: {
		width: number;
		height: number;
	};
	renderer: Renderer;
	gl: OGLRenderingContext;
	camera: Camera;
	scene: Transform;

	constructor() {
		this.createRenderer();
		this.createCamera();
		this.createScene();

		this.onResize();

		this.update();

		this.addEventListeners();
	}

	createRenderer() {
		this.renderer = new Renderer();

		this.gl = this.renderer.gl;
		this.gl.clearColor(0, 0, 0, 1);

		document.body.appendChild(this.gl.canvas);
	}

	createCamera() {
		this.camera = new Camera(this.gl);
		this.camera.fov = 45;
		this.camera.position.z = 20;
	}

	createScene() {
		this.scene = new Transform();
	}

	/**
	 * Events
	 */
	onTouchDown(e) {}
	onTouchMove(e) {}
	onTouchUp(e) {}
	onWheel(e) {}

	/**
	 * Resize
	 */

	onResize() {
		this.screen = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		this.renderer.setSize(this.screen.width, this.screen.height);
		this.camera.perspective({
			aspect: this.gl.canvas.width / this.gl.canvas.height,
		});

		const fov = this.camera.fov * (Math.PI / 180);
		const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
		const width = height * this.camera.aspect;

		this.viewport = {
			width,
			height,
		};
	}

	/**
	 * Update
	 */
	update() {
		this.renderer.render({
			scene: this.scene,
			camera: this.camera,
		});

		requestAnimationFrame(this.update.bind(this));
	}

	/**
	 * Listeners
	 */
	addEventListeners() {
		window.addEventListener("resize", this.onResize.bind(this));

		window.addEventListener("mousewheel", this.onWheel.bind(this));
		window.addEventListener("wheel", this.onWheel.bind(this));

		window.addEventListener("mousedown", this.onTouchDown.bind(this));
		window.addEventListener("mousemove", this.onTouchMove.bind(this));
		window.addEventListener("mouseup", this.onTouchUp.bind(this));

		window.addEventListener("touchstart", this.onTouchDown.bind(this));

		window.addEventListener("touchmove", this.onTouchMove.bind(this));
		window.addEventListener("touchend", this.onTouchUp.bind(this));
	}
}
