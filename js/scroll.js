/**
 * SILVER HALIDE - MOTION & SCROLL SYSTEM
 * 
 * Cinematic Camera Motion:
 * - Lenis smooth inertia scrolling synced to GSAP ScrollTrigger
 * - Entrance reveals: masked line slide-ups (80ms stagger), silver curtain wipes (1.15 -> 1.0)
 * - Parallax layers: hero typography, 3D lens, and background film grain at 3 distinct rates
 * - Overflow-hidden frame image shift (±10%)
 * - Huge outlined section numbers (01, 02...) slow drift
 * - 3D card tilt (max 8°) with moving specular light on brushed metal
 * - Magnetic CTAs (within 60px radius)
 * - Mechanical side telemetry readout (e.g. "02 / WORK") with flip animation
 * - Vertical leadership timeline drawing silver line
 */

export function initScrollSystem() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Initialize Lenis Smooth Scrolling
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    // Sync Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // 2. Section Telemetry HUD Tracking (Side readout)
  initSideTelemetry();

  // 3. Entrance Reveals & GSAP ScrollTriggers
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    initScrollAnimations();
  }

  // 4. 3D Card Tilt with Brushed Specular Light Sheen
  if (!prefersReducedMotion) {
    initCardTilt();
  }

  // 5. Magnetic CTA Buttons (60px proximity pull)
  if (!prefersReducedMotion) {
    initMagneticButtons();
  }

  // 6. Leadership Timeline Continuous Line Draw
  initTimelineLineDraw();

  return lenis;
}

function initSideTelemetry() {
  const sideIndexEl = document.getElementById('side-telemetry-index');
  const sideLabelEl = document.getElementById('side-telemetry-label');
  const sections = document.querySelectorAll('section[data-section-id]');
  if (!sideIndexEl || !sideLabelEl || sections.length === 0) return;

  const sectionMeta = {
    hero: { index: '01', label: 'EXPOSURE' },
    about: { index: '02', label: 'VIEWFINDER' },
    work: { index: '03', label: 'PORTFOLIO' },
    skills: { index: '04', label: 'OPTICS' },
    arcade: { index: '05', label: 'ARCADE' },
    leadership: { index: '06', label: 'LEADERSHIP' },
    certifications: { index: '07', label: 'ARCHIVE' },
    contact: { index: '08', label: 'SHUTTER' },
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-section-id');
        const meta = sectionMeta[id];
        if (meta) {
          // Trigger mechanical flip transition
          sideIndexEl.classList.add('telemetry-flip');
          sideLabelEl.classList.add('telemetry-flip');

          setTimeout(() => {
            sideIndexEl.textContent = meta.index;
            sideLabelEl.textContent = meta.label;
            sideIndexEl.classList.remove('telemetry-flip');
            sideLabelEl.classList.remove('telemetry-flip');
          }, 120);
        }
      }
    });
  }, { threshold: 0.35 });

  sections.forEach((sec) => observer.observe(sec));
}

function initScrollAnimations() {
  // A. Masked line reveal for headings
  const splitHeadings = document.querySelectorAll('.reveal-masked-heading');
  splitHeadings.forEach((heading) => {
    const lines = heading.querySelectorAll('.mask-line');
    if (lines.length > 0) {
      gsap.fromTo(lines, 
        { yPercent: 105, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  });

  // B. Silver Curtain Wipe for Images
  const curtainWipes = document.querySelectorAll('.curtain-reveal-box');
  curtainWipes.forEach((box) => {
    const curtain = box.querySelector('.silver-curtain');
    const img = box.querySelector('img');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: box,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    if (curtain) {
      tl.to(curtain, {
        scaleX: 0,
        transformOrigin: 'right center',
        duration: 1.1,
        ease: 'power3.inOut'
      });
    }

    if (img) {
      tl.fromTo(img, 
        { scale: 1.15 },
        { scale: 1.0, duration: 1.2, ease: 'power2.out' },
        '-=0.9'
      );
    }
  });

  // C. Parallax for background outlined section numbers
  const parallaxNums = document.querySelectorAll('.parallax-number');
  parallaxNums.forEach((num) => {
    gsap.fromTo(num,
      { y: -40 },
      {
        y: 60,
        ease: 'none',
        scrollTrigger: {
          trigger: num.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  });

  // D. Hero 3-speed parallax
  const heroText = document.querySelector('.hero-content-box');
  const heroCanvas = document.getElementById('hero-lens-canvas');
  if (heroText && heroCanvas) {
    gsap.to(heroText, {
      y: 120,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to(heroCanvas, {
      y: 180,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
}

function initCardTilt() {
  const cards = document.querySelectorAll('.tilt-metal-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max 8 degree tilt
      const rotX = ((y - centerY) / centerY) * -8;
      const rotY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015, 1.015, 1.015)`;

      // Specular highlight coordinate
      card.style.setProperty('--sheen-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--sheen-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

function initMagneticButtons() {
  const magnetics = document.querySelectorAll('.btn-magnetic');
  const radius = 60; // 60px pull radius

  magnetics.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const distX = e.clientX - btnCenterX;
      const distY = e.clientY - btnCenterY;
      const distance = Math.hypot(distX, distY);

      if (distance < radius) {
        const pullFactor = 0.35;
        btn.style.transform = `translate3d(${distX * pullFactor}px, ${distY * pullFactor}px, 0)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

function initTimelineLineDraw() {
  const lineEl = document.querySelector('.timeline-silver-line-fill');
  const trackEl = document.querySelector('.timeline-track');
  if (!lineEl || !trackEl) return;

  window.addEventListener('scroll', () => {
    const rect = trackEl.getBoundingClientRect();
    const windowH = window.innerHeight;
    
    // Calculate progress as timeline traverses viewport
    const start = windowH * 0.75;
    const end = windowH * 0.25;
    const totalDist = rect.height + (start - end);
    const scrolled = start - rect.top;

    const progress = Math.max(0, Math.min(scrolled / totalDist, 1));
    lineEl.style.height = `${progress * 100}%`;
  }, { passive: true });
}

