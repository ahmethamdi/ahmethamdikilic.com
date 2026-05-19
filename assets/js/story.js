/* AHK / 34devs — story.js
   Apple-style pinned scroll story
   Three.js 3D bag + Lenis smooth scroll + scene controller
   ES module, vanilla
*/

import * as THREE from './vendor/three.module.min.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 879px)').matches;

/* ============================================================
   1. Smooth scroll (Lenis UMD loaded via <script> tag, expose on window)
   ============================================================ */
function initSmoothScroll() {
  if (reduced || mobile) return;
  if (typeof window.Lenis !== 'function') return; // not loaded
  const lenis = new window.Lenis({
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 1,
  });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  window.__lenis = lenis;
}
initSmoothScroll();

/* ============================================================
   2. Three.js scene — Shopify shopping bag (procedural geometry)
   ============================================================ */
const canvas = document.querySelector('[data-story-canvas]');
let renderer, scene, camera, bag, lights = {};

function initThree() {
  if (!canvas || reduced) return;

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 8, 22);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);

  /* === Bag group === */
  bag = new THREE.Group();

  // Main body — a rounded prism shape
  const bagShape = new THREE.Shape();
  const w = 2.2, h = 2.8, r = 0.18;
  bagShape.moveTo(-w + r, -h);
  bagShape.lineTo(w - r, -h);
  bagShape.quadraticCurveTo(w, -h, w, -h + r);
  bagShape.lineTo(w, h - r);
  bagShape.quadraticCurveTo(w, h, w - r, h);
  bagShape.lineTo(-w + r, h);
  bagShape.quadraticCurveTo(-w, h, -w, h - r);
  bagShape.lineTo(-w, -h + r);
  bagShape.quadraticCurveTo(-w, -h, -w + r, -h);

  const bagGeo = new THREE.ExtrudeGeometry(bagShape, {
    depth: 1.3,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.1,
    bevelSegments: 4,
    curveSegments: 12,
  });
  bagGeo.center();

  const bagMat = new THREE.MeshStandardMaterial({
    color: 0x0e0e0e,
    metalness: 0.4,
    roughness: 0.55,
  });
  const bagMesh = new THREE.Mesh(bagGeo, bagMat);
  bag.add(bagMesh);

  // Lime "S" badge on the front — a flat extruded shape
  const sShape = new THREE.Shape();
  // simple block "S" using two rounded rectangles
  // We'll use a circle ring with a cut and another arc, simplified:
  const radius = 0.55;
  const segs = 32;
  sShape.absarc(0, 0, radius, 0, Math.PI * 2, false);

  const sGeo = new THREE.ExtrudeGeometry(sShape, {
    depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 32,
  });
  const sMat = new THREE.MeshStandardMaterial({
    color: 0xc5ff4a,
    emissive: 0xc5ff4a,
    emissiveIntensity: 1.2,
    metalness: 0.2,
    roughness: 0.3,
  });
  const sBadge = new THREE.Mesh(sGeo, sMat);
  sBadge.position.set(0, 0, 0.73);
  bag.add(sBadge);

  // text "S" using sprite/canvas
  const sCanvas = document.createElement('canvas');
  sCanvas.width = 256; sCanvas.height = 256;
  const ctx = sCanvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.font = 'italic 200px "PT Serif", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', 128, 138);
  const sTexture = new THREE.CanvasTexture(sCanvas);
  const sLabelMat = new THREE.MeshBasicMaterial({ map: sTexture, transparent: true });
  const sLabelGeo = new THREE.PlaneGeometry(0.8, 0.8);
  const sLabel = new THREE.Mesh(sLabelGeo, sLabelMat);
  sLabel.position.set(0, 0, 0.83);
  bag.add(sLabel);

  // Handles — two torus arcs at top
  const handleGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 16, Math.PI);
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, metalness: 0.7, roughness: 0.4,
  });
  const handleL = new THREE.Mesh(handleGeo, handleMat);
  handleL.position.set(-0.7, h - 0.05, 0);
  handleL.rotation.x = 0;
  handleL.rotation.z = 0;
  bag.add(handleL);
  const handleR = handleL.clone();
  handleR.position.set(0.7, h - 0.05, 0);
  bag.add(handleR);

  // edge wireframe glow accents
  const edges = new THREE.EdgesGeometry(bagGeo, 30);
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xc5ff4a, transparent: true, opacity: 0.15,
  });
  const edgeLines = new THREE.LineSegments(edges, edgeMat);
  bag.add(edgeLines);

  scene.add(bag);
  bag.rotation.y = -0.4;
  bag.rotation.x = 0.1;

  /* === Lighting === */
  lights.ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(lights.ambient);

  lights.keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  lights.keyLight.position.set(5, 4, 5);
  scene.add(lights.keyLight);

  lights.limeFill = new THREE.PointLight(0xc5ff4a, 2.5, 12, 2);
  lights.limeFill.position.set(-3, 2, 3);
  scene.add(lights.limeFill);

  lights.rimLight = new THREE.DirectionalLight(0x6677ff, 0.4);
  lights.rimLight.position.set(-4, -2, -3);
  scene.add(lights.rimLight);

  // Particles around the bag — subtle floating dots
  const particleCount = 80;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3]   = (Math.random() - 0.5) * 14;
    positions[i*3+1] = (Math.random() - 0.5) * 10;
    positions[i*3+2] = (Math.random() - 0.5) * 8 - 2;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xc5ff4a, size: 0.03, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* === Resize === */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });

  /* === Animation loop === */
  function tick() {
    requestAnimationFrame(tick);
    // breathing micro-motion
    const t = performance.now() * 0.0008;
    bag.rotation.y += 0.0015;
    bag.position.y = Math.sin(t) * 0.08;
    sBadge.rotation.z = Math.sin(t * 0.7) * 0.04;
    sLabel.rotation.z = sBadge.rotation.z;

    // particle drift
    particles.rotation.y += 0.0003;

    renderer.render(scene, camera);
  }
  tick();

  return { bag, camera, lights };
}

