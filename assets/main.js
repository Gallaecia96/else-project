/* else — About page interactions (standalone export of the canvas wireframe).
   Plain JS, no dependencies. Each block is independent. */
(function () {
  'use strict';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- typed text helper ---------- */
  function Typer(el) {
    this.el = el;
    this.text = el.getAttribute('data-text') || '';
    this.speed = parseInt(el.getAttribute('data-speed'), 10) || 40;
    this.last = el.hasAttribute('data-last');
    this.shown = el.querySelector('.tw-shown');
    this.rest = el.querySelector('.tw-rest');
    this.caret = el.querySelector('.tw-caret');
    this.n = -1;
  }
  Typer.prototype.set = function (n, caretOn) {
    n = Math.max(0, Math.min(this.text.length, n));
    if (n !== this.n) {
      this.shown.textContent = this.text.slice(0, n);
      this.rest.textContent = this.text.slice(n);
      this.n = n;
    }
    this.caret.classList.toggle('is-on', !!caretOn);
  };
  Typer.prototype.done = function () { return this.n >= this.text.length; };

  /* ---------- header: solid after 60px, scroll badge fades on first scroll ---------- */
  var header = $('#siteHeader');
  var badge = $('#scrollBadge');
  var water = $('#heroWater');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle('is-solid', y > 60);
    if (badge) badge.style.opacity = y > 8 ? '0' : '1';
    if (water && !reduce) {
      var cap = (window.innerHeight || 900) * 1.5;
      var base = window.innerWidth < 700 ? 72 : 110;
      // the sea rises faster than the page scrolls, so it swallows the hero
      water.style.height = Math.round(base + Math.min(y, cap) * 1.25) + 'px';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- menu overlay ---------- */
  var menuBtn = $('#menuBtn');
  var menuWrap = $('#menuWrap');
  var lastFocus = null;
  function openMenu() {
    if (!menuWrap) return;
    lastFocus = document.activeElement;
    menuWrap.hidden = false;
    document.body.classList.add('menu-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    var first = menuWrap.querySelector('button, a');
    if (first) first.focus();
  }
  function closeMenu() {
    if (!menuWrap || menuWrap.hidden) return;
    menuWrap.hidden = true;
    document.body.classList.remove('menu-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  $$('[data-close-menu]').forEach(function (el) { el.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (!menuWrap || menuWrap.hidden) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key === 'Tab') { // keep focus inside the menu
      var f = $$('a, button', menuWrap);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- founder: read the full conversation ---------- */
  var fullBtn = $('#fullBtn'), fullWrap = $('#fullWrap'), fullLabel = $('#fullLabel'), fullChev = $('#fullChev');
  if (fullBtn && fullWrap) {
    fullBtn.setAttribute('aria-controls', 'fullWrap');
    fullBtn.addEventListener('click', function () {
      var open = fullWrap.hidden;
      fullWrap.hidden = !open;
      fullBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (fullLabel) fullLabel.textContent = open ? 'HIDE THE FULL CONVERSATION' : 'READ THE FULL CONVERSATION';
      if (fullChev) fullChev.style.transform = 'rotate(' + (open ? 180 : 0) + 'deg)';
    });
  }

  /* ---------- chapter 01: scroll-driven sequence ---------- */
  var ws = $('#whyStory');
  if (ws) {
    var STEP = 520, PIN = 110;
    var track = $('.ws-track', ws);
    var steps = $$('.ws-step', ws);
    var dots = $$('.ws-dot', ws);
    var hint = $('.ws-hint', ws);
    var c = new Typer($('.ws-step[data-step="1"] .tw', ws));
    var concl = $$('.ws-step[data-step="3"] .tw', ws).map(function (el) { return new Typer(el); });
    // start times for the three conclusion sentences: one after another with a short pause
    var t = 300;
    concl.forEach(function (ty) { ty.start = t; t += ty.text.length * ty.speed + 450; });
    c.start = 300;

    if (reduce) {
      ws.classList.add('ws-static');
      c.set(c.text.length, false);
      concl.forEach(function (ty) { ty.set(ty.text.length, false); });
    } else {
      track.style.height = (560 + 4 * STEP) + 'px';
      var stage = -1, startAt = 0, seen = {};
      var measure = function () {
        var r = track.getBoundingClientRect();
        var vh = window.innerHeight || 900;
        var s = -1;
        if (r.top < vh * 0.7) s = Math.max(0, Math.min(3, Math.floor((PIN - r.top) / STEP)));
        if (s !== stage) {
          stage = s;
          startAt = performance.now();
          if (s >= 0) {
            if (seen[s]) startAt -= 600000; // already read: show it complete
            seen[s] = true;
          }
          steps.forEach(function (el, i) {
            el.classList.toggle('is-on', i === s);
            el.classList.toggle('is-past', i < s);
          });
          dots.forEach(function (d, i) { d.classList.toggle('is-on', i === s); });
        }
      };
      var frame = function (now) {
        measure();
        var el = now - startAt;
        var blink = Math.floor(now / 500) % 2 === 1;
        var s = stage;
        $$('.ws-reveal', ws).forEach(function (line) {
          var k = parseInt(line.parentNode.getAttribute('data-step'), 10);
          var at = parseInt(line.getAttribute('data-at'), 10) || 0;
          line.classList.toggle('is-on', s > k || (s === k && el >= at));
        });
        var typeStep = function (ty, k) {
          var n = s > k ? ty.text.length : (s === k ? Math.floor((el - ty.start) / ty.speed) : 0);
          var nn = Math.max(0, Math.min(ty.text.length, n));
          var typing = s === k && el >= ty.start && nn < ty.text.length;
          ty.set(nn, typing || (s === k && ty.last && nn >= ty.text.length && blink));
        };
        typeStep(c, 1);
        concl.forEach(function (ty) { typeStep(ty, 3); });
        var stepDone = (s === 0 && el > 1800) || (s === 1 && c.done()) || (s === 2 && el > 2600);
        if (hint) hint.classList.toggle('is-on', stepDone);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }

  /* ---------- closing line: types itself out once in view, then holds ---------- */
  var closing = $('.closing-tw .tw');
  if (closing) {
    var ct = new Typer(closing);
    if (reduce || !('IntersectionObserver' in window)) { ct.set(ct.text.length, false); }
    else {
      ct.set(0, false);
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var t0 = performance.now();
        var step = function (now) {
          var n = Math.floor((now - t0) / ct.speed);
          var blink = Math.floor(now / 500) % 2 === 0;
          ct.set(n, ct.done() ? blink : true);
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      io.observe(closing);
    }
  }

  /* ---------- cursor ring (desktop pointer only) ---------- */
  var ring = $('#cursorRing');
  var fine = false;
  try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
  if (ring && fine && !reduce) {
    var tx = -200, ty = -200, cx = -200, cy = -200, cs = 1, hot = false, on = false;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      var tgt = e.target;
      hot = !!(tgt && tgt.closest && tgt.closest('a, button, input, label, select, textarea, summary'));
      if (!on) { cx = tx; cy = ty; on = true; ring.classList.add('is-on'); }
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) { on = false; ring.classList.remove('is-on'); } });
    var tick = function () {
      cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15; cs += ((hot ? 1.4 : 1) - cs) * 0.2;
      ring.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) scale(' + cs.toFixed(3) + ')';
      ring.classList.toggle('is-hot', hot);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
