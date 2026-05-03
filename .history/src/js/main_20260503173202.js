import Lenis from 'lenis';
import { Application } from '@splinetool/runtime';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

// ===== SPLINE 3D SCROLL BACKGROUND =====
function initSplineScroll() {
  const canvas = document.getElementById('global-canvas');
  if (!canvas) return;

  const app = new Application(canvas);
  app.load('https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode').then(() => {
    // 1. Extract the main 3D objects
    const axiomEngine = app.findObjectByName('AxiomEngine') || app.scene;
    const splineCamera = app.findObjectByName('Camera');

    // 2. Create a master GSAP timeline tied to the whole page scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, 
      }
    });

    // Sequence the animations across the scroll
    tl.to(axiomEngine.scale, { x: 1.2, y: 1.2, z: 1.2, ease: "none", duration: 1 }, 0)
      .to(axiomEngine.rotation, { y: Math.PI, ease: "none", duration: 1 }, 0);

    if (splineCamera) {
      tl.to(splineCamera.position, { z: splineCamera.position.z - 400, ease: "none", duration: 1 }, 1);
    }

    tl.to(axiomEngine.position, { x: axiomEngine.position.x + 500, ease: "none", duration: 1 }, 2)
      .to(axiomEngine.scale, { x: 0.8, y: 0.8, z: 0.8, ease: "none", duration: 1 }, 2);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initActiveNavOnLoad();
  initThemeToggle();
  initSplineScroll();
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
    
    // Show Preloader transition
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.remove('hidden');
      const canvas = document.getElementById('matrix-canvas');
      if (canvas) startHolographicForgePreloader(canvas, null, true); // Fast transition for routing
      
      try {
        // Fetch new page and wait for the preloader animation simultaneously
        const [response] = await Promise.all([
          fetch(url.href),
          new Promise(res => setTimeout(res, 800))
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

        // Hide preloader and update ScrollTrigger
        if (preloader) preloader.classList.add('hidden');
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('SPA routing failed:', error);
        window.location.href = url.href; // Fallback to hard reload
      }
    } else {
      window.location.href = url.href;

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
});
}

