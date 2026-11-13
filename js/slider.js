/**
 * SILVER HALIDE - FILM STRIP + FOCUS RING SLIDER
 * 
 * Mechanical 35mm film strip slider:
 * - Sprocket holes along top and bottom edges
 * - Pointer drag, wheel, keyboard arrows, touch swipe with momentum inertia
 * - Rack-focus optics: edge frames rotate ±12° on Y-axis and blur 2-3px; center frame stays razor-sharp
 * - Lens-barrel focus scale: calibrated distance ruler with draggable silver knob
 * - Fisheye magnification of tick marks near the focus knob
 * - Monospace frame counter (e.g. "02 / 04")
 */

export class FilmStripSlider {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    if (!this.container) return;

    this.track = this.container.querySelector('.film-strip-track');
    this.slides = Array.from(this.container.querySelectorAll('.film-frame'));
    this.counterEl = this.container.querySelector('.slider-frame-counter');
    this.focusScale = this.container.querySelector('.focus-scale');
    this.focusKnob = this.container.querySelector('.focus-scale-knob');
    this.focusTicksContainer = this.container.querySelector('.focus-scale-ticks');
    this.prevBtn = this.container.querySelector('.slider-prev-btn');
    this.nextBtn = this.container.querySelector('.slider-next-btn');

    this.slideCount = this.slides.length;
    if (this.slideCount === 0) return;

    this.currentIndex = 0;
    this.targetPosition = 0;
    this.currentPosition = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartPos = 0;
    this.dragVelocity = 0;
    this.lastDragX = 0;
    this.lastDragTime = 0;
    this.isKnobDragging = false;

