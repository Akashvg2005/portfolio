/**
 * SILVER HALIDE - 2.39:1 CINEMATIC SHOT ENTRY
 * Anamorphic Letterbox Opening, Rack Focus Pull & Camera Dolly-In
 */

export function initLoader(onComplete) {
  const curtain = document.getElementById('cinematic-curtain');
  const slate = document.getElementById('cinematic-slate');
  const recalibrateBtn = document.getElementById('btn-recalibrate-optics');

  if (!curtain) {
    document.body.classList.add('exposed');
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const hasVisited = sessionStorage.getItem('silver_cinematic_opened');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasVisited || prefersReducedMotion) {
    curtain.style.display = 'none';
    document.body.classList.add('exposed');
    if (typeof onComplete === 'function') onComplete();
    setupReplayTrigger();
    return;
  }

  runCinematicShot(onComplete);

  function runCinematicShot(done) {
    curtain.style.display = 'flex';
    curtain.classList.remove('curtain-open');
    if (slate) slate.classList.remove('slate-fade');

    // 1. Brief pause to establish the film slate (420ms)
    setTimeout(() => {
      // 2. Play subtle mechanical shutter / clapper sound
      window.__playShutterSound?.();

      // 3. Fade slate and smoothly part anamorphic letterbox curtains
      if (slate) slate.classList.add('slate-fade');
      curtain.classList.add('curtain-open');

      // 4. Expose the hero section: pulls focus and dollies forward
      document.body.classList.add('exposed');
      sessionStorage.setItem('silver_cinematic_opened', 'true');

      // 5. Complete transition and hide overlay
      setTimeout(() => {
        curtain.style.display = 'none';
        if (typeof done === 'function') done();
        setupReplayTrigger();
      }, 950);
    }, 420);
  }

  function setupReplayTrigger() {
    window.__replayCinematicShot = function() {
      sessionStorage.removeItem('silver_cinematic_opened');
      document.body.classList.remove('exposed');
      runCinematicShot(() => {
        const heroReveal = document.querySelector('.hero-exposure-cue');
        if (heroReveal) heroReveal.classList.add('is-exposed');
      });
    };

    if (recalibrateBtn) {
      recalibrateBtn.onclick = () => {
        window.__playShutterSound?.();
        window.__replayCinematicShot();
      };
    }
  }
}
