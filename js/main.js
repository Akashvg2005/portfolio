/**
 * SILVER HALIDE - MAIN JAVASCRIPT ENTRY MODULE
 * 
 * High-End Monochromatic Camera Portfolio:
 * - Module orchestration (Loader, Viewfinder Cursor, Film Strip Sliders, Three.js, Scroll Engine)
 * - Procedural film grain canvas overlay (3-4% opacity)
 * - Interactive Viewfinder Photo Roll (switching between real location portraits)
 * - Machined Game Centre:
 *    [01] The Decisive Shutter (precision reaction timing game)
 *    [02] Halide Runner (canvas optical sensor dodger & crystal collector)
 * - Interactive Resume (CV) and Certificate inspection modals
 * - Synthesized mechanical shutter sound (Web Audio API)
 */

import { initLoader } from './loader.js';
import { initCursor } from './cursor.js';
import { initSliders } from './slider.js';
import { initScrollSystem } from './scroll.js';
import { initThreeScene } from './three-scene.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Procedural Film Grain Overlay
  initFilmGrain();

  // 2. Initialize Viewfinder Custom Cursor
  initCursor();

  // 3. Initialize Aperture Open Loader
  initLoader(() => {
    initPostLoader();
  });

  // Core interactive systems
  initSliders();
  initThreeScene();
  initScrollSystem();
  initViewfinderSlideshow();
  initGameCentre();
  initModals();
  initNavApertures();
  initMechanicalAudio();
});

function initPostLoader() {
  const heroReveal = document.querySelector('.hero-exposure-cue');
  if (heroReveal) {
    heroReveal.classList.add('is-exposed');
  }
}

/**
 * Procedural 35mm Analog Film Grain Overlay
 */
function initFilmGrain() {
  const canvas = document.getElementById('film-grain-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth / 2;
    height = canvas.height = window.innerHeight / 2;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let frameCount = 0;
  function renderGrain() {
    frameCount++;
    if (frameCount % 3 === 0) {
      const imgData = ctx.createImageData(width, height);
      const buffer = new Uint32Array(imgData.data.buffer);
      const len = buffer.length;

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.28) {
          const shade = Math.floor(Math.random() * 90) + 160;
          buffer[i] = (255 << 24) | (shade << 16) | (shade << 8) | shade;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
    requestAnimationFrame(renderGrain);
  }
  requestAnimationFrame(renderGrain);
}

/**
 * Camera Shutter Slideshow in About Section
 * Automatic & Interactive transitions between real portraits with optical exposure flash
 * (No text names displayed in bottom)
 */
function initViewfinderSlideshow() {
  const slideshow = document.getElementById('viewfinder-slideshow');
  const slides = document.querySelectorAll('.slideshow-slide');
  const dashes = document.querySelectorAll('.slide-dash-btn');
  const prevBtn = document.getElementById('slideshow-prev-btn');
  const nextBtn = document.getElementById('slideshow-next-btn');
  const flash = document.getElementById('viewfinder-shutter-flash');

  if (!slideshow || slides.length === 0) return;

  let currentIndex = 0;
  let timer = null;
  let isTransitioning = false;

  function goToSlide(index) {
    if (isTransitioning || index === currentIndex) return;
    isTransitioning = true;

    // Optical Shutter Flash / Curtain Wipe
    if (flash) {
      flash.classList.add('flashing');
    }
    window.__playShutterSound?.();

    // Outgoing slide
    slides[currentIndex].classList.remove('active');
    if (dashes[currentIndex]) dashes[currentIndex].classList.remove('active');

    currentIndex = (index + slides.length) % slides.length;

    // Incoming slide with scale and exposure reveal
    setTimeout(() => {
      slides[currentIndex].classList.add('active');
      if (dashes[currentIndex]) dashes[currentIndex].classList.add('active');
      if (flash) flash.classList.remove('flashing');
      setTimeout(() => {
        isTransitioning = false;
      }, 300);
    }, 110);
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(nextSlide, 4500);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      startTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      startTimer();
    });
  }

  dashes.forEach((dash) => {
    dash.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIdx = parseInt(dash.getAttribute('data-dash-index'), 10);
      goToSlide(targetIdx);
      startTimer();
    });
  });

  // Clicking on the viewfinder image advances to next frame
  slideshow.addEventListener('click', () => {
    nextSlide();
    startTimer();
  });

  // Pause on hover
  slideshow.addEventListener('mouseenter', stopTimer);
  slideshow.addEventListener('mouseleave', startTimer);

  startTimer();
}

/**
 * MACHINED GAME CENTRE ("05 / ARCADE")
 * Hosts two retro-hardware camera games:
 *  1. The Decisive Shutter (Reflex / Timing)
 *  2. Halide Runner (Canvas Optical Dodger)
 */
