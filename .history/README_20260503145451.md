# Axiomate Tech Services - Website

## Overview
Axiomate is an enterprise-grade technology services website featuring a highly interactive, 3D-accelerated frontend. It showcases services ranging from Web Development to AI/ML and Cloud DevOps.

## Tech Stack
- **Build Tool:** Vite
- **Animations:** GSAP (with ScrollTrigger)
- **Smooth Scrolling:** Lenis
- **3D Graphics:** Three.js (Custom particle morphing scenes)
- **Styling:** Vanilla CSS (Modularized)

## Project Structure
```text
c:\Users\DELL\Downloads\AxiomateWeb\
├── public/                   # Static assets (logos, images, favicons)
├── *.html                    # Core HTML pages (index, about, process, contact, etc.)
├── package.json              # Build configuration
├── vite.config.js            # Build configuration
└── src/
    ├── js/                   # JavaScript logic modules
    │   ├── main.js           # Application entry point, Preloader, and Router
    │   ├── animations.js     # GSAP ScrollTrigger animations
    │   ├── interactions.js   # UI elements (Cursor, Theme, Spotlight, Tilt, Nav)
    │   └── three-scene.js    # Global Three.js particle system and morph logic
    └── styles/               # Modular CSS directory
        ├── style.css         # Main stylesheet entry (imports modules)
        ├── core.css          # Design Tokens, Themes, Reset, Base Utilities
        ├── layout.css        # Preloader, Navbar, Footer components
        ├── pages.css         # Page-specific layouts (Hero, Bento Grid, Timeline)
        └── effects.css       # Marquee, Glitch, Cursor, Ambient Orbs
```

## Key Features & Architecture

1. **Seamless Page Transitions (SPA-like routing):**
   Located in `src/main.js`. A custom JS router intercepts link clicks, triggers the "Hacker Boot" preloader animation, fetches the requested HTML page, and swaps out the `<section>` and `<nav>` tags without triggering a hard browser reload.

2. **Interactive 3D Background:**
   Located in `src/three-scene.js`. A persistent global Three.js canvas runs behind the content. As the user scrolls into different sections, custom events (`scrollSceneUpdate` and `morphScene`) are fired, causing the 3D particle system to morph into different shapes (Neural Net, DNA, Globe, Matrix).

3. **Fluid Animations:**
   Located in `src/animations.js`. GSAP manages scroll-based reveals, stagger effects, and counters. Optimized to avoid heavy CSS filters (`blur`) during scroll events to maintain a snappy 60fps experience.

4. **Micro-Interactions:**
   Located in `src/interactions.js`. Handles the cyberpunk glitch effects, custom trailing cursor, magnetic buttons, 3D tilt cards, and audio hover effects.

## Recent Optimizations
- Modularized massive monolithic `style.css` and `main.js` files into domain-specific modules.
- Fixed GSAP ScrollTrigger desynchronization with Lenis.
- Standardized Navbar and Footer partials across all sub-pages.
- Removed heavy inline styles from sub-pages (e.g., `web-development.html`, `ai-ml.html`) and replaced them with the reusable `.service-detail-card` class.