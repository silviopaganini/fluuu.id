import { WebGLRenderer } from 'three';

const renderer = new WebGLRenderer({ antialias: false, alpha: false });
renderer.inputGamma = true;
renderer.outputGamma = true;
renderer.autoClear = false;
renderer.autoClearColor = true;
// renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.setSize(window.innerWidth, window.innerHeight);

export default renderer;
