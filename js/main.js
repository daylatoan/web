/**
 * ==========================================================================
 * MAIN ENTRY POINT — GROK SUPER INTELLIGENCE ($GSI)
 * ES Modules initialization
 * ==========================================================================
 */

import { siteConfig } from './config.js';
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initTokenModule } from './token.js';
import { initGameModule } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation & Header
  initNavigation();

  // 2. Animations & Scroll Observers
  initAnimations();

  // 3. Token Facts & Contract Box
  initTokenModule();

  // 5. Mini-game Arcade (if enabled)
  if (siteConfig.features.enableGame) {
    initGameModule();
  }

  // 6. Dynamic Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
});
