/**
 * SILVER HALIDE - VIEWFINDER CURSOR
 * 
 * Camera viewfinder cursor system:
 * - 6px precision dot tracking physical mouse with 0 latency
 * - 36px optical ring trailing smoothly with fluid mechanical damping (lerp 0.22)
 * - Autofocus state: smoothly scales up with 4 corner brackets on interactive elements
 * - Clean tactile shutter-click compression
 * - Instant high-contrast visibility across dark (Silver Halide) and light (Satin Chrome) modes
 * - 100% non-blocking: pointer-events: none on all cursor elements
 */

export function initCursor() {
  const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
  if (isTouchDevice) {
    document.body.classList.remove('has-custom-cursor');
    return;
  }

  const cursorEl = document.getElementById('viewfinder-cursor');
  const dotEl = document.getElementById('cursor-dot');
  const ringEl = document.getElementById('cursor-ring');
  const labelEl = document.getElementById('cursor-label');

  if (!cursorEl || !dotEl || !ringEl) return;

  document.body.classList.add('has-custom-cursor');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let currentScale = 1.0;
  let isVisible = false;
  let isHovering = false;
  let isShutterPulse = false;

  function onPointerMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorEl.style.opacity = '1';
      ringX = mouseX;
      ringY = mouseY;
    }

    // Instant zero-lag dot tracking
    dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    // Detect hovered context
    const target = e.target;
    if (!target) return;

    // Interactive buttons, links, inputs
    const interactive = target.closest('a, button, [role="button"], input[type="submit"], .btn-magnetic, .clickable, .focus-scale-knob, .arcade-tab-btn, .btn-arcade-shutter, .spec-tile');
    if (interactive) {
      if (!isHovering) {
        isHovering = true;
        cursorEl.classList.add('cursor-hover', 'cursor-locked');
      }
      setLabel('');
      return;
    } else if (isHovering) {
      isHovering = false;
      cursorEl.classList.remove('cursor-hover', 'cursor-locked');
    }

    // Project inspection cards
    const projectCard = target.closest('.film-frame, .project-slide, .view-inspect');
    if (projectCard) {
      cursorEl.classList.add('cursor-view');
      cursorEl.classList.remove('cursor-rec', 'cursor-drag');
      setLabel('VIEW');
      return;
    } else {
      cursorEl.classList.remove('cursor-view');
    }

    // Media / Showreel / Video
    const mediaCard = target.closest('.showreel-frame, .cinema-viewport, .viewfinder-portrait');
    if (mediaCard) {
      cursorEl.classList.add('cursor-rec');
      cursorEl.classList.remove('cursor-drag');
      setLabel('REC \u25CF');
      return;
    } else {
      cursorEl.classList.remove('cursor-rec');
    }

    // Draggable tracks
    const draggable = target.closest('.film-strip-track, .focus-scale-track, .draggable-area');
    if (draggable) {
      cursorEl.classList.add('cursor-drag');
      setLabel('\u2039 DRAG \u203A');
      return;
    } else {
      cursorEl.classList.remove('cursor-drag');
    }

    setLabel('');
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  function setLabel(text) {
    if (!labelEl) return;
    if (text) {
      labelEl.textContent = text;
      labelEl.style.opacity = '1';
    } else {
      labelEl.textContent = '';
      labelEl.style.opacity = '0';
    }
  }

  // Smooth lerp loop for the trailing ring with scale handling
  function render() {
    if (isVisible) {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      let targetScale = 1.0;
      if (isShutterPulse) {
        targetScale = 0.78;
      } else if (cursorEl.classList.contains('cursor-view')) {
        targetScale = 1.75;
      } else if (cursorEl.classList.contains('cursor-rec')) {
        targetScale = 1.4;
      } else if (isHovering) {
        targetScale = 1.35;
      }

      currentScale += (targetScale - currentScale) * 0.25;

      ringEl.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${currentScale.toFixed(3)})`;
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Tactile Shutter Click Pulse
  window.addEventListener('pointerdown', () => {
    isShutterPulse = true;
    cursorEl.classList.add('cursor-shutter-pulse');
  }, { passive: true });

  window.addEventListener('pointerup', () => {
    isShutterPulse = false;
    cursorEl.classList.remove('cursor-shutter-pulse');
  }, { passive: true });

  // Window boundaries
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorEl.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorEl.style.opacity = '1';
  });
}
