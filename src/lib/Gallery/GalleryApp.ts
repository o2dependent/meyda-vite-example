import { Renderer, Camera, Transform, OGLRenderingContext, Plane } from "ogl";
import Mar9 from "./images/mar-9-2024.jpg";
import Mar10 from "./images/mar-10-2024.jpg";
import Mar11 from "./images/mar-11-2024.jpg";
import Mar12 from "./images/mar-12-2024.jpg";
import Mar13 from "./images/mar-13-2024.jpg";
import Media from "./Media";

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
	planeGeometry: Plane;

	mediasImages: { image: string; text: string }[];
	medias: Media[];

	constructor() {
		this.createRenderer();
		this.createCamera();
		this.createScene();

		this.onResize();

		this.createGeometry();
		this.createGalleryMedia();

		this.update();

		this.addEventListeners();
	}

	createRenderer() {
		this.renderer = new Renderer();

		this.gl = this.renderer.gl;
		this.gl.clearColor(0.05, 0.05, 0.05, 1);

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

	createGeometry() {
		this.planeGeometry = new Plane(this.gl, {
			heightSegments: 50,
			widthSegments: 100,
		});
	}

	createGalleryMedia() {
		console.log(Mar9);
		this.mediasImages = [
			{ image: Mar9, text: "Mar 9 2024" },
			{ image: Mar10, text: "Mar 10 2024" },
			{ image: Mar11, text: "Mar 11 2024" },
			{ image: Mar12, text: "Mar 12 2024" },
			{ image: Mar13, text: "Mar 13 2024" },
		];

		this.medias = this.mediasImages.map(({ image, text }, index) => {
			const media = new Media({
				geometry: this.planeGeometry,
				gl: this.gl,
				image,
				index,
				length: this.mediasImages.length,
				scene: this.scene,
				screen: this.screen,
				text,
				viewport: this.viewport,
				renderer: this.renderer,
			});

			return media;
		});
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

		if (this.medias) {
			this.medias.forEach((media) =>
				media.onResize({
					screen: this.screen,
					viewport: this.viewport,
				}),
			);
		}
	}

	/**
	 * Update
	 */
	update() {
		if (this.medias) {
			this.medias.forEach((media) =>
				media?.update?.(/*this?.scroll, this?.direction*/),
			);
		}
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
