/**
 * ==========================================================================
 * NAVIGATION MODULE — GROK SUPER INTELLIGENCE ($GSI)
 * ==========================================================================
 */

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (!header) return;

  // 1. Sticky Header scroll state
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // 2. Mobile Menu Toggle
  const toggleMobileMenu = (open) => {
    const isOpen = open !== undefined ? open : !mobileDrawer?.classList.contains('is-open');
    if (!mobileDrawer || !hamburgerBtn) return;

    if (isOpen) {
      mobileDrawer.classList.add('is-open');
      hamburgerBtn.classList.add('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    } else {
      mobileDrawer.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  };

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close mobile drawer on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('is-open')) {
      toggleMobileMenu(false);
    }
  });

  // Close mobile drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (
      mobileDrawer?.classList.contains('is-open') &&
      !mobileDrawer.contains(e.target) &&
      !hamburgerBtn?.contains(e.target)
    ) {
      toggleMobileMenu(false);
    }
  });

  // 3. Smooth Scroll Navigation with offset
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;

      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        e.preventDefault();
        toggleMobileMenu(false); // Close mobile drawer if open

        const headerHeight = header.offsetHeight || 76;
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // 4. Active Section Spy (IntersectionObserver)
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
              link.classList.add('is-active');
            } else {
              link.classList.remove('is-active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }
}
