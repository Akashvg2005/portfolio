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
    soundEnabled: localStorage.getItem('sound_enabled') !== 'false', // Enabled by default
    currentTheme: localStorage.getItem('theme') || 'dark',
    currentAccent: localStorage.getItem('accent') || 'indigo',
    whirlyHighScore: parseInt(localStorage.getItem('whirly_high') || '0', 10),
    stackerHighScore: parseInt(localStorage.getItem('stack_high') || '0', 10),
    bricksHighScore: parseInt(localStorage.getItem('bricks_high') || '0', 10),
    activeGame: 'stacker',
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

  // Automatic Audio Context Unlock on first user gesture (satisfies browser autoplay policy)
  const unlockAudio = () => {
    if (state.soundEnabled) {
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  };

  ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown', 'mousemove'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { capture: true, once: true });
  });

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
      } else if (type === 'stack') {
        // Crisp hollow block drop thud
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.09);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'perfect') {
        // High-pitched crystal combo chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(880, now + 0.07);
        osc.frequency.setValueAtTime(1318.51, now + 0.14);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'nexusTone' || type === 'cinemaBoom') {
        // Ethereal ambient warm pulse
        const pulseOsc = audioCtx.createOscillator();
        const pulseGain = audioCtx.createGain();
        pulseOsc.type = 'sine';
        pulseOsc.frequency.setValueAtTime(220, now);
        pulseOsc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
        pulseGain.gain.setValueAtTime(0.001, now);
        pulseGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        pulseOsc.connect(pulseGain);
        pulseGain.connect(audioCtx.destination);
        pulseOsc.start(now);
        pulseOsc.stop(now + 1.4);
      } else if (type === 'nexusPortal' || type === 'cinemaClap' || type === 'walkieTalkie' || type === 'portal') {
        // High-end crystal harmonic chime (D4, F#4, A4, C#5 - Major 7th harmonic)
        [293.66, 369.99, 440.00, 554.37].forEach((freq, idx) => {
          const chordOsc = audioCtx.createOscillator();
          const chordGain = audioCtx.createGain();
          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.03);
          chordGain.gain.setValueAtTime(0.001, now);
          chordGain.gain.linearRampToValueAtTime(0.09 / (idx + 1), now + 0.08 + idx * 0.03);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

          chordOsc.connect(chordGain);
          chordGain.connect(audioCtx.destination);
          chordOsc.start(now + idx * 0.03);
          chordOsc.stop(now + 1.2);
        });

        // Tactile optical shutter lock click
        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(980, now + 0.05);
        clickOsc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        clickGain.gain.setValueAtTime(0.18, now + 0.05);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        clickOsc.connect(clickGain);
        clickGain.connect(audioCtx.destination);
        clickOsc.start(now + 0.05);
        clickOsc.stop(now + 0.13);
      } else if (type === 'matrixBeep') {
        // Subtle futuristic cyber decryption chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + Math.random() * 500, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'win') {
        // Tic Tac Toe / Game Victory
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

  // Sound FX Toggle State & UI Sync
  function syncSoundUI() {
    const entrySoundBtn = document.getElementById('entry-sound-btn');
    const entrySoundIconOff = entrySoundBtn?.querySelector('.entry-sound-icon-off');
    const entrySoundIconOn = entrySoundBtn?.querySelector('.entry-sound-icon-on');
    const entrySoundLabel = document.getElementById('entry-sound-label');

    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundIconOff = soundToggleBtn?.querySelector('.sound-icon-off');
    const soundIconOn = soundToggleBtn?.querySelector('.sound-icon-on');

    if (state.soundEnabled) {
      entrySoundIconOff?.classList.add('hidden');
      entrySoundIconOn?.classList.remove('hidden');
      if (entrySoundLabel) entrySoundLabel.textContent = 'Sound: ON';
      entrySoundBtn?.classList.add('active');

      soundIconOff?.classList.add('hidden');
      soundIconOn?.classList.remove('hidden');
      soundToggleBtn?.classList.add('active');
      soundToggleBtn?.setAttribute('title', 'Sound FX (ON)');
    } else {
      entrySoundIconOff?.classList.remove('hidden');
      entrySoundIconOn?.classList.add('hidden');
      if (entrySoundLabel) entrySoundLabel.textContent = 'Sound: OFF';
      entrySoundBtn?.classList.remove('active');

      soundIconOff?.classList.remove('hidden');
      soundIconOn?.classList.add('hidden');
      soundToggleBtn?.classList.remove('active');
      soundToggleBtn?.setAttribute('title', 'Sound FX (OFF)');
    }
  }

  function toggleSoundState() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('sound_enabled', state.soundEnabled);
    if (state.soundEnabled) {
      initAudio();
      playSound('score');
    }
    syncSoundUI();
  }

  const soundToggleBtn = document.getElementById('sound-toggle');
  soundToggleBtn?.addEventListener('click', () => {
    toggleSoundState();
  });

  // Initial sound UI sync on load
  syncSoundUI();

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

  // --------------------------------------------------------------------------
  // 3. LIQUID GLASS FLOATING ISLAND NAVBAR LOGIC
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const navContainer = document.getElementById('nav-container');
  const navLinksRow = document.getElementById('nav-links');
  const liquidPill = document.getElementById('nav-liquid-pill');
  const navLinks = document.querySelectorAll('.nav-link');
  let activeNavLink = document.querySelector('.nav-link[data-section="about"]') || navLinks[0];

  // 3.1 Dynamic Specular Liquid Sheen Tracking Mouse
  navContainer?.addEventListener('mousemove', (e) => {
    const rect = navContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    navContainer.style.setProperty('--nav-mouse-x', `${x}%`);
    navContainer.style.setProperty('--nav-mouse-y', `${y}%`);
  });

  navContainer?.addEventListener('mouseleave', () => {
    navContainer.style.setProperty('--nav-mouse-x', '50%');
    navContainer.style.setProperty('--nav-mouse-y', '50%');
  });

  // 3.2 Animated Scrollbar, Progress Laser & Telemetry HUD Controls
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const scrollHudPill = document.getElementById('scroll-hud-pill');
  const scrollHudSection = document.getElementById('scroll-hud-section');
  const scrollHudPercent = document.getElementById('scroll-hud-percent');
  let scrollAnimationTimeout = null;

  // Click scroll telemetry HUD to smoothly scroll to top
  scrollHudPill?.addEventListener('click', () => {
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 3.3 Magnetic Elastic Liquid Pill Indicator
  function moveLiquidPill(targetEl) {
    if (!liquidPill || !targetEl || window.innerWidth <= 900) {
      if (liquidPill) liquidPill.style.opacity = '0';
      return;
    }
    const offsetLeft = targetEl.offsetLeft;
    const width = targetEl.offsetWidth;
    liquidPill.style.transform = `translateX(${offsetLeft}px)`;
    liquidPill.style.width = `${width}px`;
    liquidPill.style.opacity = '1';
  }

  // Hover fluid movement
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      moveLiquidPill(link);
    });
  });

  navLinksRow?.addEventListener('mouseleave', () => {
    if (activeNavLink) {
      moveLiquidPill(activeNavLink);
    } else if (liquidPill) {
      liquidPill.style.opacity = '0';
    }
  });

  // 3.4 Dynamic Scroll-Spy for Sections & Live Telemetry HUD
  const spySections = [
    { id: 'hero', navTarget: 'about', label: 'HERO' },
    { id: 'about', navTarget: 'about', label: 'ABOUT' },
    { id: 'skills', navTarget: 'skills', label: 'SKILLS' },
    { id: 'projects', navTarget: 'projects', label: 'PROJECTS' },
    { id: 'education', navTarget: 'education', label: 'EDUCATION' },
    { id: 'arcade', navTarget: 'arcade', label: 'ARCADE' },
    { id: 'contact', navTarget: 'contact', label: 'CONTACT' }
  ];

  function handleScrollUpdate() {
    const scrollY = window.scrollY;

    // Trigger active scrolling animation on the scrollbar & HUD beacon
    document.body.classList.add('is-scrolling');
    clearTimeout(scrollAnimationTimeout);
    scrollAnimationTimeout = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 450);

    // Floating Island Compressed Scroll State
    if (scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Top Neon Laser Progress Bar & Percentage
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.min(100, Math.max(0, Math.round((scrollY / docHeight) * 100))) : 0;
    
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }
    if (scrollHudPercent) {
      scrollHudPercent.textContent = `${scrollPercent}%`;
    }

    // Scroll-Spy detection
    const scrollPos = scrollY + 200;
    let currentTarget = 'about';
    let currentLabel = 'HERO';

    spySections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentTarget = sec.navTarget;
          currentLabel = sec.label;
        }
      }
    });

    if (scrollHudSection) {
      scrollHudSection.textContent = currentLabel;
    }

    navLinks.forEach(link => {
      const secAttr = link.getAttribute('data-section') || link.getAttribute('href')?.replace('#', '');
      if (secAttr === currentTarget) {
        link.classList.add('active');
        activeNavLink = link;
        moveLiquidPill(link);
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', handleScrollUpdate, { passive: true });
  window.addEventListener('resize', () => {
    if (activeNavLink) moveLiquidPill(activeNavLink);
  }, { passive: true });

  // Initial pill positioning & scroll telemetry state
  setTimeout(() => {
    handleScrollUpdate();
  }, 250);

  // 3.5 Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');

  mobileMenuBtn?.addEventListener('click', () => {
    playSound('click');
    const isOpen = navLinksRow?.classList.toggle('open');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      playSound('click');
      navLinksRow?.classList.remove('open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  // --------------------------------------------------------------------------
  // 3.6 CUSTOM HIGH-TECH CYBER MOUSE CURSOR CONTROLLER
  // --------------------------------------------------------------------------
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorRing = document.getElementById('custom-cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isCursorActive = false;

    // Direct movement on mouse move
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isCursorActive) {
        ringX = mouseX;
        ringY = mouseY;
        isCursorActive = true;
        document.body.classList.remove('cursor-hidden');
      }

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      // Check if hovering over interactive elements
      const target = e.target;
      const interactive = target && target.closest(
        'a, button, select, [role="button"], input[type="button"], input[type="submit"], .btn, .btn-icon, .nav-link, .cmd-pill, .interactive-card, .tilt-card, .cert-card, .game-card, .social-link, .arcade-btn, #scroll-hud-pill'
      );

      if (interactive) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    }, { passive: true });

    // Smooth lerp physics for outer trailing ring
    function renderCursor() {
      if (isCursorActive) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Mouse down & up
    window.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-clicking');
    });

    window.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-clicking');
    });

    // Window exit & enter
    document.addEventListener('mouseleave', () => {
      document.body.classList.add('cursor-hidden');
    });

    document.addEventListener('mouseenter', () => {
      document.body.classList.remove('cursor-hidden');
    });
  }

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
  - <span class="highlight-code">vibecoding</span>    : Vibe coding &amp; rapid prototyping philosophy
  - <span class="highlight-code">aitools</span>       : AI tools handling &amp; agentic workflows
  - <span class="highlight-code">latex</span>         : LaTeX document engineering &amp; scientific papers
  - <span class="highlight-code">roles</span>         : Active campus leadership &amp; positions of responsibility
  - <span class="highlight-code">ieee</span>          : Videographer @ IEEE SB CECTL details
  - <span class="highlight-code">placement</span>     : PR Team Head @ Training & Placement Cell CEC
  - <span class="highlight-code">cinematography</span>: Mobile filmmaking &amp; cinematography details
  - <span class="highlight-code">photography</span>   : Mobile photography, framing &amp; composition
  - <span class="highlight-code">signbridge</span>    : Flagship AI Sign Language platform details
  - <span class="highlight-code">certificates</span>  : View all 4 verified industry credentials
  - <span class="highlight-code">security</span>      : NIELIT Cyber Security &amp; Ethical Hacking (Grade 'S')
  - <span class="highlight-code">flutter</span>       : Fawstech App Development (Flutter) certificate
  - <span class="highlight-code">devtown</span>       : DevTown &amp; GDG Netflix Clone certificate
  - <span class="highlight-code">techmaghi</span>     : Techmaghi EV Design &amp; Virtual Reality internship
  - <span class="highlight-code">skills</span>        : Technical stack &amp; proficiency metrics
  - <span class="highlight-code">projects</span>      : Full project repository list
  - <span class="highlight-code">education</span>     : Academic degree &amp; timeline
  - <span class="highlight-code">arcade</span>        : Launch minigames (Whirly Bird / Tic-Tac-Toe)
  - <span class="highlight-code">contact</span>       : Direct email, WhatsApp, phone &amp; socials
  - <span class="highlight-code">theme</span>         : Toggle light/dark mode
  - <span class="highlight-code">clear</span>         : Clear screen`,

    vibecoding: `⚡ <strong style="color:#f59e0b;">Vibe Coding &amp; Rapid Prototyping:</strong>
