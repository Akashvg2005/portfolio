/**
 * SILVER HALIDE - APERTURE OPEN LOADER
 * 
 * 2.2-second mechanical camera iris opening sequence:
 * - Monospace exposure counter 000 -> 100
 * - Six silver aperture blades rotating open with cubic-bezier(0.76, 0, 0.24, 1)
 * - Shutter expansion wipe revealing the exposed viewport
 * - Session storage check to skip on repeat visits
 */

export function initLoader(onComplete) {
  const loaderEl = document.getElementById('aperture-loader');
  const counterEl = document.getElementById('loader-counter');
  const irisEl = document.getElementById('aperture-iris');
  const blades = document.querySelectorAll('.aperture-blade');
  
  if (!loaderEl) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Check if already visited in this session
  const hasVisited = sessionStorage.getItem('silver_halide_loaded');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasVisited || prefersReducedMotion) {
    loaderEl.style.display = 'none';
    document.body.classList.add('exposed');
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const duration = 2200; // 2.2 seconds
  const startTime = performance.now();
  let completed = false;

  function easeAperture(t) {
    // cubic-bezier(0.76, 0, 0.24, 1)
    // Approximation for smooth mechanical snap
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function tick(now) {
    const elapsed = now - startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = easeAperture(rawProgress);

    // Update 3-digit counter (000 to 100)
    const countValue = Math.floor(rawProgress * 100);
    const formattedCount = String(countValue).padStart(3, '0');
    if (counterEl) {
      counterEl.textContent = formattedCount;
    }

    // Rotate and retract the 6 aperture blades
    // Each blade rotates around its own offset pivot as the iris dilates
    if (blades && blades.length) {
      const openAngle = easedProgress * 62; // degrees of blade rotation
      const slideDist = easedProgress * 38; // pixel expansion
      blades.forEach((blade, i) => {
        const baseAngle = i * 60;
        blade.style.transform = `rotate(${baseAngle}deg) translate(0px, -${slideDist}px) rotate(${openAngle}deg)`;
      });
    }

    if (rawProgress < 1) {
      requestAnimationFrame(tick);
    } else if (!completed) {
      completed = true;
      finishLoader();
    }
  }

  function finishLoader() {
    sessionStorage.setItem('silver_halide_loaded', 'true');
    
    // Iris dilation past viewport
    if (irisEl) {
      irisEl.classList.add('iris-expand-out');
    }
    
    loaderEl.classList.add('loader-exposed');

    setTimeout(() => {
      document.body.classList.add('exposed');
      setTimeout(() => {
        loaderEl.style.display = 'none';
        if (typeof onComplete === 'function') onComplete();
      }, 550);
    }, 280);
  }

  // Start the frame animation
  requestAnimationFrame(tick);
}

