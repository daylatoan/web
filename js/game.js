/**
 * ==========================================================================
 * MINI-GAME MODULE — GSI HERO DEFENSE
 * Pure HTML5 Canvas API + Vanilla JavaScript
 * ==========================================================================
 */

import { siteConfig } from './config.js';

export function initGameModule() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // DOM Elements
  const overlayStart = document.getElementById('game-overlay-start');
  const overlayPause = document.getElementById('game-overlay-pause');
  const overlayOver = document.getElementById('game-overlay-gameover');
  
  const btnStart = document.getElementById('btn-game-start');
  const btnResume = document.getElementById('btn-game-resume');
  const btnRestart = document.getElementById('btn-game-restart');
  const btnPauseToggle = document.getElementById('btn-game-pause-toggle');
  const btnSoundToggle = document.getElementById('btn-game-sound-toggle');
  
  const scoreDisplay = document.getElementById('hud-score-val');
  const highScoreDisplay = document.getElementById('hud-highscore-val');
  const finalScoreDisplay = document.getElementById('final-score-val');
  const finalHighScoreDisplay = document.getElementById('final-highscore-val');
  const healthBarFill = document.getElementById('health-bar-fill');

  // Load Hero Avatar Image
  const heroImage = new Image();
  heroImage.src = siteConfig.assets.characterAvatar;

  // Game Dimensions (Logical Canvas Resolution)
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 450;

  // Audio Synthesizer (Web Audio API)
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freqStart, freqEnd, duration, type = 'sine', volume = 0.15) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), now + duration);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio playback failsafe
    }
  }

  const sfx = {
    shoot: () => playTone(880, 220, 0.12, 'sawtooth', 0.12),
    hit: () => playTone(240, 60, 0.2, 'square', 0.2),
    explode: () => playTone(180, 40, 0.35, 'triangle', 0.25),
    start: () => playTone(440, 880, 0.25, 'sine', 0.15),
    gameOver: () => playTone(300, 75, 0.6, 'sawtooth', 0.25),
  };

  // Game States: 'start', 'playing', 'paused', 'gameover'
  let gameState = 'start';
  let score = 0;
  let highScore = parseInt(localStorage.getItem('gsi_hero_high_score') || '0', 10);
  if (highScoreDisplay) highScoreDisplay.textContent = highScore.toString();

  let health = 100;
  const maxHealth = 100;

  let lastTime = 0;
  let animId = null;
  let isSectionInView = true;

  // Inputs
  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false,
    Space: false,
  };

  // Entities
  let player = {
    x: 60,
    y: LOGICAL_HEIGHT / 2 - 25,
    targetX: 60,
    targetY: LOGICAL_HEIGHT / 2 - 25,
    usePointer: false,
    width: 50,
    height: 50,
    speed: 320,
    fireCooldown: 0,
    fireRate: 0.18, // seconds between shots
  };

  let lasers = [];
  let enemies = [];
  let particles = [];
  let stars = [];
  let enemySpawnTimer = 0;
  let enemySpawnInterval = 1.2;

  // Generate background starfield
  for (let i = 0; i < 70; i++) {
    stars.push({
      x: Math.random() * LOGICAL_WIDTH,
      y: Math.random() * LOGICAL_HEIGHT,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 80 + 30,
      alpha: Math.random() * 0.7 + 0.3,
    });
  }

  // Canvas DPI Scaling
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = LOGICAL_WIDTH * dpr;
    canvas.height = LOGICAL_HEIGHT * dpr;

    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // Reset Game
  function resetGame() {
    score = 0;
    health = maxHealth;
    lasers = [];
    enemies = [];
    particles = [];
    enemySpawnTimer = 0;
    enemySpawnInterval = 1.2;

    player.x = 60;
    player.y = LOGICAL_HEIGHT / 2 - 25;
    player.targetX = 60;
    player.targetY = LOGICAL_HEIGHT / 2 - 25;
    player.usePointer = false;
    player.fireCooldown = 0;

    updateHUD();
  }

  function updateHUD() {
    if (scoreDisplay) scoreDisplay.textContent = score.toString();
    if (highScoreDisplay) highScoreDisplay.textContent = highScore.toString();

    if (healthBarFill) {
      const pct = Math.max(0, Math.min(100, (health / maxHealth) * 100));
      healthBarFill.style.width = `${pct}%`;

      if (pct > 50) {
        healthBarFill.className = 'health-bar-fill';
      } else if (pct > 25) {
        healthBarFill.className = 'health-bar-fill warning';
      } else {
        healthBarFill.className = 'health-bar-fill danger';
      }
    }
  }

  // Switch Game States
  function setGameState(newState) {
    gameState = newState;

    overlayStart?.classList.toggle('hidden', gameState !== 'start');
    overlayPause?.classList.toggle('hidden', gameState !== 'paused');
    overlayOver?.classList.toggle('hidden', gameState !== 'gameover');

    if (gameState === 'gameover') {
      sfx.gameOver();
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('gsi_hero_high_score', highScore.toString());
      }
      if (finalScoreDisplay) finalScoreDisplay.textContent = score.toString();
      if (finalHighScoreDisplay) finalHighScoreDisplay.textContent = highScore.toString();
      if (highScoreDisplay) highScoreDisplay.textContent = highScore.toString();
    } else if (gameState === 'playing') {
      initAudio();
      lastTime = performance.now();
    }
  }

  // Spawn Enemy
  function spawnEnemy() {
    const types = [
      { name: 'drone', width: 34, height: 34, speed: 170, hp: 1, color: '#F51E32', score: 10 },
      { name: 'asteroid', width: 44, height: 44, speed: 120, hp: 2, color: '#FF914D', score: 25 },
      { name: 'anomaly', width: 28, height: 28, speed: 230, hp: 1, color: '#A855F7', score: 20 },
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const y = Math.random() * (LOGICAL_HEIGHT - type.height - 40) + 20;

    enemies.push({
      x: LOGICAL_WIDTH + 20,
      y,
      width: type.width,
      height: type.height,
      speed: type.speed + Math.min(score * 0.4, 160),
      hp: type.hp,
      maxHp: type.hp,
      color: type.color,
      scoreVal: type.score,
    });
  }

  // Spawn Explosion Particles
  function createExplosion(x, y, color = '#FFD66B', count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 40;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color,
        alpha: 1,
        life: Math.random() * 0.4 + 0.3,
        maxLife: 0.5,
      });
    }
  }

  // Game Loop Update
  function update(dt) {
    if (gameState !== 'playing') return;

    // 1. Player Movement (Keyboard & Mouse/Touch pointer steering)
    let moveX = 0;
    let moveY = 0;

    if (keys.ArrowUp || keys.w) moveY -= 1;
    if (keys.ArrowDown || keys.s) moveY += 1;
    if (keys.ArrowLeft || keys.a) moveX -= 1;
    if (keys.ArrowRight || keys.d) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      player.usePointer = false;
      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }
      player.x += moveX * player.speed * dt;
      player.y += moveY * player.speed * dt;
    } else if (player.usePointer) {
      player.x += (player.targetX - player.x) * Math.min(1, dt * 10);
      player.y += (player.targetY - player.y) * Math.min(1, dt * 10);
    }

    // Boundaries
    player.x = Math.max(10, Math.min(LOGICAL_WIDTH - player.width - 10, player.x));
    player.y = Math.max(10, Math.min(LOGICAL_HEIGHT - player.height - 10, player.y));

    // Player Shooting
    player.fireCooldown -= dt;
    if (keys.Space && player.fireCooldown <= 0) {
      fireLaser();
      player.fireCooldown = player.fireRate;
    }

    // 2. Stars scrolling
    stars.forEach((star) => {
      star.x -= star.speed * dt;
      if (star.x < 0) {
        star.x = LOGICAL_WIDTH;
        star.y = Math.random() * LOGICAL_HEIGHT;
      }
    });

    // 3. Lasers update
    for (let i = lasers.length - 1; i >= 0; i--) {
      const laser = lasers[i];
      laser.x += laser.speed * dt;

      if (laser.x > LOGICAL_WIDTH + 20) {
        lasers.splice(i, 1);
      }
    }

    // 4. Enemy Spawning
    enemySpawnTimer += dt;
    if (enemySpawnTimer >= enemySpawnInterval) {
      enemySpawnTimer = 0;
      spawnEnemy();
      // Increase difficulty
      enemySpawnInterval = Math.max(0.45, 1.2 - (score / 400) * 0.2);
    }

    // 5. Enemies update & collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.x -= enemy.speed * dt;

      // Laser vs Enemy
      for (let j = lasers.length - 1; j >= 0; j--) {
        const laser = lasers[j];
        if (
          laser.x < enemy.x + enemy.width &&
          laser.x + laser.width > enemy.x &&
          laser.y < enemy.y + enemy.height &&
          laser.y + laser.height > enemy.y
        ) {
          // Hit
          lasers.splice(j, 1);
          enemy.hp -= 1;
          createExplosion(laser.x, laser.y, '#FFD66B', 6);

          if (enemy.hp <= 0) {
            score += enemy.scoreVal;
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 18);
            sfx.explode();
            enemies.splice(i, 1);
            updateHUD();
            break;
          } else {
            sfx.hit();
          }
        }
      }

      // Enemy vs Player collision
      if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
      ) {
        // Player hit
        health -= 25;
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#F51E32', 20);
        enemies.splice(i, 1);
        sfx.hit();
        updateHUD();

        if (health <= 0) {
          health = 0;
          updateHUD();
          setGameState('gameover');
          return;
        }
        continue;
      }

      // Despawn off-screen
      if (enemy.x < -enemy.width - 20) {
        enemies.splice(i, 1);
      }
    }

    // 6. Particles update
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function fireLaser() {
    sfx.shoot();
    lasers.push({
      x: player.x + player.width - 4,
      y: player.y + player.height / 2 - 3,
      width: 18,
      height: 6,
      speed: 680,
    });
  }

  // Render Frame
  function render() {
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // 1. Draw Starfield
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      ctx.globalAlpha = s.alpha;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;

    // 2. Draw Lasers (Electric Blue Cosmic Energy)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0866F9';
    ctx.fillStyle = '#2A82FF';
    for (let i = 0; i < lasers.length; i++) {
      const l = lasers[i];
      ctx.fillRect(l.x, l.y, l.width, l.height);
      // Bright white core
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(l.x + 3, l.y + 1, l.width - 6, l.height - 2);
      ctx.fillStyle = '#2A82FF';
    }
    ctx.shadowBlur = 0;

    // 3. Draw Enemies
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      ctx.save();
      ctx.translate(e.x + e.width / 2, e.y + e.height / 2);

      ctx.shadowBlur = 12;
      ctx.shadowColor = e.color;

      ctx.fillStyle = e.color;
      ctx.beginPath();
      // Draw diamond / drone tech shape
      ctx.moveTo(0, -e.height / 2);
      ctx.lineTo(e.width / 2, 0);
      ctx.lineTo(0, e.height / 2);
      ctx.lineTo(-e.width / 2, 0);
      ctx.closePath();
      ctx.fill();

      // Inner glowing core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, e.width / 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 4. Draw Particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 5. Draw Player (GSI Superhero in round emblem)
    ctx.save();
    ctx.translate(player.x, player.y);

    // Cape Glow & Shield Aura
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#0866F9';

    ctx.beginPath();
    ctx.arc(player.width / 2, player.height / 2, player.width / 2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 102, 249, 0.35)';
    ctx.fill();

    // Red Cape trailing behind
    ctx.fillStyle = '#F51E32';
    ctx.beginPath();
    ctx.moveTo(player.width * 0.2, player.height * 0.4);
    ctx.lineTo(-12, player.height * 0.3);
    ctx.lineTo(-16, player.height * 0.7);
    ctx.lineTo(player.width * 0.2, player.height * 0.6);
    ctx.closePath();
    ctx.fill();

    // Clip circular hero avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(player.width / 2, player.height / 2, player.width / 2, 0, Math.PI * 2);
    ctx.clip();

    if (heroImage.complete && heroImage.naturalWidth > 0) {
      ctx.drawImage(heroImage, 0, 0, player.width, player.height);
    } else {
      // Fallback geometric hero if image loading
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, player.width, player.height);
      ctx.fillStyle = '#0866F9';
      ctx.fillRect(0, player.height * 0.5, player.width, player.height * 0.5);
    }
    ctx.restore();

    // Gold superhero rim border
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFD66B';
    ctx.beginPath();
    ctx.arc(player.width / 2, player.height / 2, player.width / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Game Loop
  function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (gameState === 'playing' && isSectionInView) {
      update(dt);
      render();
    }

    animId = requestAnimationFrame(gameLoop);
  }

  animId = requestAnimationFrame(gameLoop);

  // Pause loop when section is outside viewport
  const gameSection = document.querySelector('.game-section');
  if (gameSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isSectionInView = entry.isIntersecting;
      });
    });
    observer.observe(gameSection);
  }

  // Keyboard Event Handlers (Supports QWERTY & Vietnamese Telex/VNI IME)
  const handleKeyChange = (e, isPressed) => {
    const code = e.code;
    const key = e.key;

    if (code === 'KeyW' || key === 'w' || key === 'W' || key === 'ư' || key === 'Ư') {
      keys.w = isPressed;
    }
    if (code === 'KeyS' || key === 's' || key === 'S') {
      keys.s = isPressed;
    }
    if (code === 'KeyA' || key === 'a' || key === 'A') {
      keys.a = isPressed;
    }
    if (code === 'KeyD' || key === 'd' || key === 'D' || key === 'đ' || key === 'Đ') {
      keys.d = isPressed;
    }
    if (code === 'ArrowUp' || key === 'ArrowUp') {
      keys.ArrowUp = isPressed;
    }
    if (code === 'ArrowDown' || key === 'ArrowDown') {
      keys.ArrowDown = isPressed;
    }
    if (code === 'ArrowLeft' || key === 'ArrowLeft') {
      keys.ArrowLeft = isPressed;
    }
    if (code === 'ArrowRight' || key === 'ArrowRight') {
      keys.ArrowRight = isPressed;
    }
    if (code === 'Space' || key === ' ') {
      keys.Space = isPressed;
    }
  };

  window.addEventListener('keydown', (e) => {
    // Only capture game keys if playing
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) || e.code === 'Space') {
      if (gameState === 'playing') {
        e.preventDefault();
      }
    }

    handleKeyChange(e, true);

    if (e.code === 'Space' || e.key === ' ') {
      if (gameState === 'start' || gameState === 'gameover') {
        startGame();
      }
    }
    if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
      togglePause();
    }
  });

  window.addEventListener('keyup', (e) => {
    handleKeyChange(e, false);
  });

  // Canvas Mouse & Pointer Controls (drag/move hero & auto-fire)
  function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('pointermove', (e) => {
    if (gameState === 'playing') {
      const pos = getCanvasCoords(e.clientX, e.clientY);
      player.targetX = pos.x - player.width / 2;
      player.targetY = pos.y - player.height / 2;
      player.usePointer = true;
    }
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (gameState === 'playing') {
      const pos = getCanvasCoords(e.clientX, e.clientY);
      player.targetX = pos.x - player.width / 2;
      player.targetY = pos.y - player.height / 2;
      player.usePointer = true;
      keys.Space = true;
    } else if (gameState === 'start' || gameState === 'gameover') {
      startGame();
    }
  });

  canvas.addEventListener('pointerup', () => {
    keys.Space = false;
  });

  canvas.addEventListener('pointerleave', () => {
    keys.Space = false;
  });

  function startGame() {
    isSectionInView = true;
    initAudio();
    resetGame();
    sfx.start();
    setGameState('playing');
  }

  function togglePause() {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }

  // Button Listeners
  btnStart?.addEventListener('click', startGame);
  btnResume?.addEventListener('click', () => setGameState('playing'));
  btnRestart?.addEventListener('click', startGame);

  btnPauseToggle?.addEventListener('click', () => {
    if (gameState === 'playing' || gameState === 'paused') {
      togglePause();
    }
  });

  // Sound Toggle
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      btnSoundToggle.innerHTML = soundEnabled
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
    });
  }

  // Mobile Virtual Touch Controls
  setupTouchButton('dpad-btn-up', () => { keys.ArrowUp = true; }, () => { keys.ArrowUp = false; });
  setupTouchButton('dpad-btn-down', () => { keys.ArrowDown = true; }, () => { keys.ArrowDown = false; });
  setupTouchButton('dpad-btn-left', () => { keys.ArrowLeft = true; }, () => { keys.ArrowLeft = false; });
  setupTouchButton('dpad-btn-right', () => { keys.ArrowRight = true; }, () => { keys.ArrowRight = false; });
  
  setupTouchButton('touch-btn-fire', () => {
    keys.Space = true;
    if (gameState === 'start' || gameState === 'gameover') {
      startGame();
    }
  }, () => {
    keys.Space = false;
  });
}

function setupTouchButton(elementId, onPress, onRelease) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const handleStart = (e) => {
    e.preventDefault();
    el.classList.add('active');
    onPress();
  };

  const handleEnd = (e) => {
    e.preventDefault();
    el.classList.remove('active');
    onRelease();
  };

  el.addEventListener('touchstart', handleStart, { passive: false });
  el.addEventListener('touchend', handleEnd, { passive: false });
  el.addEventListener('touchcancel', handleEnd, { passive: false });

  // Mouse fallbacks for testing in responsive mode
  el.addEventListener('mousedown', handleStart);
  el.addEventListener('mouseup', handleEnd);
  el.addEventListener('mouseleave', handleEnd);
}