function initGameCentre() {
  const arcadeConsole = document.querySelector('.arcade-cabinet');
  if (!arcadeConsole) return;

  // Tab switching
  const tabs = document.querySelectorAll('.arcade-tab-btn');
  const views = document.querySelectorAll('.arcade-game-view');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-game-tab');
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');

      // Dispatch resize so canvas games recalculate container width/height
      window.dispatchEvent(new Event('resize'));

      // Lifecycle management for Focus Puller
      if (targetId === 'game-focus-puller') {
        window.__activateFocusPuller?.();
      } else {
        window.__deactivateFocusPuller?.();
      }
    });
  });

  // GAME 1: THE DECISIVE SHUTTER
  initShutterGame();

  // GAME 2: HALIDE RUNNER
  initRunnerGame();

  // GAME 3: FOCUS PULLER
  initFocusPullerGame();

  // GAME 4: RANGEFINDER SNIPE
  initRangefinderSnipeGame();
}

function initShutterGame() {
  const track = document.getElementById('shutter-track');
  const needle = document.getElementById('shutter-needle');
  const triggerBtn = document.getElementById('btn-arcade-shutter');
  const feedbackText = document.getElementById('shutter-feedback-text');
  const deltaText = document.getElementById('shutter-delta-text');
  const scoreVal = document.getElementById('shutter-score-val');
  const streakVal = document.getElementById('shutter-streak-val');
  const highVal = document.getElementById('shutter-high-val');

  if (!track || !needle || !triggerBtn) return;

  let currentScore = 0;
  let currentStreak = 0;
  let highScore = parseInt(localStorage.getItem('silver_shutter_high') || '0', 10);
  if (highVal) highVal.textContent = String(highScore);

  let needlePos = 0; // 0 to 1
  let direction = 1;
  let speed = 0.009;
  let isPaused = false;

  function loopNeedle() {
    if (!isPaused) {
      needlePos += speed * direction;
      if (needlePos >= 1) {
        needlePos = 1;
        direction = -1;
      } else if (needlePos <= 0) {
        needlePos = 0;
        direction = 1;
      }
      const trackWidth = track.clientWidth - 4;
      needle.style.left = `${needlePos * trackWidth}px`;
    }
    requestAnimationFrame(loopNeedle);
  }
  requestAnimationFrame(loopNeedle);

  function triggerShutter() {
    if (isPaused) return;
    isPaused = true;

    // Delta from dead-center (0.5)
    const deltaNorm = Math.abs(needlePos - 0.5);
    const msError = Math.round(deltaNorm * 120);

    let points = 0;
    let label = '';
    let rating = '';

    if (deltaNorm <= 0.045) {
      // Critical Exposure!
      points = 500;
      currentStreak++;
      label = 'CRITICAL EXPOSURE!';
      rating = `1/8000s &bull; ${msError}ms DELTA &bull; COMBO ${currentStreak}x`;
      needle.style.boxShadow = '0 0 25px #ffffff';
    } else if (deltaNorm <= 0.12) {
      // Sharp Capture
      points = 250;
      currentStreak++;
      label = 'SHARP CAPTURE';
      rating = `1/2000s &bull; +${msError}ms &bull; COMBO ${currentStreak}x`;
      needle.style.boxShadow = '0 0 15px rgba(246, 247, 248, 0.7)';
    } else if (deltaNorm <= 0.25) {
      // Acceptable
      points = 100;
      label = 'ACCEPTABLE FOCUS';
      rating = `1/500s &bull; +${msError}ms &bull; STREAK RESET`;
      currentStreak = 0;
    } else {
      // Motion Blur / Miss
      points = 0;
      label = 'MOTION BLUR &bull; MISSED';
      rating = `1/30s &bull; +${msError}ms &bull; STREAK RESET`;
      currentStreak = 0;
    }

    currentScore += points * Math.max(1, currentStreak);
    if (currentScore > highScore) {
      highScore = currentScore;
      localStorage.setItem('silver_shutter_high', String(highScore));
      if (highVal) highVal.textContent = String(highScore);
    }

    if (scoreVal) scoreVal.textContent = String(currentScore);
    if (streakVal) streakVal.textContent = `${currentStreak}x`;
    if (feedbackText) feedbackText.innerHTML = label;
    if (deltaText) deltaText.innerHTML = rating;

    // Camera flash effect
    track.style.background = '#282b30';
    setTimeout(() => {
      track.style.background = '';
      needle.style.boxShadow = '';
      // Accelerate slightly on streak
      speed = Math.min(0.022, 0.009 + currentStreak * 0.0015);
      isPaused = false;
    }, 420);
  }

  triggerBtn.addEventListener('click', triggerShutter);

  // Spacebar trigger support when viewing Arcade section
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      const activeGame = document.getElementById('game-decisive-shutter');
      if (activeGame && activeGame.classList.contains('active')) {
        const rect = activeGame.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          e.preventDefault();
          triggerShutter();
        }
      }
    }
  });
}

