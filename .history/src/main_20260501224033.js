import Lenis from 'lenis';
import { initGlobalScene } from './three-scene.js';
import { initAnimations, cleanupAnimations } from './animations.js';

// ===== SMOOTH SCROLL =====
const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

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
    canvas.dataset.resizeBound = 'true';
  }
}

function typeLine(text, container, color, glow, callback) {
  const line = document.createElement('div');
  if (color) line.style.color = color;
  if (glow) line.style.textShadow = `0 0 10px ${color}`;
  container.appendChild(line);
  
  let i = 0;
  line.textContent = "> ";
  
  const interval = setInterval(() => {
    line.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 25); // Hacker typing speed
}

function startTerminalBoot() {
  const output = document.getElementById('terminal-output');
  const sequence = [
    { text: "Booting Axiomate OS v9.4.1...", delay: 300 },
    { text: "Establishing secure connection [200 OK]", delay: 400 },
    { text: "Bypassing mainframe security protocols...", delay: 400 },
    { text: "Decrypting neural pathways...", delay: 300 },
    { text: "Loading 3D environments...", delay: 200 },
    { text: "Access Granted.", delay: 500, color: "#10b981", glow: true },
    { text: "Welcome to Axiomate.", delay: 800, color: "#06b6d4", glow: true }
  ];
  
  let step = 0;
  function nextStep() {
    if (step >= sequence.length) {
      setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('hidden');
        if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
      }, 800);
      return;
    }
    
    const current = sequence[step];
    typeLine(current.text, output, current.color, current.glow, () => {
      setTimeout(() => { step++; nextStep(); }, current.delay);
    });
  }
  nextStep();
}

const enterBtn = document.getElementById('pl-enter-btn');
if (enterBtn) {
  enterBtn.addEventListener('click', () => {
    document.getElementById('pl-intro').classList.add('hidden');
    document.getElementById('pl-boot').classList.remove('hidden');
    startMatrixEffect(document.getElementById('matrix-canvas'));
    startTerminalBoot();
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initGlobalScene('global-canvas');
  initAnimations();
  initMobileMenu();
  initCursorSystem();
  initSmoothLinks();
  initTiltCards();
  initMagneticButtons();
  initSoundEffects();
  initSpotlight();
  initGlitchEffect();
  initRouter();
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
        termOutput.innerHTML = '<div style="color: #06b6d4">> Routing secure connection...</div>';
      }
      startMatrixEffect(document.getElementById('matrix-canvas'));
    }

    try {
      const response = await fetch(url.href);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Update Title & URL
      document.title = doc.title;
      history.pushState(null, '', url.href);

      // Kill old GSAP animations to prevent bugs on new pages
      cleanupAnimations();

      // Remove current content sections
      document.querySelectorAll('section, .marquee-strip, footer').forEach(el => el.remove());

      // Insert new content
      const newContent = doc.querySelectorAll('section, .marquee-strip, footer');
      const scriptTag = document.querySelector('script[type="module"]');
      newContent.forEach(el => {
        document.body.insertBefore(el, scriptTag);
      });

      // Update Navbar
      const newNav = doc.querySelector('#navbar');
      if (newNav) {
        document.querySelector('#navbar').innerHTML = newNav.innerHTML;
        initMobileMenu();
        initThemeToggle();
      }

      // Re-initialize interactions
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
      initAnimations();
      initTiltCards();
      initMagneticButtons();
      initFormHandler();
      initSoundEffects();
      initSmoothLinks();

      // Trigger custom event so Three.js knows to update its shape based on URL
      window.dispatchEvent(new Event('routeChange'));

      setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
        if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
      }, 600);
    } catch (err) {
      console.error(err);
      window.location.href = url.href; // Fallback hard reload
    }
  });

  window.addEventListener('popstate', () => {
    window.location.reload();
  });
}

// ===== SOUND EFFECTS =====
function initSoundEffects() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  function playHoverSound() {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Short high-tech "tick" sound
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  document.querySelectorAll('a, button, .service-card, .process-card').forEach(el => {
    el.addEventListener('mouseenter', playHoverSound);
  });
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('axiomate-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('axiomate-theme', next);
  });
}

// ===== FLUENT DESIGN SPOTLIGHT =====
function initSpotlight() {
  document.body.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.service-card, .process-card, .about-grid, .contact-grid, .testimonial-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// ===== CYBERPUNK GLITCH EFFECT =====
function initGlitchEffect() {
  setInterval(() => {
    const titles = document.querySelectorAll('.hero-title, .section-title');
    if (Math.random() > 0.7 && titles.length > 0) {
      const title = titles[Math.floor(Math.random() * titles.length)];
      title.classList.add('glitch-active');
      setTimeout(() => title.classList.remove('glitch-active'), 150 + Math.random() * 200);
    }
  }, 2500);
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
  });
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ===== CURSOR SYSTEM =====
function initCursorSystem() {
  if (window.innerWidth < 768) return;
  const glow = document.getElementById('cursor-glow');
  const dot = document.getElementById('cursor-dot');
  if (!glow || !dot) return;

  let mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  // Smooth follow for glow
  function animateCursor() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover expand on interactive elements
  const interactives = document.querySelectorAll('a, button, .service-card, .stat-card, .process-card, .testimonial-card, input, textarea, select');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('hovering'));
    el.addEventListener('mouseleave', () => dot.classList.remove('hovering'));
  });
}

// ===== TILT CARDS =====
function initTiltCards() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== MAGNETIC BUTTONS =====
function initMagneticButtons() {
  if (window.innerWidth < 768) return;
  document.querySelectorAll('.magnetic-btn, .nav-link').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ===== SMOOTH ANCHOR LINKS =====
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: -80 });
    });
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
        btn.parentElement.style.background = 'linear-gradient(135deg, #059669, #10b981)';
        btn.parentElement.style.boxShadow = '0 0 30px rgba(16,185,129,0.3)';
        form.reset();
      } else {
        btn.textContent = 'Error Sending';
        console.log(result);
      }
    } catch (error) {
      console.log(error);
      btn.textContent = 'Error Sending';
    }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.parentElement.style.background = '';
      btn.parentElement.style.boxShadow = '';
    }, 4000);
  });
}
