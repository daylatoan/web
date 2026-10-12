/**
 * ==========================================================================
 * ANIMATIONS MODULE — GROK SUPER INTELLIGENCE ($GSI)
 * ==========================================================================
 */

import { siteConfig } from './config.js';

export function initAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // 1. Scroll Reveal with IntersectionObserver for rest of the page
  const otherRevealElements = document.querySelectorAll(
    '.animated-banner-section .reveal, .section .reveal, .final-cta-section .reveal, .site-footer .reveal'
  );

  if (otherRevealElements.length > 0) {
    if (prefersReducedMotion || !siteConfig.features.enableAnimations) {
      otherRevealElements.forEach((el) => el.classList.add('is-visible'));
    } else if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.05,
        }
      );

      otherRevealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 60) {
          el.classList.add('is-visible');
        } else {
          revealObserver.observe(el);
        }
      });
    } else {
      otherRevealElements.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // 2. Cosmic Spark Particle System in Hero
  if (siteConfig.features.enableParticles && !prefersReducedMotion) {
    initHeroParticles();
  }
}

function initHeroParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
  let height = (canvas.height = canvas.offsetHeight || 800);
  let animationFrameId = null;
  let isVisible = true;

  const particleCount = Math.min(Math.floor((width * height) / 28000), 45);
  const particles = [];

  const colors = [
    'rgba(8, 102, 249, ',   // Blue
    'rgba(255, 214, 107, ', // Gold
    'rgba(255, 145, 77, ',  // Sunset Orange
    'rgba(255, 255, 255, ', // White
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseVal = Math.random() * Math.PI;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.pulseVal += this.pulseSpeed;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      const currentAlpha = Math.max(0.1, this.alpha * (0.6 + 0.4 * Math.sin(this.pulseVal)));
      ctx.fillStyle = `${this.colorBase}${currentAlpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const render = () => {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationFrameId = requestAnimationFrame(render);
  };

  const handleResize = () => {
    width = canvas.width = canvas.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.offsetHeight || 800;
  };

  window.addEventListener('resize', handleResize, { passive: true });

  // Pause particle loop when hero is offscreen
  const heroSection = document.querySelector('.hero-section');
  if (heroSection && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          render();
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      });
    });
    heroObserver.observe(heroSection);
  } else {
    render();
  }
}
