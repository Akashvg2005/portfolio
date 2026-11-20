/**
 * SILVER HALIDE - MOTION & SCROLL SYSTEM
 * 
 * Cinematic Camera Motion:
 * - Lenis smooth inertia scrolling synced to GSAP ScrollTrigger
 * - Entrance reveals: masked line slide-ups (80ms stagger), silver curtain wipes
 * - 3D Gyro / Mousemove Parallax across hero elements, lenses, and floating section numbers
 * - Overflow-hidden frame image shift with perspective tilt on project film frames
 * - 3D card tilt with moving specular highlight on brushed metal and film chassis
 * - Magnetic CTAs & buttons (60px proximity pull)
 * - Telemetry exposure HUD tracking (top bar & side telemetry readout)
 * - Vertical leadership timeline drawing silver line
 * - Tactile acoustic shutter audio feedback on micro-interactions
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

  // 2. Section Telemetry HUD Tracking (Side readout & Top Bar ISO/Shutter)
  initSideTelemetry();

  // 3. Entrance Reveals & GSAP ScrollTriggers
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    initScrollAnimations();
  }

  // 4. Hero Mousemove Parallax
  if (!prefersReducedMotion) {
    initHeroParallax();
  }

  // 5. 3D Card Tilt with Brushed Specular Light Sheen & Image Parallax Shift
  if (!prefersReducedMotion) {
    initCardTilt();
  }

  // 6. Magnetic CTA Buttons (60px proximity pull)
  if (!prefersReducedMotion) {
    initMagneticButtons();
  }

  // 7. Leadership Timeline Continuous Line Draw
  initTimelineLineDraw();

  // 8. Smooth Scroll Anchor Links with Audio Feedback
  initSmoothScrollLinks();

  return lenis;
}

function initSideTelemetry() {
  const sideIndexEl = document.getElementById('side-telemetry-index');
  const sideLabelEl = document.getElementById('side-telemetry-label');
  const topTelemetry = document.querySelector('.telemetry-readout');
  const sections = document.querySelectorAll('section[data-section-id]');
  if (sections.length === 0) return;

  const sectionMeta = {
    hero: { index: '01', label: 'EXPOSURE', telemetry: 'ISO 100 · 1/250s · f/1.4' },
    about: { index: '02', label: 'VIEWFINDER', telemetry: 'ISO 200 · 1/125s · f/2.0' },
    work: { index: '03', label: 'PORTFOLIO', telemetry: 'ISO 400 · 1/500s · f/2.8' },
    skills: { index: '04', label: 'OPTICS', telemetry: 'ISO 100 · 1/1000s · f/1.4' },
    arcade: { index: '05', label: 'ARCADE', telemetry: 'ISO 800 · 1/60s · f/1.2' },
    leadership: { index: '06', label: 'EXPERIENCE', telemetry: 'ISO 400 · 1/250s · f/2.0' },
    certifications: { index: '07', label: 'ARCHIVE', telemetry: 'ISO 100 · 1/60s · f/4.0' },
    contact: { index: '08', label: 'SHUTTER', telemetry: 'ISO 1600 · 1/30s · f/1.4' },
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-section-id');
        const meta = sectionMeta[id];
        if (meta) {
          // Trigger mechanical flip transition on side readout
          if (sideIndexEl && sideLabelEl) {
            sideIndexEl.classList.add('telemetry-flip');
            sideLabelEl.classList.add('telemetry-flip');

            setTimeout(() => {
              sideIndexEl.textContent = meta.index;
              sideLabelEl.textContent = meta.label;
              sideIndexEl.classList.remove('telemetry-flip');
              sideLabelEl.classList.remove('telemetry-flip');
            }, 120);
          }

          // Top bar exposure telemetry update with soft fade
          if (topTelemetry && meta.telemetry) {
            topTelemetry.style.transition = 'opacity 0.2s ease';
            topTelemetry.style.opacity = '0.35';
            setTimeout(() => {
              topTelemetry.textContent = meta.telemetry;
              topTelemetry.style.opacity = '1';
            }, 150);
          }
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

/**
 * 3D Mousemove Parallax for Hero Elements
 */
function initHeroParallax() {
  const heroSection = document.getElementById('hero');
  const heroContent = document.querySelector('.hero-content-box');
  const heroLens = document.querySelector('.hero-lens-stage');
  const parallaxNum = document.querySelector('#hero .parallax-number');

  if (!heroSection) return;

  heroSection.addEventListener('mousemove', (e) => {
    const { innerWidth: w, innerHeight: h } = window;
    const nx = (e.clientX / w - 0.5) * 2;
    const ny = (e.clientY / h - 0.5) * 2;

    if (heroContent) {
      heroContent.style.transform = `translate3d(${nx * 9}px, ${ny * 7}px, 0)`;
    }
    if (heroLens) {
      heroLens.style.transform = `translate3d(${-nx * 15}px, ${-ny * 11}px, 0)`;
    }
    if (parallaxNum) {
      parallaxNum.style.transform = `translate3d(${nx * 24}px, ${ny * 18}px, 0)`;
    }
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    if (heroContent) heroContent.style.transform = 'translate3d(0, 0, 0)';
    if (heroLens) heroLens.style.transform = 'translate3d(0, 0, 0)';
    if (parallaxNum) parallaxNum.style.transform = 'translate3d(0, 0, 0)';
  });
}

/**
 * 3D Card Tilt with Specular Glare & Photo Parallax Shift
 */
function initCardTilt() {
  const cards = document.querySelectorAll('.tilt-metal-card, .film-frame, .leadership-card, .spec-tile');
  cards.forEach((card) => {
    const img = card.querySelector('.frame-media-box img, img');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max 6.5 degree tilt
      const rotX = ((y - centerY) / centerY) * -6.5;
      const rotY = ((x - centerX) / centerX) * 6.5;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`;

      // Specular highlight coordinate
      card.style.setProperty('--sheen-x', `${((x / rect.width) * 100).toFixed(1)}%`);
      card.style.setProperty('--sheen-y', `${((y / rect.height) * 100).toFixed(1)}%`);

      // Parallax image shift inside frame
      if (img) {
        const imgShiftX = ((x - centerX) / centerX) * -8;
        const imgShiftY = ((y - centerY) / centerY) * -8;
        img.style.transform = `scale(1.08) translate3d(${imgShiftX.toFixed(1)}px, ${imgShiftY.toFixed(1)}px, 0)`;
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (img) {
        img.style.transform = 'scale(1.0) translate3d(0, 0, 0)';
      }
    });
  });
}

/**
 * Magnetic CTA Buttons (60px proximity pull)
 */
function initMagneticButtons() {
  const magnetics = document.querySelectorAll(
    '.btn-magnetic, .btn-machined-silver, .intro-skip-btn, .hero-scroll-cue, .btn-arcade-shutter, .frame-link, .btn-label-swap'
  );
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
        const pullFactor = 0.32;
        btn.style.transform = `translate3d(${distX * pullFactor}px, ${distY * pullFactor}px, 0)`;
      }
    }, { passive: true });

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

/**
 * Smooth Scroll Links with Audio Shutter Feedback
 */
function initSmoothScrollLinks() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          window.__playShutterSound?.();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}