function initRunnerGame() {
  const canvas = document.getElementById('halide-runner-canvas');
  const scoreDisplay = document.getElementById('runner-score-val');
  const integrityDisplay = document.getElementById('runner-integrity-val');
  const overModal = document.getElementById('runner-over-modal');
  const finalScoreEl = document.getElementById('runner-final-score');
  const restartBtn = document.getElementById('runner-restart-btn');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.clientWidth || 640;
    height = canvas.height = canvas.parentElement.clientHeight || 320;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let isPlaying = false;
  let playerX = width / 2;
  const playerY = height - 36;
  const playerRadius = 9;
  let integrity = 3;
  let score = 0;
  let crystals = [];
  let obstacles = [];
  let spawnTimer = 0;
  let keys = { left: false, right: false };

  function resetGame() {
    integrity = 3;
    score = 0;
    crystals = [];
    obstacles = [];
    playerX = width / 2;
    isPlaying = true;
    if (scoreDisplay) scoreDisplay.textContent = '0';
    if (integrityDisplay) integrityDisplay.textContent = '100%';
    if (overModal) overModal.classList.remove('is-active');
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetGame();
    });
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  });

  // Pointer / Touch drag controls
  canvas.addEventListener('pointermove', (e) => {
    if (!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    playerX = Math.max(playerRadius, Math.min(e.clientX - rect.left, width - playerRadius));
  });

  function spawnObjects() {
    spawnTimer++;
    // Spawn falling silver crystal
    if (spawnTimer % 45 === 0) {
      crystals.push({
        x: Math.random() * (width - 40) + 20,
        y: -10,
        speed: 2.4 + Math.random() * 1.5,
        size: 7
      });
    }

    // Spawn falling shutter obstacle
    if (spawnTimer % 65 === 0) {
      obstacles.push({
        x: Math.random() * (width - 70) + 35,
        y: -20,
        width: 48 + Math.random() * 32,
        height: 8,
        speed: 2.8 + Math.random() * 2
      });
    }
  }

  function gameLoop() {
    if (isPlaying) {
      // Movement
      if (keys.left) playerX = Math.max(playerRadius, playerX - 5.5);
      if (keys.right) playerX = Math.min(width - playerRadius, playerX + 5.5);

      spawnObjects();

      // Clear Canvas
      ctx.fillStyle = '#090a0c';
      ctx.fillRect(0, 0, width, height);

      // Draw Horizon & Grid
      ctx.strokeStyle = '#1e2126';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw & Update Crystals
      for (let i = crystals.length - 1; i >= 0; i--) {
        const c = crystals[i];
        c.y += c.speed;

        ctx.fillStyle = '#F6F7F8';
        ctx.shadowColor = '#E4E6E9';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision with player
        const dist = Math.hypot(c.x - playerX, c.y - playerY);
        if (dist < playerRadius + c.size) {
          crystals.splice(i, 1);
          score += 150;
          if (scoreDisplay) scoreDisplay.textContent = String(score);
          continue;
        }

        if (c.y > height + 20) crystals.splice(i, 1);
      }

      // Draw & Update Obstacles
      for (let j = obstacles.length - 1; j >= 0; j--) {
        const o = obstacles[j];
        o.y += o.speed;

        ctx.strokeStyle = '#6E737A';
        ctx.fillStyle = 'rgba(110, 115, 122, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(o.x - o.width / 2, o.y, o.width, o.height);
        ctx.fillRect(o.x - o.width / 2, o.y, o.width, o.height);

        // Collision check with player
        if (
          playerX + playerRadius > o.x - o.width / 2 &&
          playerX - playerRadius < o.x + o.width / 2 &&
          playerY + playerRadius > o.y &&
          playerY - playerRadius < o.y + o.height
        ) {
          obstacles.splice(j, 1);
          integrity--;
          if (integrityDisplay) integrityDisplay.textContent = `${Math.round((integrity / 3) * 100)}%`;

          if (integrity <= 0) {
            isPlaying = false;
            if (finalScoreEl) finalScoreEl.textContent = `SCORE: ${score} PTS`;
            if (overModal) overModal.classList.add('is-active');
          }
          continue;
        }

        if (o.y > height + 30) obstacles.splice(j, 1);
      }

      // Draw Player Optical Sensor
      ctx.shadowColor = '#F6F7F8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#E4E6E9';
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Outer focus bracket ring around player
      ctx.strokeStyle = '#B8BCC2';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerRadius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    requestAnimationFrame(gameLoop);
  }

  // Start initial idle runner state
  resetGame();
  requestAnimationFrame(gameLoop);
}

/**
 * GAME 3: FOCUS PULLER (Rack Focus & Focus Peaking)
 */
function initFocusPullerGame() {
  const slider = document.getElementById('focus-ring-slider');
  const distReadout = document.getElementById('focus-current-dist-readout');
  const directorCall = document.getElementById('focus-director-call');
  const peakingIndicator = document.getElementById('focus-peaking-indicator');
  const timerVal = document.getElementById('focus-timer-val');
  const toast = document.getElementById('focus-result-toast');
  const lockBtn = document.getElementById('btn-lock-focus');
  const scoreVal = document.getElementById('focus-score-val');
  const takesVal = document.getElementById('focus-takes-val');
  const streakVal = document.getElementById('focus-streak-val');
  const ratingVal = document.getElementById('focus-rating-val');
  const cards = document.querySelectorAll('.focus-subject-card');
  const viewport = document.getElementById('focus-optical-viewport');
  const scaleMarks = document.querySelectorAll('.focus-barrel-scale .scale-mark');

  if (!slider || !lockBtn) return;

  const targets = [
    { label: 'ACTOR FOREGROUND (0.8m)', depth: 0.8, id: 'focus-plane-fore' },
    { label: 'ACTOR MIDGROUND (2.0m)', depth: 2.0, id: 'focus-plane-mid' },
    { label: 'ACTOR BACKGROUND (4.5m)', depth: 4.5, id: 'focus-plane-back' },
    { label: 'RACK TO FOREGROUND (0.8m)', depth: 0.8, id: 'focus-plane-fore' },
    { label: 'RACK TO BACKGROUND (4.5m)', depth: 4.5, id: 'focus-plane-back' },
    { label: 'RACK TO MIDGROUND (2.0m)', depth: 2.0, id: 'focus-plane-mid' },
    { label: 'CLOSE-UP FOREGROUND (0.8m)', depth: 0.8, id: 'focus-plane-fore' },
    { label: 'MASTER SHOT MIDGROUND (2.0m)', depth: 2.0, id: 'focus-plane-mid' }
  ];

  let currentTake = 0;
  let score = 0;
  let streak = 0;
  let isLocked = false;
  let timerInterval = null;
  let remainingTime = 5.0;

  function updateVisuals(dist) {
    if (distReadout) distReadout.textContent = `${dist.toFixed(2)}m`;

    scaleMarks.forEach(mark => {
      const markText = mark.textContent.trim();
      const markVal = parseFloat(markText);
      if (!isNaN(markVal) && Math.abs(dist - markVal) < 0.35) {
        mark.classList.add('active');
      } else {
        mark.classList.remove('active');
      }
    });

    const activeTarget = targets[currentTake % targets.length];
    let isPeaking = false;

    cards.forEach(card => {
      const cardDepth = parseFloat(card.getAttribute('data-depth') || '1.0');
      const delta = Math.abs(dist - cardDepth);
      const blurPx = Math.min(14, delta * 7.5);
      card.style.filter = `blur(${blurPx.toFixed(1)}px)`;

      if (card.id === activeTarget.id) {
        card.classList.add('target-cue');
        if (delta <= 0.22) {
          card.classList.add('peaking-lock');
          isPeaking = true;
        } else {
          card.classList.remove('peaking-lock');
        }
      } else {
        card.classList.remove('target-cue');
        card.classList.remove('peaking-lock');
      }
    });

    if (peakingIndicator) {
      if (isPeaking) {
        peakingIndicator.textContent = 'CRITICAL LOCK';
        peakingIndicator.classList.add('active');
      } else {
        peakingIndicator.textContent = 'SEARCHING';
        peakingIndicator.classList.remove('active');
      }
    }
  }

  function startTakeTimer() {
    clearInterval(timerInterval);
    remainingTime = 5.0;
    if (timerVal) timerVal.textContent = `${remainingTime.toFixed(1)}s`;

    timerInterval = setInterval(() => {
      remainingTime -= 0.1;
      if (remainingTime <= 0) {
        remainingTime = 0;
        clearInterval(timerInterval);
        triggerExposure(true);
      }
      if (timerVal) timerVal.textContent = `${Math.max(0, remainingTime).toFixed(1)}s`;
    }, 100);
  }

  function setupTake() {
    isLocked = false;
    const activeTarget = targets[currentTake % targets.length];
    if (directorCall) directorCall.textContent = `TARGET: ${activeTarget.label}`;
    if (takesVal) takesVal.textContent = `${(currentTake % targets.length) + 1}/${targets.length}`;
    updateVisuals(parseFloat(slider.value));
    startTakeTimer();
  }

  function triggerExposure(isTimeout = false) {
    if (isLocked) return;
    isLocked = true;
    clearInterval(timerInterval);

    window.__playShutterSound?.();

    const currentDist = parseFloat(slider.value);
    const target = targets[currentTake % targets.length];
    const delta = isTimeout ? 999 : Math.abs(currentDist - target.depth);

    let earnedPts = 0;
    let toastMsg = '';
    let rating = '';

    if (delta <= 0.20) {
      streak++;
      earnedPts = 500 * streak;
      toastMsg = `CRITICAL 4K FOCUS! +${earnedPts}`;
      rating = `PIN SHARP &bull; COMBO ${streak}x`;
    } else if (delta <= 0.45) {
      earnedPts = 250;
      streak = 0;
      toastMsg = `SHARP CAPTURE +${earnedPts}`;
      rating = `ACCEPTABLE DOFF &bull; ${delta.toFixed(2)}m OFF`;
    } else {
      streak = 0;
      earnedPts = 0;
      toastMsg = isTimeout ? 'TIME EXPIRED / CUT!' : 'SOFT FOCUS / RE-TAKE';
      rating = `OUT OF FOCUS &bull; RESET`;
    }

    score += earnedPts;
    if (scoreVal) scoreVal.textContent = String(score);
    if (streakVal) streakVal.textContent = `${streak}x`;
    if (ratingVal) ratingVal.innerHTML = rating;

    if (toast) {
      toast.textContent = toastMsg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 700);
    }

    currentTake++;
    setTimeout(() => {
      setupTake();
    }, 900);
  }

  slider.addEventListener('input', () => {
    updateVisuals(parseFloat(slider.value));
    window.__playRatchetClick?.();
  });

  if (viewport) {
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const step = 0.08;
      const current = parseFloat(slider.value);
      const next = Math.max(0.5, Math.min(5.5, current + (e.deltaY < 0 ? -step : step)));
      slider.value = String(next);
      updateVisuals(next);
    }, { passive: false });
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const targetDepth = parseFloat(card.getAttribute('data-depth') || '0.8');
      slider.value = String(targetDepth);
      updateVisuals(targetDepth);
    });
  });

  lockBtn.addEventListener('click', () => triggerExposure(false));

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      const focusView = document.getElementById('game-focus-puller');
      if (focusView && focusView.classList.contains('active')) {
        const rect = focusView.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          e.preventDefault();
          triggerExposure(false);
        }
      }
    }
  });

  window.__activateFocusPuller = function() {
    setupTake();
  };

  window.__deactivateFocusPuller = function() {
    clearInterval(timerInterval);
    if (timerVal) timerVal.textContent = 'PAUSED';
  };

  // Initial visual calibration only (timer starts when tab is opened)
  updateVisuals(parseFloat(slider.value));
}