• Philosophy    : Intuitive, high-velocity engineering pairing human vision with generative AI tools
• Velocity      : Zero-to-one production builds in record time with fluid iterative development
• Core Workflow : Natural prompt architecture, AI pair-programming, dynamic component synthesis
• Focus Areas   : Modern full-stack reactive apps, interactive micro-animations, glassmorphic UI`,

    aitools: `🤖 <strong style="color:#38bdf8;">AI Tools &amp; Multi-Agent Orchestration:</strong>
• Ecosystem     : Antigravity AI, LLM Prompt Engineering, MediaPipe, OpenCV, TensorFlow
• Agentic Flow  : Autonomous agent loops, tool-augmented pipelines, multi-modal vision synthesis
• Implementations: Real-time sign language recognition (SignBridge), intelligent prompt workflows`,

    latex: `📑 <strong style="color:#c084fc;">LaTeX Document Engineering &amp; Typesetting:</strong>
• Expertise     : Academic research papers, IEEE/ACM conference templates, scientific publications
• Mathematics   : Complex mathematical formulas, equations, matrix notations, theorem proofs
• Graphics      : TikZ vector diagrams, algorithm pseudo-code formatting, tabular layouts
• Citations     : Automated BibTeX bibliography management and cross-referencing`,

    roles: `🏛️ <strong style="color:#38bdf8;">Current Positions of Responsibility:</strong>
1. 🎬 <strong>Videographer</strong> — IEEE Student Branch CECTL (College of Engineering Cherthala)
   • Directing official event coverage, video teasers, camera choreography & cinematic aftermovies.
2. 📢 <strong>Public Relations (PR) Team Head</strong> — Training & Placement Cell (TPC), CEC
   • Spearheading corporate outreach, campus recruitment publicity, announcements & student engagement.`,

    ieee: `🎬 <strong style="color:#fbbf24;">Videographer • IEEE SB CECTL:</strong>
• Organization : IEEE Student Branch, College of Engineering Cherthala (CECTL)
• Scope        : Event coverage, promotional reels, hackathons, and national tech summits
• Responsibilities : Mobile cinematography, audio staging, gimbal choreography & DaVinci Resolve color grading
• Status       : Active Current Role (2024 — Present)`,

    placement: `📢 <strong style="color:#34d399;">Public Relations (PR) Team Head • Training & Placement Cell CEC:</strong>
• Organization : Training & Placement Cell (TPC), College of Engineering Cherthala (CEC)
• Role         : PR Team Head
• Scope        : Corporate communications, campus drive publicity, social media broadcasting
• Impact       : Facilitating student-industry connectivity and placement awareness campaigns
• Status       : Active Leadership Position (2024 — Present)`,

    cinematography: `🎬 <strong style="color:#fbbf24;">Cinematography &amp; Mobile Filmmaking:</strong>
• Primary Focus : 4K HDR ProRes / Log Mobile Cinematography
• Visual Style  : Anamorphic widescreen (2.39:1), dynamic camera choreography, golden hour lighting
• Post-Pipeline : Custom LUT design, DaVinci Resolve color timing, sound design &amp; pacing
• Core Toolkit  : Mobile Cinema Rig, 3-Axis Gimbal, Anamorphic 1.33x lens, Variable ND filters`,

    photography: `📸 <strong style="color:#38bdf8;">Mobile Photography &amp; Framing:</strong>
