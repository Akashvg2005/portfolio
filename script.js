/* ==========================================================================
   Akash V G — Personal Portfolio JavaScript Engine
   Gamification, Interactive Terminal, SignBridge Simulator, Cmd+K Palette,
   Theme Customizer, Sound Effects Synthesizer, 3D Tilt, Accessibility.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. SOUND EFFECTS SYNTHESIZER (WEB AUDIO API)
     -------------------------------------------------------------------------- */
  let soundEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playBlip(freq = 440, type = 'sine', duration = 0.08) {
    if (!soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIconOff = soundToggleBtn?.querySelector('.sound-icon-off');
  const soundIconOn = soundToggleBtn?.querySelector('.sound-icon-on');

  soundToggleBtn?.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIconOff?.classList.add('hidden');
      soundIconOn?.classList.remove('hidden');
      soundToggleBtn.title = "Sound FX (On)";
      playBlip(587.33, 'triangle', 0.15); // D5 chime
    } else {
      soundIconOn?.classList.add('hidden');
      soundIconOff?.classList.remove('hidden');
      soundToggleBtn.title = "Sound FX (Off)";
    }
  });

  // Attach hover sound to interactive elements
  document.querySelectorAll('button, a, .skill-card, .project-card, .cmd-pill').forEach(elem => {
    elem.addEventListener('mouseenter', () => playBlip(329.63, 'sine', 0.04));
    elem.addEventListener('click', () => playBlip(523.25, 'triangle', 0.08));
  });

  /* --------------------------------------------------------------------------
     2. THEME & ACCENT COLOR MANAGER
     -------------------------------------------------------------------------- */
  const htmlElem = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn?.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn?.querySelector('.moon-icon');

  // Load saved theme or default dark
  const savedTheme = localStorage.getItem('akash_portfolio_theme') || 'dark';
  setTheme(savedTheme);

  function setTheme(theme) {
    htmlElem.setAttribute('data-theme', theme);
    localStorage.setItem('akash_portfolio_theme', theme);

    if (theme === 'light') {
      moonIcon?.classList.add('hidden');
      sunIcon?.classList.remove('hidden');
    } else {
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
    }
  }

  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = htmlElem.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Accent Color Customizer Dropdown
  const accentBtn = document.getElementById('accent-picker-btn');
  const accentMenu = document.getElementById('accent-menu');
  const savedAccent = localStorage.getItem('akash_portfolio_accent') || 'indigo';
  
  setAccent(savedAccent);

  function setAccent(accentName) {
    htmlElem.setAttribute('data-accent', accentName);
    localStorage.setItem('akash_portfolio_accent', accentName);
  }

  accentBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    accentMenu?.classList.toggle('hidden');
  });

  document.querySelectorAll('.accent-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const selectedAccent = opt.getAttribute('data-accent');
      if (selectedAccent) setAccent(selectedAccent);
      accentMenu?.classList.add('hidden');
    });
  });

  document.addEventListener('click', () => {
    accentMenu?.classList.add('hidden');
  });

  /* --------------------------------------------------------------------------
     3. INTERACTIVE CLI DEVELOPER TERMINAL WIDGET
     -------------------------------------------------------------------------- */
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalClearBtn = document.getElementById('terminal-clear-btn');
  const terminalBody = document.getElementById('terminal-body');

  const COMMANDS = {
    help: `Available commands:
• <span class="highlight-code">bio</span>       — Summary of Akash V G's developer focus
• <span class="highlight-code">signbridge</span>— Details on SignBridge AI Accessibility platform
• <span class="highlight-code">skills</span>    — Technical skills matrix
• <span class="highlight-code">projects</span>  — List featured projects
• <span class="highlight-code">education</span> — B.Tech college details
• <span class="highlight-code">contact</span>   — Contact information & social links
• <span class="highlight-code">theme</span>     — Switch theme between dark and light
• <span class="highlight-code">matrix</span>    — Run digital rain simulator
• <span class="highlight-code">clear</span>     — Clear terminal screen`,

    bio: `Akash V G | Computer Science & Engineering Student (2023-2027)
Location: Vaikom, Kerala, India
Focus: AI Accessibility, Flutter Apps, Computer Vision (MediaPipe/OpenCV), Web Systems.`,

    signbridge: `✦ SIGNBRIDGE (Flagship Project)
Description: AI-Powered Interview Platform for Deaf and Hard-of-Hearing candidates.
Tech Stack: Python, MediaPipe, Flutter, TensorFlow, OpenCV, Antigravity AI.
Status: Current Build Phase 2 (Active Development).
Feature: Converts Indian Sign Language (ISL) gestures to live text & synthetic audio.`,

    skills: `[SKILL MATRIX]
• Dart & Flutter ........ [90%] Mobile Apps & Flame Game Physics
• JavaScript & Web ..... [92%] ES6+, Responsive Layouts, DOM
• Python & CV .......... [85%] MediaPipe, OpenCV, TensorFlow
• React Native & Node .. [80%] Full-stack Expo & REST APIs
• Firebase & Cloud ..... [88%] Firestore, Auth, Security Rules
• Git & Antigravity AI . [95%] Version Control & Agentic Pair Programming`,

    projects: `[FEATURED PROJECTS]
1. SignBridge (AI ISL Interview Platform)
2. Smart Bus Tracking & Monitoring System ("FaceIt!" Face Attendance)
3. Layam — The Music Mate (Full-Stack AI Music App)
4. Netflix UI Clone (HTML/CSS/JS)`,

    education: `[EDUCATION]
Degree: B.Tech in Computer Science and Engineering (2023–2027)
Institution: College of Engineering, Cherthala, Kerala, India`,

    contact: `[CONTACT INFO]
• Email: akashvg2005@gmail.com
• GitHub: https://github.com/Akashvg2005
• LinkedIn: https://www.linkedin.com/in/akash-v-g-76b46a291/
• Location: Vaikom, Kerala, India`,

    matrix: `<span class="highlight-code">01000001 01101011 01100001 01110011 01101000</span>
<span style="color:#10b981;">[MATRIX MODE ENGAGED] Entering Indian Sign Language AI neural space...</span>`
  };

  function executeTerminalCmd(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    // Append user line
    const userLine = document.createElement('div');
    userLine.className = 'terminal-line';
    userLine.innerHTML = `<span class="terminal-prompt">akash@portfolio:~$</span> ${escapeHtml(cmdRaw)}`;
    terminalOutput.appendChild(userLine);

    if (cmd === 'clear') {
      terminalOutput.innerHTML = '';
      terminalInput.value = '';
      return;
    }

    if (cmd === 'theme') {
      const currentTheme = htmlElem.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      appendTerminalOutput(`Theme switched to: <span class="highlight-code">${newTheme}</span> mode`);
      terminalInput.value = '';
      return;
    }

    if (cmd === 'signbridge') {
      // Trigger opening simulator
      openIslSimulator();
    }

    const response = COMMANDS[cmd] || `Command not found: '${escapeHtml(cmdRaw)}'. Type <span class="highlight-code">'help'</span> for a list of valid commands.`;
    appendTerminalOutput(response);

    terminalInput.value = '';
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function appendTerminalOutput(text) {
    const resLine = document.createElement('div');
    resLine.className = 'terminal-line text-dim';
    resLine.innerHTML = text.replace(/\n/g, '<br/>');
    terminalOutput.appendChild(resLine);
  }

  terminalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    executeTerminalCmd(terminalInput.value);
  });

  terminalClearBtn?.addEventListener('click', () => {
    terminalOutput.innerHTML = '';
  });

  // Quick Command Pills
  document.querySelectorAll('.cmd-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cmd = pill.getAttribute('data-cmd');
      if (cmd) {
        terminalInput.value = cmd;
        executeTerminalCmd(cmd);
      }
    });
  });

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  /* --------------------------------------------------------------------------
     4. SIGNBRIDGE LIVE ISL GESTURE SIMULATOR WIDGET
     -------------------------------------------------------------------------- */
  const openIslSimBtn = document.getElementById('open-isl-sim-btn');
  const closeIslSimBtn = document.getElementById('close-isl-sim');
  const islSimWidget = document.getElementById('isl-sim-widget');
  const simGestureOutput = document.getElementById('sim-gesture-output');
  const simConfidenceOutput = document.getElementById('sim-confidence-output');
  const canvas = document.getElementById('landmark-canvas');

  let animFrameId = null;

  function openIslSimulator() {
    islSimWidget?.classList.remove('hidden');
    islSimWidget?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    startLandmarkCanvasAnimation();
  }

  openIslSimBtn?.addEventListener('click', openIslSimulator);

  closeIslSimBtn?.addEventListener('click', () => {
    islSimWidget?.classList.add('hidden');
    if (animFrameId) cancelAnimationFrame(animFrameId);
  });

  // Simulator Gesture Buttons
  document.querySelectorAll('.sim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sim-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const gesture = btn.getAttribute('data-gesture');
      const conf = btn.getAttribute('data-conf');

      if (simGestureOutput && simConfidenceOutput) {
        simGestureOutput.textContent = `Target: "${gesture}"`;
        simConfidenceOutput.textContent = `Confidence: ${conf}`;
      }
    });
  });

  // Canvas Landmark Motion Render Loop
  function startLandmarkCanvasAnimation() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    // Simulated 21 MediaPipe hand landmark points
    const baseNodes = [
      { x: 150, y: 140 }, // Wrist (0)
      { x: 130, y: 120 }, { x: 115, y: 95 }, { x: 105, y: 75 }, { x: 95, y: 55 }, // Thumb
      { x: 135, y: 80 },  { x: 132, y: 55 }, { x: 130, y: 35 }, { x: 128, y: 20 }, // Index
      { x: 150, y: 75 },  { x: 150, y: 50 }, { x: 150, y: 30 }, { x: 150, y: 15 }, // Middle
      { x: 165, y: 80 },  { x: 168, y: 58 }, { x: 170, y: 40 }, { x: 172, y: 25 }, // Ring
      { x: 180, y: 90 },  { x: 185, y: 70 }, { x: 190, y: 55 }, { x: 195, y: 40 }  // Pinky
    ];

    const connections = [
      [0,1],[1,2],[2,3],[3,4], // Thumb
      [0,5],[5,6],[6,7],[7,8], // Index
      [0,9],[9,10],[10,11],[11,12], // Middle
      [0,13],[13,14],[14,15],[15,16], // Ring
      [0,17],[17,18],[18,19],[19,20], // Pinky
      [5,9],[9,13],[13,17] // Palm bridge
    ];

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera feed simulation background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }

      angle += 0.04;
      const wave = Math.sin(angle) * 4;

      // Draw Connection Skeleton Lines
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      connections.forEach(([i, j]) => {
        const p1 = baseNodes[i];
        const p2 = baseNodes[j];
        ctx.beginPath();
        ctx.moveTo(p1.x + (i > 0 ? wave : 0), p1.y);
        ctx.lineTo(p2.x + (j > 0 ? wave : 0), p2.y);
        ctx.stroke();
      });

      // Draw Glowing Nodes
      baseNodes.forEach((node, idx) => {
        const nx = node.x + (idx > 0 ? wave : 0);
        const ny = node.y;

        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#6366f1' : '#34d399';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.stroke();
      });

      animFrameId = requestAnimationFrame(draw);
    }

    draw();
  }

  /* --------------------------------------------------------------------------
     5. SKILLS FILTERING MECHANISM
     -------------------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
     6. COMMAND PALETTE MODAL (CMD+K / CTRL+K)
     -------------------------------------------------------------------------- */
  const cmdModal = document.getElementById('cmd-palette');
  const cmdBtn = document.getElementById('cmd-palette-btn');
  const cmdBackdrop = document.getElementById('cmd-backdrop');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResults = document.getElementById('cmd-results');

  const PALETTE_ITEMS = [
    { title: "Jump to About Section", cat: "Navigation", action: () => scrollToSection('#about') },
    { title: "Jump to Skills Matrix", cat: "Navigation", action: () => scrollToSection('#skills') },
    { title: "Jump to Projects Showcase", cat: "Navigation", action: () => scrollToSection('#projects') },
    { title: "Launch SignBridge AI Simulator", cat: "Featured Project", action: () => { scrollToSection('#projects'); openIslSimulator(); } },
    { title: "Jump to Education & Milestones", cat: "Navigation", action: () => scrollToSection('#education') },
    { title: "Jump to Contact Form", cat: "Navigation", action: () => scrollToSection('#contact') },
    { title: "Download Resume (PDF)", cat: "Action", action: () => document.getElementById('resume-download-btn')?.click() },
    { title: "Toggle Light / Dark Mode", cat: "Theme", action: () => themeToggleBtn?.click() },
    { title: "Open GitHub Profile", cat: "External Link", action: () => window.open('https://github.com/Akashvg2005', '_blank') },
    { title: "Open LinkedIn Profile", cat: "External Link", action: () => window.open('https://www.linkedin.com/in/akash-v-g-76b46a291/', '_blank') }
  ];

  let selectedCmdIdx = 0;

  function openCmdPalette() {
    cmdModal?.classList.add('active');
    cmdModal?.setAttribute('aria-hidden', 'false');
    cmdInput.value = '';
    renderCmdResults(PALETTE_ITEMS);
    cmdInput?.focus();
  }

  function closeCmdPalette() {
    cmdModal?.classList.remove('active');
    cmdModal?.setAttribute('aria-hidden', 'true');
  }

  cmdBtn?.addEventListener('click', openCmdPalette);
  cmdBackdrop?.addEventListener('click', closeCmdPalette);

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdModal?.classList.contains('active') ? closeCmdPalette() : openCmdPalette();
    } else if (e.key === 'Escape' && cmdModal?.classList.contains('active')) {
      closeCmdPalette();
    }
  });

  function renderCmdResults(items) {
    if (!cmdResults) return;
    cmdResults.innerHTML = '';
    selectedCmdIdx = 0;

    if (items.length === 0) {
      cmdResults.innerHTML = `<div class="cmd-item" style="cursor:default;">No matching commands</div>`;
      return;
    }

    items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `cmd-item ${idx === 0 ? 'selected' : ''}`;
      row.innerHTML = `
        <span class="cmd-item-title">${item.title}</span>
        <span class="cmd-item-category">${item.cat}</span>
      `;

      row.addEventListener('click', () => {
        closeCmdPalette();
        item.action();
      });

      cmdResults.appendChild(row);
    });
  }

  cmdInput?.addEventListener('input', () => {
    const q = cmdInput.value.toLowerCase().trim();
    const filtered = PALETTE_ITEMS.filter(i => 
      i.title.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)
    );
    renderCmdResults(filtered);
  });

  function scrollToSection(selector) {
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* --------------------------------------------------------------------------
     7. 3D PARALLAX TILT EFFECT ON TILT CARDS
     -------------------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // max 6deg tilt
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  /* --------------------------------------------------------------------------
     8. INTERSECTION OBSERVER FOR FADE-IN ENTRANCE & SCROLLSPY
     -------------------------------------------------------------------------- */
  const fadeElems = document.querySelectorAll('.fade-in-up');
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbar = document.getElementById('navbar');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  fadeElems.forEach(el => fadeObserver.observe(el));

  window.addEventListener('scroll', () => {
    // Navbar glass blur background on scroll
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scrollspy active nav link tracking
    let currentSec = '';
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      if (window.scrollY >= secTop) {
        currentSec = sec.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSec}`) {
        link.classList.add('active');
      }
    });
  });

  /* --------------------------------------------------------------------------
     9. MOBILE MENU DRAWER TOGGLE
     -------------------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  mobileToggle?.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    navLinksContainer?.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinksContainer?.classList.remove('open');
      mobileToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  /* --------------------------------------------------------------------------
     10. CONTACT FORM HANDLING
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;

    if (formFeedback) {
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = `Thank you, ${name}! Your message has been sent to Akash V G (${email}).`;
      formFeedback.classList.remove('hidden');
    }

    contactForm.reset();
  });

});
