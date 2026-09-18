/* app.js — design system v2 enhancement layer (progressive, zero deps)
   Theme toggle · Command palette (Ctrl/Cmd+K) · Mobile drawer · Reveal */
(function () {
  'use strict';
  var root = document.documentElement;
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* ---- theme ---- */
  try {
    var saved = store.get('ds-theme');
    if (saved === 'dark' || saved === 'light') {
      root.dataset.theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.dataset.theme = 'dark';
    }
  } catch (e) {}
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('.ds-theme-btn');
    if (!btn) return;
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('ds-theme', next);
  });

  /* ---- normalize Arabic for matching (search) ---- */
  function norm(s) {
    return (s || '')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[\u0623\u0625\u0622]/g, '\u0627')
      .replace(/\u0629/g, '\u0647')
      .replace(/\u0649/g, '\u064A')
      .replace(/\u200f|\u200e/g, '')
      .toLowerCase();
  }

  /* ---- command palette ---- */
  var palette = document.querySelector('.ds-palette');
  if (palette) {
    var input = palette.querySelector('input');
    var list = palette.querySelector('.ds-palette__list');
    var idx = -1, rows = [], items = [], all = null;
    function normalize(href) { return href && href.replace(/\/index\.html$/, '/'); }
    function render() {
      list.innerHTML = '';
      items = [];
      var q = norm(input.value).trim();
      var src = all;
      if (!src) return;
      if (q) {
        src = src.filter(function (r) {
          var hay = norm(r.t + ' ' + (r.d || '') + ' ' + r.u);
          return hay.indexOf(q) !== -1;
        });
      }
      rows = src.slice(0, 12);
      rows.forEach(function (r, i) {
        var a = document.createElement('a');
        a.href = r.u;
        a.textContent = r.t;
        a.setAttribute('aria-selected', 'false');
        if (typeof r.t === 'string' && r.t.length) { a.title = r.u; }
        a.addEventListener('click', function () { close(); });
        list.appendChild(a);
        items.push(a);
      });
      idx = items.length ? 0 : -1;
      mark();
    }
    function mark() {
      items.forEach(function (el, i) {
        var on = i === idx;
        el.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) { el.focus(); }
      });
    }
    function open(ev) {
      ev.preventDefault();
      palette.classList.add('is-open');
      palette.setAttribute('aria-hidden', 'false');
      var ds = root.dataset.theme;
      if (!all) {
        fetch('assets/search-index.json', { cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            all = Array.isArray(data) ? data : (data && data.pages) ? data.pages : [];
            render();
          })
          .catch(function () { all = []; render(); });
      }
      if (ds) { root.dataset.theme = ds; }
      setTimeout(function () {
        if (input) {
          input.value = '';
          render();
          input.focus();
        }
      }, 20);
    }
    function close() {
      palette.classList.remove('is-open');
      palette.setAttribute('aria-hidden', 'true');
    }
    document.addEventListener('keydown', function (ev) {
      var mod = ev.metaKey || ev.ctrlKey;
      if (mod && ev.key.toLowerCase() === 'k') { ev.preventDefault(); open(ev); }
      if (!palette.classList.contains('is-open')) return;
      if (ev.key === 'Escape') { close(); }
      if (ev.key === 'ArrowDown') { ev.preventDefault(); idx = Math.min(idx + 1, items.length - 1); mark(); }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); idx = Math.max(idx - 1, 0); mark(); }
      if (ev.key === 'Enter' && items[idx]) { ev.preventDefault(); items[idx].click(); }
    });
    if (input) input.addEventListener('input', render);
  }

  /* ---- mobile drawer ---- */
  var burger = document.querySelector('.ds-burger');
  var drawer = document.querySelector('.ds-drawer');
  var scrim = document.querySelector('.ds-scrim');
  if (burger && drawer) {
    function toggleOpen(on) {
      drawer.classList.toggle('is-open', on);
      if (scrim) scrim.classList.toggle('is-open', on);
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    burger.addEventListener('click', function () { toggleOpen(!drawer.classList.contains('is-open')); });
    if (scrim) scrim.addEventListener('click', function () { toggleOpen(false); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggleOpen(false); }); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && drawer.classList.contains('is-open')) { toggleOpen(false); burger.focus(); }
    });
  }

  /* ---- reveal (progressive) ---- */
  if ('IntersectionObserver' in window) {
    var reveal = document.querySelectorAll('.ds-reveal');
    if (reveal.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      reveal.forEach(function (el) { io.observe(el); });
    }
  } else {
    document.querySelectorAll('.ds-reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- footer year ---- */
  document.querySelectorAll('[data-ds-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();