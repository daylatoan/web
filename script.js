/**
 * CAT SI ($CSI) — INTERACTIVE ENGINE
 * Features:
 * - Boot loader sequence with progress bar
 * - GSAP hero entrance & scroll reveals
 * - Lightweight 60fps cosmic starfield canvas
 * - Desktop 3D mouse tilt on hero card
 * - Cursor glow & Card spotlight effect
 * - Sticky glass navbar & active section observer
 * - Functional smart contract copy with feedback toast
 * - Mobile navigation drawer
 * - Scroll-to-top handler
 * - Accessibility & prefers-reduced-motion compliance
 */

(function () {
  'use strict';

  var isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ==========================================================================
     1. PAGE LOADER & BOOT SEQUENCE
     ========================================================================== */
  var loader = document.getElementById('page-loader');
  var loaderBar = document.getElementById('loader-bar');
  var loaderStatus = document.getElementById('loader-status');

  var urlParams = new URLSearchParams(window.location.search);
  var skipLoader = isReducedMotion || urlParams.has('noload') || (function() {
    try { return sessionStorage.getItem('catsi-loaded') === '1'; } catch (e) { return false; }
  })();

  function initLoader() {
    if (!loader) return;
    if (skipLoader) {
      loader.classList.add('loaded');
      loader.style.display = 'none';
      initHeroAnimations();
      return;
    }
    try { sessionStorage.setItem('catsi-loaded', '1'); } catch (e) {}

    var progress = 0;
    var statusMessages = [
      'INITIALIZING NEURAL CORE...',
      'CONNECTING STARBASE RELAY...',
      'CALCULATING MARS TRAJECTORY...',
      'QUANTUM PURR ENGINE ONLINE.'
    ];

    var interval = setInterval(function () {
      progress += Math.floor(Math.random() * 25) + 18;
      if (progress > 100) progress = 100;

      if (loaderBar) loaderBar.style.width = progress + '%';
      if (loaderStatus) {
        var msgIdx = Math.min(Math.floor((progress / 100) * statusMessages.length), statusMessages.length - 1);
        loaderStatus.textContent = statusMessages[msgIdx];
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(function () {
          loader.classList.add('loaded');
          initHeroAnimations();
          setTimeout(function () {
            if (loader) loader.style.display = 'none';
          }, 400);
        }, 100);
      }
    }, 40);
  }

  /* ==========================================================================
     2. HERO INTRO ANIMATION
     ========================================================================== */
  function initHeroAnimations() {
    document.body.classList.add('hero-active');
  }

  /* ==========================================================================
     3. COSMIC CANVAS STARFIELD (LIGHTWEIGHT 60FPS)
     ========================================================================== */
  function initCosmicCanvas() {
    var canvas = document.getElementById('cosmic-canvas');
    if (!canvas || isReducedMotion) return;

    var ctx = canvas.getContext('2d');
    var stars = [];
    var count = 75; // optimized for high performance
    var width = (canvas.width = window.innerWidth);
    var height = (canvas.height = window.innerHeight);
    var running = true;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });

    function createStars() {
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.8 + 0.4,
          speedY: Math.random() * 0.25 + 0.05,
          alpha: Math.random() * 0.7 + 0.3,
          color: Math.random() > 0.3 ? '#00f0ff' : '#ff9e2c'
        });
      }
    }
    createStars();

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(Date.now() * 0.002 + i));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        s.y -= s.speedY;
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }
      }

      requestAnimationFrame(draw);
    }

    // Pause when tab is hidden to conserve resources
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(draw);
    });

    requestAnimationFrame(draw);
  }

  /* ==========================================================================
     4. CURSOR GLOW & CARD SPOTLIGHT
     ========================================================================== */
  function initPointerEffects() {
    if (!isFinePointer || isReducedMotion) return;

    var glow = document.getElementById('cursor-glow');
    var spotlightCards = document.querySelectorAll('.spotlight-card, .telemetry-card');

    window.addEventListener('mousemove', function (e) {
      var x = e.clientX;
      var y = e.clientY;

      if (glow) {
        glow.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      }

      spotlightCards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        if (
          x >= rect.left - 50 &&
          x <= rect.right + 50 &&
          y >= rect.top - 50 &&
          y <= rect.bottom + 50
        ) {
          var cardX = ((x - rect.left) / rect.width) * 100;
          var cardY = ((y - rect.top) / rect.height) * 100;
          card.style.setProperty('--mouse-x', cardX + '%');
          card.style.setProperty('--mouse-y', cardY + '%');
        }
      });
    }, { passive: true });
  }

  /* ==========================================================================
     5. 3D MOUSE TILT ON HERO CARD
     ========================================================================== */
  function initHeroTilt() {
    if (!isFinePointer || isReducedMotion) return;

    var stage = document.getElementById('hero-art-stage');
    var card = document.getElementById('hero-tilt-card');
    if (!stage || !card) return;

    var maxTilt = 8; // degrees

    stage.addEventListener('mousemove', function (e) {
      var rect = stage.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;

      var tiltX = (0.5 - y) * maxTilt * 2;
      var tiltY = (x - 0.5) * maxTilt * 2;

      card.style.transform =
        'perspective(1000px) rotateX(' +
        tiltX.toFixed(2) +
        'deg) rotateY(' +
        tiltY.toFixed(2) +
        'deg) scale3d(1.02, 1.02, 1.02)';
    });

    stage.addEventListener('mouseleave', function () {
      card.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  /* ==========================================================================
     6. SCROLL SPY, NAVBAR STATE, AND PROGRESS BAR
     ========================================================================== */
  function initScrollHandlers() {
    var navbar = document.getElementById('navbar');
    var progressBar = document.getElementById('progress-bar');
    var scrollTopBtn = document.getElementById('scroll-top-btn');

    function onScroll() {
      var scrollY = window.scrollY;

      // Navbar glass state
      if (navbar) {
        if (scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Scroll progress
      if (progressBar) {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      }

      // Scroll to top button
      if (scrollTopBtn) {
        if (scrollY > 450) {
          scrollTopBtn.classList.add('visible');
        } else {
          scrollTopBtn.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ==========================================================================
     7. ACTIVE SECTION INDICATOR IN NAVBAR
     ========================================================================== */
  function initActiveNav() {
    var navLinks = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('section[id], header[id]');

    if (!('IntersectionObserver' in window) || !navLinks.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              var href = link.getAttribute('href');
              if (href === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(function (sec) {
      observer.observe(sec);
    });
  }

  /* ==========================================================================
     8. SCROLL REVEALS (INTERSECTION OBSERVER)
     ========================================================================== */
  function initScrollReveals() {
    var revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length) return;

    if (isReducedMotion || urlParams.has('reveal')) {
      revealElements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================================
     9. INFINITE TICKER STRIP
     ========================================================================== */
  function initTicker() {
    var track = document.getElementById('ticker-track');
    if (!track || isReducedMotion) return;

    // Clone content for smooth seamless looping
    track.innerHTML += track.innerHTML;

    var posX = 0;
    var speed = 0.8;

    function loop() {
      posX -= speed;
      var halfWidth = track.scrollWidth / 2;
      if (Math.abs(posX) >= halfWidth) {
        posX = 0;
      }
      track.style.transform = 'translate3d(' + posX + 'px, 0, 0)';
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  /* ==========================================================================
     10. SMART CONTRACT COPY BUTTON WITH LIVE FEEDBACK
     ========================================================================== */
  function initCopyButtons() {
    var copyBtn = document.getElementById('copy-btn');
    var caString = document.getElementById('contract-address');
    var copyLabel = document.getElementById('copy-label');
    var copyToast = document.getElementById('copy-toast');

    var footerCopyBtn = document.getElementById('footer-copy-btn');

    function performCopy(text, btnElement, labelElement) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          onSuccess();
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
        document.body.removeChild(textarea);
      }

      function onSuccess() {
        if (btnElement) {
          btnElement.classList.add('copied');
        }
        if (labelElement) {
          labelElement.textContent = 'COPIED! ✓';
        }
        if (copyToast) {
          copyToast.classList.add('show');
        }

        setTimeout(function () {
          if (btnElement) btnElement.classList.remove('copied');
          if (labelElement) labelElement.textContent = 'COPY CA';
          if (copyToast) copyToast.classList.remove('show');
        }, 2200);
      }
    }

    if (copyBtn && caString) {
      copyBtn.addEventListener('click', function () {
        performCopy(caString.textContent.trim(), copyBtn, copyLabel);
      });
    }

    if (footerCopyBtn && caString) {
      footerCopyBtn.addEventListener('click', function () {
        var footerSpan = footerCopyBtn.querySelector('span');
        performCopy(caString.textContent.trim(), footerCopyBtn, footerSpan);
      });
    }
  }

  /* ==========================================================================
     11. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var drawer = document.getElementById('mobile-nav');
    var links = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta a');

    if (!toggle || !drawer) return;

    function openMenu() {
      toggle.classList.add('open');
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* ==========================================================================
     12. PLACEHOLDER LINKS HANDLER
     ========================================================================== */
  function initPlaceholderLinks() {
    document.querySelectorAll('a[href="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
      });
    });
  }

  /* ==========================================================================
     BOOTSTRAP EVERYTHING
     ========================================================================== */
  function init() {
    initLoader();
    initCosmicCanvas();
    initPointerEffects();
    initHeroTilt();
    initScrollHandlers();
    initActiveNav();
    initScrollReveals();
    initTicker();
    initCopyButtons();
    initMobileMenu();
    initPlaceholderLinks();

    if (urlParams.has('scroll')) {
      var target = document.getElementById(urlParams.get('scroll'));
      if (target) {
        window.scrollTo(0, target.offsetTop);
        document.documentElement.scrollTop = target.offsetTop;
        document.body.scrollTop = target.offsetTop;
        target.scrollIntoView({ behavior: 'instant' });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