/**
 * GAME 4: RANGEFINDER SNIPE (Rule-of-Thirds Target Shooting)
 */
function initRangefinderSnipeGame() {
  const canvas = document.getElementById('rangefinder-snipe-canvas');
  const timerVal = document.getElementById('snipe-timer-val');
  const scoreVal = document.getElementById('snipe-score-val');
  const hitsVal = document.getElementById('snipe-hits-val');
  const accVal = document.getElementById('snipe-acc-val');
  const highVal = document.getElementById('snipe-high-val');
  const modal = document.getElementById('snipe-modal');
  const modalTitle = document.getElementById('snipe-modal-title');
  const modalDesc = document.getElementById('snipe-modal-desc');
  const startBtn = document.getElementById('snipe-start-btn');

  if (!canvas || !startBtn) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.clientWidth || 680;
    height = canvas.height = canvas.parentElement.clientHeight || 320;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let isPlaying = false;
  let score = 0;
  let hits = 0;
  let totalShots = 0;
  let timeLeft = 30.0;
  let timerId = null;
  let highScore = parseInt(localStorage.getItem('silver_snipe_high') || '0', 10);
  if (highVal) highVal.textContent = String(highScore);

  let mouseX = width / 2;
  let mouseY = height / 2;
  let flashAlpha = 0;
  let targets = [];
  let particles = [];
  let floatingTexts = [];

  function spawnTarget() {
    const types = ['pedestrian', 'car', 'bird', 'flare'];
    const type = types[Math.floor(Math.random() * types.length)];
    const speed = 1.2 + Math.random() * 1.8;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = direction === 1 ? -30 : width + 30;
    const startY = 40 + Math.random() * (height - 90);

    return {
      x: startX,
      y: startY,
      vx: speed * direction,
      vy: (Math.random() - 0.5) * 0.4,
      radius: type === 'bird' ? 14 : (type === 'car' ? 24 : 18),
      type: type
    };
  }

  function initTargets() {
    targets = [];
    for (let i = 0; i < 4; i++) {
      const t = spawnTarget();
      t.x = Math.random() * width;
      targets.push(t);
    }
  }

  function startGame() {
    score = 0;
    hits = 0;
    totalShots = 0;
    timeLeft = 30.0;
    isPlaying = true;
    particles = [];
    floatingTexts = [];
    initTargets();

    if (scoreVal) scoreVal.textContent = '0';
    if (hitsVal) hitsVal.textContent = '0';
    if (accVal) accVal.textContent = '100%';
    if (modal) modal.classList.remove('is-active');

    clearInterval(timerId);
    timerId = setInterval(() => {
      timeLeft -= 0.1;
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame();
      }
      if (timerVal) timerVal.textContent = `${timeLeft.toFixed(1)}s`;
    }, 100);
  }

  function endGame() {
    isPlaying = false;
    clearInterval(timerId);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('silver_snipe_high', String(highScore));
      if (highVal) highVal.textContent = String(highScore);
    }

    if (modalTitle) modalTitle.textContent = 'Film Roll Exposed';
    if (modalDesc) {
      const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 100;
      modalDesc.innerHTML = `FINAL SCORE: <strong>${score} PTS</strong> &bull; HITS: ${hits}/${totalShots} (${accuracy}%)`;
    }
    if (modal) modal.classList.add('is-active');
  }

  startBtn.addEventListener('click', startGame);

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function shoot() {
    if (!isPlaying) return;

    totalShots++;
    flashAlpha = 0.85;
    window.__playShutterSound?.();

    const thirdX1 = width / 3;
    const thirdX2 = (width * 2) / 3;
    const thirdY1 = height / 3;
    const thirdY2 = (height * 2) / 3;
    const powerNodes = [
      { x: thirdX1, y: thirdY1 },
      { x: thirdX2, y: thirdY1 },
      { x: thirdX1, y: thirdY2 },
      { x: thirdX2, y: thirdY2 }
    ];

    let hitIndex = -1;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const dist = Math.hypot(mouseX - t.x, mouseY - t.y);
      if (dist <= t.radius + 18) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex !== -1) {
      hits++;
      const hitTarget = targets[hitIndex];

      let isGolden = false;
      for (const node of powerNodes) {
        if (Math.hypot(hitTarget.x - node.x, hitTarget.y - node.y) < 46) {
          isGolden = true;
          break;
        }
      }

      const pts = isGolden ? 600 : 250;
      score += pts;

      for (let p = 0; p < 12; p++) {
        particles.push({
          x: hitTarget.x,
          y: hitTarget.y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 25,
          color: isGolden ? '#ffffff' : '#C7CAD0'
        });
      }

      floatingTexts.push({
        x: hitTarget.x,
        y: hitTarget.y - 10,
        text: isGolden ? 'GOLDEN RATIO COMBO! +600' : 'SHARP CAPTURE +250',
        color: isGolden ? '#ffffff' : '#D0D4DC',
        life: 30
      });

      targets[hitIndex] = spawnTarget();
    } else {
      score = Math.max(0, score - 50);
      floatingTexts.push({
        x: mouseX,
        y: mouseY - 10,
        text: 'MISSED -50',
        color: '#8A939E',
        life: 20
      });
    }

    const accuracy = Math.round((hits / totalShots) * 100);
    if (scoreVal) scoreVal.textContent = String(score);
    if (hitsVal) hitsVal.textContent = String(hits);
    if (accVal) accVal.textContent = `${accuracy}%`;
  }

  canvas.addEventListener('click', shoot);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      const snipeView = document.getElementById('game-rangefinder-snipe');
      if (snipeView && snipeView.classList.contains('active')) {
        const rect = snipeView.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          e.preventDefault();
          shoot();
        }
      }
    }
  });

  function draw() {
    ctx.fillStyle = '#08090a';
    ctx.fillRect(0, 0, width, height);

    const thirdX1 = width / 3;
    const thirdX2 = (width * 2) / 3;
    const thirdY1 = height / 3;
    const thirdY2 = (height * 2) / 3;

    ctx.strokeStyle = 'rgba(138, 147, 158, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(thirdX1, 0); ctx.lineTo(thirdX1, height);
    ctx.moveTo(thirdX2, 0); ctx.lineTo(thirdX2, height);
    ctx.moveTo(0, thirdY1); ctx.lineTo(width, thirdY1);
    ctx.moveTo(0, thirdY2); ctx.lineTo(width, thirdY2);
    ctx.stroke();
    ctx.setLineDash([]);

    const powerNodes = [
      { x: thirdX1, y: thirdY1 },
      { x: thirdX2, y: thirdY1 },
      { x: thirdX1, y: thirdY2 },
      { x: thirdX2, y: thirdY2 }
    ];

    powerNodes.forEach(node => {
      ctx.strokeStyle = 'rgba(246, 247, 248, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
      ctx.stroke();
    });

    if (isPlaying) {
      targets.forEach(t => {
        t.x += t.vx;
        t.y += t.vy;

        if (t.x < -40) t.x = width + 40;
        if (t.x > width + 40) t.x = -40;
        if (t.y < 30 || t.y > height - 40) t.vy *= -1;

        ctx.save();
        ctx.translate(t.x, t.y);

        if (t.type === 'bird') {
          ctx.strokeStyle = '#D0D4DC';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-10, 4);
          ctx.quadraticCurveTo(-4, -6, 0, 0);
          ctx.quadraticCurveTo(4, -6, 10, 4);
          ctx.stroke();
        } else if (t.type === 'car') {
          ctx.fillStyle = '#8A939E';
          ctx.fillRect(-18, -6, 36, 12);
          ctx.fillStyle = '#C7CAD0';
          ctx.fillRect(-8, -12, 18, 7);
          ctx.fillStyle = '#08090a';
          ctx.beginPath();
          ctx.arc(-10, 6, 4, 0, Math.PI * 2);
          ctx.arc(10, 6, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (t.type === 'flare') {
          const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#C7CAD0';
          ctx.beginPath();
          ctx.arc(0, -10, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-3, -5, 6, 14);
        }

        ctx.restore();
      });

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
        if (p.life <= 0) particles.splice(i, 1);
      }

      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.8;
        ft.life--;
        ctx.fillStyle = ft.color;
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillText(ft.text, ft.x - 40, ft.y);
        if (ft.life <= 0) floatingTexts.splice(i, 1);
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(mouseX - 14, mouseY - 10, 28, 20);
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(mouseX - 11, mouseY - 8, 22, 16);
      ctx.setLineDash([]);

      const bLen = 8;
      const bRad = 24;
      ctx.strokeStyle = 'rgba(246, 247, 248, 0.65)';
      ctx.beginPath();
      ctx.moveTo(mouseX - bRad, mouseY - bRad + bLen); ctx.lineTo(mouseX - bRad, mouseY - bRad); ctx.lineTo(mouseX - bRad + bLen, mouseY - bRad);
      ctx.moveTo(mouseX + bRad - bLen, mouseY - bRad); ctx.lineTo(mouseX + bRad, mouseY - bRad); ctx.lineTo(mouseX + bRad, mouseY - bRad + bLen);
      ctx.moveTo(mouseX - bRad, mouseY + bRad - bLen); ctx.lineTo(mouseX - bRad, mouseY + bRad); ctx.lineTo(mouseX - bRad + bLen, mouseY + bRad);
      ctx.moveTo(mouseX + bRad - bLen, mouseY + bRad); ctx.lineTo(mouseX + bRad, mouseY + bRad); ctx.lineTo(mouseX + bRad, mouseY + bRad - bLen);
      ctx.stroke();
    }

    if (flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, width, height);
      flashAlpha *= 0.68;
    }

    requestAnimationFrame(draw);
  }

  initTargets();
  requestAnimationFrame(draw);
}

