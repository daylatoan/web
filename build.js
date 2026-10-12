/**
 * Build script to bundle modular ES scripts into a single standalone js/script.js.
 * This guarantees full compatibility when opening index.html directly via file:// protocol
 * without hitting browser CORS restrictions on ES modules.
 */
const fs = require('fs');
const path = require('path');

const config = fs.readFileSync(path.join(__dirname, 'js/config.js'), 'utf8')
  .replace('export const siteConfig', 'const siteConfig');

const nav = fs.readFileSync(path.join(__dirname, 'js/navigation.js'), 'utf8')
  .replace('export function initNavigation', 'function initNavigation');

const anim = fs.readFileSync(path.join(__dirname, 'js/animations.js'), 'utf8')
  .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, '')
  .replace('export function initAnimations', 'function initAnimations');

const token = fs.readFileSync(path.join(__dirname, 'js/token.js'), 'utf8')
  .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, '')
  .replace('export function initTokenModule', 'function initTokenModule')
  .replace('export function showToast', 'function showToast');

const game = fs.readFileSync(path.join(__dirname, 'js/game.js'), 'utf8')
  .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, '')
  .replace('export function initGameModule', 'function initGameModule');

const main = fs.readFileSync(path.join(__dirname, 'js/main.js'), 'utf8')
  .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, '');

const bundle = `/**
 * GROK SUPER INTELLIGENCE ($GSI) - STANDALONE SCRIPT BUNDLE
 * Designed to work smoothly both locally via file:// and on hosted web servers.
 */
(() => {
"use strict";

${config}

${nav}

${anim}

${token}

${game}

${main}
})();
`;

fs.writeFileSync(path.join(__dirname, 'js/script.js'), bundle, 'utf8');
console.log('Build completed: js/script.js generated successfully (' + bundle.length + ' bytes).');
