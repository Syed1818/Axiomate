import * as THREE from 'three';

export function initPreloaderScene() {
  const canvas = document.getElementById('pl-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 40;

  // Particles — start in a wide explosion, spiral inward
  const COUNT = 600;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT * 4); // angle, radius, speed, phase

  const palette = [
    new THREE.Color(0x6366f1),
    new THREE.Color(0xa855f7),
    new THREE.Color(0x06b6d4),
    new THREE.Color(0x818cf8),
  ];

  for (let i = 0; i < COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * 40;
    positions[i * 3]     = Math.cos(theta) * r;
    positions[i * 3 + 1] = Math.sin(theta) * r;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

    const c = palette[i % palette.length];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    seeds[i * 4]     = theta;
    seeds[i * 4 + 1] = r;
    seeds[i * 4 + 2] = 0.3 + Math.random() * 0.7;
    seeds[i * 4 + 3] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 1.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Connection lines
  const LINE_MAX = 200;
  const linePos = new Float32Array(LINE_MAX * 6);
  const lineCol = new Float32Array(LINE_MAX * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const clock = new THREE.Clock();
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const pos = geo.attributes.position.array;

    // Spiral inward over time (converge by t=2.5s)
    const convergeFactor = Math.min(1, t / 2.5);
    const targetR = 8 * (1 - convergeFactor) + 0.5;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const angle = seeds[i * 4] + t * seeds[i * 4 + 2] * 1.5;
      const baseR = seeds[i * 4 + 1];
      const r = baseR * (1 - convergeFactor * 0.85) + targetR;

      const tx = Math.cos(angle) * r;
      const ty = Math.sin(angle) * r;
      const tz = Math.sin(t * 0.5 + seeds[i * 4 + 3]) * (5 * (1 - convergeFactor));

      pos[i3]     += (tx - pos[i3]) * 0.04;
      pos[i3 + 1] += (ty - pos[i3 + 1]) * 0.04;
      pos[i3 + 2] += (tz - pos[i3 + 2]) * 0.04;
    }
    geo.attributes.position.needsUpdate = true;

    // Connection lines
    let li = 0;
    const check = Math.min(COUNT, 120);
    for (let i = 0; i < check && li < LINE_MAX; i++) {
      for (let j = i + 1; j < check && li < LINE_MAX; j++) {
        const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
        const d2 = dx*dx + dy*dy + dz*dz;
        if (d2 < 60) {
          const idx = li * 6;
          const fade = (1 - d2 / 60) * 0.5;
          linePos[idx]   = pos[i*3];   linePos[idx+1] = pos[i*3+1]; linePos[idx+2] = pos[i*3+2];
          linePos[idx+3] = pos[j*3];   linePos[idx+4] = pos[j*3+1]; linePos[idx+5] = pos[j*3+2];
          lineCol[idx] = 0.4*fade; lineCol[idx+1] = 0.4*fade; lineCol[idx+2] = 0.9*fade;
          lineCol[idx+3] = 0.4*fade; lineCol[idx+4] = 0.4*fade; lineCol[idx+5] = 0.9*fade;
          li++;
        }
      }
    }
    lineGeo.setDrawRange(0, li * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    points.rotation.z = t * 0.08;
    lines.rotation.z = t * 0.08;
    mat.opacity = 0.5 + convergeFactor * 0.4;

    renderer.render(scene, camera);
  }
  animate();

  // Cleanup when preloader hides
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.classList.contains('hidden')) {
        cancelAnimationFrame(animId);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
        lineGeo.dispose();
        lineMat.dispose();
        observer.disconnect();
        break;
      }
    }
  });
  const preloader = document.getElementById('preloader');
  if (preloader) observer.observe(preloader, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
