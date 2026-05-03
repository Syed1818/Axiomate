import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import * as THREE from 'three';
import { initAnimations, refreshAnimations } from './animations.js';
import './nav.js';
import './footer.js';
import { startHolographicForgePreloader } from './preloader-scene.js';
import {
  initThemeToggle, initMobileMenu, initCursorSystem,
  initTiltCards, initMagneticButtons, initSoundEffects,
  initSpotlight, initGlitchEffect, initActiveNavOnLoad
} from './interactions.js';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(TextPlugin);

// ===== SMOOTH SCROLL =====
const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ===== INITIAL CINEMATIC PRELOADER =====
function initPreloader() {
  const canvas = document.getElementById('matrix-canvas');
  const preloader = document.getElementById('preloader');

  if (canvas) {
    // Auto-start the cinematic sequence on load
    startHolographicForgePreloader(canvas, () => {
      if (preloader) preloader.classList.add('hidden');
      refreshAnimations();
    }, false);
  }
}

function initSmoothLinks(lenisInstance) {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) lenisInstance.scrollTo(target, { offset: -80 });
    });
  });
}

// ===== 3D AXIOM ENGINE (Three.js Model) =====
function initAxiomEngine() {
  const canvas = document.getElementById('global-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 25; // Initial zoom distance

  // --- 1. Construct the 3D Axiom Engine ---
  const axiomEngine = new THREE.Group();

  // The Inner Core (Glowing Wireframe Icosahedron)
  const coreGeo = new THREE.IcosahedronGeometry(2.5, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    wireframe: true,
    emissive: 0x00d2ff, // Axiomate Cyan
    emissiveIntensity: 1.5
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  axiomEngine.add(core);

  // The Outer Quantum Rings
  const ringGeo = new THREE.TorusGeometry(5, 0.04, 16, 100);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xff3366, // Axiomate Crimson
    emissive: 0xff3366,
    emissiveIntensity: 2
  });
  
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2;
  axiomEngine.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.rotation.y = Math.PI / 2;
  axiomEngine.add(ring2);
  
  const ring3 = new THREE.Mesh(ringGeo, ringMat);
  ring3.rotation.z = Math.PI / 2;
  axiomEngine.add(ring3);

  // Orbital Particle Field
  const particleGeo = new THREE.BufferGeometry();
  const pCount = 800;
  const posArray = new Float32Array(pCount * 3);
  for(let i = 0; i < pCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 30; // Spread particles around
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.15, color: 0x00d2ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  axiomEngine.add(particles);

  // Add entire engine to scene
  scene.add(axiomEngine);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // --- 2. Ambient Animation Loop ---
  function animate() {
    requestAnimationFrame(animate);
    
    // Constant gentle rotation
    core.rotation.y += 0.004;
    core.rotation.x += 0.002;
    ring1.rotation.x += 0.008;
    ring1.rotation.y -= 0.004;
    ring2.rotation.y += 0.008;
    ring2.rotation.z -= 0.004;
    ring3.rotation.z += 0.008;
    ring3.rotation.x -= 0.004;
    particles.rotation.y -= 0.001;
    particles.rotation.z += 0.001;
    
    // Gentle vertical floating effect
    axiomEngine.position.y = Math.sin(Date.now() * 0.001) * 0.5;

    renderer.render(scene, camera);
  }
  animate();

  // --- 3. GSAP ScrollTrigger Orchestration ---
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1, 
    }
  });

  // Sequence the 3D transitions seamlessly across the page scroll
  tl.to(axiomEngine.scale, { x: 1.4, y: 1.4, z: 1.4, ease: "none", duration: 1 }, 0)
    .to(axiomEngine.rotation, { y: Math.PI * 1.5, ease: "none", duration: 1 }, 0)
    
    .to(camera.position, { z: 12, ease: "none", duration: 1 }, 1) // Zoom in tight
    
    // Move to the right on desktop, stay centered on mobile
    .to(axiomEngine.position, { x: window.innerWidth > 768 ? 10 : 0, ease: "none", duration: 1 }, 2) 
    .to(axiomEngine.scale, { x: 0.7, y: 0.7, z: 0.7, ease: "none", duration: 1 }, 2);

  // Handle Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initActiveNavOnLoad();
  initThemeToggle();
  initAxiomEngine();
  initAnimations();
  initMobileMenu();
  initCursorSystem();
  initSmoothLinks(lenis);
  initTiltCards();
  initMagneticButtons();
  initSoundEffects();
  initSpotlight();
  initGlitchEffect();
  initRouter();
  initFormHandler();
});

