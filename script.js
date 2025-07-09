import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// === Scene Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.set(0, 200, 500);

// === Stars Background ===
function createStars() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 5000; i++) {
    vertices.push((Math.random() - 0.5) * 2000);
    vertices.push((Math.random() - 0.5) * 2000);
    vertices.push((Math.random() - 0.5) * 2000);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}
createStars();

// === Lighting (optional — not needed with MeshBasicMaterial)
scene.add(new THREE.AmbientLight(0xffffff));

// === Planet Data ===
const planetsData = {
  Mercury: { color: 0x888888, radius: 3, distance: 50, speed: 0.04 },
  Venus:   { color: 0xe6c8a8, radius: 5, distance: 80, speed: 0.015 },
  Earth:   { color: 0x3399ff, radius: 5.5, distance: 110, speed: 0.01 },
  Mars:    { color: 0xaa5533, radius: 4.5, distance: 140, speed: 0.008 },
  Jupiter: { color: 0xffcc88, radius: 12, distance: 180, speed: 0.004 },
  Saturn:  { color: 0xf0e68c, radius: 10, distance: 220, speed: 0.002 },
  Uranus:  { color: 0x66ffff, radius: 9, distance: 260, speed: 0.0012 },
  Neptune: { color: 0x3366ff, radius: 8.5, distance: 300, speed: 0.001 },
};

const planets = {};
const speedControls = {};
const ui = document.getElementById('controls');

// === Sun ===
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(20, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xFDB813 })
);
scene.add(sun);

// === Create Planets and Orbits ===
Object.entries(planetsData).forEach(([name, { color, radius, distance, speed }]) => {
  // Planet material — always visible
  const material = new THREE.MeshBasicMaterial({ color });

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material);
  planets[name] = { mesh: sphere, distance, angle: 0, speed };
  sphere.position.x = distance;
  scene.add(sphere);

  // Orbit ring (fully visible, no transparency)
  const orbitGeo = new THREE.RingGeometry(distance - 0.2, distance + 0.2, 64);
  const orbitMat = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1
  });
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

 

  // UI speed slider
  const label = document.createElement('label');
  label.textContent = `${name} Speed: `;
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '0.1';
  slider.step = '0.001';
  slider.value = speed;
  slider.addEventListener('input', () => {
    planets[name].speed = parseFloat(slider.value);
  });
  label.appendChild(slider);
  ui.appendChild(label);

  speedControls[name] = slider;
});

// === Animation Loop ===
let paused = false;
function animate() {
  if (!paused) {
    Object.values(planets).forEach(p => {
      p.angle += p.speed;
      p.mesh.position.x = Math.cos(p.angle) * p.distance;
      p.mesh.position.z = Math.sin(p.angle) * p.distance;
      p.mesh.rotation.y += 0.01;
    });
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// === Pause/Resume Buttons ===
document.getElementById('pauseBtn').addEventListener('click', () => {
  paused = true;
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('resumeBtn').disabled = false;
});
document.getElementById('resumeBtn').addEventListener('click', () => {
  paused = false;
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('resumeBtn').disabled = true;
});

// === Handle Window Resize ===
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
