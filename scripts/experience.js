import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import loaderManager from "./loaderManager";

const device = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio,
};

export default class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();

    this.init();
  }

  async init() {
    this.setScene();
    this.setLights();
    this.setRenderer();
    this.setCamera();

    const assets = [{ name: "car", gltf: "/models/car/scene.gltf" }];

    // Preload all resources
    await loaderManager.load(assets);
  }

  setScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 10, 15);
    this.grid = new THREE.GridHelper(20, 40, 0xffffff, 0xffffff);
    this.grid.material.opacity = 0.2;
    this.grid.material.depthWrite = false;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      device.width / device.height,
      0.1,
      1000
    );
    this.camera.position.set(4, 1, 0);
    this.scene.add(this.camera);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.enablePan = false;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 8;
    this.controls.maxPolarAngle = Math.PI * 0.4;
    this.controls.enableDamping = true;
    this.controls.update();
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
  }

  setLights() {
    this.scene.add(new THREE.AmbientLight(0x111122, 3));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-60, 100, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    this.scene.add(dirLight);
  }

  onResize() {
    device.width = window.innerWidth;
    device.height = window.innerHeight;

    this.camera.aspect = device.width / device.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
  }

  update() {
    if (this.controls && this.renderer) {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    }
  }
}
