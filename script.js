/* ==========================================================================
   Akash V G — Personal Portfolio Script
   Terminal Engine, Web Audio FX, Scroll Sound Synthesizer, 
   Cmd+K Palette, ISL Simulator, Whirly Bird Game & Tic-Tac-Toe AI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. STATE & AUDIO SYNTHESIZER ENGINE (Web Audio API)
  // --------------------------------------------------------------------------
  const state = {
    soundEnabled: false,
    currentTheme: localStorage.getItem('theme') || 'dark',
    currentAccent: localStorage.getItem('accent') || 'indigo',
    whirlyHighScore: parseInt(localStorage.getItem('whirly_high') || '0', 10),
    tttScoreX: 0,
    tttScoreO: 0,
    tttBoard: Array(9).fill(null),
    tttActive: true,
    lastScrollY: window.scrollY
  };

  // Audio Context Setup
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play Retro Synthesizer Tone
  function playSound(type) {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'scroll') {
        // Subtle low-freq soft blip for scrolling
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'jump') {
        // Whirly bird flap jump
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'score') {
        // Score chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        // Game Over explosion
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        // Tic Tac Toe Win
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (err) {
      console.warn('Audio play error:', err);
    }
  }

  // Sound FX Toggle Listener
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIconOff = soundToggleBtn?.querySelector('.sound-icon-off');
  const soundIconOn = soundToggleBtn?.querySelector('.sound-icon-on');

  soundToggleBtn?.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    if (state.soundEnabled) {
      initAudio();
      soundIconOff?.classList.add('hidden');
      soundIconOn?.classList.remove('hidden');
      soundToggleBtn.setAttribute('title', 'Sound FX (ON)');
      playSound('score');
    } else {
      soundIconOff?.classList.remove('hidden');
      soundIconOn?.classList.add('hidden');
      soundToggleBtn.setAttribute('title', 'Sound FX (OFF)');
    }
  });

  // --------------------------------------------------------------------------
  // 2. THROTTLED SCROLL SOUND SYNTHESIZER
  // --------------------------------------------------------------------------
  let lastScrollSoundTime = 0;
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const now = Date.now();

    // Play scroll sound if user scrolled more than 120px and 200ms elapsed
    if (state.soundEnabled && Math.abs(currentY - state.lastScrollY) > 120 && now - lastScrollSoundTime > 200) {
      playSound('scroll');
      lastScrollSoundTime = now;
      state.lastScrollY = currentY;
    }
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 3. THEME & ACCENT COLOR SYSTEM
  // --------------------------------------------------------------------------
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn?.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn?.querySelector('.moon-icon');

  function applyTheme(theme) {
    state.currentTheme = theme;
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'light') {
      sunIcon?.classList.remove('hidden');
      moonIcon?.classList.add('hidden');
    } else {
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
    }
  }

  applyTheme(state.currentTheme);

  themeToggleBtn?.addEventListener('click', () => {
    playSound('click');
    applyTheme(state.currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Accent Color Customizer
  const accentPickerBtn = document.getElementById('accent-picker-btn');
  const accentMenu = document.getElementById('accent-menu');
  const accentOpts = document.querySelectorAll('.accent-opt');

  function applyAccent(accent) {
    state.currentAccent = accent;
    htmlEl.setAttribute('data-accent', accent);
    localStorage.setItem('accent', accent);
  }

  applyAccent(state.currentAccent);

  accentPickerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound('click');
    accentMenu?.classList.toggle('hidden');
  });

  accentOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      const accent = opt.getAttribute('data-accent');
      if (accent) {
        applyAccent(accent);
        playSound('click');
        accentMenu?.classList.add('hidden');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!accentPickerBtn?.contains(e.target) && !accentMenu?.contains(e.target)) {
      accentMenu?.classList.add('hidden');
    }
  });

  // Navbar Scroll Background Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const navLinksRow = document.getElementById('nav-links');

  mobileMenuBtn?.addEventListener('click', () => {
    playSound('click');
    const isOpen = navLinksRow?.classList.toggle('open');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      playSound('click');
      navLinksRow?.classList.remove('open');
    });
  });

  // --------------------------------------------------------------------------
  // 4. INTERACTIVE CLI TERMINAL ENGINE
  // --------------------------------------------------------------------------
  const terminalInput = document.getElementById('terminal-input');
  const terminalForm = document.getElementById('terminal-form');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalClearBtn = document.getElementById('terminal-clear-btn');
  const cmdPills = document.querySelectorAll('.cmd-pill');

  const terminalCommands = {
    help: `Available commands:
  - <span class="highlight-code">signbridge</span> : Flagship AI Sign Language platform details
  - <span class="highlight-code">skills</span>     : Technical stack & proficiency metrics
  - <span class="highlight-code">projects</span>   : Full project repository list
  - <span class="highlight-code">education</span>  : Academic background at COE Cherthala
  - <span class="highlight-code">arcade</span>     : Launch minigames (Whirly Bird / Tic-Tac-Toe)
  - <span class="highlight-code">contact</span>    : Direct email & social links
  - <span class="highlight-code">theme</span>      : Toggle light/dark mode
  - <span class="highlight-code">clear</span>      : Clear screen`,

    signbridge: `🚀 <strong class="text-accent">SignBridge (Flagship Project)</strong>
AI-powered interview platform for Deaf and Hard-of-Hearing candidates using Indian Sign Language (ISL) recognition.
• Tech: Python, MediaPipe, Flutter, TensorFlow, OpenCV, Antigravity AI
• Status: Phase 2 Active Development`,

    skills: `⚡ <strong class="text-accent">Technical Stack:</strong>
• Languages  : Dart, JavaScript (ES6+), Python, HTML5/CSS3
• Frameworks : Flutter, React Native, Node.js, Express, Flame 2.5D
• AI & Vision: MediaPipe, OpenCV, TensorFlow, Antigravity Workflows
• Databases  : Firebase Firestore, Realtime DB, Cloud Storage`,

    projects: `📁 <strong class="text-accent">Key Projects:</strong>
1. SignBridge (AI ISL Interview Platform)
2. Smart Bus Tracking & Monitoring System ("FaceIt!")
3. Layam – The Music Mate (React Native / Expo Music Player)
4. Netflix UI Clone (HTML/CSS/JS)`,

    education: `🎓 <strong class="text-accent">Education:</strong>
• B.Tech Computer Science and Engineering (2023–2027)
  College of Engineering, Cherthala, Kerala, India`,

    arcade: `🎮 <strong class="text-accent">Arcade Zone:</strong>
Opening Arcade Zone... Jump down to play Whirly Bird or Tic-Tac-Toe!`,

    contact: `📬 <strong class="text-accent">Get in Touch:</strong>
• Email   : akashvg2005@gmail.com
• GitHub  : https://github.com/Akashvg2005
• LinkedIn: https://www.linkedin.com/in/akash-v-g-76b46a291/`,

    matrix: `<span style="color:#10b981;">01010011 01001001 01000111 01001110 01000010 01010010 01001001 01000100 01000111 01000101</span><br><span class="text-accent">System initialized. Antigravity core online.</span>`
  };

  function printTerminalLine(cmd, output) {
    const entry = document.createElement('div');
    entry.className = 'terminal-line';
    entry.innerHTML = `<span class="terminal-prompt">akash@portfolio:~$</span> <strong>${cmd}</strong><br>${output}`;
    terminalOutput?.appendChild(entry);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  terminalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawCmd = terminalInput.value.trim().toLowerCase();
    if (!rawCmd) return;

    playSound('click');
    terminalInput.value = '';

    if (rawCmd === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    if (rawCmd === 'theme') {
      applyTheme(state.currentTheme === 'dark' ? 'light' : 'dark');
      printTerminalLine(rawCmd, `Switched theme to ${state.currentTheme} mode.`);
      return;
    }

    if (rawCmd === 'arcade') {
      document.getElementById('arcade')?.scrollIntoView({ behavior: 'smooth' });
      printTerminalLine(rawCmd, terminalCommands.arcade);
      return;
    }

    const output = terminalCommands[rawCmd] || `Command not found: <span style="color:#ef4444;">'${rawCmd}'</span>. Type <span class="highlight-code">'help'</span> for list.`;
    printTerminalLine(rawCmd, output);
  });

  cmdPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cmd = pill.getAttribute('data-cmd');
      if (cmd && terminalInput) {
        terminalInput.value = cmd;
        terminalForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  terminalClearBtn?.addEventListener('click', () => {
    playSound('click');
    terminalOutput.innerHTML = '';
  });

  // --------------------------------------------------------------------------
  // 5. SIGNBRIDGE ISL SIMULATOR CANVAS ANIMATION
  // --------------------------------------------------------------------------
  const openSimBtn = document.getElementById('open-isl-sim-btn');
  const closeSimBtn = document.getElementById('close-isl-sim');
  const simWidget = document.getElementById('isl-sim-widget');
  const landmarkCanvas = document.getElementById('landmark-canvas');
  const simGestureOutput = document.getElementById('sim-gesture-output');
  const simConfidenceOutput = document.getElementById('sim-confidence-output');
  const simBtns = document.querySelectorAll('.sim-btn');

  let canvasCtx = landmarkCanvas?.getContext('2d');
  let animationFrameId = null;
  let animTime = 0;

  openSimBtn?.addEventListener('click', () => {
    playSound('click');
    simWidget?.classList.remove('hidden');
    startLandmarkAnimation();
  });

  closeSimBtn?.addEventListener('click', () => {
    playSound('click');
    simWidget?.classList.add('hidden');
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  });

  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      simBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const gesture = btn.getAttribute('data-gesture');
      const conf = btn.getAttribute('data-conf');

      if (simGestureOutput) simGestureOutput.textContent = `Target: "${gesture}"`;
      if (simConfidenceOutput) simConfidenceOutput.textContent = `Confidence: ${conf}`;
    });
  });

  function startLandmarkAnimation() {
    if (!canvasCtx || !landmarkCanvas) return;

    function render() {
      animTime += 0.04;
      canvasCtx.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);

      const centerX = landmarkCanvas.width / 2;
      const centerY = landmarkCanvas.height / 2 + 20;

      // Draw Hand Landmark Skeleton Lines
      const wrist = { x: centerX, y: centerY + 40 };
      const palmCenter = { x: centerX + Math.sin(animTime) * 4, y: centerY };

      const fingertips = [
        { x: centerX - 50 + Math.cos(animTime * 1.2) * 6, y: centerY - 60 },
        { x: centerX - 25 + Math.sin(animTime * 1.5) * 6, y: centerY - 80 },
        { x: centerX + Math.sin(animTime * 0.9) * 6, y: centerY - 85 },
        { x: centerX + 25 + Math.cos(animTime * 1.1) * 6, y: centerY - 75 },
        { x: centerX + 45 + Math.sin(animTime * 1.4) * 6, y: centerY - 55 }
      ];

      // Draw Connection Lines
      canvasCtx.strokeStyle = '#10b981';
      canvasCtx.lineWidth = 2.5;

      fingertips.forEach(pt => {
        canvasCtx.beginPath();
        canvasCtx.moveTo(wrist.x, wrist.y);
        canvasCtx.lineTo(palmCenter.x, palmCenter.y);
        canvasCtx.lineTo(pt.x, pt.y);
        canvasCtx.stroke();
      });

      // Draw Landmark Nodes
      canvasCtx.fillStyle = '#6366f1';
      [wrist, palmCenter, ...fingertips].forEach(pt => {
        canvasCtx.beginPath();
        canvasCtx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        canvasCtx.fill();
        canvasCtx.strokeStyle = '#ffffff';
        canvasCtx.lineWidth = 1.5;
        canvasCtx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();
  }

  // --------------------------------------------------------------------------
  // 6. WHIRLY BIRD CANVAS GAME ENGINE
  // --------------------------------------------------------------------------
  const whirlyCanvas = document.getElementById('whirly-canvas');
  const whirlyCtx = whirlyCanvas?.getContext('2d');
  const startWhirlyBtn = document.getElementById('start-whirly-btn');
  const restartWhirlyBtn = document.getElementById('restart-whirly-btn');
  const whirlyStartOverlay = document.getElementById('whirly-start-overlay');
  const whirlyOverOverlay = document.getElementById('whirly-over-overlay');
  const whirlyScoreEl = document.getElementById('whirly-score');
  const whirlyHighEl = document.getElementById('whirly-high');
  const whirlyFinalScoreEl = document.getElementById('whirly-final-score');

  if (whirlyHighEl) whirlyHighEl.textContent = state.whirlyHighScore;

  let whirlyState = {
    running: false,
    birdY: 180,
    birdVelocity: 0,
    gravity: 0.38,
    jumpStrength: -6.5,
    pipes: [],
    score: 0,
    pipeTimer: 0,
    animId: null
  };

  function resetWhirlyGame() {
    whirlyState = {
      running: true,
      birdY: 180,
      birdVelocity: 0,
      gravity: 0.38,
      jumpStrength: -6.5,
      pipes: [],
      score: 0,
      pipeTimer: 0,
      animId: null
    };
    if (whirlyScoreEl) whirlyScoreEl.textContent = '0';
  }

  function flapWhirly() {
    if (!whirlyState.running) return;
    whirlyState.birdVelocity = whirlyState.jumpStrength;
    playSound('jump');
  }

  startWhirlyBtn?.addEventListener('click', () => {
    playSound('click');
    whirlyStartOverlay?.classList.add('hidden');
    resetWhirlyGame();
    runWhirlyLoop();
  });

  restartWhirlyBtn?.addEventListener('click', () => {
    playSound('click');
    whirlyOverOverlay?.classList.add('hidden');
    resetWhirlyGame();
    runWhirlyLoop();
  });

  // Canvas / Key Controls for Whirly Bird
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && whirlyState.running) {
      e.preventDefault();
      flapWhirly();
    }
  });

  whirlyCanvas?.addEventListener('click', () => {
    if (whirlyState.running) {
      flapWhirly();
    }
  });

  function runWhirlyLoop() {
    if (!whirlyCtx || !whirlyCanvas) return;

    function loop() {
      if (!whirlyState.running) return;

      // Update Bird Physics
      whirlyState.birdVelocity += whirlyState.gravity;
      whirlyState.birdY += whirlyState.birdVelocity;

      // Clear Frame
      whirlyCtx.fillStyle = '#090d16';
      whirlyCtx.fillRect(0, 0, whirlyCanvas.width, whirlyCanvas.height);

      // Draw Grid Background lines
      whirlyCtx.strokeStyle = 'rgba(255,255,255,0.04)';
      whirlyCtx.lineWidth = 1;
      for (let x = 0; x < whirlyCanvas.width; x += 40) {
        whirlyCtx.beginPath();
        whirlyCtx.moveTo(x, 0);
        whirlyCtx.lineTo(x, whirlyCanvas.height);
        whirlyCtx.stroke();
      }

      // Spawn Pipes
      whirlyState.pipeTimer++;
      if (whirlyState.pipeTimer > 100) {
        whirlyState.pipeTimer = 0;
        const gap = 110;
        const minTop = 40;
        const maxTop = whirlyCanvas.height - gap - 60;
        const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;

        whirlyState.pipes.push({
          x: whirlyCanvas.width,
          top: topHeight,
          bottom: whirlyCanvas.height - topHeight - gap,
          passed: false
        });
      }

      // Update & Draw Pipes
      whirlyState.pipes.forEach((pipe, index) => {
        pipe.x -= 2.5;

        // Draw Top Pipe
        whirlyCtx.fillStyle = '#6366f1';
        whirlyCtx.fillRect(pipe.x, 0, 48, pipe.top);
        whirlyCtx.fillStyle = '#818cf8';
        whirlyCtx.fillRect(pipe.x - 4, pipe.top - 12, 56, 12);

        // Draw Bottom Pipe
        const bottomY = whirlyCanvas.height - pipe.bottom;
        whirlyCtx.fillStyle = '#6366f1';
        whirlyCtx.fillRect(pipe.x, bottomY, 48, pipe.bottom);
        whirlyCtx.fillStyle = '#818cf8';
        whirlyCtx.fillRect(pipe.x - 4, bottomY, 56, 12);

        // Check Score Passing
        if (!pipe.passed && pipe.x < 120) {
          pipe.passed = true;
          whirlyState.score++;
          if (whirlyScoreEl) whirlyScoreEl.textContent = whirlyState.score;
          playSound('score');

          if (whirlyState.score > state.whirlyHighScore) {
            state.whirlyHighScore = whirlyState.score;
            localStorage.setItem('whirly_high', state.whirlyHighScore);
            if (whirlyHighEl) whirlyHighEl.textContent = state.whirlyHighScore;
          }
        }

        // Collision Check
        const birdX = 120;
        const birdRadius = 14;
        if (birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + 48) {
          if (whirlyState.birdY - birdRadius < pipe.top || whirlyState.birdY + birdRadius > bottomY) {
            endWhirlyGame();
          }
        }

        // Remove Off-screen Pipes
        if (pipe.x < -60) {
          whirlyState.pipes.splice(index, 1);
        }
      });

      // Check Floor & Ceiling Collision
      if (whirlyState.birdY > whirlyCanvas.height - 14 || whirlyState.birdY < 14) {
        endWhirlyGame();
      }

      // Draw Whirly Developer Avatar / Bird
      whirlyCtx.save();
      whirlyCtx.translate(120, whirlyState.birdY);
      const angle = Math.min(Math.max(whirlyState.birdVelocity * 0.05, -0.5), 0.7);
      whirlyCtx.rotate(angle);

      // Body Circle
      whirlyCtx.fillStyle = '#10b981';
      whirlyCtx.beginPath();
      whirlyCtx.arc(0, 0, 14, 0, Math.PI * 2);
      whirlyCtx.fill();

      // Eye & Beak
      whirlyCtx.fillStyle = '#ffffff';
      whirlyCtx.beginPath();
      whirlyCtx.arc(5, -4, 4, 0, Math.PI * 2);
      whirlyCtx.fill();
      whirlyCtx.fillStyle = '#000000';
      whirlyCtx.beginPath();
      whirlyCtx.arc(6, -4, 2, 0, Math.PI * 2);
      whirlyCtx.fill();

      whirlyCtx.fillStyle = '#f59e0b';
      whirlyCtx.beginPath();
      whirlyCtx.moveTo(12, 0);
      whirlyCtx.lineTo(20, 3);
      whirlyCtx.lineTo(12, 6);
      whirlyCtx.closePath();
      whirlyCtx.fill();

      whirlyCtx.restore();

      whirlyState.animId = requestAnimationFrame(loop);
    }

    loop();
  }

  function endWhirlyGame() {
    whirlyState.running = false;
    if (whirlyState.animId) cancelAnimationFrame(whirlyState.animId);
    playSound('hit');

    if (whirlyFinalScoreEl) whirlyFinalScoreEl.textContent = whirlyState.score;
    whirlyOverOverlay?.classList.remove('hidden');
  }

  // Arcade Tab Switcher
  const arcadeTabs = document.querySelectorAll('.arcade-tab-btn');
  const gameWhirly = document.getElementById('game-whirly');
  const gameTicTacToe = document.getElementById('game-tictactoe');

  arcadeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      arcadeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetGame = tab.getAttribute('data-game');
      if (targetGame === 'whirly') {
        gameWhirly?.classList.remove('hidden');
        gameTicTacToe?.classList.add('hidden');
      } else {
        gameWhirly?.classList.add('hidden');
        gameTicTacToe?.classList.remove('hidden');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 7. TIC-TAC-TOE MINIMAX AI DUEL
  // --------------------------------------------------------------------------
  const tttCells = document.querySelectorAll('.ttt-cell');
  const tttStatus = document.getElementById('ttt-status');
  const resetTttBtn = document.getElementById('reset-ttt-btn');
  const scoreXEl = document.getElementById('ttt-score-x');
  const scoreOEl = document.getElementById('ttt-score-o');

  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8], // Rows
    [0,3,6], [1,4,7], [2,5,8], // Cols
    [0,4,8], [2,4,6]          // Diagonals
  ];

  tttCells.forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = parseInt(cell.getAttribute('data-idx') || '0', 10);
      if (state.tttBoard[idx] || !state.tttActive) return;

      makeTTTMove(idx, 'X');

      if (state.tttActive) {
        setTimeout(makeAIMove, 300);
      }
    });
  });

  function makeTTTMove(idx, player) {
    state.tttBoard[idx] = player;
    const cell = tttCells[idx];
    if (cell) {
      cell.textContent = player;
      cell.classList.add(player === 'X' ? 'x-mark' : 'o-mark');
    }
    playSound('click');

    const winInfo = checkTTTWin(state.tttBoard);
    if (winInfo) {
      state.tttActive = false;
      highlightTTTWin(winInfo.pattern);
      if (winInfo.winner === 'X') {
        state.tttScoreX++;
        if (scoreXEl) scoreXEl.textContent = state.tttScoreX;
        if (tttStatus) tttStatus.textContent = '🎉 You Won (X)!';
        playSound('win');
      } else {
        state.tttScoreO++;
        if (scoreOEl) scoreOEl.textContent = state.tttScoreO;
        if (tttStatus) tttStatus.textContent = '🤖 AI Bot Won (O)!';
        playSound('hit');
      }
    } else if (state.tttBoard.every(cell => cell !== null)) {
      state.tttActive = false;
      if (tttStatus) tttStatus.textContent = '🤝 Game Draw!';
    } else {
      if (tttStatus) tttStatus.textContent = player === 'X' ? 'AI Bot Thinking (O)...' : 'Your Turn (X)';
    }
  }

  function makeAIMove() {
    if (!state.tttActive) return;
    // Find best move for O
    const emptyIndices = state.tttBoard.map((val, i) => val === null ? i : null).filter(val => val !== null);
    if (emptyIndices.length === 0) return;

    // Check if AI can win in 1 move
    for (let idx of emptyIndices) {
      const boardCopy = [...state.tttBoard];
      boardCopy[idx] = 'O';
      if (checkTTTWin(boardCopy)?.winner === 'O') {
        makeTTTMove(idx, 'O');
        return;
      }
    }

    // Check if Player X can win in 1 move and block
    for (let idx of emptyIndices) {
      const boardCopy = [...state.tttBoard];
      boardCopy[idx] = 'X';
      if (checkTTTWin(boardCopy)?.winner === 'X') {
        makeTTTMove(idx, 'O');
        return;
      }
    }

    // Pick center or random move
    const choice = emptyIndices.includes(4) ? 4 : emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    makeTTTMove(choice, 'O');
  }

  function checkTTTWin(board) {
    for (let p of winPatterns) {
      const [a, b, c] = p;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], pattern: p };
      }
    }
    return null;
  }

  function highlightTTTWin(pattern) {
    pattern.forEach(idx => {
      tttCells[idx]?.classList.add('win-cell');
    });
  }

  resetTttBtn?.addEventListener('click', () => {
    playSound('click');
    state.tttBoard = Array(9).fill(null);
    state.tttActive = true;
    if (tttStatus) tttStatus.textContent = 'Your Turn (X)';
    tttCells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'ttt-cell';
    });
  });

  // --------------------------------------------------------------------------
  // 8. COMMAND PALETTE MODAL ENGINE (CMD+K / CTRL+K)
  // --------------------------------------------------------------------------
  const cmdPaletteModal = document.getElementById('cmd-palette');
  const cmdPaletteBtn = document.getElementById('cmd-palette-btn');
  const cmdBackdrop = document.getElementById('cmd-backdrop');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResults = document.getElementById('cmd-results');

  const cmdActions = [
    { title: 'Jump to About Section', cat: 'Navigation', action: () => scrollToSection('about') },
    { title: 'Jump to Skills Matrix', cat: 'Navigation', action: () => scrollToSection('skills') },
    { title: 'Jump to Projects Showcase', cat: 'Navigation', action: () => scrollToSection('projects') },
    { title: 'Launch SignBridge AI Simulator', cat: 'Featured Project', action: () => { scrollToSection('projects'); openSimBtn?.click(); } },
    { title: 'Launch Whirly Bird Game', cat: 'Arcade', action: () => scrollToSection('arcade') },
    { title: 'Play Tic-Tac-Toe AI', cat: 'Arcade', action: () => { scrollToSection('arcade'); document.querySelectorAll('.arcade-tab-btn')[1]?.click(); } },
    { title: 'Jump to Education & Milestones', cat: 'Navigation', action: () => scrollToSection('education') },
    { title: 'Jump to Contact Form', cat: 'Navigation', action: () => scrollToSection('contact') },
    { title: 'Download Resume (PDF)', cat: 'Action', action: () => document.getElementById('resume-download-btn')?.click() },
    { title: 'Toggle Light / Dark Theme', cat: 'Preference', action: () => applyTheme(state.currentTheme === 'dark' ? 'light' : 'dark') },
    { title: 'Toggle Sound Effects', cat: 'Preference', action: () => soundToggleBtn?.click() }
  ];

  function openCmdPalette() {
    playSound('click');
    cmdPaletteModal?.classList.add('active');
    cmdPaletteModal?.setAttribute('aria-hidden', 'false');
    cmdInput?.focus();
    renderCmdResults(cmdActions);
  }

  function closeCmdPalette() {
    cmdPaletteModal?.classList.remove('active');
    cmdPaletteModal?.setAttribute('aria-hidden', 'true');
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    closeCmdPalette();
  }

  function renderCmdResults(items) {
    if (!cmdResults) return;
    cmdResults.innerHTML = '';

    if (items.length === 0) {
      cmdResults.innerHTML = `<div class="cmd-item" style="cursor:default;">No matching actions found</div>`;
      return;
    }

    items.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = `cmd-item ${index === 0 ? 'selected' : ''}`;
      el.innerHTML = `
        <span class="cmd-item-title">${item.title}</span>
        <span class="cmd-item-category">${item.cat}</span>
      `;
      el.addEventListener('click', () => {
        playSound('click');
        item.action();
        closeCmdPalette();
      });
      cmdResults.appendChild(el);
    });
  }

  cmdPaletteBtn?.addEventListener('click', openCmdPalette);
  cmdBackdrop?.addEventListener('click', closeCmdPalette);

  cmdInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = cmdActions.filter(a => a.title.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q));
    renderCmdResults(filtered);
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdPaletteModal?.classList.contains('active')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    }
    if (e.key === 'Escape' && cmdPaletteModal?.classList.contains('active')) {
      closeCmdPalette();
    }
  });

  // --------------------------------------------------------------------------
  // 9. 3D TILT EFFECT & SCROLL ENTRANCE OBSERVER
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 18;
      const rotateY = (centerX - x) / 18;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  });

  // Fade-In Entrance Scroll Observer
  const fadeElements = document.querySelectorAll('.fade-in-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => observer.observe(el));

  // --------------------------------------------------------------------------
  // 10. CONTACT FORM SUBMISSION HANDLING
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    playSound('score');

    if (formFeedback) {
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = '🚀 Thank you! Your message has been sent successfully. Akash will respond shortly.';
      formFeedback.classList.remove('hidden');
    }

    contactForm.reset();
  });

});
