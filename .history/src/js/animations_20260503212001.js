import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  initHero();
  initNavScroll();
  initScrollReveals();
  initServiceCards();
  initProcessCards();
  initCounters();
  initTestimonials();
  initContactForm();
}

export function cleanupAnimations() {
  ScrollTrigger.getAll().forEach(t => t.kill());
  gsap.globalTimeline.clear();
}

export function refreshAnimations() {
  ScrollTrigger.refresh();
}

function initHero() {
  if (!document.querySelector('.hero-title')) return;
  const tl = gsap.timeline({ delay: 0.2 });
  tl.from('.cmd-palette', { opacity: 0, y: 30, rotationX: -20, duration: 1, ease: 'expo.out' })
    .from('.title-line', { y: '120%', rotationZ: 2, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.15 }, '-=0.6')
    .from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, ease: 'expo.out' }, '-=0.8')
    .from('.hero-buttons .btn', { opacity: 0, y: 20, scale: 0.95, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)' }, '-=0.6');
}

function initNavScroll() {
  const nav = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => nav.classList.toggle('scrolled', self.progress > 0),
  });

  // Global scroll progress for 3D opacity/rotation dynamics
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      window.dispatchEvent(new CustomEvent('scrollSceneUpdate', { detail: { progress: self.progress } }));
    }
  });

  const getSceneMapping = (section) => {
    const mappings = {
      'hero': { shape: 'neural', palette: 'hero', label: 'Neural Network' },
      'services': { shape: 'matrix', palette: 'services', label: 'Code Matrix' },
      'about': { shape: 'globe', palette: 'about', label: 'Globe Mesh' },
      'process': { shape: 'dna', palette: 'process', label: 'DNA Helix' },
      'testimonials': { shape: 'cloud', palette: 'clients', label: 'Cloud Nodes' },
      'contact': { shape: 'torusKnot', palette: 'contact', label: 'Torus Knot' }
    };
    
    // Find exact mapping based on the section ID first
    if (section.id && mappings[section.id]) return mappings[section.id];
    
    // Fallback logic for standalone subpages based on their URL
    const path = window.location.pathname;
    if (path.includes('about')) return mappings['about'];
    if (path.includes('process')) return mappings['process'];
    if (path.includes('testimonials')) return mappings['testimonials'];
    if (path.includes('contact')) return mappings['contact'];
    if (path.includes('ai-ml') || path.includes('cloud') || path.includes('mobile') || path.includes('web')) return mappings['services'];
    
    return mappings['hero'];
  };

  document.querySelectorAll('.section, .hero-section, .contact-hero-section').forEach(section => {
    const mapping = getSceneMapping(section);
    
    ScrollTrigger.create({
      trigger: section, start: 'top center', end: 'bottom center',
      onEnter: () => {
        setActive(section.id);
        window.dispatchEvent(new CustomEvent('morphScene', { detail: mapping }));
      },
      onEnterBack: () => {
        setActive(section.id);
        window.dispatchEvent(new CustomEvent('morphScene', { detail: mapping }));
      },
    });
  });
}

function setActive(id) {
  // This scroll-spy logic is only for the homepage which uses data-section attributes.
  if (!document.querySelector('.nav-link[data-section]')) return;

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const a = document.querySelector(`.nav-link[data-section="${id}"]`);
  if (a) a.classList.add('active');
}

function initScrollReveals() {
  // Group basic reveals by section to stagger them cleanly
  gsap.utils.toArray('.section, .contact-hero-section').forEach(section => {
    const reveals = section.querySelectorAll('.reveal-up, .about-text, .contact-desc, .contact-info, .about-feature');
    if (reveals.length === 0) return;
    
    gsap.from(reveals, {
      scrollTrigger: { trigger: section, start: 'top 80%' },
      opacity: 0,
      y: 50,
      rotationX: -15, // 3D fold-up effect
      transformOrigin: 'top center',
      duration: 1.2,
      stagger: 0.15,
      ease: 'expo.out'
    });
  });
}

function initServiceCards() {
  gsap.utils.toArray('.services-grid, .services-bento').forEach(grid => {
    const cards = grid.querySelectorAll('.service-card');
    if (cards.length === 0) return;
    
    gsap.fromTo(cards, 
      { opacity: 0, y: 80, scale: 0.9, rotationY: 15 },
      {
        scrollTrigger: { trigger: grid, start: 'top 85%' },
        opacity: 1,
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'expo.out',
        clearProps: 'all'
      }
    );
  });
}

function initProcessCards() {
  // For the vertical timeline layout
  gsap.utils.toArray('.timeline-item').forEach((item) => {
    const dot = item.querySelector('.timeline-dot');
    const content = item.querySelector('.timeline-content');
    const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 85%' } });
    
    if (dot) tl.from(dot, { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2.5)' });
    
    if (content) {
      tl.from(content, { 
        opacity: 0, 
        x: item.classList.contains('right-align') ? 80 : -80,
        rotationY: item.classList.contains('right-align') ? -10 : 10,
        duration: 1, 
        ease: 'expo.out' 
      }, '-=0.4');
    }
  });

  // For standard process-cards layout grid
  gsap.utils.toArray('.process-cards').forEach(grid => {
    gsap.from(grid.querySelectorAll('.process-card'), {
      scrollTrigger: { trigger: grid, start: 'top 80%' },
      opacity: 0, y: 50, scale: 0.95, duration: 1, stagger: 0.15, ease: 'back.out(1.2)'
    });
  });
}

function initTestimonials() {
  gsap.utils.toArray('.testimonials-track').forEach(track => {
    const cards = track.querySelectorAll('.testimonial-card');
    if (cards.length === 0) return;
    
    gsap.fromTo(cards, 
      { opacity: 0, scale: 0.85, y: 50, rotationZ: -2 },
      {
        scrollTrigger: { trigger: track, start: 'top 85%' },
        opacity: 1, 
        scale: 1, 
        y: 0, 
        rotationZ: 0,
        duration: 1, 
        stagger: 0.2, 
        ease: 'elastic.out(1, 0.8)',
        clearProps: 'all'
      }
    );
  });
}

function initCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(el, {
          duration: 2, ease: 'power2.out', textContent: target,
          snap: { textContent: 1 },
          modifiers: { textContent: v => Math.round(v) },
        });
      }
    });
  });

  // Hero counters
  document.querySelectorAll('.hero-stat-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    gsap.to(el, {
      delay: 3.2, duration: 2, ease: 'power2.out', textContent: target,
      snap: { textContent: 1 },
      modifiers: { textContent: v => Math.round(v) },
    });
  });
}

function initContactForm() {
  gsap.utils.toArray('.contact-form').forEach(form => {
    const inputs = form.querySelectorAll('.form-group, .btn-submit');
    if (inputs.length === 0) return;
    
    gsap.from(inputs, {
      scrollTrigger: { trigger: form, start: 'top 85%' },
      opacity: 0, x: -30, duration: 0.8, stagger: 0.15, ease: 'power3.out'
    });
  });

  // Register individual service detail cards on sub-pages
  gsap.utils.toArray('.service-detail-card').forEach(card => {
    gsap.fromTo(card,
      { opacity: 0, y: 60, scale: 0.98 },
      {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out', clearProps: 'all'
      }
    );
  });
}
