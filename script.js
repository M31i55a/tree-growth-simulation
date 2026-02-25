import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'lil-gui';
import { Tree } from './classes/Tree.js';

// --- Configuration & UI Parameters ---
const params = {
  minDist: 5,
  maxDist: 160,
  branchLen: 5,
  leafCount: 2600,
  initialRadius: 4.5,
  radiusDecay: 0.97,
  maxBranches: 6000,
  ambientIntensity: 0.4,
  dirIntensity: 3,
  trunkColor: '#8b4513',
  leafColor: '#00ff80',
  branchCount: 0,
  showSphere: false,
  sphereRadius: 143,
//   showLeaves: true,
  generateTree: () => generateTree()
};

// --- Main Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(350, 250, 450);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const treeGroup = new THREE.Group();
scene.add(treeGroup);

// Floor & Grid
const floorGeo = new THREE.PlaneGeometry(1500, 1500);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.5 });
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const gridHelper = new THREE.GridHelper(1500, 50, 0x444444, 0x222222);
gridHelper.position.y = 0.1;
scene.add(gridHelper);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, params.ambientIntensity);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, params.dirIntensity);
dirLight.position.set(200, 600, 200);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -500;
dirLight.shadow.camera.right = 500;
dirLight.shadow.camera.top = 500;
dirLight.shadow.camera.bottom = -500;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 150, 0);
controls.enableDamping = true;

// --- Growth State ---
let isGrowing = false;

// --- Metallic Sphere ---
let sphere = null;

function createSphere() {
  const geometry = new THREE.IcosahedronGeometry(params.sphereRadius, 6);
  const material = new THREE.MeshStandardMaterial({
    color: 0x55aa66,
    metalness: 0.8,
    roughness: 0.75
  });
  sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.position.y = 140;
  treeGroup.add(sphere);
}

function toggleSphere() {
  if (params.showSphere) {
    if (!sphere) createSphere();
    sphere.visible = true;
  } else {
    if (sphere) sphere.visible = false;
  }
}

function toggleLeaves() {
  tree.leafPoints.visible = params.showLeaves;
}

let tree = new Tree(treeGroup, params);

// --- GUI ---
const gui = new GUI({ title: 'Tree Simulation' });

const growthFolder = gui.addFolder('Growth Controls');
growthFolder.add(params, 'maxBranches', 100, 10000, 100).name('Max Branches');
growthFolder.add(params, 'minDist', 1, 30).name('Min Dist (Reach)');
growthFolder.add(params, 'maxDist', 50, 400).name('Max Dist (View)');
growthFolder.add(params, 'leafCount', 100, 10000, 100).name('Leaf Quantity');
growthFolder.add(params, 'branchCount').name('Current Branches').listen().disable();

const styleFolder = gui.addFolder('Visual Style');
styleFolder.add(params, 'initialRadius', 0.5, 15).name('Trunk Width');
styleFolder.add(params, 'radiusDecay', 0.8, 0.99).name('Taper Rate');
styleFolder.addColor(params, 'trunkColor').name('Trunk Color');
// styleFolder.addColor(params, 'leafColor').name('Leaf Color');
// styleFolder.add(params, 'showLeaves').name('Show Leaves').onChange(toggleLeaves);
styleFolder.add(params, 'showSphere').name('Metallic Sphere').onChange(toggleSphere);

const lightFolder = gui.addFolder('Environment');
lightFolder.add(params, 'ambientIntensity', 0, 2).name('Ambient').onChange(v => ambientLight.intensity = v);
lightFolder.add(params, 'dirIntensity', 0, 10).name('Sun Intensity').onChange(v => dirLight.intensity = v);

gui.add(params, 'generateTree').name('GENERATE TREE');

function generateTree() {
  treeGroup.clear();
  sphere = null;
  tree = new Tree(treeGroup, params);
  isGrowing = true;
  tree.leafPoints.visible = false; // Hide leaves during growth
  if (params.showSphere) {
    createSphere();
  }
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  
  // Grow only when isGrowing flag is true
  if (isGrowing) {
    // Grow if leaves exist AND we are under the branch limit
    if (tree.leaves.length > 0 && tree.branches.length < params.maxBranches) {
      tree.grow();
    } else {
      // Growth complete
      isGrowing = false;
      if (params.showLeaves) {
        tree.leafPoints.visible = true;
      }
    }
  }

  // Handle wireframe to material animation (1 second delay)
  const now = Date.now();
  const wireframeVisibleDuration = 1000; // 1 second in milliseconds
  
  treeGroup.traverse((child) => {
    if (child.userData && child.userData.createdAt) {
      const elapsedTime = now - child.userData.createdAt;
      
      if (child.userData.isWireframe) {
        // Wireframe appears immediately, fades out after delay
        child.visible = elapsedTime < wireframeVisibleDuration;
      } else if (!child.userData.isWireframe && child.material && child.material.color) {
        // Material appears after delay
        child.visible = elapsedTime >= wireframeVisibleDuration;
      }
    }
  });

  treeGroup.rotation.y += 0.003;
  controls.update();
  renderer.render(scene, camera);
}

animate();
