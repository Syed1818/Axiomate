import * as THREE from 'three';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

gsap.registerPlugin(TextPlugin);

export function startHolographicForgePreloader(canvas, onComplete, fastMode = false) { // Renamed to startAssistantPreloader
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 25); // Pulled back slightly for the wide logo

  // --- 1. Holographic Logo Model ---
  const logoGroup = new THREE.Group();
  scene.add(logoGroup);

  const logoMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 0.0 }, uAudioPulse: { value: 0.0 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uAudioPulse;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        // Expand vertices slightly outwards for a 3D pulse effect based on audio volume
        vec3 pos = position + normal * (uAudioPulse * 0.4);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uAudioPulse;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        float fresnel = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
        fresnel = pow(fresnel, 2.0); // Softer edge glow
        
        float baseGlow = 0.5; // Base brightness so front faces are clearly visible
        float overallGlow = fresnel + baseGlow;

        // Energy scanline effect running through the logo
        float scanline = sin((vPosition.x + vPosition.y + uTime * 3.0) * 5.0) * 0.2 + 0.8;
        
        vec3 baseColor = vec3(0.0, 0.82, 1.0); // Axiomate Cyan
        vec3 pulseColor = vec3(0.8, 0.95, 1.0); // Hot white-cyan when speaking
        vec3 color = mix(baseColor, pulseColor, uAudioPulse * 1.5);
        
        gl_FragColor = vec4(color * overallGlow * scanline * uIntensity, (overallGlow * 0.8 + 0.2) * scanline * uIntensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const wireMat = new THREE.ShaderMaterial({
    uniforms: logoMat.uniforms, // Share uniforms so animations perfectly sync
    vertexShader: `
      varying vec3 vNormal;
      uniform float uAudioPulse;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        // Expand wireframe slightly further out than the solid mesh (+0.02) to prevent Z-fighting
        vec3 pos = position + normal * (uAudioPulse * 0.4 + 0.02);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uIntensity;
      uniform float uAudioPulse;
      void main() {
        vec3 wireColor = mix(vec3(0.0, 0.4, 0.8), vec3(0.6, 0.9, 1.0), uAudioPulse);
        gl_FragColor = vec4(wireColor * uIntensity, 0.15 * uIntensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    wireframe: true
  });

  const fontLoader = new FontLoader();
  fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new TextGeometry('AXIOMATE', {
      font: font, size: 3.5, height: 0.8, curveSegments: 12,
      bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.05, bevelSegments: 4
    });
    textGeo.center();
    const logoMesh = new THREE.Mesh(textGeo, logoMat);
    logoGroup.add(logoMesh);
    
    const wireMesh = new THREE.Mesh(textGeo, wireMat);
    logoGroup.add(wireMesh);
  });

  // --- 2. Audio Setup ---
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  let analyser;

  // --- 3. Caption UI Elements ---
  const captionBox = document.getElementById('caption-box');
  const captionText = document.getElementById('caption-text');

  const clock = new THREE.Clock();
  let animId;

  // --- 4. Animation Loop ---
  function animate() {
    animId = requestAnimationFrame(animate);
    logoMat.uniforms.uTime.value = clock.getElapsedTime();

    if (analyser) {
      const freq = analyser.getAverageFrequency();
      // Map audio frequency (typically 0-255) to a normalized pulse value (0.0 to 1.0)
      const audioPulse = gsap.utils.mapRange(20, 100, 0.0, 1.0, freq || 0);
      const clampedPulse = Math.max(0, Math.min(1, audioPulse));
      
      // Smooth interpolation for the uniform
      logoMat.uniforms.uAudioPulse.value = gsap.utils.interpolate(logoMat.uniforms.uAudioPulse.value, clampedPulse, 0.25);
      
      // Scale the entire logo group based on the audio volume
      const targetScale = 1.0 + (clampedPulse * 0.15);
      logoGroup.scale.set(
        gsap.utils.interpolate(logoGroup.scale.x, targetScale, 0.2),
        gsap.utils.interpolate(logoGroup.scale.y, targetScale, 0.2),
        gsap.utils.interpolate(logoGroup.scale.z, targetScale, 0.2)
      );
    }

    // Gentle ambient floating and rotation
    logoGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
    logoGroup.rotation.x = Math.cos(clock.getElapsedTime() * 0.4) * 0.05;
    logoGroup.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.5;

    renderer.render(scene, camera);
  }
  animate();

  // --- 5. Master GSAP Timeline ---
  function playPreloaderAnimation() {
    const enterBtn = document.getElementById('enter-btn');

    const tl = gsap.timeline({
      onComplete: () => {
        if (enterBtn && !fastMode) {
          enterBtn.classList.add('visible');
          
          let autoEnterTimeout;
          const proceedToSite = () => {
            clearTimeout(autoEnterTimeout);
            enterBtn.classList.remove('visible');
            if (onComplete) onComplete();
          };

          enterBtn.addEventListener('click', proceedToSite, { once: true });
          
          autoEnterTimeout = setTimeout(proceedToSite, 2000);
        } else if (onComplete) {
          onComplete();
        }
      }
    });

    if (fastMode) {
      // Skip animation for fast routing
      if (onComplete) onComplete();
      return;
    }

    // Speed-matched caption timings
    const captions = [
      { text: "Welcome to Axiomate.", duration: 2.0 },
      { text: "We are a collective of engineers, architects, and innovators.", duration: 3.8, delay: 0.2 },
      { text: "Our mission is to engineer the future.", duration: 2.8, delay: 0.3 },
      { text: "Let's build something extraordinary together.", duration: 3.2, delay: 0.2 }
    ];

    // Build the timeline
    tl.to(logoMat.uniforms.uIntensity, { value: 1.0, duration: 1.5, ease: "power2.out" })
      .to(captionBox, { opacity: 1, duration: 1.0 }, "-=1.0")
      .call(() => {
        // Only try to play if audio successfully loaded
        if (audioReady && sound && sound.buffer) {
          const playAudio = () => { if (!sound.isPlaying) sound.play(); };
          // Attempt to resume the audio context (required by browsers if it started suspended)
          if (sound.context.state === 'suspended') {
            sound.context.resume().then(playAudio).catch(() => {
              console.warn('Autoplay blocked by browser.');
              showSoundOverlay();
            });
          } else {
            playAudio();
          }
        }
      }, null, ">")
      .set(captionText, { text: "" });

    captions.forEach(caption => {
      tl.to(captionText, {
        duration: caption.duration,
        text: { value: caption.text, newClass: "typing-active" },
        ease: "none"
      }, `+=${caption.delay || 0}`);
    });

    tl.to(captionBox, { opacity: 0, duration: 1.0 }, "+=1.0")
      .to(logoMat.uniforms.uIntensity, { value: 0, duration: 1.0 }, "<");
  }

  function showSoundOverlay() {
    if (document.getElementById('sound-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sound-overlay';
    overlay.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg><span>Click anywhere to enable sound</span>';
    document.body.appendChild(overlay);

    const enableSound = () => {
      if (sound && sound.context.state === 'suspended') {
        sound.context.resume();
      }
      if (sound && !sound.isPlaying && audioReady) {
        sound.play();
      }
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 500);
      document.body.removeEventListener('click', enableSound);
    };
    document.body.addEventListener('click', enableSound);
  }

  let audioReady = false;

  audioLoader.load('/audio/enter-audio.mp3', (buffer) => {
    sound.setBuffer(buffer);
    analyser = new THREE.AudioAnalyser(sound, 32);
    audioReady = true;
  }, undefined, (error) => {
    console.warn("Could not load audio file. Playing visual animation without sound.", error);
  });

  // Start the visual sequence immediately! Do not wait for the audio loader.
  // This prevents the preloader from hanging if the audio decode fails.
  playPreloaderAnimation();

  // Setup Cleanup Watcher
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.classList.contains('hidden')) {
        if (animId) cancelAnimationFrame(animId);
        if (sound && sound.isPlaying) sound.stop();
        renderer.dispose();
        observer.disconnect();
        break;
      }
    }
  });
  const preloader = document.getElementById('preloader');
  if (preloader) observer.observe(preloader, { attributes: true, attributeFilter: ['class'] });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
