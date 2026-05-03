import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initGlobalScene } from './three-scene.js';
import { initAnimations, refreshAnimations } from './animations.js';
import {
  initThemeToggle, initMobileMenu, initCursorSystem,
  initTiltCards, initMagneticButtons, initSoundEffects,
  initSpotlight, initGlitchEffect, initActiveNavOnLoad
} from './interactions.js';

gsap.registerPlugin(ScrollTrigger);

// ===== SMOOTH SCROLL =====
const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ===== PRELOADER — INTERACTIVE HACKER BOOT =====
let matrixAnimId;

function startMatrixEffect(canvas) {
  if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}";
  const fontSize = window.innerWidth < 768 ? 12 : 16;
  const columns = Math.floor(canvas.width / fontSize) + 1;
  const drops = Array(columns).fill(1);

  function draw() {
    // Creates the translucent trailing effect
    ctx.fillStyle = "rgba(5, 6, 14, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#06b6d4"; // Axiomate cyan
    ctx.font = fontSize + "px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    matrixAnimId = requestAnimationFrame(draw);
  }
  draw();
  
  if (!canvas.dataset.resizeBound) {
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    canvas.dataset.resizeBound = "true";
  }
}

// ===== INITIAL BOOT PRELOADER =====
function initPreloader() {
  const enterBtn = document.getElementById('pl-enter-btn');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      const plIntro = document.getElementById('pl-intro');
      const plBoot = document.getElementById('pl-boot');
      const canvas = document.getElementById('matrix-canvas');
      const preloader = document.getElementById('preloader');
      const termOutput = document.getElementById('terminal-output');

      if (plIntro) plIntro.classList.add('hidden');
      if (plBoot) plBoot.classList.remove('hidden');
      if (canvas) startMatrixEffect(canvas);
      if (termOutput) termOutput.innerHTML = '<div style="color: #06b6d4">> System booting...</div><div style="color: #10b981">> Access Granted.</div>';

      setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
        refreshAnimations();
      }, 1500);
    });
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initActiveNavOnLoad();
  initThemeToggle();
  initGlobalScene('global-canvas');
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
      const plIntro = document.getElementById('pl-intro');
      const plBoot = document.getElementById('pl-boot');
      if (plIntro) plIntro.classList.add('hidden');
      if (plBoot) plBoot.classList.remove('hidden');
      
      const termOutput = document.getElementById('terminal-output');
      if (termOutput) {
        termOutput.innerHTML = `<div style="color: #06b6d4">> Routing secure connection to ${url.pathname}...</div>`;
      }
  
      const canvas = document.getElementById('matrix-canvas');
      if (canvas) startMatrixEffect(canvas);
      
      setTimeout(() => { window.location.href = url.href; }, 800);
    } else {
      window.location.href = url.href;
    }
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
