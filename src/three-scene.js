import * as THREE from 'three';

export function initGlobalScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 55;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const COLOR_1 = new THREE.Color(0x0284c7); // Deep Blue
  const COLOR_2 = new THREE.Color(0x06b6d4); // Cyan
  const COLOR_3 = new THREE.Color(0x22d3ee); // Light Cyan
  
  // Darker palette for light theme
  const LIGHT_COLOR_1 = new THREE.Color(0x0369a1); // Ocean Blue
  const LIGHT_COLOR_2 = new THREE.Color(0x0891b2); // Deep Cyan
  const LIGHT_COLOR_3 = new THREE.Color(0x0284c7); // Blue

  // === STATE ===
  const state = { scroll: 0, mouse: { x: 0, y: 0, tx: 0, ty: 0 }, isLight: false };

  // === PARTICLES (morphable) ===
  const COUNT = 1500;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const targets = new Float32Array(COUNT * 3); // morph target
  const basePositions = new Float32Array(COUNT * 3); // original

  // Shape generators
  function genSphere(arr, count, radius) {
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      arr[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      arr[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
  }

  function genTorus(arr, count, R, r) {
    for (let i = 0; i < count; i++) {
      const u = (i / count) * Math.PI * 2;
      const v = ((i * 7) % count / count) * Math.PI * 2;
      arr[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
      arr[i * 3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
      arr[i * 3 + 2] = r * Math.sin(v);
    }
  }

  function genHelix(arr, count, radius, height, turns) {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 2 * turns;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = (t - 0.5) * height;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
  }

  function genGrid(arr, count, size) {
    const side = Math.ceil(Math.sqrt(count));
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / side);
      const col = i % side;
      arr[i * 3] = (col / side - 0.5) * size;
      arr[i * 3 + 1] = (row / side - 0.5) * size;
      arr[i * 3 + 2] = Math.sin(col * 0.3) * Math.cos(row * 0.3) * 4;
    }
  }

  function genExplosion(arr, count, radius) {
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.3 + Math.random() * 0.7);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
  }

  // Precompute all shapes
  const shapes = {
    sphere: new Float32Array(COUNT * 3),
    torus: new Float32Array(COUNT * 3),
    helix: new Float32Array(COUNT * 3),
    grid: new Float32Array(COUNT * 3),
    explosion: new Float32Array(COUNT * 3),
  };
  genSphere(shapes.sphere, COUNT, 20);
  genTorus(shapes.torus, COUNT, 18, 6);
  genHelix(shapes.helix, COUNT, 15, 50, 5);
  genGrid(shapes.grid, COUNT, 55);
  genExplosion(shapes.explosion, COUNT, 30);

  // Start with sphere
  for (let i = 0; i < COUNT * 3; i++) {
    positions[i] = shapes.sphere[i];
    basePositions[i] = shapes.sphere[i];
    targets[i] = shapes.sphere[i];
  }

  // Colors
  const palette = [COLOR_1, COLOR_2, COLOR_3];
  for (let i = 0; i < COUNT; i++) {
    const c = palette[i % 3];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 1.8, vertexColors: true, transparent: true, opacity: 0.65,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // === THEME SWITCHING ===
  function applyTheme() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    state.isLight = light;
    const p = light ? [LIGHT_COLOR_1, LIGHT_COLOR_2, LIGHT_COLOR_3] : [COLOR_1, COLOR_2, COLOR_3];
    const ca = geo.attributes.color.array;
    for (let i = 0; i < COUNT; i++) {
      const c = p[i % 3];
      ca[i*3] = c.r; ca[i*3+1] = c.g; ca[i*3+2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
    mat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    mat.opacity = light ? 0.8 : 0.65;
    mat.needsUpdate = true;
    lineMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    lineMat.opacity = light ? 0.2 : 0.12;
    lineMat.needsUpdate = true;
    hudGroup.children.forEach((arc, i) => {
      arc.material.color = light ? (i % 2 === 0 ? LIGHT_COLOR_2 : LIGHT_COLOR_1) : (i % 2 === 0 ? COLOR_2 : COLOR_1);
      arc.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      arc.material.opacity = light ? 0.15 : 0.08;
      arc.material.needsUpdate = true;
    });
    glowMat.color = light ? LIGHT_COLOR_2 : COLOR_2;
    glowMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    glowMat.needsUpdate = true;
  }
  // Watch for theme changes
  const obs = new MutationObserver(applyTheme);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // Initial apply
  setTimeout(applyTheme, 100);

  // === CONNECTION LINES ===
  const LINE_MAX = 600;
  const linePos = new Float32Array(LINE_MAX * 6);
  const lineCol = new Float32Array(LINE_MAX * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // === HUD RINGS (always present, subtle) ===
  const hudGroup = new THREE.Group();
  [14, 20, 27, 34].forEach((r, i) => {
    const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * (1 + i * 0.3), false);
    const pts = curve.getPoints(80);
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? COLOR_2 : COLOR_1,
      transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    const arc = new THREE.Line(g, m);
    arc.userData = { speed: (0.06 + i * 0.02) * (i % 2 === 0 ? 1 : -1) };
    hudGroup.add(arc);
  });
  scene.add(hudGroup);

  // === CENTRAL GLOW ===
  const glowGeo = new THREE.CircleGeometry(3, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: COLOR_2, transparent: true, opacity: 0.04,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glow);

  // === MOUSE ===
  window.addEventListener('mousemove', (e) => {
    state.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // === SCROLL ===
  function updateScroll(scrollY) {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    state.scroll = docH > 0 ? scrollY / docH : 0;
  }
  window.addEventListener('scroll', () => updateScroll(window.scrollY), { passive: true });

  // === RESIZE ===
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // === SCROLL-BASED SHAPE MORPHING ===
  let currentShape = 'sphere';
  function getTargetShape(scroll) {
    const path = window.location.pathname;
    if (path.includes('404')) return 'explosion';
    if (path.includes('ai-ml')) return 'helix';
    if (path.includes('cloud-devops')) return 'grid';
    if (path.includes('web-development')) return 'torus';
    if (path.includes('mobile-apps')) return 'sphere';

    if (scroll < 0.15) return 'sphere';
    if (scroll < 0.35) return 'torus';
    if (scroll < 0.55) return 'helix';
    if (scroll < 0.75) return 'grid';
    return 'explosion';
  }

  // === ANIMATE ===
  const clock = new THREE.Clock();

  // Force shape update on route change
  window.addEventListener('routeChange', () => {
    const routeShape = getTargetShape(state.scroll);
    if (routeShape !== currentShape) {
      currentShape = routeShape;
      for (let i = 0; i < COUNT * 3; i++) {
        targets[i] = shapes[currentShape][i];
      }
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const s = state.scroll;

    // Smooth mouse
    state.mouse.x += (state.mouse.tx - state.mouse.x) * 0.03;
    state.mouse.y += (state.mouse.ty - state.mouse.y) * 0.03;

    // Determine target shape from scroll
    const newShape = getTargetShape(s);
    if (newShape !== currentShape) {
      currentShape = newShape;
      for (let i = 0; i < COUNT * 3; i++) {
        targets[i] = shapes[currentShape][i];
      }
    }

    // Morph particles toward target + add organic movement
    const pos = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      // Lerp toward target
      pos[i3] += (targets[i3] - pos[i3]) * 0.02;
      pos[i3 + 1] += (targets[i3 + 1] - pos[i3 + 1]) * 0.02;
      pos[i3 + 2] += (targets[i3 + 2] - pos[i3 + 2]) * 0.02;

      // Add subtle organic floating
      pos[i3] += Math.sin(t * 0.3 + i * 0.01) * 0.02;
      pos[i3 + 1] += Math.cos(t * 0.4 + i * 0.015) * 0.02;

      // Mouse repulsion (cursor pushes particles away)
      const mx = state.mouse.x * 25;
      const my = state.mouse.y * 20;
      const dx = pos[i3] - mx;
      const dy = pos[i3 + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) {
        const force = (12 - dist) * 0.08;
        pos[i3] += (dx / dist) * force;
        pos[i3 + 1] += (dy / dist) * force;
      }
    }
    geo.attributes.position.needsUpdate = true;

    // Update connections
    let li = 0;
    const lp = lineGeo.attributes.position.array;
    const lc = lineGeo.attributes.color.array;
    const check = Math.min(COUNT, 180);
    for (let i = 0; i < check && li < LINE_MAX; i++) {
      for (let j = i + 1; j < check && li < LINE_MAX; j++) {
        const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
        const d = dx*dx + dy*dy + dz*dz;
        if (d < 80) {
          const idx = li * 6;
          lp[idx]=pos[i*3]; lp[idx+1]=pos[i*3+1]; lp[idx+2]=pos[i*3+2];
          lp[idx+3]=pos[j*3]; lp[idx+4]=pos[j*3+1]; lp[idx+5]=pos[j*3+2];
          const fade = 1 - d / 80;
          const lr = state.isLight ? 0.03 : 0.02, lg = state.isLight ? 0.57 : 0.71, lb = state.isLight ? 0.70 : 0.83;
          lc[idx]=lr*fade; lc[idx+1]=lg*fade; lc[idx+2]=lb*fade;
          lc[idx+3]=lr*fade; lc[idx+4]=lg*fade; lc[idx+5]=lb*fade;
          li++;
        }
      }
    }
    lineGeo.setDrawRange(0, li * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    // Camera + group rotation based on mouse
    points.rotation.y = t * 0.04 + state.mouse.x * 0.4;
    points.rotation.x = state.mouse.y * 0.15;
    lines.rotation.copy(points.rotation);

    // HUD rings
    hudGroup.children.forEach(arc => {
      arc.rotation.z += arc.userData.speed * 0.008;
    });
    // Fade HUD with scroll (more visible at top)
    hudGroup.children.forEach(arc => {
      arc.material.opacity = Math.max(0.02, 0.1 * (1 - s * 0.5));
    });

    // Glow pulse
    const gs = 1 + Math.sin(t * 1.2) * 0.2;
    glow.scale.set(gs, gs, 1);
    glow.material.opacity = 0.03 + Math.sin(t * 1.8) * 0.02;

    // Opacity shifts as you scroll
    mat.opacity = 0.5 + s * 0.3;

    renderer.render(scene, camera);
  }
  animate();
}
