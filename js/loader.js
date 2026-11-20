/**
 * SILVER HALIDE - 2.39:1 CINEMATIC FILM INTRO (Title Sequence)
 * Based on the UI Plan for Akash's Portfolio Build
 * 
 * Features:
 *  - Optical Defocus Hunting: first blurs out heavily into deep bokeh, then critically focuses onto the name
 *  - Editorial Display Serif font style with brushed platinum sheen
 *  - Anamorphic horizontal flare streak across the letters
 *  - 3D Interactive Cursor Parallax during playback and waiting state
 *  - Scroll-to-Enter: scrolling down (wheel, touch drag, down arrow) smoothly transforms the intro card into the home page
 *  - Layered Parallax Handoff: letterbox bars peel away, title dollies in Z-space, and hero plane rises with rack focus
 */

import { initIntro3D } from './intro-3d.js';

export function initLoader(onComplete) {
  const introEl = document.getElementById('cinematic-intro');
  const skipBtn = document.getElementById('intro-skip-btn');
  const recalibrateBtn = document.getElementById('btn-recalibrate-optics');

  if (!introEl) {
    document.body.classList.add('exposed', 'site-entered');
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const skipRequested = urlParams.get('skipIntro') === 'true' || urlParams.get('skip') === '1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion or explicit URL skip (?skipIntro=1) bypasses intro
  if (skipRequested || prefersReducedMotion) {
    introEl.style.display = 'none';
    introEl.setAttribute('aria-hidden', 'true');
    document.body.classList.add('exposed', 'site-entered');
    if (typeof onComplete === 'function') onComplete();
    setupReplayTrigger();
    return;
  }

  let isDismissing = false;
  let rafParallaxId = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const bgStage = introEl.querySelector('.intro-bg-stage');
  const titleFrame = document.getElementById('intro-title-frame');
  const bloom = introEl.querySelector('.intro-lens-bloom');
  const transparentGlow = introEl.querySelector('.intro-transparent-glow');
  const reticle = introEl.querySelector('.intro-focus-reticle');
  const timecodeEl = document.getElementById('intro-hud-timecode');
  const telemetryEl = document.getElementById('intro-hud-telemetry');
  const canvas3D = introEl.querySelector('.intro-3d-canvas');

  // Initialize Rotating 3D Optical Aperture Gyroscope behind name
  const intro3D = initIntro3D();

  // 24 FPS Rolling Timecode (Cinematic Precision)
  let tcSeconds = 1;
  let tcFrames = 0;
  let timecodeTimer = null;
  function startTimecode() {
    if (timecodeTimer) clearInterval(timecodeTimer);
    timecodeTimer = setInterval(() => {
      if (isDismissing || introEl.style.display === 'none') {
        clearInterval(timecodeTimer);
        return;
      }
      tcFrames++;
      if (tcFrames >= 24) {
        tcFrames = 0;
        tcSeconds++;
      }
      if (timecodeEl) {
        const ss = String(tcSeconds).padStart(2, '0');
        const ff = String(tcFrames).padStart(2, '0');
        timecodeEl.textContent = `00:00:${ss}:${ff}`;
      }
    }, 1000 / 24);
  }
  if (!prefersReducedMotion) {
    startTimecode();
  }

  // Silky smooth rAF lerp parallax (zero layout thrashing, capped at display refresh rate)
  function renderParallax() {
    if (isDismissing || introEl.style.display === 'none' || prefersReducedMotion) return;
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    if (bgStage) {
      bgStage.style.transform = `translate3d(${-currentX * 10}px, ${-currentY * 10}px, 0)`;
    }
    if (titleFrame) {
      titleFrame.style.transform = `perspective(1000px) rotateX(${-currentY * 3}deg) rotateY(${currentX * 4}deg) translate3d(${currentX * 6}px, ${currentY * 4}px, 0)`;
    }
    if (bloom) {
      bloom.style.transform = `translate(-50%, -50%) translateZ(-15px) translate3d(${currentX * 12}px, ${currentY * 8}px, 0)`;
    }
    if (transparentGlow) {
      transparentGlow.style.transform = `translate(-50%, -50%) translateZ(6px) translate3d(${currentX * 8}px, ${currentY * 5}px, 0)`;
    }
    if (reticle) {
      reticle.style.transform = `translate3d(${currentX * 8}px, ${currentY * 6}px, 0)`;
    }
    if (intro3D) {
      intro3D.setTilt(currentX, currentY);
    }

    rafParallaxId = requestAnimationFrame(renderParallax);
  }
  if (!prefersReducedMotion) {
    rafParallaxId = requestAnimationFrame(renderParallax);
  }

  function onIntroMouseMove(e) {
    if (isDismissing || introEl.style.display === 'none' || prefersReducedMotion) return;
    const { innerWidth: w, innerHeight: h } = window;
    const nx = (e.clientX / w - 0.5) * 2;
    const ny = (e.clientY / h - 0.5) * 2;
    targetX = nx;
    targetY = ny;

    if (telemetryEl) {
      telemetryEl.textContent = `TILT: ${(-ny * 6).toFixed(1)}° • PAN: ${(nx * 8).toFixed(1)}°`;
    }
  }
  window.addEventListener('mousemove', onIntroMouseMove, { passive: true });

  function enterSite() {
    if (isDismissing) return;
    isDismissing = true;

    if (rafParallaxId) {
      cancelAnimationFrame(rafParallaxId);
      rafParallaxId = null;
    }
    if (timecodeTimer) {
      clearInterval(timecodeTimer);
      timecodeTimer = null;
    }

    // Clean up input listeners immediately
    window.removeEventListener('mousemove', onIntroMouseMove);
    window.removeEventListener('wheel', onIntroWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKeyDown);

    // Clear inline transforms so GPU CSS transitions cleanly take over for zoom-in blur-out
    if (titleFrame) titleFrame.style.transform = '';
    if (bgStage) bgStage.style.transform = '';
    if (bloom) bloom.style.transform = '';
    if (transparentGlow) transparentGlow.style.transform = '';
    if (reticle) reticle.style.transform = '';
    if (canvas3D) canvas3D.style.transform = '';

    // Pause 3D model during site entry
    intro3D?.pause();

    // Trigger subtle acoustic camera shutter release
    window.__playShutterSound?.();

    // 1. Activate home page hero so it pulls focus and reveals smoothly
    document.body.classList.add('exposed', 'site-entered');

    // 2. Trigger zoom-in blur-out entry transition
    introEl.classList.add('intro-dismissing', 'intro-flowing');

    // 3. Complete handoff at 850ms (matches 0.85s cubic-bezier CSS duration)
    setTimeout(() => {
      introEl.style.display = 'none';
      introEl.setAttribute('aria-hidden', 'true');
      introEl.classList.remove('intro-dismissing', 'intro-flowing');
      if (typeof onComplete === 'function') onComplete();
      setupReplayTrigger();
    }, 850);
  }

  // Scroll down detection: Mouse wheel (any scroll down immediately triggers zoom-in entry)
  function onIntroWheel(e) {
    if (isDismissing || introEl.style.display === 'none') return;
    if (e.deltaY > 0) {
      enterSite();
    }
  }
  window.addEventListener('wheel', onIntroWheel, { passive: true });

  // Touch drag detection: Swiping up = scrolling down
  let touchStartY = 0;
  function onTouchStart(e) {
    if (e.touches && e.touches[0]) {
      touchStartY = e.touches[0].clientY;
    }
  }
  function onTouchMove(e) {
    if (isDismissing || introEl.style.display === 'none') return;
    if (e.touches && e.touches[0]) {
      const diff = touchStartY - e.touches[0].clientY;
      if (diff > 12) {
        enterSite();
      }
    }
  }
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // Interactive triggers: click anywhere on intro
  introEl.addEventListener('click', () => {
    enterSite();
  });

  // Skip Intro button
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      enterSite();
    });
  }

  // Keyboard navigation: Enter, Space, ArrowDown, PageDown
  function onKeyDown(e) {
    if (introEl.style.display === 'none' || isDismissing) return;
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      enterSite();
    }
  }
  window.addEventListener('keydown', onKeyDown);

  function setupReplayTrigger() {
    window.__replayCinematicShot = function() {
      document.body.classList.remove('exposed', 'site-entered');
      introEl.style.display = 'flex';
      introEl.removeAttribute('aria-hidden');
      introEl.classList.remove('intro-flowing', 'intro-dismissing');
      isDismissing = false;
      targetX = 0;
      targetY = 0;
      currentX = 0;
      currentY = 0;

      const titleFrame = document.getElementById('intro-title-frame');
      const bgStage = introEl.querySelector('.intro-bg-stage');
      const bloom = introEl.querySelector('.intro-lens-bloom');
      const transparentGlow = introEl.querySelector('.intro-transparent-glow');
      const reticle = introEl.querySelector('.intro-focus-reticle');

      if (titleFrame) titleFrame.style.transform = '';
      if (bgStage) bgStage.style.transform = '';
      if (bloom) bloom.style.transform = '';
      if (transparentGlow) transparentGlow.style.transform = '';
      if (reticle) reticle.style.transform = '';
      if (canvas3D) {
        canvas3D.style.transform = '';
        canvas3D.style.animation = 'none';
        void canvas3D.offsetWidth;
        canvas3D.style.animation = '';
      }
      intro3D?.resume();

      // Restart timecode
      tcSeconds = 1;
      tcFrames = 0;
      if (!prefersReducedMotion) {
        startTimecode();
      }

      // Re-trigger CSS animations on characters and title
      const titleName = document.getElementById('intro-title-name');
      if (titleName) {
        titleName.style.animation = 'none';
        if (bloom) bloom.style.animation = 'none';
        if (transparentGlow) transparentGlow.style.animation = 'none';
        if (reticle) reticle.style.animation = 'none';
        const chars = titleName.querySelectorAll('.intro-char');
        chars.forEach(c => c.style.animation = 'none');

        void titleName.offsetWidth;

        titleName.style.animation = '';
        if (bloom) bloom.style.animation = '';
        if (transparentGlow) transparentGlow.style.animation = '';
        if (reticle) reticle.style.animation = '';
        chars.forEach(c => c.style.animation = '');
      }

      if (!prefersReducedMotion && !rafParallaxId) {
        rafParallaxId = requestAnimationFrame(renderParallax);
      }

      window.addEventListener('mousemove', onIntroMouseMove, { passive: true });
      window.addEventListener('wheel', onIntroWheel, { passive: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('keydown', onKeyDown);
    };

    if (recalibrateBtn) {
      recalibrateBtn.onclick = () => {
        window.__playShutterSound?.();
        window.__replayCinematicShot();
      };
    }
  }
}
