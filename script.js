/**
 * MillionHood ($MILLIONHOOD)
 * Client-side interactions: scroll nav, intersection observer reveals,
 * CA copy to clipboard, and live Meme Maker canvas rendering/download.
 */
(function() {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;

  // 0. Intro curtain, then hero entrance
  var intro = document.getElementById('intro');
  function ready() { root.classList.add('ready'); }
  if (intro && !root.classList.contains('no-intro')) {
    try { sessionStorage.setItem('mh-intro', '1'); } catch (e) {}
    var lift = function() {
      intro.classList.add('out');
      setTimeout(ready, 250);
      setTimeout(function() { intro.remove(); }, 900);
    };
    // Wait for the hero badge (max ~1.6s) so the curtain opens onto a finished page
    var start = Date.now();
    var hero = document.querySelector('.hero-art .cat');
    var go = function() { setTimeout(lift, Math.max(0, 1100 - (Date.now() - start))); };
    if (!hero || hero.complete) go();
    else {
      hero.addEventListener('load', go, { once: true });
      hero.addEventListener('error', go, { once: true });
      setTimeout(go, 1600);
    }
  } else {
    if (intro) intro.remove();
    requestAnimationFrame(ready);
  }

  // 1. Scroll-driven bits: nav state, progress bar, banner parallax, ticker
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress-bar');
  var banner = document.querySelector('.block-banner');
  var bannerImg = banner && banner.querySelector('img');
  var ticker = document.getElementById('ticker');
  var lastY = window.scrollY, velocity = 0, tickX = 0, ticking = false;

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  function update() {
    ticking = false;
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty('--sp', max > 0 ? Math.min(1, y / max) : 0);
    if (bannerImg && !reduce) {
      var r = banner.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        // -1 (entering from below) .. 1 (leaving at the top)
        var t = (window.innerHeight / 2 - (r.top + r.height / 2)) / (window.innerHeight / 2 + r.height / 2);
        bannerImg.style.setProperty('--bp', (t * r.height * 0.06).toFixed(1) + 'px');
      }
    }
    velocity += (y - lastY) * 0.15;
    lastY = y;
  }
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // Ticker: constant drift, pushed faster (and reversed) by scroll speed
  if (ticker && !reduce) {
    var dir = 1;
    ticker.innerHTML += ticker.innerHTML; // two copies for a seamless loop
    (function loop() {
      if (Math.abs(velocity) > 0.5) dir = velocity > 0 ? 1 : -1;
      tickX -= (0.6 * dir + velocity);
      velocity *= 0.9;
      var half = ticker.scrollWidth / 2;
      if (half) {
        if (tickX <= -half) tickX += half;
        if (tickX > 0) tickX -= half;
      }
      ticker.style.transform = 'translate3d(' + tickX + 'px,0,0)';
      requestAnimationFrame(loop);
    })();
  }

  // Active section pill in the nav
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var list = document.querySelector('.nav-links');
  if (list && links.length && 'IntersectionObserver' in window) {
    var pill = document.createElement('li');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    list.appendChild(pill);
    var current = null;
    var movePill = function(a) {
      links.forEach(function(l) { l.classList.toggle('active', l === a); });
      if (a) a.setAttribute('aria-current', 'true');
      links.forEach(function(l) { if (l !== a) l.removeAttribute('aria-current'); });
      if (!a) { pill.classList.remove('on'); return; }
      pill.style.setProperty('--pl', a.offsetLeft + 'px');
      pill.style.setProperty('--pw', a.offsetWidth + 'px');
      pill.classList.add('on');
    };
    var spy = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) current = e.target.id;
        else if (current === e.target.id) current = null;
      });
      movePill(links.filter(function(l) { return l.getAttribute('href') === '#' + current; })[0] || null);
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function(l) {
      var sec = document.querySelector(l.getAttribute('href'));
      if (sec) spy.observe(sec);
    });
    window.addEventListener('resize', function() {
      movePill(list.querySelector('a.active'));
    });
  }

  // 2. Reveal animations on scroll
  // Gallery cards reveal in a staggered wave, row by row
  document.querySelectorAll('.gallery > *').forEach(function(el, i) {
    el.setAttribute('data-reveal', '');
    el.style.setProperty('--rd', (i % 4) * 90 + 'ms');
  });
  if (banner) banner.setAttribute('data-reveal', '');
  var items = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function(el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function(el) { io.observe(el); });

    // Printing or saving the page should never leave hidden blocks behind
    window.addEventListener('beforeprint', function() {
      items.forEach(function(el) { el.classList.add('in'); });
    });
  }

  // 2b. Count-up for the supply number
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var fmt = function(n) { return Math.round(n).toLocaleString('en-US'); };
    var cio = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, end = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1600;
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur);
          el.textContent = fmt(end * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function(el) { el.textContent = '0'; cio.observe(el); });
  }

  // 2c. Pointer effects (desktop only): hero parallax, card tilt, magnetic buttons
  if (fine && !reduce) {
    var heroEl = document.querySelector('.hero');
    var art = document.querySelector('.hero-art-inner');
    if (heroEl && art) {
      heroEl.addEventListener('pointermove', function(e) {
        var r = heroEl.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        art.style.setProperty('--px', (x * -28).toFixed(1) + 'px');
        art.style.setProperty('--py', (y * -20).toFixed(1) + 'px');
      });
      heroEl.addEventListener('pointerleave', function() {
        art.style.setProperty('--px', '0px');
        art.style.setProperty('--py', '0px');
      });
    }

    document.querySelectorAll('.member').forEach(function(card) {
      card.addEventListener('pointermove', function(e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.classList.add('tilting');
        card.style.transform = 'perspective(900px) translateY(-6px) rotateX(' + ((0.5 - y) * 8).toFixed(2) +
          'deg) rotateY(' + ((x - 0.5) * 10).toFixed(2) + 'deg)';
        card.style.setProperty('--gx', (x * 100) + '%');
        card.style.setProperty('--gy', (y * 100) + '%');
      });
      card.addEventListener('pointerleave', function() {
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });

    document.querySelectorAll('.btn').forEach(function(b) {
      b.addEventListener('pointermove', function(e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function() {
        b.style.setProperty('--mx', '0px');
        b.style.setProperty('--my', '0px');
      });
    });
  }

  // 3. Contract address copy
  var btn = document.getElementById('copy-ca');
  var ca = document.getElementById('ca');
  var flash = document.getElementById('ca-flash');

  if (btn && ca) {
    btn.addEventListener('click', function() {
      var text = ca.textContent.trim();

      function done() {
        if (flash) flash.textContent = 'Copied. Now check it the way he would: slowly, without blinking.';
        btn.textContent = 'Copied!';
        setTimeout(function() {
          btn.textContent = 'Copy address';
          if (flash) flash.textContent = '';
        }, 2600);
      }

      function fallback() {
        var r = document.createRange();
        r.selectNodeContents(ca);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        try {
          document.execCommand('copy');
        } catch (e) {}
        done();
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  // 4. "Make One" Meme Maker
  var input = document.getElementById('line');
  var cap = document.getElementById('cap');
  var img = document.getElementById('make-img');
  var dl = document.getElementById('dl');
  var note = document.getElementById('make-note');
  var chips = document.querySelectorAll('.chip');

  // Base canvas configuration (matches base.jpg headroom)
  var W = 1000, H = 1000;
  var BOX = { x: 50, y: 40, w: 900, h: 280 };
  var FAMILY = '"Bricolage Grotesque", -apple-system, sans-serif';
  var measureCanvas = document.createElement('canvas');
  var measureCtx = measureCanvas.getContext('2d');

  function setFont(ctx, px) {
    ctx.font = '800 ' + px + 'px ' + FAMILY;
    if ('fontStretch' in ctx) ctx.fontStretch = 'condensed';
  }

  function layout(text) {
    text = (text || '').trim() || 'WE WERE NEVER HERE';
    text = text.toUpperCase();
    var words = text.split(/\s+/);

    for (var size = 110; size >= 36; size -= 4) {
      setFont(measureCtx, size);
      var lines = [], cur = '';
      for (var i = 0; i < words.length; i++) {
        var testLine = cur ? cur + ' ' + words[i] : words[i];
        if (measureCtx.measureText(testLine).width <= BOX.w || !cur) {
          cur = testLine;
        } else {
          lines.push(cur);
          cur = words[i];
        }
      }
      if (cur) lines.push(cur);

      var widest = 0;
      for (var j = 0; j < lines.length; j++) {
        var w = measureCtx.measureText(lines[j]).width;
        if (w > widest) widest = w;
      }

      if (lines.length <= 3 && lines.length * size * 1.0 <= BOX.h && widest <= BOX.w) {
        return { size: size, lines: lines };
      }
    }
    return { size: 36, lines: lines };
  }

  function render() {
    if (!input || !cap) return;
    var text = input.value.trim() || 'WE WERE NEVER HERE';
    var l = layout(text);
    cap.textContent = '';
    l.lines.forEach(function(line) {
      var s = document.createElement('span');
      s.textContent = line;
      cap.appendChild(s);
    });
    cap.style.fontSize = (l.size / W * 100) + 'cqw';
    cap.classList.remove('pop');
    void cap.offsetWidth; // restart the pop animation
    cap.classList.add('pop');

    chips.forEach(function(c) {
      var matches = c.textContent.trim().toLowerCase() === input.value.trim().toLowerCase();
      c.setAttribute('aria-pressed', String(matches));
    });
  }

  if (input) {
    input.addEventListener('input', render);
    chips.forEach(function(c) {
      c.addEventListener('click', function() {
        input.value = c.textContent.trim();
        render();
      });
    });

    if (document.fonts && document.fonts.load) {
      document.fonts.load('800 100px "Bricolage Grotesque"').then(render, render);
    } else {
      setTimeout(render, 300);
    }
  }

  if (dl && img) {
    dl.addEventListener('click', function() {
      var c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      var ctx = c.getContext('2d');

      function drawMeme() {
        try {
          ctx.drawImage(img, 0, 0, W, H);
          var text = (input ? input.value : '') || 'WE WERE NEVER HERE';
          var l = layout(text);
          setFont(ctx, l.size);

          var inkColor = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#141116';
          ctx.fillStyle = inkColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          var lh = l.size * 1.05;
          var totalTextHeight = l.lines.length * lh;
          var top = BOX.y + (BOX.h - totalTextHeight) / 2 + lh / 2;

          l.lines.forEach(function(line, idx) {
            ctx.fillText(line, W / 2, top + idx * lh);
          });

          c.toBlob(function(blob) {
            if (!blob) {
              if (note) note.textContent = 'Could not generate picture. Try again.';
              return;
            }
            var a = document.createElement('a');
            var slug = (input ? input.value : '').trim().toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .slice(0, 36) || 'hoods-up';
            a.href = URL.createObjectURL(blob);
            a.download = 'millionhood-' + slug + '.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(function() { URL.revokeObjectURL(a.href); }, 4000);
            if (note) note.textContent = 'Saved! They did not say that, for the record.';
          }, 'image/png');
        } catch (err) {
          console.error(err);
          if (note) note.textContent = 'Download ready. If blocked, right click the preview to save.';
        }
      }

      if (img.complete && img.naturalWidth !== 0) {
        drawMeme();
      } else {
        img.onload = drawMeme;
      }
    });
  }

})();
