/* ═══════════════════════════════════════
   PREETH NAIR — PORTFOLIO SCRIPT
   Particles · Typewriter · Scroll · Nav
   ═══════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────
   1. PARTICLE CANVAS ANIMATION
   ───────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;
  let raf;
  let active = true;

  /* Resize handler — debounced */
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildParticles();
    }, 120);
  }

  /* Particle factory */
  function makeParticle() {
    const palette = ['rgba(138,118,80,', 'rgba(219,206,165,'];
    const base = palette[Math.floor(Math.random() * palette.length)];
    const opacity = (Math.random() * 0.22 + 0.08).toFixed(2);
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.22,
      dy: (Math.random() - 0.5) * 0.18,
      color: `${base}${opacity})`,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
    };
  }

  function buildParticles() {
    /* ~80 particles on desktop, less on mobile */
    const count = Math.min(100, Math.floor((W * H) / 14000));
    particles = Array.from({ length: count }, makeParticle);
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      /* Pulse radius */
      p.pulse += p.pulseSpeed;
      const r = p.r + Math.sin(p.pulse) * 0.3;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, r), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      /* Drift */
      p.x += p.dx;
      p.y += p.dy;

      /* Wrap edges */
      if (p.x < -4)  p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
      if (p.y < -4)  p.y = H + 4;
      if (p.y > H + 4) p.y = -4;
    });

    raf = requestAnimationFrame(draw);
  }

  /* Init */
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  buildParticles();
  draw();

  window.addEventListener('resize', onResize, { passive: true });

  /* Pause when hero is out of view — performance */
  const heroObs = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
    if (active) {
      cancelAnimationFrame(raf);
      draw();
    }
  }, { threshold: 0 });

  const hero = document.getElementById('home');
  if (hero) heroObs.observe(hero);
})();


/* ─────────────────────────────────────
   2. TYPEWRITER EFFECT
   ───────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const titles = ['Data Scientist', 'ML Engineer', 'AI Enthusiast'];
  let titleIdx  = 0;
  let charIdx   = 0;
  let deleting  = false;
  let pauseAfterType = false;

  const TYPING_SPEED   = 75;
  const DELETING_SPEED = 42;
  const PAUSE_AFTER    = 1800;
  const PAUSE_BEFORE   = 300;

  function tick() {
    const current = titles[titleIdx];

    if (pauseAfterType) {
      pauseAfterType = false;
      setTimeout(tick, PAUSE_AFTER);
      return;
    }

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        pauseAfterType = true;
        setTimeout(tick, TYPING_SPEED);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        setTimeout(tick, PAUSE_BEFORE);
        return;
      }
    }

    setTimeout(tick, deleting ? DELETING_SPEED : TYPING_SPEED);
  }

  /* Small initial delay so it starts after the hero fades in */
  setTimeout(tick, 1200);
})();


/* ─────────────────────────────────────
   3. STICKY NAV + GLASSMORPHISM
   ───────────────────────────────────── */
(function initNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 80;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* run once on load */
})();


/* ─────────────────────────────────────
   4. SMOOTH SCROLL + ACTIVE NAV LINK
   ───────────────────────────────────── */
(function initSmoothScroll() {
  const navHeight = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72'
  );

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const offsetTop = target.getBoundingClientRect().top + window.scrollY - navHeight();
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });

      /* Close mobile nav if open */
      closeMobileNav();
    });
  });
})();

/* Shared utility: update active nav link based on scroll */
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72'
  );

  let current = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top <= navHeight + 80) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });


/* ─────────────────────────────────────
   5. HAMBURGER MENU (MOBILE)
   ───────────────────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      closeMobileNav();
    }
  });
})();

function closeMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');
  if (!navMenu) return;
  navMenu.classList.remove('open');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  }
}


/* ─────────────────────────────────────
   6. INTERSECTION OBSERVER — SECTION REVEAL
   ───────────────────────────────────── */
(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.section-reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────
   7. CONTACT FORM — SUCCESS TOAST
   ───────────────────────────────────── */
(function initContactForm() {
  const form  = document.getElementById('contact-form');
  const toast = document.getElementById('toast');
  if (!form || !toast) return;

  let toastTimer;

  function showToast() {
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  function validateForm(data) {
    const name    = data.get('name')?.trim();
    const email   = data.get('email')?.trim();
    const message = data.get('message')?.trim();
    if (!name || !email || !message) return false;
    /* Simple email pattern check */
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData(form);

    if (!validateForm(formData)) {
      /* Shake animation on invalid */
      form.style.animation = 'none';
      requestAnimationFrame(() => {
        form.style.animation = 'shake 0.4s ease';
      });
      return;
    }

    /* Simulate sending — replace with actual fetch/API call */
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.textContent = originalText;
      showToast();
    }, 900);
  });
})();


/* ─────────────────────────────────────
   8. SUBTLE CURSOR GLOW (desktop only)
   ───────────────────────────────────── */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;
    width:300px; height:300px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(138,118,80,0.045) 0%, transparent 70%);
    pointer-events:none;
    z-index:0;
    transform:translate(-50%,-50%);
    transition:opacity 0.4s;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(glow);

  let mx = -500, my = -500;
  let cx = -500, cy = -500;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
  });

  function loop() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    raf = requestAnimationFrame(loop);
  }
  loop();
})();


/* ─────────────────────────────────────
   9. CARD TILT ON HOVER (subtle 3-D)
   ───────────────────────────────────── */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -4;
      const rotY = ((x - cx) / cx) *  4;
      card.style.transform = `translateY(-4px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'box-shadow 0.35s, border-color 0.35s, transform 0.1s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });
})();


/* ─────────────────────────────────────
   KEYFRAME for shake animation (inline)
   ───────────────────────────────────── */
(function addShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();
