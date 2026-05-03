import * as THREE from 'three';
import { gsap } from 'gsap';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export function startHolographicForgePreloader(canvas, onComplete, fastMode = false) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 45); // Slightly elevated view

  // Ambient & Directional Lighting for the solid metal text later
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0x00d2ff, 2.5);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  // --- 1. The Environment (The Forge) ---
  const forgeGroup = new THREE.Group();
  scene.add(forgeGroup);

  // Glowing Torus Ring
  const ringGeo = new THREE.TorusGeometry(18, 0.4, 32, 100);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x000000, emissive: 0x00d2ff, emissiveIntensity: 2.5, transparent: true
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -8;
  forgeGroup.add(ring);

  // Volumetric Light Cone Custom Shader
  const coneGeo = new THREE.CylinderGeometry(20, 12, 30, 64, 1, true);
  const coneMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 0.6 } },
    vertexShader: `
      varying vec3 vLocalPosition;
      void main() {
        vLocalPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      varying vec3 vLocalPosition;
      void main() {
        // Fade out smoothly from bottom (-15.0) to top (+15.0)
        float light = smoothstep(15.0, -15.0, vLocalPosition.y);
        gl_FragColor = vec4(0.0, 0.82, 1.0, light * 0.25 * uOpacity);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.y = 7;
  forgeGroup.add(cone);

  const clock = new THREE.Clock();
  let animId;
  const textGroup = new THREE.Group();
  scene.add(textGroup);

  // --- Load Font and Build Text Layers ---
  const fontLoader = new FontLoader();
  fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new TextGeometry('AXIOMATE', {
      font: font, size: 4.5, height: 1.5, curveSegments: 12,
      bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1, bevelSegments: 4
    });
    
    textGeo.center();
    textGeo.computeBoundingBox();
    const minY = textGeo.boundingBox.min.y;
    const maxY = textGeo.boundingBox.max.y;

    // Act I: The 3D Print Particle System
    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uPrintProgress: { value: minY - 2.0 },
        uColor: { value: new THREE.Color(0x00d2ff) },
        uOpacity: { value: 1.0 }
      },
      vertexShader: `
        varying float vY;
        void main() {
          vY = position.y;
          gl_PointSize = 3.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uPrintProgress;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vY;
        void main() {
          if (vY > uPrintProgress) discard;
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          gl_FragColor = vec4(uColor, uOpacity);
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(textGeo, particleMat);
    textGroup.add(particles);

    // Act II: Solid Metal Mesh
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.95, roughness: 0.1, transparent: true, opacity: 0.0
    });
    const solidMesh = new THREE.Mesh(textGeo, solidMat);
    textGroup.add(solidMesh);

    // Act II: The Scanner
    const scannerGeo = new THREE.PlaneGeometry(40, 40);
    const scannerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.rotation.x = -Math.PI / 2;
    scanner.position.y = maxY + 2;
    textGroup.add(scanner);

    // --- Master GSAP Timeline Orchestration ---
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
    if (fastMode) tl.timeScale(8);

    // Seq 1: 3D Print the particles upward
    tl.to(particleMat.uniforms.uPrintProgress, { value: maxY + 0.5, duration: 3.5, ease: "power1.inOut" })
      .to({}, { duration: 0.5 }); // Short hold

    // Seq 2: The Scanner sweeps down & Solidifies the mesh
    tl.to(scannerMat, { opacity: 0.9, duration: 0.3 })
      .to(scanner.position, { y: minY - 1.0, duration: 1.8, ease: "power2.inOut" }, "-=0.1")
      .to(solidMat, { opacity: 1.0, duration: 1.0 }, "-=1.5")
      .to(particleMat.uniforms.uOpacity, { value: 0.0, duration: 1.0 }, "-=1.5")
      .to(scannerMat, { opacity: 0.0, duration: 0.3 });

    // Seq 3: The UI Handoff (Animate to top-left Navbar position)
    // Calculating a rough world coordinate mapping for top-left
    tl.to([ringMat, coneMat.uniforms.uOpacity], { opacity: 0, value: 0, duration: 1.0 }, "+=0.2")
      .to(textGroup.position, { x: -22, y: 15, z: -10, duration: 1.5, ease: "power3.inOut" }, "-=0.6")
      .to(textGroup.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 1.5, ease: "power3.inOut" }, "<");

    function animate() {
      animId = requestAnimationFrame(animate);
      ring.rotation.z += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  });

  // Setup Cleanup Watcher
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.classList.contains('hidden')) {
        if (animId) cancelAnimationFrame(animId);
        renderer.dispose();
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
