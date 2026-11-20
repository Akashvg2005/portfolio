/**
 * SILVER HALIDE - 3D ROTATING OPTICAL APERTURE GYROSCOPE
 * Rotating 3D Model positioned directly behind "Akash V G" in the Entry Card
 * 
 * Features:
 * - Machined satin-chrome calibrated aperture outer ring with radial tick notches
 * - Interlocking dual-axis gimbal pitch & yaw rings in dark titanium & polished platinum
 * - Floating crystalline icosahedron prism core with wireframe facets and translucent refractive glass
 * - 8 mechanical aperture iris blades gently breathing in optical sync
 * - Dual orbiting luminous focal spark nodes
 * - Silky smooth 60fps/120fps hardware-accelerated WebGL rendering with cursor parallax tracking
 * - Clean lifecycle controls (pause on enter, resume on replay, 0% CPU/GPU overhead when offscreen)
 */

export function initIntro3D() {
  const canvas = document.getElementById('intro-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return null;

  const container = canvas.parentElement;
  let width = canvas.clientWidth || 640;
  let height = canvas.clientHeight || 360;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
  camera.position.set(0, 0, 8.2);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('WebGL init error for intro 3D model:', err);
    return null;
  }

  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // 1. Monochromatic Machined Lighting System (Silver Halide Noir Palette)
  const ambientLight = new THREE.AmbientLight(0x363A42, 1.6);
  scene.add(ambientLight);

  // Key light: crisp cool silver specular highlight
  const keyLight = new THREE.DirectionalLight(0xF8FAFC, 3.4);
  keyLight.position.set(6, 7, 7);
  scene.add(keyLight);

  // Rim light: brushed steel reflection defining 3D edges
  const rimLight = new THREE.DirectionalLight(0x8CA0B8, 2.4);
  rimLight.position.set(-7, -5, 5);
  scene.add(rimLight);

  // Core point light: subtle luminous transparent glow from inside the prism
  const coreLight = new THREE.PointLight(0x95C6F5, 1.8, 6.0);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);

  // 2. High-End Monochromatic Materials
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xDEE2E8,
    metalness: 0.95,
    roughness: 0.16,
  });

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x2A2E35,
    metalness: 0.9,
    roughness: 0.32,
  });

  const platinumMat = new THREE.MeshStandardMaterial({
    color: 0xC4CAD2,
    metalness: 0.92,
    roughness: 0.22,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xEEF5FC,
    metalness: 0.1,
    roughness: 0.06,
    transmission: 0.88,
    thickness: 0.9,
    ior: 1.54,
    reflectivity: 0.92,
    transparent: true,
    opacity: 0.46,
  });

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xB8D4F0,
    wireframe: true,
    transparent: true,
    opacity: 0.58,
  });

  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0xE8F2FC,
  });

  // 3. Master Gyro Assembly
  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // A. Outer Calibrated Aperture Ring with Millimeter & f-stop Ticks
  const outerGroup = new THREE.Group();
  masterGroup.add(outerGroup);

  const outerBezelGeo = new THREE.TorusGeometry(3.15, 0.07, 24, 72);
  const outerBezel = new THREE.Mesh(outerBezelGeo, chromeMat);
  outerGroup.add(outerBezel);

  // 24 Calibrated Radial Ticks
  const tickGeo = new THREE.BoxGeometry(0.035, 0.14, 0.05);
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeo, i % 6 === 0 ? chromeMat : darkSteelMat);
    tick.position.set(Math.cos(angle) * 3.15, Math.sin(angle) * 3.15, 0);
    tick.rotation.z = angle;
    outerGroup.add(tick);
  }

  // B. Middle Gimbal Pitch Ring (Tilted at 35 degrees)
  const gimbalGroup = new THREE.Group();
  masterGroup.add(gimbalGroup);

  const gimbalGeo = new THREE.TorusGeometry(2.45, 0.055, 20, 64);
  const gimbalRing = new THREE.Mesh(gimbalGeo, darkSteelMat);
  gimbalGroup.add(gimbalRing);

  // Two mounting pivot studs
  const pivotGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 16);
  const pivotTop = new THREE.Mesh(pivotGeo, chromeMat);
  pivotTop.position.set(0, 2.45, 0);
  gimbalGroup.add(pivotTop);

  const pivotBottom = new THREE.Mesh(pivotGeo, chromeMat);
  pivotBottom.position.set(0, -2.45, 0);
  gimbalGroup.add(pivotBottom);

  // C. Inner Calibrated Ring
  const innerGroup = new THREE.Group();
  masterGroup.add(innerGroup);

  const innerRingGeo = new THREE.TorusGeometry(1.78, 0.045, 18, 56);
  const innerRing = new THREE.Mesh(innerRingGeo, platinumMat);
  innerGroup.add(innerRing);

  // D. 8 Mechanical Aperture Iris Blades (Subtle camera iris geometry)
  const bladeGroup = new THREE.Group();
  innerGroup.add(bladeGroup);

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.lineTo(0.72, 0.22);
  bladeShape.lineTo(0.55, 0.72);
  bladeShape.lineTo(-0.08, 0.48);
  bladeShape.closePath();

  const bladeGeo = new THREE.ShapeGeometry(bladeShape);
  for (let b = 0; b < 8; b++) {
    const bAngle = (b / 8) * Math.PI * 2;
    const blade = new THREE.Mesh(bladeGeo, platinumMat);
    blade.position.set(Math.cos(bAngle) * 0.42, Math.sin(bAngle) * 0.42, -0.05);
    blade.rotation.z = bAngle + 0.32;
    blade.scale.set(0.85, 0.85, 0.85);
    bladeGroup.add(blade);
  }

  // E. Floating Optical Prism Core (Dual-Layer Refractive Icosahedron)
  const prismGroup = new THREE.Group();
  masterGroup.add(prismGroup);

  const prismGeo = new THREE.IcosahedronGeometry(1.12, 0);
  const prismGlass = new THREE.Mesh(prismGeo, glassMat);
  prismGroup.add(prismGlass);

  const prismWire = new THREE.Mesh(prismGeo, wireMat);
  prismWire.scale.set(1.02, 1.02, 1.02);
  prismGroup.add(prismWire);

  // F. Dual Orbiting Sparkle Nodes
  const sparkGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const sparkA = new THREE.Mesh(sparkGeo, sparkMat);
  const sparkB = new THREE.Mesh(sparkGeo, sparkMat);
  masterGroup.add(sparkA);
  masterGroup.add(sparkB);

  // 4. Interactive State & Smooth Parallax Tracking
  let isRunning = true;
  let rafId = null;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 5. Animation Loop
  let clock = 0;

  function render(time) {
    if (!isRunning) return;
    rafId = requestAnimationFrame(render);

    clock += 0.016;

    if (!prefersReducedMotion) {
      // Independent rotational velocities for cinematic mechanical complexity
      outerGroup.rotation.z += 0.003;
      gimbalGroup.rotation.x += 0.0045;
      gimbalGroup.rotation.y += 0.0035;
      innerGroup.rotation.y -= 0.0055;
      innerGroup.rotation.z += 0.004;
      prismGroup.rotation.x -= 0.006;
      prismGroup.rotation.y += 0.007;

      // Iris blade gentle respiratory pulsing
      const bladeScale = 0.85 + Math.sin(clock * 1.8) * 0.05;
      bladeGroup.scale.set(bladeScale, bladeScale, 1);

      // Orbiting focal sparkle paths
      sparkA.position.set(
        Math.cos(clock * 1.4) * 2.7,
        Math.sin(clock * 1.4) * 2.7,
        Math.sin(clock * 2.0) * 0.8
      );
      sparkB.position.set(
        Math.cos(-clock * 1.1 + Math.PI) * 2.2,
        Math.sin(-clock * 1.1 + Math.PI) * 2.2,
        Math.cos(clock * 1.7) * 0.6
      );

      // Smooth damped lerp towards cursor tilt target
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;

      masterGroup.rotation.x = currentTiltY * 0.35;
      masterGroup.rotation.y = currentTiltX * 0.45;
    }

    renderer.render(scene, camera);
  }

  // Start rendering
  rafId = requestAnimationFrame(render);

  // 6. Responsive Resize Handling
  function onResize() {
    if (!canvas) return;
    width = canvas.clientWidth || 640;
    height = canvas.clientHeight || 360;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  window.addEventListener('resize', onResize);

  // 7. Public Controller API
  return {
    setTilt(nx, ny) {
      targetTiltX = nx;
      targetTiltY = -ny;
    },
    pause() {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    resume() {
      if (isRunning) return;
      isRunning = true;
      rafId = requestAnimationFrame(render);
    },
    destroy() {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
