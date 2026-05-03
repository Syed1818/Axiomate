import * as THREE from 'three';
import { gsap } from 'gsap';

export function startHolographicForgePreloader(canvas, onComplete, fastMode = false) { // Renamed to startAssistantPreloader
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 20);

  // --- 1. AI Assistant Model ---
  const assistantGroup = new THREE.Group();
  scene.add(assistantGroup);

  // Holographic Head
  const headGeo = new THREE.IcosahedronGeometry(4, 4);
  const headMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 0.0 } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      varying vec3 vNormal;
      void main() {
        float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        fresnel = pow(fresnel, 3.0);
        float scanline = sin((vNormal.y + uTime * 0.3) * 30.0) * 0.1 + 0.9;
        vec3 color = vec3(1.0, 0.2, 0.4); // Crimson
        gl_FragColor = vec4(color * fresnel * scanline * uIntensity, fresnel * scanline * uIntensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const head = new THREE.Mesh(headGeo, headMat);
  assistantGroup.add(head);

  // "Mouth" element that reacts to audio
  const mouthGeo = new THREE.PlaneGeometry(3, 0.1);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.y = -1.5;
  assistantGroup.add(mouth);

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
    headMat.uniforms.uTime.value = clock.getElapsedTime();

    if (analyser) {
      const freq = analyser.getAverageFrequency();
      // Map audio frequency to mouth scale
      const mouthScale = gsap.utils.mapRange(20, 100, 0.5, 4, freq || 0);
      mouth.scale.x = gsap.utils.interpolate(mouth.scale.x, mouthScale, 0.2);
      mouth.material.opacity = gsap.utils.mapRange(20, 80, 0.2, 1.0, freq || 0);
    }

    assistantGroup.rotation.y += 0.001;
    assistantGroup.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3;

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
          
          autoEnterTimeout = setTimeout(proceedToSite, 14000);
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

    // Define caption timings
    const captions = [
      { text: "Welcome to Axiomate.", duration: 2.5 },
      { text: "We are a collective of engineers, architects, and innovators.", duration: 4.5, delay: 0.5 },
      { text: "Our mission is to engineer the future.", duration: 3.5, delay: 0.5 },
      { text: "Let's build something extraordinary together.", duration: 4.0, delay: 0.5 }
    ];

    // Build the timeline
    tl.to(headMat.uniforms.uIntensity, { value: 1.0, duration: 1.5, ease: "power2.out" })
      .to(captionBox, { opacity: 1, duration: 1.0 }, "-=1.0")
      .call(() => {
        // Only try to play if audio successfully loaded and browser allows it
        if (audioReady && sound && sound.buffer && sound.context.state === 'running') {
          sound.play();
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

    tl.to([captionBox, headMat.uniforms.uIntensity], { opacity: 0, value: 0, duration: 1.0 }, "+=1.0");
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
