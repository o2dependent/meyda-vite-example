import { drawScene } from "./drawScene";

export const renderScene = (t: number) => {
	drawScene(t / 1000);
	requestAnimationFrame(renderScene);
};
