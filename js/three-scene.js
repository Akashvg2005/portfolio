/**
 * SILVER HALIDE - 3D CHROME CAMERA LENS & APERTURE RING
 * 
 * Monochromatic Three.js camera optic:
 * - Low-poly machined aluminium & chrome camera barrel
 * - Knurled focus grip, calibrated aperture ring, and convex optical glass element
 * - Pure silver/grey environment lighting and specular caustics
 * - Reactive cursor tracking with damped rotational inertia
 * - Viewport visibility observer: pauses when off-screen for 60fps performance
 */

export function initThreeScene() {
  const canvas = document.getElementById('hero-lens-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const container = canvas.parentElement;
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // 1. Monochromatic Machined Lighting System
  const ambientLight = new THREE.AmbientLight(0x34373C, 1.4);
  scene.add(ambientLight);

  // Key light: crisp cool silver specular highlight
  const keyLight = new THREE.DirectionalLight(0xF6F7F8, 3.2);
  keyLight.position.set(5, 6, 8);
  scene.add(keyLight);

  // Rim light: brushed steel reflection along edges
  const rimLight = new THREE.DirectionalLight(0x8E9298, 2.2);
  rimLight.position.set(-6, -4, 4);
  scene.add(rimLight);

  // Top soft box light
  const topLight = new THREE.DirectionalLight(0xE4E6E9, 1.8);
  topLight.position.set(0, 8, 2);
  scene.add(topLight);

  // 2. Materials
  // Machined Aluminium / Chrome
  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xDCDFE3,
    metalness: 0.94,
    roughness: 0.18,
  });

  // Dark Anodized Camera Body Steel
  const darkSteelMaterial = new THREE.MeshStandardMaterial({
    color: 0x222428,
    metalness: 0.88,
    roughness: 0.32,
  });

  // Knurled Grip Ring (brushed texture feel)
  const knurledMaterial = new THREE.MeshStandardMaterial({
    color: 0x484B52,
    metalness: 0.9,
    roughness: 0.45,
  });

  // Convex Optical Glass Element
  const opticalGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    thickness: 1.2,
    ior: 1.52,
    reflectivity: 0.9,
    transparent: true,
    opacity: 0.75,
  });

  // 3. Construct Mechanical Lens Assembly
  const lensGroup = new THREE.Group();

  // A. Outer Lens Barrel Cylinder
  const outerBarrelGeo = new THREE.CylinderGeometry(2.3, 2.3, 2.6, 64, 1, true);
  const outerBarrel = new THREE.Mesh(outerBarrelGeo, darkSteelMaterial);
  outerBarrel.rotation.x = Math.PI / 2;
  lensGroup.add(outerBarrel);

  // B. Front Chrome Bezel Ring
  const bezelGeo = new THREE.TorusGeometry(2.32, 0.12, 24, 64);
  const bezelRing = new THREE.Mesh(bezelGeo, chromeMaterial);
  bezelRing.position.z = 1.3;
  lensGroup.add(bezelRing);

  // C. Knurled Focus Grip Ribs (40 machined silver grooves)
  const ribGeo = new THREE.BoxGeometry(0.04, 0.08, 0.9);
  const ribCount = 36;
  const gripRadius = 2.33;
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, chromeMaterial);
    rib.position.x = Math.cos(angle) * gripRadius;
    rib.position.y = Math.sin(angle) * gripRadius;
    rib.position.z = -0.15;
    rib.rotation.z = angle;
    lensGroup.add(rib);
  }

  // D. Calibrated Aperture Step Ring
  const apertureRingGeo = new THREE.CylinderGeometry(2.15, 2.15, 0.6, 64);
  const apertureRing = new THREE.Mesh(apertureRingGeo, chromeMaterial);
  apertureRing.rotation.x = Math.PI / 2;
  apertureRing.position.z = -0.9;
  lensGroup.add(apertureRing);

  // E. Inner Optical Core (Convex Glass Element)
  const glassGeo = new THREE.SphereGeometry(1.9, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42);
  const frontGlass = new THREE.Mesh(glassGeo, opticalGlassMaterial);
  frontGlass.rotation.x = -Math.PI / 2;
  frontGlass.position.z = 0.55;
  lensGroup.add(frontGlass);

  // F. Six Silver Aperture Blades inside the optic
  const bladeGroup = new THREE.Group();
  bladeGroup.position.z = -0.1;
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.lineTo(0.9, 0.3);
  bladeShape.lineTo(0.7, 0.9);
  bladeShape.lineTo(-0.1, 0.6);
  bladeShape.closePath();

  const bladeGeo = new THREE.ShapeGeometry(bladeShape);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xC8CBD0,
    metalness: 0.95,
    roughness: 0.22,
    side: THREE.DoubleSide
  });

  for (let b = 0; b < 6; b++) {
    const bAngle = (b / 6) * Math.PI * 2;
    const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
    bladeMesh.position.x = Math.cos(bAngle) * 0.45;
    bladeMesh.position.y = Math.sin(bAngle) * 0.45;
    bladeMesh.rotation.z = bAngle + 0.35;
    bladeGroup.add(bladeMesh);
  }
  lensGroup.add(bladeGroup);

  // Tilt lens to showcase both front glass and knurled barrel
  lensGroup.rotation.x = 0.35;
  lensGroup.rotation.y = -0.45;
  scene.add(lensGroup);

  // 4. Cursor Tracking & Smooth Lerp
  let mouseNormX = 0;
  let mouseNormY = 0;
  let targetRotX = 0.35;
  let targetRotY = -0.45;

  window.addEventListener('mousemove', (e) => {
    mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormY = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Subtle responsive tilt (max ~18 degrees)
    targetRotY = -0.45 + mouseNormX * 0.35;
    targetRotX = 0.35 - mouseNormY * 0.25;
  }, { passive: true });

  // 5. Performance: Off-Screen Visibility Observer
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });
  observer.observe(canvas);

  // 6. Animation Loop
  let lastTime = performance.now();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(now) {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = (now - lastTime) * 0.001;
    lastTime = now;

    if (!prefersReducedMotion) {
      // Continuous slow mechanical spin
      lensGroup.rotation.z += 0.003;
      bladeGroup.rotation.z -= 0.0018;

      // Smooth damped lerp towards cursor target
      lensGroup.rotation.x += (targetRotX - lensGroup.rotation.x) * 0.05;
      lensGroup.rotation.y += (targetRotY - lensGroup.rotation.y) * 0.05;
    }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  // 7. Responsive Resizing
  function onResize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);
}

