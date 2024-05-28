import {
	Renderer,
	Camera,
	Transform,
	type OGLRenderingContext,
	Plane,
} from "ogl";
import NormalizedWheel from "normalize-wheel";
import Media from "./Media";
import { lerp } from "../math";
import debounce from "lodash/debounce";
import { type DebouncedFunc } from "lodash";
import { Background } from "./Background";

export default class GalleryApp {
	screen: {
		width: number;
		height: number;
	} = { height: 0, width: 0 };
	viewport: {
		width: number;
		height: number;
	} = { height: 0, width: 0 };
	renderer: Renderer;
	gl: OGLRenderingContext;
	camera: Camera;
	scene: Transform;
	planeGeometry: Plane;

	mediasImages: { image: string; text: string }[];
	medias: Media[];

	isDown: boolean = false;
	start: number = 0;
	scroll: {
		ease: number;
		position: number;
		current: number;
		target: number;
		last: number;
	} = {
		ease: 0.05,
		position: 0,
		current: 0,
		target: 0,
		last: 0,
	};
	direction: "left" | "right" = "left";

	onCheckDebounce: DebouncedFunc<() => void>;

	background: Background;

	constructor() {
		const { gl, renderer } = this.makeRenderer();
		this.renderer = renderer;
		this.gl = gl;
		this.camera = this.makeCamera();
		this.scene = this.makeScene();

		this.onResize();

		this.planeGeometry = this.makeGeometry();
		const { medias, mediasImages } = this.makeGalleryMedia();
		this.mediasImages = mediasImages;
		this.medias = medias;
		this.background = this.makeBackground();

		this.update();

		this.addEventListeners();

		this.onCheckDebounce = debounce(this.onCheck, 200);
	}

	makeBackground() {
		const background = new Background({
			gl: this.gl,
			scene: this.scene,
			viewport: this.viewport,
			screen: this.screen,
			renderer: this.renderer,
		});
		return background;
	}

	makeRenderer() {
		const renderer = new Renderer();

		const gl = this.renderer.gl;
		gl.clearColor(0.0, 0.0, 0.0, 1);
		// this.gl.clearColor(1.0, 0.0, 0.0, 1);
		// this.gl.clearColor(0.125, 0.125, 0.125, 1);

		document.body.appendChild(this.gl.canvas);
		return { renderer, gl };
	}

	makeCamera() {
		const camera = new Camera(this.gl);
		camera.fov = 45;
		camera.position.z = 20;
		return camera;
	}

	makeScene() {
		return new Transform();
	}

	makeGeometry() {
		return new Plane(this.gl, {
			heightSegments: 50,
			widthSegments: 100,
		});
	}

	makeGalleryMedia() {
		const mediasImages = [
			{ image: "/images/mar-9-2024.jpg", text: "Mar 9 2024" },
			{ image: "/images/mar-10-2024.jpg", text: "Mar 10 2024" },
			{ image: "/images/mar-11-2024.jpg", text: "Mar 11 2024" },
			{ image: "/images/mar-12-2024.jpg", text: "Mar 12 2024" },
			{ image: "/images/mar-13-2024.jpg", text: "Mar 13 2024" },
			{ image: "/images/mar-14-2024.jpg", text: "Mar 14 2024" },
			{ image: "/images/mar-15-2024.jpg", text: "Mar 15 2024" },
			{ image: "/images/mar-16-2024.jpg", text: "Mar 16 2024" },
		];

		const medias = this.mediasImages.map(({ image, text }, index) => {
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
		return { medias, mediasImages };
	}
	/**
	 * Events
	 */
	onTouchDown(e: TouchEvent | MouseEvent) {
		this.isDown = true;

		this.scroll.position = this.scroll.current;
		this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
	}

	onTouchMove(e: TouchEvent | MouseEvent) {
		if (!this.isDown) return;

		const x = "touches" in e ? e.touches[0].clientX : e.clientX;
		const distance = (this.start - x) * 0.01;

		this.scroll.target = this.scroll.position + distance;
	}

	onTouchUp(e: TouchEvent | MouseEvent) {
		this.isDown = false;

		this.onCheck();
	}

	onWheel(e: TouchEvent | MouseEvent) {
		this.onCheckDebounce();
		const normalized = NormalizedWheel(e);

		this.scroll.target += normalized.pixelY * 0.005;
	}

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

		this.background?.onResize?.({
			screen: this.screen,
			viewport: this.viewport,
		});

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
	 * On Snapping Check
	 */
	onCheck() {
		const { width } = this.medias[0];
		const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
		const item = width * itemIndex;

		console.log(item);

		this.scroll.target = item * Math.sign(this.scroll.target);
	}

	/**
	 * Update
	 */
	update() {
		this.scroll.current = lerp(
			this.scroll.current,
			this.scroll.target,
			this.scroll.ease,
		);

		if (this.scroll.current > this.scroll.last) {
			this.direction = "right";
		} else {
			this.direction = "left";
		}

		if (this.medias) {
			this.medias.forEach((media) =>
				media?.update?.(this?.scroll, this?.direction),
			);
		}

		if (this.background) {
			this.background.update(this.scroll, this.direction);
		}

		this.renderer.render({
			scene: this.scene,
			camera: this.camera,
		});

		this.scroll.last = this.scroll.current;

		requestAnimationFrame(this.update.bind(this));
	}

	/**
	 * Listeners
	 */
	addEventListeners() {
		window.addEventListener("resize", this.onResize.bind(this));

		// @ts-ignore
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
