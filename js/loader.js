/**
 * SILVER HALIDE - CINEMATIC 3D OPTICAL EXPOSURE ENTRY
 * MNC-Grade 3D Parallax Calibration & Dimensional Fly-Through
 * 
 * Features:
 * - 3D Perspective Optical Chamber with 4 depth planes (Z: -200px to +160px)
 * - Inertial mouse & gyroscope parallax tracking
 * - Real-time optical rack-focus: 14px bokeh blur to critical pin-sharp lock
 * - Six machined silver aperture blades dilating with cubic-bezier mechanical snap
 * - Optical focus-peaking contour lock at 92%
 * - Dual-curtain mechanical shutter release with audio synchronization
 * - 3D spatial fly-through warp into the Hero section
 * - Session storage guard with interactive "Re-Calibrate" trigger
 */

export function initLoader(onComplete) {
  const loaderEl = document.getElementById('aperture-loader');
  const chamberEl = document.getElementById('loader-spatial-chamber');
  const counterEl = document.getElementById('loader-counter');
  const irisEl = document.getElementById('loader-center-iris');
  const blades = document.querySelectorAll('.aperture-blade');
  const peakingRing = document.getElementById('loader-peaking-ring');
  const statusTag = document.getElementById('loader-status-tag');
  const shutterCue = document.getElementById('loader-shutter-speed-cue');
  const flashEl = document.getElementById('loader-shutter-flash');
  const curtainLeft = document.getElementById('shutter-curtain-left');
  const curtainRight = document.getElementById('shutter-curtain-right');
  const layerFore = document.querySelector('.loader-spatial-layer.layer-fore');
  const layerCore = document.querySelector('.loader-spatial-layer.layer-core');
  const layerMid = document.querySelector('.loader-spatial-layer.layer-mid');
  const layerBg = document.querySelector('.loader-spatial-layer.layer-bg');
  const recalibrateBtn = document.getElementById('btn-recalibrate-optics');
  
  if (!loaderEl) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Check if visited in this session
  const hasVisited = sessionStorage.getItem('silver_halide_loaded');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasVisited || prefersReducedMotion) {
    loaderEl.style.display = 'none';
    document.body.classList.add('exposed');
    if (typeof onComplete === 'function') onComplete();
    setupRecalibrate();
    return;
  }

  runEntrySequence(onComplete);

  function runEntrySequence(doneCallback) {
    const duration = 1800; // 1.8 seconds (snappy MNC timing)
    const startTime = performance.now();
    let completed = false;
    let animFrameId = null;

    // Interactive 3D Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const onPointerMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseX = (e.clientX - halfW) / halfW;
      mouseY = (e.clientY - halfH) / halfH;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function easeMechanical(t) {
      // High-inertia mechanical snap: cubic-bezier(0.76, 0, 0.24, 1)
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tick(now) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeMechanical(rawProgress);

      // 1. Inertial 3D Parallax Tilt Lerp
      const targetTiltX = -mouseY * 12;
      const targetTiltY = mouseX * 16;
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;

      if (chamberEl) {
        chamberEl.style.transform = `rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
      }

      // Parallax layer separation along X & Y
      if (layerFore) {
        layerFore.style.transform = `translateZ(160px) translate(${-currentTiltY * 1.5}px, ${currentTiltX * 1.5}px)`;
      }
      if (layerCore) {
        layerCore.style.transform = `translateZ(0px) translate(${-currentTiltY * 0.8}px, ${currentTiltX * 0.8}px)`;
      }
      if (layerMid) {
        layerMid.style.transform = `translateZ(-80px) translate(${-currentTiltY * 0.4}px, ${currentTiltX * 0.4}px)`;
      }
      if (layerBg) {
        layerBg.style.transform = `translateZ(-200px) translate(${-currentTiltY * 0.15}px, ${currentTiltX * 0.15}px)`;
      }

      // 2. Optical Rack Focus (14px blur down to 0px)
      if (irisEl) {
        const blurPx = Math.max(0, (1 - rawProgress * 1.15) * 14);
        irisEl.style.filter = `blur(${blurPx.toFixed(1)}px)`;
      }

      // 3. Counter Progression (000 to 100)
      const countValue = Math.min(100, Math.floor(rawProgress * 100));
      if (counterEl) {
        counterEl.textContent = String(countValue).padStart(3, '0');
      }

      // 4. Aperture Blade Mechanical Dilation
      if (blades && blades.length) {
        const openAngle = easedProgress * 64; // degrees
        const slideDist = easedProgress * 42; // pixels
        blades.forEach((blade, i) => {
          const baseAngle = i * 60;
          blade.style.transform = `rotate(${baseAngle}deg) translate(0px, -${slideDist.toFixed(1)}px) rotate(${openAngle.toFixed(1)}deg)`;
        });
      }

      // 5. Critical Focus Lock Cue (at 88%)
      if (rawProgress >= 0.88 && peakingRing && !peakingRing.classList.contains('is-locked')) {
        peakingRing.classList.add('is-locked');
        if (statusTag) {
          statusTag.innerHTML = 'CRITICAL FOCUS LOCKED &bull; f/1.4 4K';
          statusTag.classList.add('locked');
        }
        if (shutterCue) {
          shutterCue.textContent = 'SHUTTER PRIMED // 1/8000s RELEASE';
        }
      }

      if (rawProgress < 1) {
        animFrameId = requestAnimationFrame(tick);
      } else if (!completed) {
        completed = true;
        finishLoader(onPointerMove, doneCallback);
      }
    }

    function finishLoader(moveHandler, done) {
      window.removeEventListener('pointermove', moveHandler);
      sessionStorage.setItem('silver_halide_loaded', 'true');

      // A. Dual Mechanical Shutter Snap
      if (curtainLeft) curtainLeft.classList.add('snap-shut');
      if (curtainRight) curtainRight.classList.add('snap-shut');
      window.__playShutterSound?.();

      setTimeout(() => {
        // B. Optical Shutter Flash Bloom
        if (flashEl) flashEl.classList.add('is-flashing');

        setTimeout(() => {
          // C. Dimensional 3D Fly-Through
          if (chamberEl) chamberEl.classList.add('fly-through');
          if (flashEl) flashEl.classList.remove('is-flashing');

          setTimeout(() => {
            loaderEl.classList.add('loader-exposed');
            document.body.classList.add('exposed');

            setTimeout(() => {
              loaderEl.style.display = 'none';
              if (typeof done === 'function') done();
              setupRecalibrate();
            }, 450);
          }, 240);
        }, 120);
      }, 90);
    }

    animFrameId = requestAnimationFrame(tick);
  }

  function setupRecalibrate() {
    window.__replayApertureLoader = function() {
      sessionStorage.removeItem('silver_halide_loaded');
      document.body.classList.remove('exposed');
      loaderEl.style.display = 'flex';
      loaderEl.classList.remove('loader-exposed');

      if (chamberEl) chamberEl.classList.remove('fly-through');
      if (peakingRing) peakingRing.classList.remove('is-locked');
      if (statusTag) {
        statusTag.textContent = 'CALIBRATING OPTICS \u2022 ISO 100';
        statusTag.classList.remove('locked');
      }
      if (curtainLeft) curtainLeft.classList.remove('snap-shut');
      if (curtainRight) curtainRight.classList.remove('snap-shut');
      if (counterEl) counterEl.textContent = '000';

      runEntrySequence(() => {
        const heroReveal = document.querySelector('.hero-exposure-cue');
        if (heroReveal) heroReveal.classList.add('is-exposed');
      });
    };

    if (recalibrateBtn) {
      recalibrateBtn.onclick = () => {
        window.__playShutterSound?.();
        window.__replayApertureLoader();
      };
    }
  }
}
