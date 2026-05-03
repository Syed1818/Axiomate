import { Application } from '@splinetool/runtime';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize Spline Application
const canvas = document.getElementById('bg-canvas');
const app = new Application(canvas);

// Load the Spline Scene
// REPLACE THIS URL with your actual exported Spline public URL
app.load('https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode').then(() => {
  
  // 1. Extract the main 3D objects
  // REPLACE 'AxiomEngine' with the exact name of your grouped object in the Spline Outliner
  const axiomEngine = app.findObjectByName('AxiomEngine') || app.scene;
  
  // Extract the Camera (Ensure you have a camera named 'Camera' in your Spline scene)
  const splineCamera = app.findObjectByName('Camera');

  // 2. Create a master GSAP timeline tied to the whole page scroll
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: 'main',
      start: 'top top',     // Start animation when main hits the top of viewport
      end: 'bottom bottom', // End animation when main hits the bottom of viewport
      scrub: 1,             // 1-second smoothing effect on the scroll scrub
    }
  });

  // --- Sequence the Animations ---
  // Using absolute position parameters (0, 1, 2) to evenly distribute transitions across the 4 sections

  // A. Hero -> Services
  tl.to(axiomEngine.scale, { x: 1.2, y: 1.2, z: 1.2, ease: "none", duration: 1 }, 0)
    .to(axiomEngine.rotation, { y: Math.PI, ease: "none", duration: 1 }, 0);

  // B. Services -> Process
  if (splineCamera) {
    tl.to(splineCamera.position, { z: splineCamera.position.z - 400, ease: "none", duration: 1 }, 1);
  }

  // C. Process -> Footer
  tl.to(axiomEngine.position, { x: axiomEngine.position.x + 500, ease: "none", duration: 1 }, 2)
    .to(axiomEngine.scale, { x: 0.8, y: 0.8, z: 0.8, ease: "none", duration: 1 }, 2);
});