• Composition   : Rule of thirds, leading lines, golden ratio, negative space
• Lighting      : Natural chiaroscuro, golden hour, moody low-light street photography
• Focal Art     : Depth of field staging, macro perspectives, evocative portraits`,


    signbridge: `🚀 <strong class="text-accent">SignBridge (Flagship Project)</strong>
AI-powered interview platform for Deaf and Hard-of-Hearing candidates using Indian Sign Language (ISL) recognition.
• Tech: Python, MediaPipe, Flutter, TensorFlow, OpenCV, Antigravity AI
• Status: Phase 2 Active Development`,

    certificates: `📜 <strong class="text-accent">Verified Professional Credentials (4 Total):</strong>
1. 🛡️ <strong>NIELIT Calicut (Govt. of India • MeitY)</strong> — Cyber Security &amp; Ethical Hacking (<span style="color:#f59e0b;font-weight:700;">Grade 'S' Top Distinction</span>)
   <a href="assets/nielit-cyber-security-certificate.pdf" target="_blank" style="color:#10b981;text-decoration:underline;">[View NIELIT PDF]</a>
2. 📱 <strong>Fawstech Innovations (Kerala Startup Mission)</strong> — 3 Days App Development in Flutter
   <a href="assets/fawstech-flutter-certificate.pdf" target="_blank" style="color:#38bdf8;text-decoration:underline;">[View Fawstech PDF]</a>
3. 🎬 <strong>DevTown &amp; Google Developer Groups (GDG) VIT-AP</strong> — Netflix Clone Using HTML (ID: ZNOH6B)
   <a href="assets/devtown-netflix-certificate.pdf" target="_blank" style="color:#c084fc;text-decoration:underline;">[View DevTown PDF]</a> | <a href="https://cert.devtown.in/verify/ZNOH6B" target="_blank" style="color:#38bdf8;text-decoration:underline;">[Verify Online]</a>
4. ⚡ <strong>Techmaghi (Kinfra Hi-Tech Park • STEM Accredited)</strong> — EV Design &amp; Testing in Virtual Reality
   <a href="assets/techmaghi-ev-vr-certificate.pdf" target="_blank" style="color:#2dd4bf;text-decoration:underline;">[View Techmaghi PDF]</a>`,

    security: `🛡️ <strong style="color:#10b981;">Cyber Security &amp; Ethical Hacking:</strong>
