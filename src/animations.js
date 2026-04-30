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

function initHero() {
  const tl = gsap.timeline({ delay: 2.4 });
  tl.from('.hero-badge', { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' })
    .from('.char-wrap', { y: '120%', opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.18 }, '-=0.3')
    .from('.hero-subtitle', { opacity: 0, y: 25, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .from('.hero-buttons .btn', { opacity: 0, y: 25, scale: 0.9, duration: 0.6, stagger: 0.12, ease: 'back.out(1.7)' }, '-=0.3')
    .from('.hero-stats-row', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.2')
    .from('.scroll-indicator', { opacity: 0, duration: 0.8 }, '-=0.2');
}

function initNavScroll() {
  const nav = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => nav.classList.toggle('scrolled', self.progress > 0),
  });
  document.querySelectorAll('.section, .hero-section').forEach(section => {
    ScrollTrigger.create({
      trigger: section, start: 'top center', end: 'bottom center',
      onEnter: () => setActive(section.id),
      onEnterBack: () => setActive(section.id),
    });
  });
}

function setActive(id) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const a = document.querySelector(`.nav-link[data-section="${id}"]`);
  if (a) a.classList.add('active');
}

function initScrollReveals() {
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
    });
  });
  gsap.utils.toArray('.about-text, .contact-desc, .contact-info').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 0, y: 30, duration: 0.7, ease: 'power3.out',
    });
  });
}

function initServiceCards() {
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 90%' },
      opacity: 0, y: 60, scale: 0.95, duration: 0.7, delay: i * 0.08, ease: 'power3.out',
    });
  });
}

function initProcessCards() {
  gsap.utils.toArray('.process-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 88%' },
      opacity: 0, y: 50, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
    });
  });
}

function initTestimonials() {
  gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 88%' },
      opacity: 0, y: 40, duration: 0.6, delay: i * 0.12, ease: 'power3.out',
    });
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
  gsap.utils.toArray('.form-group').forEach((g, i) => {
    gsap.from(g, {
      scrollTrigger: { trigger: g, start: 'top 92%' },
      opacity: 0, y: 25, duration: 0.5, delay: i * 0.08, ease: 'power3.out',
    });
  });
}
