import { writable } from "svelte/store";

export const gl = writable<WebGLRenderingContext | null>(null);
