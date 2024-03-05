import * as THREE from "three";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

import Experience from "./experience";
import LoaderManager from "./loaderManager";

const colors = [
  new THREE.Color().setHex(0x009dff),
  new THREE.Color().setHex(0x001aff),
  new THREE.Color().setHex(0x4000ff),
  new THREE.Color().setHex(0x7300ff),
];
const experience = new Experience(document.querySelector("#canvas"));
const { scene, clock, renderer, camera } = experience || {};
const progressBar = document.querySelector("#progress-bar");

let car;

function setupCar() {
  car = LoaderManager.assets?.["car"]?.gltf;
  car.scene.position.set(0, 0, 0);
  car.scene.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      object.material.envMapIntensity = 20;
    }
  });

  scene.add(car.scene);
}

const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const params = {
  threshold: 0.05,
  strength: 0.5,
  radius: 0.4,
  exposure: 1,
};

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;
const outputPass = new OutputPass();

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

function createPointLight(color) {
  const intensity = 200;
  const light = new THREE.PointLight(color, intensity, 20);
  light.castShadow = true;
  light.shadow.bias = -0.005; // reduces self-shadowing on double-sided objects

  return light;
}

let rings = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function setupRing() {
  rings = rings.map(() => {
    const geometry = new THREE.TorusGeometry(4.5, 0.05, 16, 100, Math.PI);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const material = new THREE.MeshStandardMaterial({ color: randomColor });
    const torus = new THREE.Mesh(geometry, material);
    torus.receiveShadow = true;
    torus.castShadow = true;
    torus.rotation.y = Math.PI / 2;
    scene.add(torus);
    torus.material.emissive = randomColor.multiplyScalar(1);
    createPointLight(randomColor);
    return torus;
  });
}

LoaderManager.manager.onProgress = (url, loaded, total) => {
  const percent = (loaded * 100) / total;
  progressBar.value = percent;
};

LoaderManager.manager.onLoad = () => {
  const loader = document.querySelector("#loader");
  loader.classList.add("hide");
  setupCar();
  setupRing();
  animate();
};

const animate = () => {
  const t = clock.getElapsedTime();

  if (car) {
    const group = car.scene.children[0].children[0].children[0].children[1];
    group.children[11].rotation.y = t * 2;
    group.children[12].rotation.y = t * 2;
    group.children[13].rotation.y = t * 2;
    group.children[14].rotation.y = t * 2;
  }

  if (rings[0]?.isMesh) {
    rings.forEach((node, i) => {
      let z = (i - 7) * 3.5 + ((t * 0.4) % 3.5) * 2;
      let dist = Math.abs(z);
      node.position.set(-z, 0, 0);
      const scale = 1 - 0.02 * dist;
      node.scale.set(scale, scale, scale);

      // let colorScale = 1;
      // if (dist > 2) {
      //   colorScale = 1 - (Math.min(dist, 12) - 2) / 10;
      // }
      // colorScale *= 0.5;
      // if (i % 2 == 1) {
      //   node.material.emissive = new THREE.Color(6, 0.15, 0.7).multiplyScalar(
      //     colorScale
      //   );
      // } else {
      //   node.material.emissive = new THREE.Color(0.1, 0.7, 3).multiplyScalar(
      //     colorScale
      //   );
      // }
    });
  }

  experience.grid.position.x = -t % 1;
  experience.update();
  composer.render();
  requestAnimationFrame(animate);
};

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  experience.onResize();
  composer.setSize(width, height);
});