const three = initThree();

/* ============================================================
   3. Scroll-driven scene controller
   ============================================================ */
const story = document.querySelector('[data-story]');
const scenes = document.querySelectorAll('[data-scene]');
const progress = document.querySelector('[data-story-progress]');
const dots = document.querySelectorAll('[data-progress-dot]');

if (story && scenes.length && !reduced) {
  let lastProgress = -1;

  function update() {
    const rect = story.getBoundingClientRect();
    const total = story.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const t = scrolled / total;            // 0 → 1 across the whole story
    if (Math.abs(t - lastProgress) < 0.0008) return;
    lastProgress = t;

    /* === Scene activation === */
    const sceneIdx = Math.min(Math.floor(t * scenes.length), scenes.length - 1);
    scenes.forEach((s, i) => s.classList.toggle('is-active', i === sceneIdx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === sceneIdx));

    // scroll-hint hides after first scroll
    if (t > 0.01) story.classList.add('is-scrolled');
    else story.classList.remove('is-scrolled');

    // progress fill
    if (progress) progress.style.height = `${t * 100}%`;

    /* === 3D scene drives === */
    if (three && three.bag && three.camera) {
      // Scene-by-scene camera + rotation
      // Scene 1 (0.0-0.2): far, slow rotate
      // Scene 2 (0.2-0.4): closer, tilt forward
      // Scene 3 (0.4-0.6): wide rotation, expand
      // Scene 4 (0.6-0.8): stabilize, lime intensity up
      // Scene 5 (0.8-1.0): fade back, prep exit

      const z = lerp(9, 5.5, smoothstep(0, 0.6, t));      // closer over time
      const zEnd = lerp(5.5, 7.5, smoothstep(0.7, 1.0, t)); // pull back at end
      three.camera.position.z = t < 0.7 ? z : zEnd;
      three.camera.position.x = Math.sin(t * Math.PI * 2) * 1.2;
      three.camera.position.y = lerp(0, 0.5, t) - Math.sin(t * Math.PI) * 0.3;
      three.camera.lookAt(0, 0, 0);

      // bag base rotation override (per scene)
      three.bag.rotation.x = lerp(0.1, -0.15, t);
      three.bag.rotation.z = Math.sin(t * Math.PI * 3) * 0.06;

      // lime fill intensity ramps with scene 3-4
      if (three.lights && three.lights.limeFill) {
        three.lights.limeFill.intensity = lerp(1.5, 4.5, smoothstep(0.3, 0.7, t));
      }
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(a, b, x) {
    const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  }

  if (window.__lenis) {
    window.__lenis.on('scroll', update);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
