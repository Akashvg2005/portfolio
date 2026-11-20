/**
 * SILVER HALIDE - 2.39:1 CINEMATIC FILM INTRO (Title Sequence)
 * Based on the UI Plan for Akash's Portfolio Build
 * 
 * Timeline:
 *  0.0 - 1.0 s: Black screen. Film grain fades in at low opacity.
 *  0.6 - 1.8 s: Letterbox bars slide in from top & bottom (2.39:1 ratio).
 *  1.2 - 3.5 s: Slow push-in (scale 1.06 to 1.0) on background.
 *  2.0 - 3.8 s: "AKASH" resolves from heavy blur to sharp, letter-spacing tightening (focus pull).
 *  3.6 - 4.4 s: Role line fades in ("Engineer · Cinematographer · Storyteller").
 *  4.4 - 5.0 s: Thin silver rule draws out from centre.
 *  5.0 s onward: Waiting state cue ("Click to enter or press Enter").
 *  On enter (~1.6 s): Letterbox bars slide out. Intro fades & blurs; home page rises in with gentle focus pull.
 */

export function initLoader(onComplete) {
  const introEl = document.getElementById('cinematic-intro');
  const skipBtn = document.getElementById('intro-skip-btn');
  const enterCue = document.getElementById('intro-enter-cue');
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

  function enterSite() {
    if (isDismissing) return;
    isDismissing = true;

    // Trigger subtle acoustic camera shutter release
    window.__playShutterSound?.();

    // Begin cinematic handoff: bars slide out, title blurs and fades
    introEl.classList.add('intro-dismissing');

    // Home page rises in with optical rack-focus pull & dolly push-in
    document.body.classList.add('exposed', 'site-entered');

    try {
      sessionStorage.setItem('portfolio_intro_seen', 'true');
    } catch (_) {}

    // Complete handoff at 1.6s
    setTimeout(() => {
      introEl.style.display = 'none';
      introEl.setAttribute('aria-hidden', 'true');
      introEl.classList.remove('intro-dismissing');
      if (typeof onComplete === 'function') onComplete();
      setupReplayTrigger();
    }, 1550);
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
      introEl.classList.remove('intro-dismissing');
      isDismissing = false;

      // Re-trigger CSS animations by reflow
      const titleName = document.getElementById('intro-title-name');
      if (titleName) {
        titleName.style.animation = 'none';
        void titleName.offsetWidth;
        titleName.style.animation = '';
      }
    };

    if (recalibrateBtn) {
      recalibrateBtn.onclick = () => {
        window.__playShutterSound?.();
        window.__replayCinematicShot();
      };
    }
  }
}