// ===== SEAMLESS PAGE TRANSITIONS =====
function initRouter() {
  // Recalculate ScrollTrigger offsets once the page layout fully settles
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  document.body.addEventListener('click', async (e) => {
    const a = e.target.closest('a');
    if (!a || !a.href || a.target === '_blank' || a.href.startsWith('mailto:')) return;
    const url = new URL(a.href);
    if (url.origin !== window.location.origin) return;
    
    // If it's just an anchor on the same page, let normal smooth scroll handle it
    if (url.pathname === window.location.pathname && url.hash) return;

    e.preventDefault();
    
    // 1. Create or select the transition curtain overlay
    let transitionOverlay = document.getElementById('page-transition');
    if (!transitionOverlay) {
      transitionOverlay = document.createElement('div');
      transitionOverlay.id = 'page-transition';
      transitionOverlay.className = 'page-transition';
      transitionOverlay.innerHTML = '<div class="transition-logo">Routing...</div>';
      document.body.appendChild(transitionOverlay);
      gsap.set(transitionOverlay, { yPercent: 100 }); // Start hidden below the screen
    }

    try {
      // 2. Animate the curtain up to cover the screen
      await gsap.to(transitionOverlay, { yPercent: 0, duration: 0.6, ease: 'power4.inOut' });

      // 3. Fetch new page (with a tiny artificial delay so the animation stays smooth)
      const [response] = await Promise.all([
        fetch(url.href),
        new Promise(res => setTimeout(res, 400))
      ]);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Update Title & URL
        document.title = doc.title;
        history.pushState(null, '', url.href);

        // Remove old page content (excluding globally persistent web components)
        document.querySelectorAll('section, .brand-ticker').forEach(el => el.remove());

        // Insert new page content just before the footer component
        const newContent = doc.querySelectorAll('section, .brand-ticker');
        const footer = document.querySelector('axiomate-footer');
        newContent.forEach(el => {
          document.body.insertBefore(el, footer);
        });

        // Notify Navbar to update active link inside the web component
        window.dispatchEvent(new Event('route-changed'));

        // Reset scroll and re-initialize interactive components on new elements
        lenis.scrollTo(0, { immediate: true });
        initAnimations();
        initTiltCards();
        initMagneticButtons();
        initSpotlight();
        initSoundEffects();
        initSmoothLinks(lenis);
        initFormHandler();

        ScrollTrigger.refresh();

        // 4. Animate the curtain away to the top
        gsap.to(transitionOverlay, { yPercent: -100, duration: 0.6, ease: 'power4.inOut', onComplete: () => {
          gsap.set(transitionOverlay, { yPercent: 100 }); // Reset position for next navigation
        }});
      } catch (error) {
        console.error('SPA routing failed:', error);
        window.location.href = url.href; // Fallback to hard reload
      }
  });

  // Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    window.location.reload();
  });
}

// ===== FORM HANDLER =====
function initFormHandler() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit span');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });
      const result = await response.json();
      if (response.status == 200) {
        btn.textContent = 'Message Sent! ✓';
        btn.parentElement.classList.add('success');
        form.reset();
      } else {
        btn.textContent = 'Error Sending';
        console.log(result);
        btn.parentElement.classList.add('error');
      }
    } catch (error) {
      console.log(error);
      btn.textContent = 'Error Sending';
      btn.parentElement.classList.add('error');
    }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.parentElement.classList.remove('success', 'error');
    }, 4000);
  });
}
