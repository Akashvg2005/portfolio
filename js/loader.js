/**
 * SILVER HALIDE - 2.39:1 CINEMATIC FILM INTRO (Title Sequence)
 * Based on the UI Plan for Akash's Portfolio Build
 * 
 * Features:
 *  - Optical Defocus Hunting: first blurs out heavily into deep bokeh, then critically focuses onto the name
 *  - Editorial Display Serif font style with brushed platinum sheen
 *  - Anamorphic horizontal flare streak across the letters
 *  - 3D Interactive Cursor Parallax during playback and waiting state
 *  - FLIP morph transition: smoothly glides from screen-center straight down onto .hero-name,
 *    blending seamlessly with the home page text without changing the home page.
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

  // 3D Optical Parallax during title sequence
  function onIntroMouseMove(e) {
    if (isDismissing || introEl.style.display === 'none' || prefersReducedMotion) return;
    const { innerWidth: w, innerHeight: h } = window;
    const nx = (e.clientX / w - 0.5) * 2;
    const ny = (e.clientY / h - 0.5) * 2;

    const bgStage = introEl.querySelector('.intro-bg-stage');
    const titleFrame = document.getElementById('intro-title-frame');
    const streak = document.querySelector('.intro-anamorphic-streak');

    if (bgStage) {
      bgStage.style.transform = `translate3d(${-nx * 14}px, ${-ny * 14}px, 0)`;
    }
    if (titleFrame) {
      titleFrame.style.transform = `perspective(1000px) rotateX(${-ny * 4}deg) rotateY(${nx * 5}deg) translate3d(${nx * 8}px, ${ny * 6}px, 0)`;
    }
    if (streak) {
      streak.style.transform = `translateY(-50%) translate3d(${nx * 20}px, 0, 0)`;
    }
  }
  window.addEventListener('mousemove', onIntroMouseMove, { passive: true });

  function enterSite() {
    if (isDismissing) return;
    isDismissing = true;
    window.removeEventListener('mousemove', onIntroMouseMove);

    // Reset 3D tilt on title frame to ensure baseline coordinates for FLIP measurement
    const titleFrame = document.getElementById('intro-title-frame');
    if (titleFrame) {
      titleFrame.style.transform = 'none';
    }

    // Trigger subtle acoustic camera shutter release
    window.__playShutterSound?.();

    // 1. Target hero element and intro title element
    const heroTarget = document.querySelector('.hero-name .mask-line') || document.querySelector('.hero-name');
    const introNameWrap = document.getElementById('intro-name-wrap') || document.getElementById('intro-title-name');

    // 2. Add exposed and site-entered so home page hero layout is active
    document.body.classList.add('exposed', 'site-entered');

    // 3. Compute deltaX, deltaY, scaleRatio for FLIP transition
    if (heroTarget && introNameWrap) {
      const heroRect = heroTarget.getBoundingClientRect();
      const introRect = introNameWrap.getBoundingClientRect();

      const deltaX = (heroRect.left + heroRect.width / 2) - (introRect.left + introRect.width / 2);
      const deltaY = (heroRect.top + heroRect.height / 2) - (introRect.top + introRect.height / 2);
      const scaleRatio = (heroRect.height > 0 && introRect.height > 0) ? (heroRect.height / introRect.height) : 1;

      // Smooth FLIP motion directly landing on top of hero-name
      introNameWrap.style.willChange = 'transform, opacity, letter-spacing';
      introNameWrap.style.transition = 'transform 1.35s cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 1.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease 1.0s';
      introNameWrap.style.transform = `translate3d(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px, 0) scale(${scaleRatio.toFixed(3)})`;
      introNameWrap.style.letterSpacing = '-0.025em';
      introNameWrap.style.opacity = '0';
    }

    // 4. Trigger letterbox bars slide-out and secondary elements dismissal
    introEl.classList.add('intro-flowing');

    try {
      sessionStorage.setItem('portfolio_intro_seen', 'true');
    } catch (_) {}

    // 5. Complete handoff at 1.45s and clean up
    setTimeout(() => {
      introEl.style.display = 'none';
      introEl.setAttribute('aria-hidden', 'true');
      introEl.classList.remove('intro-flowing');
      if (introNameWrap) {
        introNameWrap.style.transform = '';
        introNameWrap.style.transition = '';
        introNameWrap.style.opacity = '';
        introNameWrap.style.letterSpacing = '';
        introNameWrap.style.willChange = '';
      }
      if (typeof onComplete === 'function') onComplete();
      setupReplayTrigger();
    }, 1450);
  }

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

  // Keyboard navigation: Enter or Space
  function onKeyDown(e) {
    if (introEl.style.display === 'none' || isDismissing) return;
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
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

      const introNameWrap = document.getElementById('intro-name-wrap') || document.getElementById('intro-title-name');
      const titleFrame = document.getElementById('intro-title-frame');
      const bgStage = introEl.querySelector('.intro-bg-stage');
      const streak = document.querySelector('.intro-anamorphic-streak');

      if (introNameWrap) {
        introNameWrap.style.transform = '';
        introNameWrap.style.transition = '';
        introNameWrap.style.opacity = '';
        introNameWrap.style.letterSpacing = '';
        introNameWrap.style.willChange = '';
      }
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

      window.addEventListener('mousemove', onIntroMouseMove, { passive: true });
    };

    if (recalibrateBtn) {
      recalibrateBtn.onclick = () => {
        window.__playShutterSound?.();
        window.__replayCinematicShot();
      };
    }
  }
}
