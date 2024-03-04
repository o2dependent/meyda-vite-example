import { writable } from "svelte/store";
import { initBuffers } from "./initBuffers";

export const buffers = writable<ReturnType<typeof initBuffers> | null>(null);