    this.init();
  }

  init() {
    this.buildFocusRuler();
    this.bindEvents();
    this.updateLayout();
    this.goToIndex(0, true);
    this.startAnimationLoop();

    window.addEventListener('resize', () => {
      this.updateLayout();
      this.goToIndex(this.currentIndex, true);
    });
  }

  buildFocusRuler() {
    if (!this.focusTicksContainer) return;
    this.focusTicksContainer.innerHTML = '';
    
    // Generate 64 fine mechanical tick marks along the focus barrel
    const totalTicks = 60;
    for (let i = 0; i <= totalTicks; i++) {
      const tick = document.createElement('span');
      tick.className = 'focus-tick';
      if (i % 10 === 0) {
        tick.classList.add('tick-major');
      } else if (i % 5 === 0) {
        tick.classList.add('tick-medium');
      } else {
        tick.classList.add('tick-minor');
      }
      this.focusTicksContainer.appendChild(tick);
    }
  }

  updateLayout() {
    if (!this.track || this.slides.length === 0) return;
    const containerWidth = this.container.offsetWidth;
    const firstSlide = this.slides[0];
    this.slideWidth = firstSlide.offsetWidth;
    this.slideGap = parseInt(window.getComputedStyle(this.track).gap || '24', 10);
    this.stepSize = this.slideWidth + this.slideGap;
    // Calculate track bounds
    this.centerOffset = (containerWidth - this.slideWidth) / 2;
  }

  goToIndex(index, immediate = false) {
    this.currentIndex = Math.max(0, Math.min(index, this.slideCount - 1));
    this.targetPosition = -(this.currentIndex * this.stepSize) + this.centerOffset;

    if (immediate) {
      this.currentPosition = this.targetPosition;
      this.applyTransform();
    }

    this.updateCounter();
    this.updateFocusKnob();
  }

  updateCounter() {
    if (this.counterEl) {
      const current = String(this.currentIndex + 1).padStart(2, '0');
      const total = String(this.slideCount).padStart(2, '0');
      this.counterEl.textContent = `FRAME ${current} / ${total}`;
    }
  }

  updateFocusKnob() {
    if (!this.focusScale || !this.focusKnob) return;
    const scaleWidth = this.focusScale.offsetWidth;
    const progress = this.slideCount > 1 ? this.currentIndex / (this.slideCount - 1) : 0;
    const knobX = progress * (scaleWidth - 28);
    this.focusKnob.style.transform = `translateX(${knobX}px)`;
    this.applyFisheyeMagnification(knobX + 14);
  }

  applyFisheyeMagnification(knobCenterX) {
    if (!this.focusTicksContainer) return;
    const ticks = this.focusTicksContainer.querySelectorAll('.focus-tick');
    const radius = 60; // Fisheye magnification radius in px

    ticks.forEach((tick) => {
      const tickX = tick.offsetLeft + tick.offsetWidth / 2;
      const dist = Math.abs(knobCenterX - tickX);

      if (dist < radius) {
        const factor = 1 - dist / radius;
        const scaleY = 1 + factor * 1.6;
        const brightness = 0.5 + factor * 0.5;
        tick.style.transform = `scaleY(${scaleY})`;
        tick.style.backgroundColor = `rgba(246, 247, 248, ${brightness})`;
      } else {
        tick.style.transform = 'scaleY(1)';
        tick.style.backgroundColor = '';
      }
    });
  }

  bindEvents() {
    // 1. Pointer drag on track
    this.track.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());
    window.addEventListener('pointercancel', () => this.onPointerUp());

    // 2. Horizontal wheel / trackpad scroll
    this.container.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.preventDefault();
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        this.targetPosition -= delta * 0.8;
        this.constrainBounds();
      }
    }, { passive: false });

    // 3. Arrow buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.goToIndex(this.currentIndex - 1);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.goToIndex(this.currentIndex + 1);
      });
    }

    // 4. Keyboard arrows when container is focused
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goToIndex(this.currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.goToIndex(this.currentIndex + 1);
      }
    });

    // 5. Draggable focus ring knob
    if (this.focusKnob && this.focusScale) {
      this.focusKnob.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.isKnobDragging = true;
        this.focusKnob.setPointerCapture(e.pointerId);
      });

      this.focusScale.addEventListener('pointermove', (e) => {
        if (!this.isKnobDragging) return;
        const rect = this.focusScale.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 28));
        const progress = offsetX / (rect.width - 28);
        const targetIndex = Math.round(progress * (this.slideCount - 1));
        this.goToIndex(targetIndex);
      });

      window.addEventListener('pointerup', () => {
        this.isKnobDragging = false;
      });
    }
  }

  onPointerDown(e) {
    if (e.target.closest('button, a, input')) return;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartPos = this.currentPosition;
    this.lastDragX = e.clientX;
    this.lastDragTime = performance.now();
    this.dragVelocity = 0;
    this.track.style.cursor = 'grabbing';
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    const now = performance.now();
    const deltaX = e.clientX - this.dragStartX;
    this.targetPosition = this.dragStartPos + deltaX;

    const timeDiff = now - this.lastDragTime;
    if (timeDiff > 0) {
      this.dragVelocity = (e.clientX - this.lastDragX) / timeDiff;
    }
    this.lastDragX = e.clientX;
    this.lastDragTime = now;
  }

  onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.cursor = '';

    // Apply inertia
    const inertia = this.dragVelocity * 140;
    const projectedTarget = this.currentPosition + inertia;

    // Find nearest frame
    const relativePos = this.centerOffset - projectedTarget;
    let nearestIndex = Math.round(relativePos / this.stepSize);
    nearestIndex = Math.max(0, Math.min(nearestIndex, this.slideCount - 1));

    this.goToIndex(nearestIndex);
  }

  constrainBounds() {
    const maxPos = this.centerOffset;
    const minPos = -( (this.slideCount - 1) * this.stepSize ) + this.centerOffset;
    this.targetPosition = Math.max(minPos - 80, Math.min(this.targetPosition, maxPos + 80));
  }

  applyTransform() {
    this.track.style.transform = `translate3d(${this.currentPosition}px, 0, 0)`;

    // Calculate optical rack-focus for each frame
    const containerCenter = this.container.offsetWidth / 2;

    this.slides.forEach((slide, idx) => {
      const slideRect = slide.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      const slideCenter = slideRect.left - containerRect.left + slideRect.width / 2;
      const distFromCenter = slideCenter - containerCenter;
      const normalizedDist = distFromCenter / this.stepSize;

      // Center frame is sharp; edge frames rotate ±12° on Y-axis and blur 2-3px
      const clampedOffset = Math.max(-1.5, Math.min(normalizedDist, 1.5));
      const rotY = clampedOffset * -12; // ±12° Y-rotation
      const blurAmount = Math.min(Math.abs(clampedOffset) * 2.8, 3.5);
      const opacity = Math.max(0.45, 1 - Math.abs(clampedOffset) * 0.38);

      slide.style.transform = `perspective(900px) rotateY(${rotY}deg)`;
      slide.style.filter = `blur(${blurAmount}px)`;
      slide.style.opacity = `${opacity}`;

      if (Math.abs(clampedOffset) < 0.45) {
        slide.classList.add('is-active-frame');
        if (this.currentIndex !== idx && !this.isDragging) {
          this.currentIndex = idx;
          this.updateCounter();
          this.updateFocusKnob();
        }
      } else {
        slide.classList.remove('is-active-frame');
      }
    });
  }

  startAnimationLoop() {
    const loop = () => {
      // Smooth lerp toward target position
      if (!this.isDragging) {
        this.currentPosition += (this.targetPosition - this.currentPosition) * 0.14;
      } else {
        this.currentPosition += (this.targetPosition - this.currentPosition) * 0.25;
      }

      this.applyTransform();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

export function initSliders() {
  const sliderContainers = document.querySelectorAll('.film-strip-slider');
  const instances = [];
  sliderContainers.forEach((container) => {
    instances.push(new FilmStripSlider(container));
  });
  return instances;
}

