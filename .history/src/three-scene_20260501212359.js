import * as THREE from 'three';

export function initGlobalScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // ── Renderer ──────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 60);

  // ── Color Palettes ─────────────────────────────────────────────────────────
  const PALETTES = {
    hero:     [new THREE.Color(0x6366f1), new THREE.Color(0xa855f7), new THREE.Color(0x06b6d4)],  // Indigo / Purple / Cyan
    services: [new THREE.Color(0x10b981), new THREE.Color(0x06b6d4), new THREE.Color(0x3b82f6)],  // Emerald / Cyan / Blue
    about:    [new THREE.Color(0xf59e0b), new THREE.Color(0xef4444), new THREE.Color(0xec4899)],  // Amber / Red / Pink
    process:  [new THREE.Color(0x8b5cf6), new THREE.Color(0x3b82f6), new THREE.Color(0x06b6d4)],  // Violet / Blue / Cyan
    clients:  [new THREE.Color(0x10b981), new THREE.Color(0x6366f1), new THREE.Color(0xf59e0b)],  // Multi
    contact:  [new THREE.Color(0x6366f1), new THREE.Color(0xa855f7), new THREE.Color(0x10b981)],  // Purple / Indigo / Emerald
  };

  // ── Particle system ─────────────────────────────────────────────────────────
  const COUNT = 2200;
  const positions  = new Float32Array(COUNT * 3);
  const colors     = new Float32Array(COUNT * 3);
  const targets    = new Float32Array(COUNT * 3);
  const velocities = new Float32Array(COUNT * 3); // used for organic drift

  // Seed random per-particle drift offsets
  const driftSeeds = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) driftSeeds[i] = Math.random() * Math.PI * 2;

  // ── Shape Generators ──────────────────────────────────────────────────────
  // 1. NEURAL NETWORK  – clustered node groups + connections (hero)
  function genNeuralNet(arr, count) {
    const layers = [6, 9, 12, 9, 6];
    const totalNodes = layers.reduce((a, b) => a + b, 0);
    const layerW = 48, layerH = 24;
    let idx = 0;
    layers.forEach((nodes, li) => {
      for (let n = 0; n < nodes; n++) {
        const x = (li / (layers.length - 1) - 0.5) * layerW;
        const y = (n / (nodes - 1) - 0.5) * layerH;
        arr[idx * 3]     = x + (Math.random() - 0.5) * 2;
        arr[idx * 3 + 1] = y + (Math.random() - 0.5) * 2;
        arr[idx * 3 + 2] = (Math.random() - 0.5) * 10;
        idx++;
      }
    });
    // Fill remaining with scattered "signal" dots
    for (; idx < count; idx++) {
      arr[idx * 3]     = (Math.random() - 0.5) * 60;
      arr[idx * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[idx * 3 + 2] = (Math.random() - 0.5) * 20;
    }
  }

  // 2. CODE / DATA MATRIX  – falling columns (services)
  function genCodeMatrix(arr, count) {
    const cols = 30, colH = 50;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols) % Math.ceil(count / cols);
      arr[i * 3]     = (col / cols - 0.5) * 70;
      arr[i * 3 + 1] = (Math.random()) * colH - colH / 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
  }

  // 3. GLOBE / MESH  – latitude-longitude grid (about)
  function genGlobe(arr, count) {
    const R = 22;
    for (let i = 0; i < count; i++) {
      const phi   = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      arr[i * 3]     = R * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = R * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = R * Math.cos(phi);
    }
  }

  // 4. DNA DOUBLE HELIX  – two interleaved spirals (process)
  function genDNA(arr, count) {
    const height = 55, R = 12, turns = 6;
    for (let i = 0; i < count; i++) {
      const t     = i / count;
      const angle = t * Math.PI * 2 * turns;
      const strand = i % 3; // 0 or 1 = strands, 2 = rung particles
      if (strand === 2) {
        // rungs – connect the two strands
        const runT = Math.floor(i / 3) / (count / 3);
        const runA = runT * Math.PI * 2 * turns;
        const mix  = (i % 30) / 30;
        const x1 = R * Math.cos(runA), x2 = -R * Math.cos(runA);
        const z1 = R * Math.sin(runA), z2 = -R * Math.sin(runA);
        arr[i * 3]     = x1 + (x2 - x1) * mix;
        arr[i * 3 + 1] = (runT - 0.5) * height;
        arr[i * 3 + 2] = z1 + (z2 - z1) * mix;
      } else {
        const sign = strand === 0 ? 1 : -1;
        arr[i * 3]     = sign * R * Math.cos(angle);
        arr[i * 3 + 1] = (t - 0.5) * height;
        arr[i * 3 + 2] = sign * R * Math.sin(angle);
      }
    }
  }

  // 5. CLOUD NODES  – organic floating clusters (testimonials)
  function genCloudNodes(arr, count) {
    // Multiple Gaussian clusters
    const clusters = [
      { cx: -20, cy: 10, cz: -5 },
      { cx: 15,  cy: -8, cz: 5 },
      { cx: 5,   cy: 15, cz: -10 },
      { cx: -10, cy: -15, cz: 8 },
      { cx: 22,  cy: 2,  cz: 0 },
    ];
    for (let i = 0; i < count; i++) {
      const cl = clusters[i % clusters.length];
      const r  = Math.abs(gaussRand()) * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = cl.cx + r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = cl.cy + r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = cl.cz + r * Math.cos(phi);
    }
  }

  // 6. TORUS KNOT  – contact page
  function genTorusKnot(arr, count) {
    const R = 16, r = 7, p = 3, q = 2;
    for (let i = 0; i < count; i++) {
      const t  = (i / count) * Math.PI * 2;
      const qx = Math.cos(q * t) * (R + r * Math.cos(p * t));
      const qy = Math.sin(q * t) * (R + r * Math.cos(p * t));
      const qz = r * Math.sin(p * t);
      arr[i * 3]     = qx;
      arr[i * 3 + 1] = qy;
      arr[i * 3 + 2] = qz;
    }
  }

  function gaussRand() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Pre-compute all shape arrays
  const shapes = {
    neural:    new Float32Array(COUNT * 3),
    matrix:    new Float32Array(COUNT * 3),
    globe:     new Float32Array(COUNT * 3),
    dna:       new Float32Array(COUNT * 3),
    cloud:     new Float32Array(COUNT * 3),
    torusKnot: new Float32Array(COUNT * 3),
  };
  genNeuralNet(shapes.neural,    COUNT);
  genCodeMatrix(shapes.matrix,   COUNT);
  genGlobe(shapes.globe,         COUNT);
  genDNA(shapes.dna,             COUNT);
  genCloudNodes(shapes.cloud,    COUNT);
  genTorusKnot(shapes.torusKnot, COUNT);

  // Scroll sections  → shape & palette mapping
  const SECTIONS = [
    { shape: 'neural',    palette: 'hero',     label: 'Neural Network'  },
    { shape: 'matrix',    palette: 'services', label: 'Code Matrix'     },
    { shape: 'globe',     palette: 'about',    label: 'Globe Mesh'      },
    { shape: 'dna',       palette: 'process',  label: 'DNA Helix'       },
    { shape: 'cloud',     palette: 'clients',  label: 'Cloud Nodes'     },
    { shape: 'torusKnot', palette: 'contact',  label: 'Torus Knot'      },
  ];

  // Initialize positions with first shape
  for (let i = 0; i < COUNT * 3; i++) {
    positions[i] = shapes.neural[i];
    targets[i]   = shapes.neural[i];
  }

  // ── Color initialization (fill array before geo is created) ────────────────
  const heroPal = PALETTES.hero;
  for (let i = 0; i < COUNT; i++) {
    const c = heroPal[i % heroPal.length];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  // ── Geometry & Material ───────────────────────────────────────────────────
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  function applyPalette(palKey) {
    const pal = PALETTES[palKey];
    for (let i = 0; i < COUNT; i++) {
      const c = pal[i % pal.length];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
  }

  const mat = new THREE.PointsMaterial({
    size: 1.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── Connection Lines ───────────────────────────────────────────────────────
  const LINE_MAX = 800;
  const linePos = new Float32Array(LINE_MAX * 6);
  const lineCol = new Float32Array(LINE_MAX * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ── HUD Rings ─────────────────────────────────────────────────────────────
  const hudGroup = new THREE.Group();
  const ringRadii = [12, 18, 25, 33];
  ringRadii.forEach((r, i) => {
    const curve = new THREE.EllipseCurve(0, 0, r, r * 0.6, 0, Math.PI * (0.8 + i * 0.4), false);
    const pts = curve.getPoints(100);
    const g   = new THREE.BufferGeometry().setFromPoints(pts);
    const m   = new THREE.LineBasicMaterial({
      color: PALETTES.hero[i % 3],
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Line(g, m);
    ring.rotation.x = Math.PI * (0.1 + i * 0.15);
    ring.userData.rotSpeed = (0.05 + i * 0.015) * (i % 2 === 0 ? 1 : -1);
    hudGroup.add(ring);
  });
  scene.add(hudGroup);

  // ── Section label HUD ─────────────────────────────────────────────────────
  let currentSectionIndex  = 0;
  let currentColorPalette  = 'hero';
  let colorTransitionTimer = 0;
  let targetPalette        = 'hero';
  const nextColors         = new Float32Array(COUNT * 3);

  // ── State ─────────────────────────────────────────────────────────────────
  const state = {
    scroll: 0,
    mouse: { x: 0, y: 0, tx: 0, ty: 0 },
    morphT: 0, // global lerp t for smooth section transitions
  };

  // ── Mouse ─────────────────────────────────────────────────────────────────
  window.addEventListener('mousemove', e => {
    state.mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    state.mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Scroll tracking ───────────────────────────────────────────────────────
  function updateScroll(y) {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    state.scroll = docH > 0 ? Math.min(1, y / docH) : 0;
    checkSectionChange();
  }
  window.addEventListener('scroll', () => updateScroll(window.scrollY), { passive: true });

  function checkSectionChange() {
    // Section index = which sixth of the page we're in
    const idx = Math.min(SECTIONS.length - 1, Math.floor(state.scroll * SECTIONS.length));
    if (idx !== currentSectionIndex) {
      currentSectionIndex = idx;
      const sec = SECTIONS[idx];

      // Set morph targets
      const sh = shapes[sec.shape];
      for (let i = 0; i < COUNT * 3; i++) targets[i] = sh[i];

      // Prepare next color palette
      targetPalette = sec.palette;
      const pal = PALETTES[targetPalette];
      for (let i = 0; i < COUNT; i++) {
        const c = pal[i % pal.length];
        nextColors[i * 3]     = c.r;
        nextColors[i * 3 + 1] = c.g;
        nextColors[i * 3 + 2] = c.b;
      }
      colorTransitionTimer = 0;

      // Update HUD ring colors
      hudGroup.children.forEach((ring, i) => {
        ring.material.color = PALETTES[sec.palette][i % 3];
        ring.material.needsUpdate = true;
      });

      // Update section indicator
      updateSectionIndicator(sec.label, idx);
    }
  }

  // ── Section Indicator DOM element ─────────────────────────────────────────
  function updateSectionIndicator(label, idx) {
    let el = document.getElementById('scroll-section-indicator');
    if (!el) {
      el = document.createElement('div');
      el.id = 'scroll-section-indicator';
      el.style.cssText = `
        position: fixed; right: 32px; top: 50%; transform: translateY(-50%);
        z-index: 100; display: flex; flex-direction: column; gap: 10px;
        align-items: flex-end; pointer-events: none;
      `;
      document.body.appendChild(el);

      SECTIONS.forEach((s, i) => {
        const dot = document.createElement('div');
        dot.className = 'si-dot';
        dot.style.cssText = `
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.25); transition: all 0.4s ease;
          position: relative;
        `;
        el.appendChild(dot);
      });

      const lbl = document.createElement('div');
      lbl.id = 'si-label';
      lbl.style.cssText = `
        position: fixed; right: 52px; top: 50%;
        font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
        letter-spacing: 2px; text-transform: uppercase;
        color: rgba(255,255,255,0.4); transform: translateY(-50%) rotate(-90deg);
        transform-origin: center; white-space: nowrap; pointer-events: none;
        z-index: 100; transition: opacity 0.4s;
      `;
      document.body.appendChild(lbl);
    }

    const dots = document.querySelectorAll('.si-dot');
    dots.forEach((d, i) => {
      d.style.width  = i === idx ? '10px' : '6px';
      d.style.height = i === idx ? '10px' : '6px';
      d.style.background = i === idx ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)';
    });

    const lbl = document.getElementById('si-label');
    if (lbl) {
      lbl.style.opacity = '0';
      setTimeout(() => {
        lbl.textContent = label;
        lbl.style.opacity = '1';
      }, 200);
    }
  }
  // Initial indicator
  updateSectionIndicator(SECTIONS[0].label, 0);

  // ── Resize ────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Route change (SPA) ────────────────────────────────────────────────────
  window.addEventListener('routeChange', () => {
    updateScroll(window.scrollY);
  });

  // ── Animation Loop ────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const CONNECTION_DISTANCE_SQ = 100;
  const MOUSE_REPEL_R = 14;
  const MORPH_SPEED = 0.025;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const s = state.scroll;

    // Smooth mouse
    state.mouse.x += (state.mouse.tx - state.mouse.x) * 0.04;
    state.mouse.y += (state.mouse.ty - state.mouse.y) * 0.04;

    // Mouse world position
    const mwx = state.mouse.x * 28;
    const mwy = state.mouse.y * 20;

    // Particle morph + drift + repulsion
    const pos = geo.attributes.position.array;
    const col = geo.attributes.color.array;
    colorTransitionTimer = Math.min(1, colorTransitionTimer + 0.012);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const ds0 = driftSeeds[i3], ds1 = driftSeeds[i3 + 1], ds2 = driftSeeds[i3 + 2];

      // Lerp toward target shape
      pos[i3]     += (targets[i3]     - pos[i3])     * MORPH_SPEED;
      pos[i3 + 1] += (targets[i3 + 1] - pos[i3 + 1]) * MORPH_SPEED;
      pos[i3 + 2] += (targets[i3 + 2] - pos[i3 + 2]) * MORPH_SPEED;

      // Organic micro-drift
      pos[i3]     += Math.sin(t * 0.35 + ds0) * 0.018;
      pos[i3 + 1] += Math.cos(t * 0.28 + ds1) * 0.018;
      pos[i3 + 2] += Math.sin(t * 0.22 + ds2) * 0.012;

      // Mouse repulsion
      const dx = pos[i3] - mwx, dy = pos[i3 + 1] - mwy;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_REPEL_R * MOUSE_REPEL_R && d2 > 0.001) {
        const d    = Math.sqrt(d2);
        const f    = (MOUSE_REPEL_R - d) / MOUSE_REPEL_R * 0.12;
        pos[i3]     += (dx / d) * f * 3;
        pos[i3 + 1] += (dy / d) * f * 3;
      }

      // Smooth color blend between palettes
      if (colorTransitionTimer < 1) {
        const ct = colorTransitionTimer;
        col[i3]     += (nextColors[i3]     - col[i3])     * ct * 0.04;
        col[i3 + 1] += (nextColors[i3 + 1] - col[i3 + 1]) * ct * 0.04;
        col[i3 + 2] += (nextColors[i3 + 2] - col[i3 + 2]) * ct * 0.04;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    // Connection lines — only sample first N particles for perf
    let li = 0;
    const CHECK = Math.min(COUNT, 200);
    for (let i = 0; i < CHECK && li < LINE_MAX; i++) {
      for (let j = i + 1; j < CHECK && li < LINE_MAX; j++) {
        const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
        const d2 = dx*dx + dy*dy + dz*dz;
        if (d2 < CONNECTION_DISTANCE_SQ) {
          const idx = li * 6;
          linePos[idx]   = pos[i*3];   linePos[idx+1] = pos[i*3+1]; linePos[idx+2] = pos[i*3+2];
          linePos[idx+3] = pos[j*3];   linePos[idx+4] = pos[j*3+1]; linePos[idx+5] = pos[j*3+2];
          const fade = (1 - d2 / CONNECTION_DISTANCE_SQ) * 0.7;
          // Use current particle color tinted
          lineCol[idx]   = col[i*3]   * fade;
          lineCol[idx+1] = col[i*3+1] * fade;
          lineCol[idx+2] = col[i*3+2] * fade;
          lineCol[idx+3] = col[j*3]   * fade;
          lineCol[idx+4] = col[j*3+1] * fade;
          lineCol[idx+5] = col[j*3+2] * fade;
          li++;
        }
      }
    }
    lineGeo.setDrawRange(0, li * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate    = true;

    // Camera tilt from mouse
    camera.position.x += (state.mouse.x * 6 - camera.position.x) * 0.03;
    camera.position.y += (state.mouse.y * 4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    // Slow global rotation
    points.rotation.y = t * 0.03 + state.mouse.x * 0.2;
    points.rotation.x = state.mouse.y * 0.08;
    lines.rotation.copy(points.rotation);

    // HUD rings spin
    hudGroup.children.forEach(ring => {
      ring.rotation.z += ring.userData.rotSpeed * 0.006;
    });

    // Opacity based on scroll (slight fade in middle of scroll)
    mat.opacity = 0.55 + s * 0.35;

    renderer.render(scene, camera);
  }
  animate();
}
