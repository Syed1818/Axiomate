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
  const tl = gsap.timeline({ delay: 0.2 });
  tl.from('.cmd-palette', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' })
    .from('.title-line', { y: '100%', opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, '-=0.4')
    .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .from('.hero-buttons .btn', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.5');
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
      scrollTrigger: { trigger: el, start: 'top 85%' },
      opacity: 0, y: 40, duration: 1, ease: 'power3.out',
    });
  });
  gsap.utils.toArray('.about-text, .contact-desc, .contact-info').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      opacity: 0, y: 20, duration: 1, ease: 'power3.out',
    });
  });
}

function initServiceCards() {
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%' },
      opacity: 0, y: 40, duration: 1, delay: i * 0.05, ease: 'power4.out',
    });
  });
}

function initProcessCards() {
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 85%' },
      opacity: 0, x: item.classList.contains('right-align') ? 50 : -50,
      duration: 0.8, ease: 'power3.out',
    });
  });
}

function initTestimonials() {
  gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 88%' },
      opacity: 0, scale: 0.8, rotationZ: i % 2 === 0 ? -5 : 5, duration: 0.8, delay: i * 0.15, ease: 'back.out(1.2)',
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