/**
 * Nav Links Aperture Icon Hover Rotation
 */
function initNavApertures() {
  const navLinks = document.querySelectorAll('.nav-link-item');
  navLinks.forEach((link) => {
    const icon = link.querySelector('.nav-aperture-icon');
    if (!icon) return;
    
    link.addEventListener('mouseenter', () => {
      icon.style.transform = 'rotate(60deg)';
    });
    link.addEventListener('mouseleave', () => {
      icon.style.transform = 'rotate(0deg)';
    });
  });
}

/**
 * Modals System: Resume CV Viewer & Certificate Inspector
 */
function initModals() {
  const resumeTriggers = document.querySelectorAll('.trigger-resume-modal');
  const certTriggers = document.querySelectorAll('.trigger-cert-modal');
  const resumeModal = document.getElementById('resume-modal');
  const certModal = document.getElementById('cert-modal');
  const closeBtns = document.querySelectorAll('.modal-close-btn');
  const modalBackdrops = document.querySelectorAll('.modal-backdrop');

  resumeTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(resumeModal);
    });
  });

  certTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-cert-title') || 'Certificate of Completion';
      const issuer = btn.getAttribute('data-cert-issuer') || 'Accredited Issuer';
      const date = btn.getAttribute('data-cert-date') || 'Verified';
      const grade = btn.getAttribute('data-cert-grade') || '';
      const docPath = btn.getAttribute('data-cert-doc') || 'assets/nielit-cyber-security-certificate.pdf';
      const imgPath = btn.getAttribute('data-cert-img') || '';

      const titleEl = document.getElementById('cert-modal-title');
      const issuerEl = document.getElementById('cert-modal-issuer');
      const gradeEl = document.getElementById('cert-modal-grade');
      const frameEl = document.getElementById('cert-modal-frame');
      const downloadLink = document.getElementById('cert-modal-download');

      if (titleEl) titleEl.textContent = title;
      if (issuerEl) issuerEl.textContent = `${issuer} · ${date}`;
      if (gradeEl) {
        gradeEl.textContent = grade ? `ACCREDITATION GRADE: ${grade}` : '';
        gradeEl.style.display = grade ? 'inline-block' : 'none';
      }
      if (downloadLink) downloadLink.href = docPath;

      if (frameEl) {
        if (imgPath) {
          frameEl.innerHTML = `<img src="${imgPath}" alt="${title}" class="cert-modal-image" />`;
        } else {
          frameEl.innerHTML = `<iframe src="${docPath}#toolbar=0" title="${title}" class="cert-modal-iframe"></iframe>`;
        }
      }

      openModal(certModal);
    });
  });

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    window.__playClapperSound?.('in');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    window.__playClapperSound?.('out');
  }

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.silver-modal'));
    });
  });

  modalBackdrops.forEach((backdrop) => {
    backdrop.addEventListener('click', () => {
      closeModal(backdrop.closest('.silver-modal'));
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.silver-modal.is-open');
      if (openModalEl) closeModal(openModalEl);
    }
  });
}

