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
  initViewfinderRoll();
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
 * Interactive Viewfinder Photo Roll in About Section
 * Allows visitors to toggle between Akash's real location portraits
 */
function initViewfinderRoll() {
  const mainImg = document.getElementById('viewfinder-main-img');
  const hudFrameLabel = document.getElementById('viewfinder-hud-frame-label');
  const thumbBtns = document.querySelectorAll('.roll-thumb-btn');

  if (!mainImg || thumbBtns.length === 0) return;

  thumbBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newSrc = btn.getAttribute('data-photo-src');
      const newLabel = btn.getAttribute('data-photo-label') || 'AKASH V G';

      if (!newSrc || mainImg.getAttribute('src') === newSrc) return;

      thumbBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Quick shutter fade transition
      mainImg.style.opacity = '0.3';
      mainImg.style.transform = 'scale(1.04)';
      setTimeout(() => {
        mainImg.src = newSrc;
        if (hudFrameLabel) hudFrameLabel.textContent = newLabel;
        mainImg.style.opacity = '1';
        mainImg.style.transform = 'scale(1.0)';
      }, 160);
    });
  });
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
    });
  });

  // GAME 1: THE DECISIVE SHUTTER
  initShutterGame();

  // GAME 2: HALIDE RUNNER
  initRunnerGame();
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
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
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
 * Web Audio API: Synthesized Mechanical Camera Shutter Click
 */
function initMechanicalAudio() {
  let audioCtx = null;

  function playShutterClick() {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audioCtx = new AudioContext();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, audioCtx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay policy or unsupported: fail silently
    }
  }

  const shutterButtons = document.querySelectorAll('.trigger-shutter-sound, .btn-shutter, .btn-arcade-shutter');
  shutterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playShutterClick();
    });
  });
}
