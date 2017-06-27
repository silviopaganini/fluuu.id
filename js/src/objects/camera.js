import { PerspectiveCamera } from 'three';

const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
export default camera;
