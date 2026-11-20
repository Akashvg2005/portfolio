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

export function initLoader(onComplete) {
  const introEl = document.getElementById('cinematic-intro');
  const skipBtn = document.getElementById('intro-skip-btn');
  const recalibrateBtn = document.getElementById('btn-recalibrate-optics');

  if (!introEl) {
    document.body.classList.add('exposed', 'site-entered');
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const hasVisited = sessionStorage.getItem('portfolio_intro_seen');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Returning visitor or reduced-motion user bypasses intro automatically
  if (hasVisited === 'true' || prefersReducedMotion) {
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
  const streak = document.querySelector('.intro-anamorphic-streak');

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
    if (streak) {
      streak.style.transform = `translateY(-50%) translate3d(${currentX * 14}px, 0, 0)`;
    }

    rafParallaxId = requestAnimationFrame(renderParallax);
  }
  if (!prefersReducedMotion) {
    rafParallaxId = requestAnimationFrame(renderParallax);
  }

  function onIntroMouseMove(e) {
    if (isDismissing || introEl.style.display === 'none' || prefersReducedMotion) return;
    const { innerWidth: w, innerHeight: h } = window;
    targetX = (e.clientX / w - 0.5) * 2;
    targetY = (e.clientY / h - 0.5) * 2;
  }
  window.addEventListener('mousemove', onIntroMouseMove, { passive: true });

  function enterSite() {
    if (isDismissing) return;
    isDismissing = true;

    if (rafParallaxId) {
      cancelAnimationFrame(rafParallaxId);
      rafParallaxId = null;
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
    if (streak) streak.style.transform = '';

    // Trigger subtle acoustic camera shutter release
    window.__playShutterSound?.();

    // 1. Activate home page hero so it pulls focus and reveals smoothly
    document.body.classList.add('exposed', 'site-entered');

    // 2. Trigger zoom-in blur-out entry transition
    introEl.classList.add('intro-dismissing', 'intro-flowing');

    try {
      sessionStorage.setItem('portfolio_intro_seen', 'true');
    } catch (_) {}

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
      sessionStorage.removeItem('portfolio_intro_seen');
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
      const streak = document.querySelector('.intro-anamorphic-streak');

      if (titleFrame) titleFrame.style.transform = '';
      if (bgStage) bgStage.style.transform = '';
      if (streak) streak.style.transform = '';

      // Re-trigger CSS animations by reflow
      const titleName = document.getElementById('intro-title-name');
      if (titleName) {
        titleName.style.animation = 'none';
        if (streak) streak.style.animation = 'none';
        void titleName.offsetWidth;
        titleName.style.animation = '';
        if (streak) streak.style.animation = '';
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
