import "./style.css";
import * as THREE from "three";
import { gsap } from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// GSAP
gsap.set(".hero-h1 div", { yPercent: -90 });
gsap.set(".hero-h2 div", { yPercent: -90 });

const tl = gsap.timeline();
tl.to(".hero-h1 div", {
  yPercent: 0,
  duration: 1,
  stagger: 0.05,
  ease: "expo.inOut",
}).to('.hero-h1 div:not([data-char="."])', {
  duration: 1,
  yPercent: 90,
  stagger: 0.05,
  ease: "expo.inOut",
});

tl.to(
  ".hero-h2 div",
  {
    yPercent: 0,
    duration: 1.5,
    stagger: 0.05,
    ease: "expo.inOut",
  },
  "0"
).to(
  '.hero-h2 div:not([data-char="."])',
  {
    duration: 1.5,
    yPercent: 90,
    stagger: 0.05,
    ease: "expo.inOut",
  },
  "1"
);

// THREE init

const manager = new THREE.LoadingManager();

const textureLoader = new THREE.TextureLoader(manager);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Cursor
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

// Init scene
const scene = new THREE.Scene();

// Camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 5;
cameraGroup.add(camera);

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

scene.add(directionalLight, ambientLight);

// Generate particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.2,
  sizeAttenuation: true,
  alphaMap: textureLoader.load("/textures/particles/circle_01.png"),
  transparent: true,
  depthWrite: false,
  vertexColors: true,
});

const count = 3000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 30;
  colors[i] = Math.random();
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const points = new THREE.Points(particlesGeometry, particlesMaterial);
// console.log(points);
scene.add(points);

// Loading Models
const gltfLoader = new GLTFLoader(manager);

// Duck
let duck;
gltfLoader.load("./models/Duck/gLTF/Duck.gltf", (gltf) => {
  duck = gltf.scene.children[0].children[1];
  duck.traverse((child) => {
    if (child.isMesh) {
      child.material.roughness = 0.1;
      child.scale.set(0.012, 0.012, 0.012);
      child.position.set(2, -1, 0);
    }
  });
  scene.add(duck);
});

// Avocado
let avocado;
gltfLoader.load("./models/Avocado/gLTF/Avocado.gltf", (gltf) => {
  avocado = gltf.scene.children[0];
  avocado.scale.set(25, 25, 25);
  avocado.position.set(-2, -7, 0);
  avocado.rotation.x = Math.PI * 1.25;
  avocado.material.roughness = 0.1;
  scene.add(avocado);
});

// Fox
let fox;
let mixer;
gltfLoader.load("./models/Fox/gLTF/Fox.gltf", (gltf) => {
  fox = gltf.scene;
  fox.scale.set(0.02, 0.02, 0.02);
  fox.position.set(2, -13, 0);
  fox.rotation.y = Math.PI * 1.75;
  mixer = new THREE.AnimationMixer(fox);
  const action = mixer.clipAction(gltf.animations[2]);
  console.log(action);
  action.play();
  scene.add(fox);
});

// ScrollY
let scrollY = 0;
let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.floor(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;
    switch (currentSection) {
      case 0:
        gsap.to(duck.rotation, {
          duration: 1.5,
          ease: "power2.inOut",
          x: "+=6",
          y: "+=3",
        });
      case 1:
        gsap.to(avocado.rotation, {
          duration: 1.5,
          ease: "power2.inOut",
          x: "+=6",
          y: "+=3",
        });
      default:
        return;
    }
  }
});

const renderer = new THREE.WebGLRenderer({
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();
let previosTime = 0;
const tick = () => {
  requestAnimationFrame(tick);

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previosTime;
  previosTime = elapsedTime;

  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  if (duck) {
    duck.rotation.y += 0.01;
  }
  if (avocado) {
    avocado.rotation.y += 0.01;
  }
  camera.position.y = -scrollY * 0.007;
  if (mixer) {
    mixer.update(deltaTime);
  }
  renderer.render(scene, camera);
};

tick();
