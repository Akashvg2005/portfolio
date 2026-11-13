/**
 * SILVER HALIDE - VIEWFINDER CURSOR
 * 
 * Camera viewfinder cursor system:
 * - 6px silver dot + 32px weighted ring trailing with lerp
 * - Autofocus lock: four corner brackets snapping to button/link bounds
 * - Project inspection: 80px ring with rotating tick marks + "VIEW" label
 * - Media/Video inspection: crosshairs with "REC ●" label
 * - Sliders/Focus rings: "‹ DRAG ›" label
 * - Shutter click pulse (150ms compress & release)
 * - mix-blend-mode: difference for dynamic contrast across surfaces
 * - Desktop only, cleanly deactivated on touch devices
 */

export function initCursor() {
  // Mobile / touch device check
  const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
  if (isTouchDevice) {
    document.body.classList.remove('has-custom-cursor');
    return;
  }

  const cursorEl = document.getElementById('viewfinder-cursor');
  const dotEl = document.getElementById('cursor-dot');
  const ringEl = document.getElementById('cursor-ring');
  const labelEl = document.getElementById('cursor-label');
  const brackets = {
    tl: document.querySelector('.cursor-bracket-tl'),
    tr: document.querySelector('.cursor-bracket-tr'),
    bl: document.querySelector('.cursor-bracket-bl'),
    br: document.querySelector('.cursor-bracket-br'),
  };

  if (!cursorEl || !dotEl || !ringEl) return;

  document.body.classList.add('has-custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let currentTarget = null;
  let isLocked = false;
  let lockRect = null;
  let isVisible = false;

  // Track real mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorEl.style.opacity = '1';
      ringX = mouseX;
      ringY = mouseY;
    }

    // Direct update for the fast precision dot
    dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    // Detect hovered context
    const target = e.target;
    updateCursorMode(target);
  }, { passive: true });

  function updateCursorMode(target) {
    if (!target) return;

    // 1. Autofocus lock on interactive elements (links, buttons, inputs)
    const lockable = target.closest('a, button, .btn-magnetic, .nav-item, .clickable, .focus-scale-knob');
    if (lockable) {
      if (currentTarget !== lockable) {
        currentTarget = lockable;
        isLocked = true;
        cursorEl.classList.add('cursor-locked');
      }
      lockRect = lockable.getBoundingClientRect();
      setLabel('');
      return;
    } else if (isLocked) {
      isLocked = false;
      currentTarget = null;
      lockRect = null;
      cursorEl.classList.remove('cursor-locked');
    }

    // 2. Project card / film frame
    const projectCard = target.closest('.film-frame, .project-slide, .view-inspect');
    if (projectCard) {
      cursorEl.classList.add('cursor-view');
      cursorEl.classList.remove('cursor-rec', 'cursor-drag');
      setLabel('VIEW');
      return;
    } else {
      cursorEl.classList.remove('cursor-view');
    }

    // 3. Media / Showreel / Video / Images
    const mediaCard = target.closest('.showreel-frame, .cinema-viewport, .viewfinder-portrait');
    if (mediaCard) {
      cursorEl.classList.add('cursor-rec');
      cursorEl.classList.remove('cursor-drag');
      setLabel('REC ●');
      return;
    } else {
      cursorEl.classList.remove('cursor-rec');
    }

    // 4. Draggable film strip & focus ring
    const draggable = target.closest('.film-strip-track, .focus-scale-track, .draggable-area');
    if (draggable) {
      cursorEl.classList.add('cursor-drag');
      setLabel('‹ DRAG ›');
      return;
    } else {
      cursorEl.classList.remove('cursor-drag');
    }

    setLabel('');
  }

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

  // Smooth lerp RAF loop with mechanical inertia
  function render() {
    if (isVisible) {
      if (isLocked && lockRect) {
        // Snap ring smoothly around the locked element's center
        const targetX = lockRect.left + lockRect.width / 2;
        const targetY = lockRect.top + lockRect.height / 2;
        ringX += (targetX - ringX) * 0.28;
        ringY += (targetY - ringY) * 0.28;

        ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        ringEl.style.width = `${lockRect.width + 12}px`;
        ringEl.style.height = `${lockRect.height + 10}px`;
        ringEl.style.borderRadius = '4px';
      } else {
        // Fluid weighted trailing ring
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        ringEl.style.borderRadius = '';
        ringEl.style.width = '';
        ringEl.style.height = '';
      }
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Shutter click pulse (150ms compress and release)
  window.addEventListener('mousedown', () => {
    cursorEl.classList.add('cursor-shutter-pulse');
  });

  window.addEventListener('mouseup', () => {
    setTimeout(() => {
      cursorEl.classList.remove('cursor-shutter-pulse');
    }, 150);
  });

  // Hide on mouseleave
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorEl.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorEl.style.opacity = '1';
  });
}

