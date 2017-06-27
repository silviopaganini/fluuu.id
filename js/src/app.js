import {
  Scene,
  Clock,
  PlaneBufferGeometry,
  ShaderMaterial,
  Mesh,
  Vector3,
} from 'three';
import eve from 'dom-events';
import WAGNER from '@superguigui/wagner';
import MultiPassBloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass';
import FXAAPass from '@superguigui/wagner/src/passes/fxaa/FXAAPass';
import BlendPass from '@superguigui/wagner/src/passes/blend//BlendPass';
import { uniforms } from './constants';
import camera from './objects/camera';
import renderer from './objects/renderer';
import planeMaterialGLSL from './shaders/plane-material.glsl';


export default class App {

  constructor() {
    this.bindUpdate = this.update.bind(this);
  }

  static onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = -window.innerWidth * 0.5;
    camera.right = window.innerWidth * 0.5;
    camera.top = window.innerHeight * 0.5;
    camera.bottom = -window.innerHeight * 0.5;
    camera.updateProjectionMatrix();
  }

  init() {
    this.clock = new Clock(false);

    document.getElementById('containerCanvas').insertBefore(renderer.domElement, document.getElementById('containerCanvas').childNodes[0]);

    this.buildScene();
    this.initPass();

    eve.on(window, 'resize', this.constructor.onWindowResize);
    this.constructor.onWindowResize();

    this.clock.start();
    this.update();

    setTimeout(() => {
      renderer.domElement.style.opacity = 1;
    }, 1000);
  }

  initPass() {
    this.composer = new WAGNER.Composer(renderer);

    this.bloomPass = new MultiPassBloomPass({
      blurAmount: 2,
      applyZoomBlur: true,
    });

    this.blendPass = new BlendPass();
    this.fxaa = new FXAAPass();
  }

  buildScene() {
    this.scene = new Scene();

    // camera.position.z = 5;
    camera.position.copy(new Vector3(0, 0, 6));
    this.scene.add(camera);

    this.planeGeometry = new PlaneBufferGeometry(10, 10, 200, 200);
    this.planeMaterial = new ShaderMaterial({
      vertexShader: planeMaterialGLSL.vertex,
      fragmentShader: planeMaterialGLSL.fragment,
      wireframe: false,
        // wireframeLinewidth : 1,
      transparent: true,
      uniforms,
    });

    this.planeMesh = new Mesh(this.planeGeometry, this.planeMaterial);
    this.planeMesh.rotation.x = -Math.PI / 2;
    this.planeMesh.position.y = -0.5;
    this.scene.add(this.planeMesh);
  }

  render() {
    // renderer.render(this.scene, camera);
    this.composer.reset();
    this.composer.render(this.scene, camera);
    this.composer.pass(this.bloomPass);
    this.composer.pass(this.blendPass);
    this.composer.pass(this.fxaa);
    this.composer.toScreen();
  }

  update() {
    // this.controls.update();
    this.planeMaterial.uniforms.time.value = this.clock.getElapsedTime();
    this.render();
    requestAnimationFrame(this.bindUpdate);
  }
}
