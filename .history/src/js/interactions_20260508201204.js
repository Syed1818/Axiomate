export function initSoundEffects() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  function playHoverSound() {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }
  document.querySelectorAll('a, button, .service-card, .service-detail-card, .process-card').forEach(el => { el.addEventListener('mouseenter', playHoverSound); });
}

export function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  
  function updateIcon(theme) {
    if (theme === 'light') {
      btn.innerHTML = `<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else {
      btn.innerHTML = `<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>`;
    }
  }

  const saved = localStorage.getItem('axiomate-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    updateIcon(saved);
    setTimeout(() => window.dispatchEvent(new CustomEvent('theme-changed', { detail: saved })), 10);
  }
  
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('axiomate-theme', next);
    updateIcon(next);
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: next }));
  });
}

export function initSpotlight() {
  document.body.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.service-card, .service-detail-card, .process-card, .about-grid, .contact-grid, .testimonial-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}

export function initGlitchEffect() {
  setInterval(() => {
    const titles = document.querySelectorAll('.hero-title, .section-title');
    if (Math.random() > 0.7 && titles.length > 0) {
      const title = titles[Math.floor(Math.random() * titles.length)];
      title.classList.add('glitch-active');
      setTimeout(() => title.classList.remove('glitch-active'), 150 + Math.random() * 200);
    }
  }, 2500);
}

export function initMobileMenu() {
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

export function initCursorSystem() {
  if (window.innerWidth < 768) return;
  const glow = document.getElementById('cursor-glow'), dot = document.getElementById('cursor-dot');
  if (!glow || !dot) return;
  let mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  function animateCursor() {
    gx += (mx - gx) * 0.08; gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  document.querySelectorAll('a, button, .service-card, .service-detail-card, .stat-card, .process-card, .testimonial-card, input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hovering');
      glow.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hovering');
      glow.classList.remove('hovering');
    });
  });
}

export function initTiltCards() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.transform = `perspective(800px) rotateY(${((e.clientX - rect.left) / rect.width - 0.5) * 10}deg) rotateX(${((e.clientY - rect.top) / rect.height - 0.5) * -10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

export function initMagneticButtons() {
  if (window.innerWidth < 768) return;
  document.querySelectorAll('.magnetic-btn, .nav-link').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.3}px, ${(e.clientY - rect.top - rect.height / 2) * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

export function initActiveNavOnLoad() {
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const currentPath = window.location.pathname;

  // Clear all active states first
  navLinks.forEach(link => link.classList.remove('active'));

  // Find the best match for the current page
  let bestMatch = null;
  navLinks.forEach(link => {
    const linkUrl = new URL(link.href);
    // Check for exact path match, but ignore for root/index
    if (linkUrl.pathname !== '/' && linkUrl.pathname !== '/index.html' && linkUrl.pathname === currentPath) {
      bestMatch = link;
    }
  });

  if (bestMatch) {
    bestMatch.classList.add('active');
  } else {
    // Default to the 'Home' link if no other match is found (we are on the homepage)
    const homeLink = document.querySelector('.nav-link[data-section="hero"]');
    if (homeLink) homeLink.classList.add('active');
  }
}