• Certified by : NIELIT Calicut (Ministry of Electronics &amp; IT, Govt. of India)
• Project      : ISEA Phase III Project (Information Security Education &amp; Awareness)
• Grade        : <span class="highlight-code">Grade 'S' (Top Distinction • 80% &amp; above)</span>
• Certificate #: NIELIT/ISEAPHASEIII/BC/26-27/OO9
• Competencies : Network Penetration Testing, Vulnerability Scanning, Cryptography, Wireshark, System Hardening
• PDF View     : <a href="assets/nielit-cyber-security-certificate.pdf" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;text-decoration:underline;">Open NIELIT Certificate (PDF)</a>`,

    flutter: `📱 <strong style="color:#38bdf8;">App Development (Flutter):</strong>
• Certified by : Fawstech Innovations Pvt. Ltd. (Kochi)
• Recognition  : Kerala Startup Mission, ISO 9001:2015, #startupindia, MSME
• Honors       : Outstanding completion of 3 Days App Development (Flutter)
• Competencies : Cross-platform Dart &amp; Flutter mobile apps, state management, reactive layouts
• PDF View     : <a href="assets/fawstech-flutter-certificate.pdf" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;text-decoration:underline;">Open Fawstech Certificate (PDF)</a>`,

    devtown: `🎬 <strong style="color:#c084fc;">Netflix Clone Using HTML:</strong>
• Issued by    : DevTown in collaboration with Google Developer Groups (GDG) - VIT-AP
• Issue Date   : 09 Jun 2025
• Verification : ID <a href="https://cert.devtown.in/verify/ZNOH6B" target="_blank" style="color:#38bdf8;text-decoration:underline;">ZNOH6B</a>
• Competencies : Frontend architecture, responsive layout grids, streaming service UI replication
• PDF View     : <a href="assets/devtown-netflix-certificate.pdf" target="_blank" rel="noopener noreferrer" style="color:#c084fc;text-decoration:underline;">Open DevTown Certificate (PDF)</a>`,

    techmaghi: `⚡ <strong style="color:#2dd4bf;">EV Design &amp; Testing in Virtual Reality:</strong>
• Certified by : Techmaghi (Kinfra Hi-Tech Park • Kerala Startup Mission)
• Recognition  : STEM Accredited, ISO 9001:2015, #startupindia, MSME
• Duration     : 7-Day Technical Internship (15 June 2025 - 21 June 2025)
• Competencies : MATLAB Simulink powertrain modeling, electric vehicle dynamics, virtual reality testing
• PDF View     : <a href="assets/techmaghi-ev-vr-certificate.pdf" target="_blank" rel="noopener noreferrer" style="color:#2dd4bf;text-decoration:underline;">Open Techmaghi Certificate (PDF)</a>`,

    certificate: `📜 <strong class="text-accent">Certificates Quick Hub:</strong> Type <span class="highlight-code">'certificates'</span> to view all 4 credentials or type <span class="highlight-code">'security'</span>, <span class="highlight-code">'flutter'</span>, <span class="highlight-code">'devtown'</span>, <span class="highlight-code">'techmaghi'</span>.`,

    whatsapp: `📱 <strong style="color:#25d366;">WhatsApp Direct Contact:</strong>
• Number: <strong>+91 88489 48105</strong>
• Chat: <a href="https://wa.me/918848948105" target="_blank" rel="noopener noreferrer" style="color:#25d366;text-decoration:underline;">Click to open WhatsApp Conversation</a>`,

    instagram: `📸 <strong style="color:#e1306c;">Instagram Profile:</strong>
• Handle: <strong>@a.k_a.s_h__</strong>
• Link  : <a href="https://www.instagram.com/a.k_a.s_h__/" target="_blank" rel="noopener noreferrer" style="color:#e1306c;text-decoration:underline;">https://www.instagram.com/a.k_a.s_h__/</a>`,

    skills: `⚡ <strong class="text-accent">Technical Stack:</strong>
• Security   : Cyber Security &amp; Ethical Hacking (NIELIT Grade 'S'), Penetration Testing, OWASP
• Languages  : Dart, JavaScript (ES6+), Python, HTML5/CSS3
• Frameworks : Flutter, React Native, Node.js, Express, Flame 2.5D
• AI &amp; Vision: MediaPipe, OpenCV, TensorFlow, Antigravity Workflows
• Databases  : Firebase Firestore, Realtime DB, Cloud Storage`,

    projects: `📁 <strong class="text-accent">Key Projects:</strong>
1. SignBridge (AI ISL Interview Platform)
2. Smart Bus Tracking & Monitoring System ("FaceIt!")
3. Layam – The Music Mate (React Native / Expo Music Player)
4. Netflix UI Clone (HTML/CSS/JS)`,

    education: `🎓 <strong class="text-accent">Education &amp; Certifications:</strong>
• B.Tech Computer Science and Engineering (2023–2027)
  College of Engineering, Cherthala, Kerala, India
• Certified in Cyber Security &amp; Ethical Hacking (Grade 'S')
  NIELIT Calicut • ISEA Phase III (MeitY, Govt. of India)`,

    arcade: `🎮 <strong class="text-accent">Dev Arcade Zone Mini-Games:</strong>
1. 🏗️ <span class="highlight-code">stacker</span> : Cyber Stacker Block Building Skyscraper
2. 🧱 <span class="highlight-code">bricks</span>  : Cyber Bricks Neon Block Breaker
3. 🐦 <span class="highlight-code">whirly</span>  : Whirly Bird Developer Edition
4. ❌ <span class="highlight-code">ttt</span>     : Tic-Tac-Toe Minimax AI`,

    stacker: `🏗️ <strong class="text-accent">Cyber Stacker:</strong> Launching Block Tower Builder in Arcade Zone...`,
    bricks: `🧱 <strong class="text-accent">Cyber Bricks:</strong> Launching Neon Block Breaker in Arcade Zone...`,
    whirly: `🐦 <strong class="text-accent">Whirly Bird:</strong> Launching Whirly Bird in Arcade Zone...`,

    contact: `📬 <strong class="text-accent">Get in Touch:</strong>
• Email    : akashvg2005@gmail.com
• WhatsApp : +91 88489 48105 (https://wa.me/918848948105)
• Instagram: @a.k_a.s_h__ (https://www.instagram.com/a.k_a.s_h__/)
• GitHub   : https://github.com/Akashvg2005
• LinkedIn : https://www.linkedin.com/in/akash-v-g-76b46a291/`,

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

    if (rawCmd === 'stacker' || rawCmd === 'block' || rawCmd === 'blocks') {
      document.getElementById('arcade')?.scrollIntoView({ behavior: 'smooth' });
      document.querySelector('.arcade-tab-btn[data-game="stacker"]')?.click();
      printTerminalLine(rawCmd, terminalCommands.stacker);
      return;
    }

    if (rawCmd === 'bricks' || rawCmd === 'breakout') {
      document.getElementById('arcade')?.scrollIntoView({ behavior: 'smooth' });
      document.querySelector('.arcade-tab-btn[data-game="bricks"]')?.click();
      printTerminalLine(rawCmd, terminalCommands.bricks);
      return;
    }

    if (rawCmd === 'whirly') {
      document.getElementById('arcade')?.scrollIntoView({ behavior: 'smooth' });
      document.querySelector('.arcade-tab-btn[data-game="whirly"]')?.click();
      printTerminalLine(rawCmd, terminalCommands.whirly);
      return;
    }

    if (rawCmd === 'ttt') {
      document.getElementById('arcade')?.scrollIntoView({ behavior: 'smooth' });
      document.querySelector('.arcade-tab-btn[data-game="tictactoe"]')?.click();
      printTerminalLine(rawCmd, '❌ Tic-Tac-Toe AI loaded. Good luck!');
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

  // Global Canvas / Key Controls for Arcade Games
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (state.activeGame === 'stacker' && stackerState.running) {
        e.preventDefault();
        placeStackBlock();
      } else if (state.activeGame === 'whirly' && whirlyState.running) {
        e.preventDefault();
        flapWhirly();
      }
    } else if (state.activeGame === 'bricks' && bricksState.running) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        bricksState.paddle.x = Math.max(0, bricksState.paddle.x - 35);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        bricksState.paddle.x = Math.min(bricksCanvas.width - bricksState.paddle.width, bricksState.paddle.x + 35);
      }
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

  // --------------------------------------------------------------------------
  // 6.2 CYBER STACKER (BLOCK BUILDING TOWER GAME)
  // --------------------------------------------------------------------------
  const stackerCanvas = document.getElementById('stacker-canvas');
  const stackerCtx = stackerCanvas?.getContext('2d');
  const startStackerBtn = document.getElementById('start-stacker-btn');
  const restartStackerBtn = document.getElementById('restart-stacker-btn');
  const dropBlockBtn = document.getElementById('drop-block-btn');
  const stackerStartOverlay = document.getElementById('stacker-start-overlay');
  const stackerOverOverlay = document.getElementById('stacker-over-overlay');
  const stackerHeightEl = document.getElementById('stacker-height');
  const stackerComboEl = document.getElementById('stacker-combo');
  const stackerComboBox = document.getElementById('stacker-combo-box');
  const stackerHighEl = document.getElementById('stacker-high');
  const stackerFinalHeightEl = document.getElementById('stacker-final-height');
  const stackerFinalPerfectsEl = document.getElementById('stacker-final-perfects');

  if (stackerHighEl) stackerHighEl.textContent = state.stackerHighScore;

  const STACK_BLOCK_HEIGHT = 24;
  const BASE_BLOCK_WIDTH = 220;

  let stackerState = {
    running: false,
    height: 0,
    combo: 0,
    perfects: 0,
    cameraY: 0,
    targetCameraY: 0,
    placedBlocks: [],
    currentBlock: null,
    debrisList: [],
    particles: [],
    animId: null
  };

  function getStackerBlockColor(index) {
    const hue = (index * 16) % 360;
    return `hsl(${hue}, 88%, 58%)`;
  }

  function resetStackerGame() {
    if (!stackerCanvas) return;
    const canvasWidth = stackerCanvas.width;
    const canvasHeight = stackerCanvas.height;
    const baseWidth = BASE_BLOCK_WIDTH;
    const baseX = (canvasWidth - baseWidth) / 2;
    const baseY = canvasHeight - STACK_BLOCK_HEIGHT - 10;

    stackerState = {
      running: true,
      height: 0,
      combo: 0,
      perfects: 0,
      cameraY: 0,
      targetCameraY: 0,
      placedBlocks: [
        {
          x: baseX,
          y: baseY,
          width: baseWidth,
          height: STACK_BLOCK_HEIGHT,
          color: getStackerBlockColor(0),
          isBase: true
        }
      ],
      currentBlock: {
        x: 0,
        y: baseY - STACK_BLOCK_HEIGHT,
        width: baseWidth,
        height: STACK_BLOCK_HEIGHT,
        dir: 1,
        speed: 3.2,
        color: getStackerBlockColor(1)
      },
      debrisList: [],
      particles: [],
      animId: null
    };

    if (stackerHeightEl) stackerHeightEl.textContent = '0';
    if (stackerComboEl) stackerComboEl.textContent = '0';
  }

  function placeStackBlock() {
    if (!stackerState.running || !stackerState.currentBlock) return;

    const curr = stackerState.currentBlock;
    const prev = stackerState.placedBlocks[stackerState.placedBlocks.length - 1];

    const diff = curr.x - prev.x;
    const absDiff = Math.abs(diff);

    // Overlap calculation: complete miss
    if (absDiff >= curr.width) {
      stackerState.debrisList.push({
        x: curr.x,
        y: curr.y,
        width: curr.width,
        height: curr.height,
        color: curr.color,
        vy: 2,
        vx: curr.dir * 2,
        rot: 0,
        vRot: 0.08,
        opacity: 1
      });
      stackerState.currentBlock = null;
      endStackerGame();
      return;
    }

    // Check if Perfect Stack (within 4 pixels tolerance)
    if (absDiff <= 4) {
      curr.x = prev.x; // Perfect alignment snap
      stackerState.combo++;
      stackerState.perfects++;
      playSound('perfect');

      // Sparkle particles
      for (let i = 0; i < 14; i++) {
        stackerState.particles.push({
          x: curr.x + (Math.random() * curr.width),
          y: curr.y + (Math.random() * curr.height),
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 4 - 2,
          radius: Math.random() * 3 + 2,
          color: '#ffffff',
          alpha: 1
        });
      }

      // Bonus expansion if combo >= 3
      if (stackerState.combo >= 3 && curr.width < BASE_BLOCK_WIDTH) {
        curr.width = Math.min(BASE_BLOCK_WIDTH, curr.width + 12);
        curr.x = Math.max(10, curr.x - 6);
      }

      // Bump combo UI
      if (stackerComboBox) {
        stackerComboBox.classList.add('bump');
        setTimeout(() => stackerComboBox.classList.remove('bump'), 200);
      }
    } else {
      // Slice block
      stackerState.combo = 0;
      playSound('stack');

      let debrisX, debrisWidth, newX, newWidth;
      if (diff > 0) {
        newX = curr.x;
        newWidth = prev.width - diff;
        debrisX = curr.x + newWidth;
        debrisWidth = diff;
      } else {
        newX = prev.x;
        newWidth = curr.width + diff;
        debrisX = curr.x;
        debrisWidth = -diff;
      }

      curr.x = newX;
      curr.width = newWidth;

      // Spawn falling sliced debris
      stackerState.debrisList.push({
        x: debrisX,
        y: curr.y,
        width: debrisWidth,
        height: curr.height,
        color: curr.color,
        vy: 1,
        vx: diff > 0 ? 2.5 : -2.5,
        rot: 0,
        vRot: diff > 0 ? 0.05 : -0.05,
        opacity: 1
      });
    }

    // Commit current block to placed tower
    stackerState.placedBlocks.push({
      x: curr.x,
      y: curr.y,
      width: curr.width,
      height: curr.height,
      color: curr.color
    });

    stackerState.height++;
    if (stackerHeightEl) stackerHeightEl.textContent = stackerState.height;
    if (stackerComboEl) stackerComboEl.textContent = stackerState.combo;

    // Update high score
    if (stackerState.height > state.stackerHighScore) {
      state.stackerHighScore = stackerState.height;
      localStorage.setItem('stack_high', state.stackerHighScore);
      if (stackerHighEl) stackerHighEl.textContent = state.stackerHighScore;
    }

    // Scroll camera up if tower grows higher than screen threshold
    const topBlockScreenY = curr.y - stackerState.cameraY;
    if (topBlockScreenY < 180) {
      stackerState.targetCameraY = (stackerState.height - 4) * STACK_BLOCK_HEIGHT;
    }

    // Spawn next block
    const nextLevel = stackerState.height + 1;
    const nextSpeed = Math.min(7.5, 3.2 + (stackerState.height * 0.08));
    const startFromLeft = nextLevel % 2 === 0;

    stackerState.currentBlock = {
      x: startFromLeft ? -curr.width : stackerCanvas.width,
      y: curr.y - STACK_BLOCK_HEIGHT,
      width: curr.width,
      height: STACK_BLOCK_HEIGHT,
      dir: startFromLeft ? 1 : -1,
      speed: nextSpeed,
      color: getStackerBlockColor(nextLevel)
    };
  }

  function runStackerLoop() {
    if (!stackerCtx || !stackerCanvas) return;

    function loop() {
      if (!stackerState.running) return;

      // Smooth camera interpolation
      stackerState.cameraY += (stackerState.targetCameraY - stackerState.cameraY) * 0.12;

      // Clear Frame
      stackerCtx.fillStyle = '#090d16';
      stackerCtx.fillRect(0, 0, stackerCanvas.width, stackerCanvas.height);

      // Background Cyber Grid that drifts with camera
      stackerCtx.save();
      const gridOffset = (stackerState.cameraY * 0.5) % 40;
      stackerCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      stackerCtx.lineWidth = 1;
      for (let y = gridOffset; y < stackerCanvas.height; y += 40) {
        stackerCtx.beginPath();
        stackerCtx.moveTo(0, y);
        stackerCtx.lineTo(stackerCanvas.width, y);
        stackerCtx.stroke();
      }
      for (let x = 0; x < stackerCanvas.width; x += 40) {
        stackerCtx.beginPath();
        stackerCtx.moveTo(x, 0);
        stackerCtx.lineTo(x, stackerCanvas.height);
        stackerCtx.stroke();
      }
      stackerCtx.restore();

      stackerCtx.save();
      stackerCtx.translate(0, stackerState.cameraY);

      // Draw Placed Tower Blocks
      stackerState.placedBlocks.forEach((block) => {
        // Drop shadow for block depth
        stackerCtx.fillStyle = 'rgba(0,0,0,0.3)';
        stackerCtx.fillRect(block.x + 3, block.y + 4, block.width, block.height);

        // Block Body
        stackerCtx.fillStyle = block.color;
        stackerCtx.fillRect(block.x, block.y, block.width, block.height);

        // Top glossy highlight bevel
        stackerCtx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        stackerCtx.fillRect(block.x, block.y, block.width, 3);

        // Border outline
        stackerCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        stackerCtx.lineWidth = 1;
        stackerCtx.strokeRect(block.x, block.y, block.width, block.height);
      });

      // Update & Draw Falling Debris
      stackerState.debrisList.forEach((debris, idx) => {
        debris.y += debris.vy;
        debris.vy += 0.35; // gravity
        debris.x += debris.vx;
        debris.rot += debris.vRot;
        debris.opacity -= 0.015;

        if (debris.opacity > 0) {
          stackerCtx.save();
          stackerCtx.translate(debris.x + debris.width / 2, debris.y + debris.height / 2);
          stackerCtx.rotate(debris.rot);
          stackerCtx.globalAlpha = Math.max(0, debris.opacity);
          stackerCtx.fillStyle = debris.color;
          stackerCtx.fillRect(-debris.width / 2, -debris.height / 2, debris.width, debris.height);
          stackerCtx.restore();
        } else {
          stackerState.debrisList.splice(idx, 1);
        }
      });

      // Update & Draw Moving Block
      if (stackerState.currentBlock) {
        const curr = stackerState.currentBlock;
        curr.x += curr.speed * curr.dir;

        // Bounce back if hit edge
        if (curr.x + curr.width > stackerCanvas.width) {
          curr.dir = -1;
          curr.x = stackerCanvas.width - curr.width;
        } else if (curr.x < 0) {
          curr.dir = 1;
          curr.x = 0;
        }

        // Draw shadow
        stackerCtx.fillStyle = 'rgba(0,0,0,0.35)';
        stackerCtx.fillRect(curr.x + 3, curr.y + 4, curr.width, curr.height);

        // Draw Moving Block
        stackerCtx.fillStyle = curr.color;
        stackerCtx.fillRect(curr.x, curr.y, curr.width, curr.height);

        // Highlight
        stackerCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        stackerCtx.fillRect(curr.x, curr.y, curr.width, 3);
        stackerCtx.strokeStyle = '#ffffff';
        stackerCtx.lineWidth = 1.5;
        stackerCtx.strokeRect(curr.x, curr.y, curr.width, curr.height);
      }

      // Update & Draw Sparkle Particles
      stackerState.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha > 0) {
          stackerCtx.save();
          stackerCtx.globalAlpha = p.alpha;
          stackerCtx.fillStyle = p.color;
          stackerCtx.beginPath();
          stackerCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          stackerCtx.fill();
          stackerCtx.restore();
        } else {
          stackerState.particles.splice(idx, 1);
        }
      });

      stackerCtx.restore();

      stackerState.animId = requestAnimationFrame(loop);
    }

    loop();
  }

  function endStackerGame() {
    stackerState.running = false;
    if (stackerState.animId) cancelAnimationFrame(stackerState.animId);
    playSound('hit');

    if (stackerFinalHeightEl) stackerFinalHeightEl.textContent = stackerState.height;
    if (stackerFinalPerfectsEl) stackerFinalPerfectsEl.textContent = stackerState.perfects;
    stackerOverOverlay?.classList.remove('hidden');
  }

  startStackerBtn?.addEventListener('click', () => {
    playSound('click');
    stackerStartOverlay?.classList.add('hidden');
    resetStackerGame();
    runStackerLoop();
  });

  restartStackerBtn?.addEventListener('click', () => {
    playSound('click');
    stackerOverOverlay?.classList.add('hidden');
    resetStackerGame();
    runStackerLoop();
  });

  dropBlockBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    placeStackBlock();
  });

  stackerCanvas?.addEventListener('pointerdown', (e) => {
    if (stackerState.running) {
      placeStackBlock();
    }
  });

  // --------------------------------------------------------------------------
  // 6.3 CYBER BRICKS (NEON BLOCK BREAKER GAME)
  // --------------------------------------------------------------------------
  const bricksCanvas = document.getElementById('bricks-canvas');
  const bricksCtx = bricksCanvas?.getContext('2d');
  const startBricksBtn = document.getElementById('start-bricks-btn');
  const restartBricksBtn = document.getElementById('restart-bricks-btn');
  const nextBricksBtn = document.getElementById('next-bricks-btn');
  const bricksStartOverlay = document.getElementById('bricks-start-overlay');
  const bricksOverOverlay = document.getElementById('bricks-over-overlay');
  const bricksWinOverlay = document.getElementById('bricks-win-overlay');
  const bricksScoreEl = document.getElementById('bricks-score');
  const bricksLivesEl = document.getElementById('bricks-lives');
  const bricksHighEl = document.getElementById('bricks-high');
  const bricksFinalScoreEl = document.getElementById('bricks-final-score');
  const bricksWinScoreEl = document.getElementById('bricks-win-score');

  if (bricksHighEl) bricksHighEl.textContent = state.bricksHighScore;

  const BRICK_ROWS = 5;
  const BRICK_COLS = 8;
  const BRICK_COLORS = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4', '#10b981'];

  let bricksState = {
    running: false,
    score: 0,
    lives: 3,
    paddle: { x: 250, y: 350, width: 100, height: 12, speed: 7 },
    ball: { x: 300, y: 330, vx: 3.5, vy: -3.5, radius: 7 },
    bricks: [],
    particles: [],
    animId: null
  };

  function initBricksGrid() {
    if (!bricksCanvas) return [];
    const list = [];
    const brickW = 64;
    const brickH = 20;
    const gap = 8;
    const startX = (bricksCanvas.width - ((brickW + gap) * BRICK_COLS - gap)) / 2;
    const startY = 40;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        list.push({
          x: startX + c * (brickW + gap),
          y: startY + r * (brickH + gap),
          width: brickW,
          height: brickH,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
          points: (BRICK_ROWS - r) * 10,
          alive: true
        });
      }
    }
    return list;
  }

  function resetBricksGame() {
    if (!bricksCanvas) return;
    bricksState = {
      running: true,
      score: 0,
      lives: 3,
      paddle: { x: (bricksCanvas.width - 100) / 2, y: bricksCanvas.height - 24, width: 100, height: 12, speed: 7 },
      ball: { x: bricksCanvas.width / 2, y: bricksCanvas.height - 40, vx: 3.8, vy: -4, radius: 7 },
      bricks: initBricksGrid(),
      particles: [],
      animId: null
    };

    if (bricksScoreEl) bricksScoreEl.textContent = '0';
    if (bricksLivesEl) bricksLivesEl.textContent = '❤️❤️❤️';
  }

  function runBricksLoop() {
    if (!bricksCtx || !bricksCanvas) return;

    function loop() {
      if (!bricksState.running) return;

      // Clear Canvas
      bricksCtx.fillStyle = '#090d16';
      bricksCtx.fillRect(0, 0, bricksCanvas.width, bricksCanvas.height);

      // Draw Grid Background
      bricksCtx.strokeStyle = 'rgba(255,255,255,0.03)';
      bricksCtx.lineWidth = 1;
      for (let x = 0; x < bricksCanvas.width; x += 30) {
        bricksCtx.beginPath();
        bricksCtx.moveTo(x, 0);
        bricksCtx.lineTo(x, bricksCanvas.height);
        bricksCtx.stroke();
      }

      // Update & Draw Bricks
      let remainingBricks = 0;
      bricksState.bricks.forEach(brick => {
        if (!brick.alive) return;
        remainingBricks++;

        // Glowing Brick
        bricksCtx.fillStyle = brick.color;
        bricksCtx.fillRect(brick.x, brick.y, brick.width, brick.height);

        // Highlight
        bricksCtx.fillStyle = 'rgba(255,255,255,0.25)';
        bricksCtx.fillRect(brick.x, brick.y, brick.width, 3);
        bricksCtx.strokeStyle = 'rgba(255,255,255,0.15)';
        bricksCtx.strokeRect(brick.x, brick.y, brick.width, brick.height);

        // Ball & Brick Collision
        const b = bricksState.ball;
        if (
          b.x + b.radius > brick.x &&
          b.x - b.radius < brick.x + brick.width &&
          b.y + b.radius > brick.y &&
          b.y - b.radius < brick.y + brick.height
        ) {
          brick.alive = false;
          b.vy = -b.vy;
          bricksState.score += brick.points;
          if (bricksScoreEl) bricksScoreEl.textContent = bricksState.score;
          playSound('score');

          // Check High Score
          if (bricksState.score > state.bricksHighScore) {
            state.bricksHighScore = bricksState.score;
            localStorage.setItem('bricks_high', state.bricksHighScore);
            if (bricksHighEl) bricksHighEl.textContent = state.bricksHighScore;
          }

          // Spawn Brick Particles
          for (let i = 0; i < 8; i++) {
            bricksState.particles.push({
              x: brick.x + brick.width / 2,
              y: brick.y + brick.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: brick.color,
              radius: Math.random() * 2.5 + 1.5,
              alpha: 1
            });
          }
        }
      });

      // Win Condition Check
      if (remainingBricks === 0) {
        bricksState.running = false;
        if (bricksState.animId) cancelAnimationFrame(bricksState.animId);
        playSound('win');
        if (bricksWinScoreEl) bricksWinScoreEl.textContent = bricksState.score;
        bricksWinOverlay?.classList.remove('hidden');
        return;
      }

      // Update Particles
      bricksState.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha > 0) {
          bricksCtx.save();
          bricksCtx.globalAlpha = p.alpha;
          bricksCtx.fillStyle = p.color;
          bricksCtx.beginPath();
          bricksCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          bricksCtx.fill();
          bricksCtx.restore();
        } else {
          bricksState.particles.splice(idx, 1);
        }
      });

      // Update Ball Position
      const ball = bricksState.ball;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall Collisions
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx;
        playSound('click');
      } else if (ball.x + ball.radius > bricksCanvas.width) {
        ball.x = bricksCanvas.width - ball.radius;
        ball.vx = -ball.vx;
        playSound('click');
      }

      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy;
        playSound('click');
      }

      // Paddle Collision
      const paddle = bricksState.paddle;
      if (
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
      ) {
        ball.y = paddle.y - ball.radius;
        // Angle depends on where ball hits the paddle
        const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.vx = hitOffset * 5.5;
        ball.vy = -Math.abs(ball.vy);
        playSound('jump');
      }

      // Ball Drop (Bottom Out)
      if (ball.y - ball.radius > bricksCanvas.height) {
        bricksState.lives--;
        playSound('hit');

        if (bricksLivesEl) {
          bricksLivesEl.textContent = '❤️'.repeat(Math.max(0, bricksState.lives));
        }

        if (bricksState.lives <= 0) {
          bricksState.running = false;
          if (bricksState.animId) cancelAnimationFrame(bricksState.animId);
          if (bricksFinalScoreEl) bricksFinalScoreEl.textContent = bricksState.score;
          bricksOverOverlay?.classList.remove('hidden');
          return;
        } else {
          // Reset ball on paddle
          ball.x = paddle.x + paddle.width / 2;
          ball.y = paddle.y - 15;
          ball.vx = (Math.random() > 0.5 ? 3.5 : -3.5);
          ball.vy = -4;
        }
      }

      // Draw Paddle
      bricksCtx.fillStyle = '#6366f1';
      bricksCtx.shadowColor = 'rgba(99, 102, 241, 0.5)';
      bricksCtx.shadowBlur = 10;
      bricksCtx.beginPath();
      if (typeof bricksCtx.roundRect === 'function') {
        bricksCtx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
      } else {
        bricksCtx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
      }
      bricksCtx.fill();
      bricksCtx.shadowBlur = 0;

      // Draw Ball
      bricksCtx.fillStyle = '#38bdf8';
      bricksCtx.shadowColor = '#38bdf8';
      bricksCtx.shadowBlur = 12;
      bricksCtx.beginPath();
      bricksCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      bricksCtx.fill();
      bricksCtx.shadowBlur = 0;

      bricksState.animId = requestAnimationFrame(loop);
    }

    loop();
  }

  startBricksBtn?.addEventListener('click', () => {
    playSound('click');
    bricksStartOverlay?.classList.add('hidden');
    resetBricksGame();
    runBricksLoop();
  });

  restartBricksBtn?.addEventListener('click', () => {
    playSound('click');
    bricksOverOverlay?.classList.add('hidden');
    resetBricksGame();
    runBricksLoop();
  });

  nextBricksBtn?.addEventListener('click', () => {
    playSound('click');
    bricksWinOverlay?.classList.add('hidden');
    resetBricksGame();
    runBricksLoop();
  });

  // Paddle Mouse & Touch Movement
  bricksCanvas?.addEventListener('mousemove', (e) => {
    if (!bricksCanvas) return;
    const rect = bricksCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    bricksState.paddle.x = Math.max(0, Math.min(bricksCanvas.width - bricksState.paddle.width, mouseX - bricksState.paddle.width / 2));
  });

  bricksCanvas?.addEventListener('touchmove', (e) => {
    if (!bricksCanvas || !e.touches[0]) return;
    const rect = bricksCanvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    bricksState.paddle.x = Math.max(0, Math.min(bricksCanvas.width - bricksState.paddle.width, touchX - bricksState.paddle.width / 2));
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 6.4 ARCADE TAB SWITCHER (4-GAME ENGINE)
  // --------------------------------------------------------------------------
  const arcadeTabs = document.querySelectorAll('.arcade-tab-btn');
  const gameStacker = document.getElementById('game-stacker');
  const gameBricks = document.getElementById('game-bricks');
  const gameWhirly = document.getElementById('game-whirly');
  const gameTicTacToe = document.getElementById('game-tictactoe');

  arcadeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      arcadeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetGame = tab.getAttribute('data-game');
      state.activeGame = targetGame;

      // Hide all game containers
      document.querySelectorAll('.game-viewport .game-container, .arcade-viewport .game-container').forEach(c => c.classList.add('hidden'));

      if (targetGame === 'stacker') {
        gameStacker?.classList.remove('hidden');
      } else if (targetGame === 'bricks') {
        gameBricks?.classList.remove('hidden');
      } else if (targetGame === 'whirly') {
        gameWhirly?.classList.remove('hidden');
      } else if (targetGame === 'tictactoe') {
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
  // 7.5 SKILLS CATEGORY FILTERING ENGINE
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skills-grid .skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });
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
    { title: 'View Role: Videographer @ IEEE SB CECTL', cat: 'Leadership', action: () => scrollToSection('education') },
    { title: 'View Role: PR Team Head @ Placement Cell CEC', cat: 'Leadership', action: () => scrollToSection('education') },
    { title: 'Jump to Leadership & Academic Milestones', cat: 'Navigation', action: () => scrollToSection('education') },
    { title: 'Jump to Skills Matrix', cat: 'Navigation', action: () => scrollToSection('skills') },
    { title: 'Filter: AI & Vibe Coding Skills', cat: 'Skills', action: () => { scrollToSection('skills'); document.querySelector('.filter-btn[data-filter="ai-vibe"]')?.click(); } },
    { title: 'Filter: LaTeX Document Engineering & Tools', cat: 'Skills', action: () => { scrollToSection('skills'); document.querySelector('.filter-btn[data-filter="tools"]')?.click(); } },
    { title: 'Filter: Cinematography & Mobile Filmmaking', cat: 'Skills', action: () => { scrollToSection('skills'); document.querySelector('.filter-btn[data-filter="cinema"]')?.click(); } },
    { title: 'Filter: Cyber Security Skills', cat: 'Skills', action: () => { scrollToSection('skills'); document.querySelector('.filter-btn[data-filter="security"]')?.click(); } },
    { title: 'Jump to Verified Credentials & Certifications', cat: 'Navigation', action: () => scrollToSection('education') },
    { title: 'View NIELIT Cyber Security Certificate (Grade S)', cat: 'Certification', action: () => window.open('assets/nielit-cyber-security-certificate.pdf', '_blank') },
    { title: 'View Fawstech App Development (Flutter) Certificate', cat: 'Certification', action: () => window.open('assets/fawstech-flutter-certificate.pdf', '_blank') },
    { title: 'View DevTown & GDG Netflix Clone Certificate', cat: 'Certification', action: () => window.open('assets/devtown-netflix-certificate.pdf', '_blank') },
    { title: 'Verify DevTown Credential Online (ID: ZNOH6B)', cat: 'Verification', action: () => window.open('https://cert.devtown.in/verify/ZNOH6B', '_blank') },
    { title: 'View Techmaghi EV Design & VR Internship Certificate', cat: 'Certification', action: () => window.open('assets/techmaghi-ev-vr-certificate.pdf', '_blank') },
    { title: 'Jump to Projects Showcase', cat: 'Navigation', action: () => scrollToSection('projects') },
    { title: 'Chat on WhatsApp (+91 88489 48105)', cat: 'Direct Contact', action: () => window.open('https://wa.me/918848948105', '_blank') },
    { title: 'Open Instagram Profile (@a.k_a.s_h__)', cat: 'Socials', action: () => window.open('https://www.instagram.com/a.k_a.s_h__/', '_blank') },
    { title: 'Replay Entry Intro Animation', cat: 'Experience', action: () => runEntryAnimation() },
    { title: 'Launch SignBridge AI Simulator', cat: 'Featured Project', action: () => { scrollToSection('projects'); openSimBtn?.click(); } },
    { title: 'Play Cyber Stacker (Block Building Tower)', cat: 'Arcade', action: () => { scrollToSection('arcade'); document.querySelector('.arcade-tab-btn[data-game="stacker"]')?.click(); } },
    { title: 'Play Cyber Bricks (Neon Block Breaker)', cat: 'Arcade', action: () => { scrollToSection('arcade'); document.querySelector('.arcade-tab-btn[data-game="bricks"]')?.click(); } },
    { title: 'Launch Whirly Bird Game', cat: 'Arcade', action: () => { scrollToSection('arcade'); document.querySelector('.arcade-tab-btn[data-game="whirly"]')?.click(); } },
    { title: 'Play Tic-Tac-Toe AI', cat: 'Arcade', action: () => { scrollToSection('arcade'); document.querySelector('.arcade-tab-btn[data-game="tictactoe"]')?.click(); } },
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

  // --------------------------------------------------------------------------
  // 11. AURA NEXUS // ULTRA-PREMIUM HIGH-FPS KINETIC PORTAL ENGINE
  // --------------------------------------------------------------------------
  const entryOverlay = document.getElementById('entry-overlay');
  const entryCard = document.getElementById('entry-card');
  const skipIntroBtn = document.getElementById('skip-intro-btn');
  const enterSiteBtn = document.getElementById('enter-site-btn');
  const replayIntroBtn = document.getElementById('replay-intro-btn');
  const entryProgressFill = document.getElementById('entry-progress-fill');
  const entryLoaderStatus = document.getElementById('entry-loader-status');
  const entryLoaderPercent = document.getElementById('entry-loader-percent');
  const entrySoundBtn = document.getElementById('entry-sound-btn');
  const warpFlashEl = document.getElementById('entry-warp-flash');
  const laserHead = document.querySelector('.nexus-laser-head');

  let introCompleted = false;
  let isWarping = false;
  let entryRafId = null;
  let entryStartTime = null;
  const entryDuration = 2300; // 2.3 seconds buttery-smooth cinematic load
  let cachedPercent = -1;

  // 11.1 RETINA-AWARE HIGH-FPS STARDUST & COSMIC FILAMENTS CANVAS
  const pCanvas = document.getElementById('entry-particle-canvas');
  const pCtx = pCanvas?.getContext('2d', { alpha: true });
  let particles = [];
  let dpr = 1;
  let logicalW = window.innerWidth;
  let logicalH = window.innerHeight;
  let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // Smooth lerp state for 3D card tilt
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  function initParticleField() {
    if (!pCanvas || !pCtx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    logicalW = window.innerWidth;
    logicalH = window.innerHeight;

    pCanvas.width = Math.floor(logicalW * dpr);
    pCanvas.height = Math.floor(logicalH * dpr);
    pCanvas.style.width = logicalW + 'px';
    pCanvas.style.height = logicalH + 'px';

    pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = [];
    const count = Math.min(65, Math.max(30, Math.floor(logicalW / 24)));
    const colors = ['#6366f1', '#38bdf8', '#818cf8', '#ffffff', '#f43f5e', '#a5b4fc'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * logicalW,
        y: Math.random() * logicalH,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 1.8 + 1.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.55 + 0.3
      });
    }
  }

  // 11.2 UNIFIED HIGH-FPS V-SYNC RENDER & SIMULATION LOOP
  function renderEntryLoop(timestamp) {
    if (introCompleted && !isWarping) {
      if (entryRafId) cancelAnimationFrame(entryRafId);
      return;
    }

    // 1. High-FPS Progress Engine Interpolation (V-Sync Driven)
    if (!introCompleted && entryStartTime !== null) {
      const elapsed = timestamp - entryStartTime;
      const linear = Math.min(1, Math.max(0, elapsed / entryDuration));
      const ease = 1 - Math.pow(1 - linear, 2.4);
      const pct = Math.min(100, Math.floor(ease * 100));

      if (pct !== cachedPercent) {
        cachedPercent = pct;
        const pctStr = pct < 10 ? '0' + pct : '' + pct;
        if (entryLoaderPercent) entryLoaderPercent.textContent = pctStr + '%';

        if (pct < 25) {
          if (entryLoaderStatus) entryLoaderStatus.textContent = 'Calibrating neural core & sensory matrix...';
        } else if (pct < 55) {
          if (entryLoaderStatus) entryLoaderStatus.textContent = 'Loading 4K cinematography & visual reels...';
        } else if (pct < 85) {
          if (entryLoaderStatus) entryLoaderStatus.textContent = 'Synchronizing verified credentials & AI models...';
        } else {
          if (entryLoaderStatus) entryLoaderStatus.textContent = 'System Synchronized // Welcome.';
        }
      }

      const cssProgress = (ease * 100).toFixed(2) + '%';
      if (entryProgressFill) entryProgressFill.style.width = cssProgress;
      if (laserHead) laserHead.style.left = cssProgress;

      if (linear >= 1) {
        dismissIntro();
      }
    }

    // 2. High-FPS 3D Card Physics Lerp
    if (entryCard && !introCompleted) {
      currentTiltX += (targetTiltX - currentTiltX) * 0.12;
      currentTiltY += (targetTiltY - currentTiltY) * 0.12;
      entryCard.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateZ(10px)`;
    }

    // 3. High-FPS Canvas Particle Field Rendering
    if (pCtx && pCanvas) {
      pCtx.clearRect(0, 0, logicalW, logicalH);

      const centerX = logicalW / 2;
      const centerY = logicalH / 2;
      const pLen = particles.length;

      if (!isWarping) {
        // Fast batched filament lines (Single path, single stroke)
        pCtx.beginPath();
        pCtx.strokeStyle = 'rgba(99, 102, 241, 0.14)';
        pCtx.lineWidth = 0.75;
        const maxDistSq = 85 * 85;

        for (let i = 0; i < pLen; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < pLen; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            if (dx * dx + dy * dy < maxDistSq) {
              pCtx.moveTo(p1.x, p1.y);
              pCtx.lineTo(p2.x, p2.y);
            }
          }
        }
        pCtx.stroke();
      }

      // Render Particles
      for (let i = 0; i < pLen; i++) {
        const p = particles[i];

        if (isWarping) {
          // Hyperspace warp burst outward from center
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.hypot(dx, dy) || 1;
          const angle = Math.atan2(dy, dx);
          const speed = 24 + dist * 0.06;

          pCtx.strokeStyle = p.color;
          pCtx.lineWidth = p.radius * 2;
          pCtx.globalAlpha = 0.85;
          pCtx.beginPath();
          pCtx.moveTo(p.x, p.y);
          pCtx.lineTo(p.x - Math.cos(angle) * speed * 2.6, p.y - Math.sin(angle) * speed * 2.6);
          pCtx.stroke();

          p.x += Math.cos(angle) * speed;
          p.y += Math.sin(angle) * speed;
        } else {
          // Smooth cosmic drift
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = logicalW;
          else if (p.x > logicalW) p.x = 0;
          if (p.y < 0) p.y = logicalH;
          else if (p.y > logicalH) p.y = 0;

          // Gravitational reaction to mouse cursor
          const cdx = p.x - mousePos.x;
          const cdy = p.y - mousePos.y;
          const cdistSq = cdx * cdx + cdy * cdy;
          if (cdistSq < 14400 && cdistSq > 0) { // 120^2
            const cdist = Math.sqrt(cdistSq);
            p.x += (cdx / cdist) * 1.4;
            p.y += (cdy / cdist) * 1.4;
          }

          // Crisp node with soft ambient glow
          pCtx.globalAlpha = p.alpha * 0.45;
          pCtx.fillStyle = p.color;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          pCtx.fill();

          pCtx.globalAlpha = p.alpha;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          pCtx.fill();
        }
      }
      pCtx.globalAlpha = 1.0;
    }

    entryRafId = requestAnimationFrame(renderEntryLoop);
  }

  // 11.3 HIGH-FPS MOUSE TILT LISTENER
  entryOverlay?.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    if (!entryCard || introCompleted) return;
    const rect = entryCard.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - cardCenterX) / (rect.width / 2);
    const deltaY = (e.clientY - cardCenterY) / (rect.height / 2);

    targetTiltX = -deltaY * 7.5;
    targetTiltY = deltaX * 7.5;
  }, { passive: true });

  entryOverlay?.addEventListener('mouseleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!introCompleted) initParticleField();
  }, { passive: true });

  // 11.4 TYPOGRAPHIC KINETIC STAGGER REVEAL
  function runKineticTitleAnimation() {
    playSound('nexusTone');
    const chars = document.querySelectorAll('.nexus-char');
    chars.forEach((c, idx) => {
      c.classList.remove('revealed');
      setTimeout(() => {
        c.classList.add('revealed');
      }, idx * 65 + 100);
    });
  }

  // 11.5 SOUND TOGGLE ON ENTRY
  entrySoundBtn?.addEventListener('click', () => {
    toggleSoundState();
  });

  // 11.6 PORTAL DISMISS & HERO ARRIVAL UNFOLD
  function dismissIntro() {
    if (introCompleted) return;
    introCompleted = true;

    if (entryProgressFill) entryProgressFill.style.width = '100%';
    if (entryLoaderPercent) entryLoaderPercent.textContent = '100%';
    if (entryLoaderStatus) entryLoaderStatus.textContent = 'Access Granted // Welcome.';

    // High-end crystal portal chime + shutter lock
    isWarping = true;
    playSound('nexusPortal');

    // Trigger Optical Portal Burst Bloom
    if (warpFlashEl) warpFlashEl.classList.add('bursting');

    // Split Dual Optical Shutter Plates
    entryOverlay?.classList.add('exit');

    // Smooth Hero & Navbar Unfold
    setTimeout(() => {
      const hero = document.getElementById('hero');
      const navbar = document.getElementById('navbar');

      hero?.classList.add('hero-unfold-active');
      navbar?.classList.add('nav-slide-down');

      document.querySelectorAll('#hero .fade-in-up').forEach((el, idx) => {
        setTimeout(() => el.classList.add('visible'), idx * 80);
      });
    }, 380);

    setTimeout(() => {
      if (entryRafId) cancelAnimationFrame(entryRafId);
      if (entryOverlay) entryOverlay.style.display = 'none';
    }, 1050);
  }

  function runEntryAnimation() {
    introCompleted = false;
    isWarping = false;
    cachedPercent = -1;
    targetTiltX = 0;
    targetTiltY = 0;
    currentTiltX = 0;
    currentTiltY = 0;

    if (entryRafId) cancelAnimationFrame(entryRafId);

    if (entryOverlay) {
      entryOverlay.style.display = 'flex';
      entryOverlay.classList.remove('exit');
    }
    if (warpFlashEl) {
      warpFlashEl.classList.remove('bursting');
    }
    if (entryCard) {
      entryCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    }

    if (entryProgressFill) entryProgressFill.style.width = '0%';
    if (entryLoaderPercent) entryLoaderPercent.textContent = '00%';
    if (entryLoaderStatus) entryLoaderStatus.textContent = 'Initializing neural interface & sensory matrix...';

    if (laserHead) {
      laserHead.style.left = '0%';
      laserHead.style.opacity = '1';
    }

    syncSoundUI();

    // Start High-FPS Retina Particle Canvas
    initParticleField();

    // Trigger Kinetic Typography Reveal
    runKineticTitleAnimation();

    // Synchronize Entry Loop with display refresh rate (V-Sync)
    entryStartTime = performance.now();
    entryRafId = requestAnimationFrame(renderEntryLoop);
  }

  // Initialize entry experience on page load
  runEntryAnimation();

  skipIntroBtn?.addEventListener('click', () => {
    playSound('click');
    dismissIntro();
  });

  enterSiteBtn?.addEventListener('click', () => {
    playSound('click');
    dismissIntro();
  });

  replayIntroBtn?.addEventListener('click', () => {
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    runEntryAnimation();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !entryOverlay?.classList.contains('exit')) {
      dismissIntro();
    }
  });
});

