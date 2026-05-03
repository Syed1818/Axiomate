import * as THREE from 'three';
import { gsap } from 'gsap';

// Hidden 2D Canvas to extract text coordinates
function extractTextParticles(text) {
  const canvas = document.createElement('canvas');
  const width = 1024;
  const height = 256;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Draw Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  // Draw Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 160px "JetBrains Mono", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const particles = [];
  
  // Scan pixel data (step by 2 to control particle density)
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const alpha = imageData[(y * width + x) * 4];
      if (alpha > 128) {
        // Center the coordinates and scale them to 3D space
        particles.push({
          x: (x - width / 2) * 0.05,
          y: -(y - height / 2) * 0.05
        });
      }
    }
  }
  return particles;
}

export function startSingularityPreloader(canvas, onComplete, fastMode = false) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 35;

  // 1. Extract Target Brand Reveal Positions
  const textCoords = extractTextParticles('AXIOMATE');
  const COUNT = textCoords.length; // Will be around 5,000 - 10,000 particles

  // Geometry Buffers
  const treePos = new Float32Array(COUNT * 3);
  const lorenzPos = new Float32Array(COUNT * 3);
  const textPos = new Float32Array(COUNT * 3);
  const randoms = new Float32Array(COUNT);

  // Lorenz Attractor Constants
  let lx = 0.1, ly = 0.1, lz = 0.1;
  const dt = 0.006;
  const a = 10.0, b = 28.0, c = 8.0 / 3.0;

  // Warm up the attractor so it isn't starting at 0,0,0
  for(let i = 0; i < 100; i++) {
    let dx = a * (ly - lx) * dt;
    let dy = (lx * (b - lz) - ly) * dt;
    let dz = (lx * ly - c * lz) * dt;
    lx += dx; ly += dy; lz += dz;
  }

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    
    // --- Act I: AST Tree (Fibonacci Spiral Cone) ---
    const t = i / COUNT;
    const radius = Math.sqrt(t) * 20; 
    const angle = i * 137.5 * (Math.PI / 180); 
    const yPos = (t * 40) - 20; 
    
    treePos[i3] = Math.cos(angle) * radius;
    treePos[i3 + 1] = -yPos; // Start high, spiral down
    treePos[i3 + 2] = Math.sin(angle) * radius;

    // --- Act II: Math (Lorenz Attractor Trail) ---
    let dx = a * (ly - lx) * dt;
    let dy = (lx * (b - lz) - ly) * dt;
    let dz = (lx * ly - c * lz) * dt;
    lx += dx; ly += dy; lz += dz;
    
    lorenzPos[i3] = lx * 0.5;
    lorenzPos[i3 + 1] = ly * 0.5;
    lorenzPos[i3 + 2] = (lz - 20) * 0.5; // Offset Z to center the attractor

    // --- Act IV: Brand Text Coordinates ---
    textPos[i3] = textCoords[i].x;
    textPos[i3 + 1] = textCoords[i].y;
    textPos[i3 + 2] = (Math.random() - 0.5) * 1.5; // Slight depth variance

    randoms[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  // We don't use the standard 'position' attribute; everything is driven by custom attributes
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3)); 
  geo.setAttribute('aTreePos', new THREE.BufferAttribute(treePos, 3));
  geo.setAttribute('aLorenzPos', new THREE.BufferAttribute(lorenzPos, 3));
  geo.setAttribute('aTextPos', new THREE.BufferAttribute(textPos, 3));
  geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

  // GLSL Shader Material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDFSProgress: { value: 1.2 },
      uMathMorph: { value: 0.0 },
      uGravityWell: { value: 0.0 },
      uTextMorph: { value: 0.0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uDFSProgress;
      uniform float uMathMorph;
      uniform float uGravityWell;
      uniform float uTextMorph;

      attribute vec3 aTreePos;
      attribute vec3 aLorenzPos;
      attribute vec3 aTextPos;
      attribute float aRandom;

      varying vec3 vColor;

      mat3 rotateY(float angle) {
        float s = sin(angle); float c = cos(angle);
        return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
      }
      mat3 rotateX(float angle) {
        float s = sin(angle); float c = cos(angle);
        return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
      }

      void main() {
        vec3 pos = aTreePos;
        
        // Colors
        vec3 treeColor = vec3(0.01, 0.15, 0.04);
        vec3 neonGreen = vec3(0.0, 1.0, 0.25);
        vec3 lorenzColor = vec3(0.0, 0.6, 1.0);
        vec3 brandColor = vec3(0.0, 0.82, 1.0); // Axiomate cyan
        vec3 color = treeColor;

        // Act I: The Code Phase (DFS AST Pulse)
        float normalizedY = (pos.y + 20.0) / 40.0;
        float distToPulse = abs(normalizedY - uDFSProgress);
        float pulseGlow = smoothstep(0.15, 0.0, distToPulse);
        color = mix(treeColor, neonGreen, pulseGlow);

        // Act II: The Math Phase (Lorenz Attractor)
        // Dynamically rotate the attractor shape
        vec3 lorenz = aLorenzPos * rotateY(uTime * 0.4) * rotateX(uTime * 0.2);
        pos = mix(pos, lorenz, smoothstep(0.0, 1.0, uMathMorph));
        color = mix(color, lorenzColor, uMathMorph);

        // Act III: Singularity Collapse
        pos = mix(pos, vec3(0.0), uGravityWell);
        color = mix(color, vec3(1.0, 1.0, 1.0), uGravityWell * 0.9); // Bright white core

        // Act IV: Brand Reveal
        vec3 finalPos = aTextPos;
        finalPos.y += sin(uTime * 2.0 + aRandom * 6.28) * 0.3; // Gentle ambient floating
        pos = mix(pos, finalPos, smoothstep(0.0, 1.0, uTextMorph));
        color = mix(color, brandColor, uTextMorph);

        // Final Projection
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (2.0 + aRandom * 3.0) * (50.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vColor = color;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        // Soft circular particle
        vec2 uv = gl_PointCoord.xy - 0.5;
        float dist = length(uv);
        if (dist > 0.5) discard;
        
        float alpha = smoothstep(0.5, 0.2, dist);
        gl_FragColor = vec4(vColor, alpha * 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, material);
  scene.add(points);

  const clock = new THREE.Clock();
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    material.uniforms.uTime.value = clock.getElapsedTime();
    
    // Slight ambient rotation applied to the whole mesh
    points.rotation.y = Math.sin(material.uniforms.uTime.value * 0.2) * 0.2;
    
    renderer.render(scene, camera);
  }
  animate();

  // --- Master GSAP Timeline ---
  const tl = gsap.timeline({
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });

  // Fast mode bypasses the slow cinematic delays for quick SPA routing
  if (fastMode) tl.timeScale(8);

  tl.fromTo(material.uniforms.uDFSProgress, 
      { value: 1.2 }, 
      { value: -0.2, duration: 2.0, ease: "power2.inOut" }
    )
    .to(material.uniforms.uMathMorph, { value: 1.0, duration: 1.8, ease: "power2.inOut" }, "-=0.2")
    .to(material.uniforms.uMathMorph, { value: 1.0, duration: 1.0 }) // Orbit observation window
    .to(material.uniforms.uGravityWell, { value: 1.0, duration: 1.2, ease: "power4.in" })
    .to(material.uniforms.uTextMorph, { value: 1.0, duration: 2.5, ease: "elastic.out(1.0, 0.4)" })
    .to({}, { duration: 1.5 }); // Final hold time on the brand logo

  // Setup Cleanup Watcher
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.classList.contains('hidden')) {
        cancelAnimationFrame(animId);
        renderer.dispose();
        geo.dispose();
        material.dispose();
        observer.disconnect();
        break;
      }
    }
  });
  const preloader = document.getElementById('preloader');
  if (preloader) observer.observe(preloader, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
