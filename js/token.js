/**
 * ==========================================================================
 * TOKEN & CONTRACT MODULE — GROK SUPER INTELLIGENCE ($GSI)
 * ==========================================================================
 */

import { siteConfig } from './config.js';

export function initTokenModule() {
  const { token, social } = siteConfig;

  // 1. Populate Token Facts in the UI
  const setElementText = (id, text, fallback = 'To Be Announced') => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text || fallback;
    }
  };

  setElementText('token-name-val', token.name);
  setElementText('token-symbol-val', token.symbol);
  setElementText('token-network-val', token.network);

  // Setup Contract Boxes (Hero & Token Sections)
  const setupContractBox = (textElId, copyBtnId) => {
    const contractTextEl = document.getElementById(textElId);
    const copyBtn = document.getElementById(copyBtnId);

    if (contractTextEl) {
      if (token.contractAddress) {
        contractTextEl.textContent = token.contractAddress;
      } else {
        contractTextEl.textContent = 'Contract address coming soon';
        contractTextEl.style.fontStyle = 'italic';
        contractTextEl.style.opacity = '0.7';
      }
    }

    if (copyBtn) {
      if (!token.contractAddress) {
        copyBtn.setAttribute('disabled', 'true');
        copyBtn.setAttribute('aria-disabled', 'true');
        copyBtn.classList.add('btn-disabled');
        copyBtn.title = 'Contract address is not yet deployed';
      } else {
        copyBtn.addEventListener('click', async () => {
          try {
            if (navigator.clipboard && window.isSecureContext) {
              await navigator.clipboard.writeText(token.contractAddress);
            } else {
              // Fallback for non-HTTPS local environments
              const textArea = document.createElement('textarea');
              textArea.value = token.contractAddress;
              textArea.style.position = 'fixed';
              textArea.style.left = '-9999px';
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
            }

            showToast('Contract address copied to clipboard!');

            const origContent = copyBtn.innerHTML;
            copyBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>COPIED!</span>
            `;
            copyBtn.style.borderColor = 'var(--color-success)';

            setTimeout(() => {
              copyBtn.innerHTML = origContent;
              copyBtn.style.borderColor = '';
            }, 2000);
          } catch (err) {
            console.error('Failed to copy contract:', err);
            showToast('Unable to copy contract address');
          }
        });
      }
    }
  };

  setupContractBox('contract-address-val', 'btn-copy-contract');
  setupContractBox('hero-contract-address-val', 'btn-copy-contract-hero');

  // 2. Configure Action Buttons (Swap, Chart, Explorer)
  setupActionButton('btn-buy-hero', token.swapUrl, 'Uniswap v4 portal coming soon');
  setupActionButton('btn-buy-token', token.swapUrl, 'Uniswap v4 portal coming soon');
  setupActionButton('btn-buy-final', token.swapUrl, 'Uniswap v4 portal coming soon');
  
  setupActionButton('btn-chart-hero', token.chartUrl, 'Chart coming soon');
  setupActionButton('btn-chart-token', token.chartUrl, 'Chart coming soon');
  setupActionButton('btn-verify-contract', token.explorerUrl, 'Robinhood Chain Explorer coming soon');

  // Configure Social links
  setupActionButton('social-btn-twitter', social.twitterUrl, 'Twitter channel coming soon');
  setupActionButton('social-btn-telegram', social.telegramUrl, 'Telegram channel coming soon');
  setupActionButton('social-btn-telegram-hero', social.telegramUrl, 'Telegram channel coming soon');
  setupActionButton('social-btn-explorer', token.explorerUrl, 'Robinhood Chain Explorer coming soon');
}

function setupActionButton(elementId, url, comingSoonMessage) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (url) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    el.removeAttribute('aria-disabled');
    el.classList.remove('btn-disabled');
  } else {
    el.href = '#';
    el.setAttribute('aria-disabled', 'true');
    el.classList.add('btn-disabled');
    el.title = comingSoonMessage;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(comingSoonMessage);
    });
  }
}

/**
 * Toast Notification Utility
 */
export function showToast(message) {
  let existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-golden-yellow)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}
