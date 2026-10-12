/**
 * ==========================================================================
 * FAQ ACCORDION MODULE — GROK SUPER INTELLIGENCE ($GSI)
 * ==========================================================================
 */

export function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach((item, index) => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content-collapse');

    if (!trigger || !content) return;

    // Accessibility ARIA attributes
    const contentId = `faq-content-${index + 1}`;
    content.setAttribute('id', contentId);
    trigger.setAttribute('aria-controls', contentId);
    trigger.setAttribute('aria-expanded', 'false');

    const toggleItem = (open) => {
      const willOpen = open !== undefined ? open : !item.classList.contains('is-open');

      if (willOpen) {
        // Close other items for neat accordion behavior
        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            const otherTrigger = other.querySelector('.faq-trigger');
            const otherContent = other.querySelector('.faq-content-collapse');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            if (otherContent) otherContent.style.maxHeight = '0px';
          }
        });

        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = `${content.scrollHeight + 20}px`;
      } else {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0px';
      }
    };

    trigger.addEventListener('click', () => toggleItem());

    // Keyboard navigation (Enter / Space)
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleItem();
      }
    });
  });

  // Re-adjust max-height on window resize if open
  window.addEventListener('resize', () => {
    faqItems.forEach((item) => {
      if (item.classList.contains('is-open')) {
        const content = item.querySelector('.faq-content-collapse');
        if (content) {
          content.style.maxHeight = `${content.scrollHeight + 20}px`;
        }
      }
    });
  }, { passive: true });
}
