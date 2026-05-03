import { Application } from '@splinetool/runtime';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);

// Load the generic Spline scene
// Replace this URL with your exported Spline URL: 'https://prod.spline.design/.../scene.splinecode'
app.load('https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode').then(() => {
  
  // --- 1. HANDLE LOADING STATE ---
  const loader = document.getElementById('loader');
  const mainContent = document.getElementById('main-content');

  // Fade out loader and fade in main content
  gsap.to(loader, { 
    opacity: 0, 
    duration: 0.8, 
    ease: "power2.inOut",
    onComplete: () => loader.remove() 
  });
  
  gsap.to(mainContent, { 
    opacity: 1, 
    duration: 1.2, 
    delay: 0.2,
    pointerEvents: 'auto', // Restore pointer events so buttons work
    ease: "power2.out"
  });

  // --- 2. EXTRACT THE 3D OBJECT ---
  // Replace 'HeroObject' with the exact name you gave your layer/object inside the Spline editor.
  // If you want to move the camera instead, you can look for 'Camera'.
  // For this generic fallback, we'll apply it to the entire scene if a specific object isn't found.
  const targetObject = app.findObjectByName('HeroObject') || app.scene;

  // --- 3. SETUP SCROLLTRIGGER TIMELINE ---
  // We tie the progress of this timeline strictly to the scrollbar (scrub: 1)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: mainContent,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1, // Smooth 1-second catch-up delay
    }
  });

  // Animate the object's properties over the course of the scroll.
  // Spline's runtime uses radians for rotation.
  tl.to(targetObject.rotation, {
    y: Math.PI * 2, // Spin 360 degrees on the Y axis
    x: Math.PI / 4, // Tilt slightly on the X axis
    ease: "none"    // 'none' is best for scrubbed animations to maintain a linear scroll relationship
  }, 0) // The '0' ensures this starts at the very beginning of the timeline
  .to(targetObject.position, {
    z: 500, // Move the object closer to the camera
    y: -200, // Move it slightly down
    ease: "none"
  }, 0);

});