/**
 * Procedural Analog Sound Design (Web Audio API)
 * - 35mm Background Camera Rolling Motor
 * - Director's Clapperboard (Clap In / Clap Out)
 * - Dual-Curtain Focal-Plane Shutter Click
 * - Film Advance / Winding Sprocket Ratchet
 * - Optical Dial / Focus Ring Micro-ticks
 */
function initMechanicalAudio() {
  let audioCtx = null;
  let isAudioEnabled = localStorage.getItem('silver_audio_enabled') !== 'false';
  let motorSourceNode = null;
  let motorGainNode = null;
  let isMotorRolling = false;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 1. Dual-Curtain Mechanical Camera Shutter
  function playShutterClick() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Curtain 1 (Opening transient)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'highpass';
      filter1.frequency.setValueAtTime(1600, t);
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(2600, t);
      osc1.frequency.exponentialRampToValueAtTime(100, t + 0.03);
      gain1.gain.setValueAtTime(0.045, t);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.035);

      // Curtain 2 (Closing brake snap, +30ms delay)
      const t2 = t + 0.03;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(1200, t2);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1800, t2);
      osc2.frequency.exponentialRampToValueAtTime(80, t2 + 0.035);
      gain2.gain.setValueAtTime(0.035, t2);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.035);
      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.04);
    } catch (e) {}
  }

  // 2. Director's Clapperboard ("Clap In" / "Clap Out")
  function playClapperSound(type = 'in') {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Primary Wooden Slate Slap (High frequency impulse)
      const bufferSize = Math.floor(ctx.sampleRate * 0.02);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(type === 'in' ? 2400 : 1900, t);
      noiseFilter.Q.setValueAtTime(2.0, t);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);

      // Resonant Wooden Body Thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      const startFreq = type === 'in' ? 480 : 360;
      const endFreq = type === 'in' ? 140 : 110;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.05);
      oscGain.gain.setValueAtTime(0.07, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.065);
    } catch (e) {}
  }

  // 3. Film Winding / Advance Sprocket Ratchet
  function playFilmAdvanceSound() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      [0, 0.035, 0.075].forEach((offset) => {
        const clickTime = t + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2200, clickTime);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3200 - offset * 800, clickTime);
        osc.frequency.exponentialRampToValueAtTime(300, clickTime + 0.018);
        gain.gain.setValueAtTime(0.025, clickTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.018);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(clickTime);
        osc.stop(clickTime + 0.02);
      });
    } catch (e) {}
  }

  // 4. Optical Focus Ring Dial Ratchet Tick
  function playRatchetClick() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3400, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.008);
      gain.gain.setValueAtTime(0.015, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.01);
    } catch (e) {}
  }

  // 5. 35mm Background Camera Rolling Motor (Continuous Subtle Whir)
  function startCameraMotorRoll() {
    if (!isAudioEnabled || isMotorRolling) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      isMotorRolling = true;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const timeSec = i / ctx.sampleRate;
        const flutter = Math.sin(timeSec * Math.PI * 2 * 24);
        const noise = (Math.random() * 2 - 1) * 0.4;
        const motorHum = Math.sin(timeSec * Math.PI * 2 * 72) * 0.25;
        data[i] = (noise + motorHum) * (0.6 + 0.4 * flutter);
      }

      motorSourceNode = ctx.createBufferSource();
      motorSourceNode.buffer = buffer;
      motorSourceNode.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(260, ctx.currentTime);
      bandpass.Q.setValueAtTime(2.2, ctx.currentTime);

      motorGainNode = ctx.createGain();
      motorGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      motorGainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1.2);

      motorSourceNode.connect(bandpass);
      bandpass.connect(motorGainNode);
      motorGainNode.connect(ctx.destination);

      motorSourceNode.start();
    } catch (e) {
      isMotorRolling = false;
    }
  }

  function stopCameraMotorRoll() {
    if (!isMotorRolling) return;
    try {
      if (motorGainNode && audioCtx) {
        motorGainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        setTimeout(() => {
          if (motorSourceNode) {
            try { motorSourceNode.stop(); } catch (e) {}
            motorSourceNode.disconnect();
          }
          isMotorRolling = false;
        }, 450);
      } else {
        isMotorRolling = false;
      }
    } catch (e) {
      isMotorRolling = false;
    }
  }

  // Audio Toggle UI in Header
  const audioToggleBtn = document.getElementById('btn-audio-toggle');
  const audioToggleLabel = document.getElementById('audio-toggle-label');

  function updateAudioUI() {
    if (!audioToggleBtn) return;
    if (isAudioEnabled) {
      audioToggleBtn.classList.add('is-active');
      if (audioToggleLabel) audioToggleLabel.textContent = 'AUDIO // 35mm ON';
      startCameraMotorRoll();
    } else {
      audioToggleBtn.classList.remove('is-active');
      if (audioToggleLabel) audioToggleLabel.textContent = 'AUDIO // MUTE';
      stopCameraMotorRoll();
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      getAudioContext();
      isAudioEnabled = !isAudioEnabled;
      localStorage.setItem('silver_audio_enabled', String(isAudioEnabled));
      if (isAudioEnabled) {
        playClapperSound('in');
      }
      updateAudioUI();
    });
  }

  const onFirstGesture = () => {
    getAudioContext();
    if (isAudioEnabled) {
      startCameraMotorRoll();
    }
    window.removeEventListener('click', onFirstGesture);
    window.removeEventListener('keydown', onFirstGesture);
  };
  window.addEventListener('click', onFirstGesture);
  window.addEventListener('keydown', onFirstGesture);

  // Global triggers
  window.__playShutterSound = playShutterClick;
  window.__playClapperSound = playClapperSound;
  window.__playFilmAdvanceSound = playFilmAdvanceSound;
  window.__playRatchetClick = playRatchetClick;
  window.__startCameraMotor = startCameraMotorRoll;
  window.__stopCameraMotor = stopCameraMotorRoll;

  const shutterButtons = document.querySelectorAll('.trigger-shutter-sound, .btn-shutter, .btn-arcade-shutter');
  shutterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playShutterClick();
    });
  });

  updateAudioUI();
}
