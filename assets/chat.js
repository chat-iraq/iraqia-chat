/* chat.js — live room chat for static pages (Pusher Channels, browser-only client events)
   Entry form: <form class="px-enter">  ·  Overlay chat injected on submit. No backend. */
(function () {
  'use strict';
  var cfg = (window.PUSHER_CHAT) || { key: '', cluster: '', prefix: 'lobby' };
  var READY = !!(cfg.key && cfg.key.length > 4 && cfg.cluster);

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store() { try { var v = localStorage.getItem('ds-nick'); return v || ''; } catch (e) { return ''; } }

  /* ---- helpers ---- */
  function cleanName(raw) {
    var s = String(raw || '').replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
    s = s.replace(/[<>{}[\]\\\t\r\n]/g, '');
    s = s.replace(/\s{2,}/g, ' ');
    if (s.length < 2) return '';
    return s.slice(0, 20);
  }
  function cleanMsg(raw) {
    var s = String(raw || '').trim().replace(/[\u200e\u200f]/g, '');
    return s.slice(0, 200);
  }
  function slug() {
    var link = qs('link[rel="canonical"]');
    var p = '';
    if (link) { try { p = new URL(link.href).pathname; } catch (e) { p = link.getAttribute('href') || ''; } }
    p = p.replace(/^\/|\/$/g, '').replace(/\/index\.html$/, '');
    var s = p.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
    return (s && s.length > 1) ? s : 'lobby';
  }
  function roomTitle() {
    var h = qs('.px-hero h1');
    if (h && h.textContent.trim()) return h.textContent.trim();
    return document.title.replace(/\s*[-|]\s*شات عسل تايم\s*$/i, '').trim() || 'الغرفة';
  }
  function toast(msg, ms) {
    var t = document.createElement('div');
    t.className = 'px-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); }, (ms || 2200));
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, (ms || 2200) + 350);
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* ---- entry form ---- */
  var form = qs('.px-enter');
  if (!form) return;

  var nameInput = qs('.px-enter__name', form);
  var btn = qs('.px-enter__btn', form);
  var errEl = document.createElement('p');
  errEl.className = 'px-enter__err';
  errEl.hidden = true;

  var saved = store();
  if (saved && nameInput && nameInput.type === 'text') nameInput.value = saved;

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (form.classList.contains('is-busy')) return;
    var nick = cleanName(nameInput ? nameInput.value : '');
    if (!nick) {
      errEl.textContent = 'اكتب اسمك المستعار أولاً (حرفان على الأقل)';
      errEl.hidden = false;
      if (nameInput) { nameInput.focus(); }
      return;
    }
    errEl.hidden = true;
    try { localStorage.setItem('ds-nick', nick); } catch (e) {}
    form.classList.add('is-busy');

    if (!READY) {
      var href = form.getAttribute('data-href');
      toast('شغّلنا الدردشة الآن — خذك للدخول المباشر…', 1800);
      setTimeout(function () { if (href) { window.location.href = href; } }, 1700);
      return;
    }
    openChat(nick);
  });
  if (nameInput) {
    nameInput.insertAdjacentElement('afterend', errEl);
    nameInput.addEventListener('input', function () { errEl.hidden = true; });
  }

  /* ---- live chat overlay ---- */
  function openChat(nick) {
    var root = document.createElement('div');
    root.className = 'chat-root';
    root.innerHTML =
      '<div class="chat-box" role="dialog" aria-modal="true" aria-label="غرفة الدردشة">' +
      '<header class="chat-head"><strong class="chat-title">' + esc(roomTitle()) + '</strong>' +
      '<span class="chat-count" hidden></span>' +
      '<button type="button" class="chat-close" aria-label="إغلاق">&times;</button></header>' +
      '<div class="chat-msgs"></div>' +
      '<form class="chat-form"><input class="chat-field" type="text" maxlength="200" autocomplete="off" aria-label="اكتب رسالتك" placeholder="اكتب رسالتك…"><button type="submit" class="chat-send" disabled>إرسال</button></form>' +
      '</div>';
    document.body.appendChild(root);

    var msgs = qs('.chat-msgs', root);
    var countEl = qs('.chat-count', root);
    var field = qs('.chat-field', root);
    var send = qs('.chat-send', root);
    var chatForm = qs('.chat-form', root);
    var me = nick;
    var subCount = 0;

    function infoLine(text) {
      var d = document.createElement('div');
      d.className = 'chat-info';
      d.textContent = text;
      msgs.appendChild(d);
      scrollDown();
    }
    function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }

    function addMsg(data) {
      var name = (typeof data.n === 'string') ? data.n.slice(0, 20) : 'زائر';
      var text = (typeof data.t === 'string') ? data.t.slice(0, 200) : '';
      if (!text) return;
      var row = document.createElement('div');
      row.className = 'chat-msg' + (name === me ? ' chat-msg--me' : '');
      var nm = document.createElement('span');
      nm.className = 'chat-msg__name';
      nm.textContent = name === me ? 'أنت' : name;
      row.appendChild(nm);
      var tx = document.createElement('span');
      tx.className = 'chat-msg__text';
      tx.textContent = text;
      row.appendChild(tx);
      var tm = document.createElement('time');
      tm.className = 'chat-msg__time';
      tm.textContent = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
      row.appendChild(tm);
      msgs.appendChild(row);
      while (msgs.children.length > 200) msgs.removeChild(msgs.firstChild);
      scrollDown();
    }

    function loadPusher(cb, onFail) {
      if (window.Pusher) return cb(window.Pusher);
      var s = document.createElement('script');
      s.src = 'https://js.pusher.com/8.3.0/pusher.min.js';
      s.onload = function () { cb(window.Pusher); };
      s.onerror = onFail;
      document.head.appendChild(s);
    }

    loadPusher(function (Pusher) {
      var errOnce = false;
      var pusher = new Pusher(cfg.key, { cluster: cfg.cluster });
      var channelName = cfg.prefix + '-' + slug();
      var ch = pusher.subscribe(channelName);
      ch.bind('pusher:subscription_succeeded', function () {
        send.disabled = false;
        infoLine('تم الاتصال بالغرفة — تفضل أدردش!');
      });
      if ('pusher:subscription_count' in ch) {
        ch.bind('pusher_internal:subscription_count', function (d) {
          if (d && typeof d.subscription_count === 'number') {
            subCount = d.subscription_count;
            countEl.hidden = false;
            countEl.textContent = '· ' + subCount + ' متصل';
          }
        });
      }
      ch.bind('client-msg', function (d) { addMsg(d); });
      pusher.connection.bind('error', function () {
        if (errOnce) return;
        errOnce = true;
        var e = document.createElement('div');
        e.className = 'chat-err';
        e.textContent = 'انقطعت الفائدة من الخادم — حاول لاحقاً.';
        msgs.appendChild(e);
      });

      chatForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (send.disabled) return;
        var text = cleanMsg(field.value);
        if (!text) return;
        field.value = '';
        ch.trigger('client-msg', { n: me, t: text });
      });
      field.focus();
    }, function () {
      infoLine('تعذر تحميل خدمة الدردشة الآن — جرّب بعد قليل.');
      send.disabled = true;
    });

    qs('.chat-close', root).addEventListener('click', function () {
      close();
    });
    function close() {
      if (root.parentNode) root.parentNode.removeChild(root);
      document.removeEventListener('keydown', onKey, false);
    }
    function onKey(ev) {
      if (ev.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey, false);
  }
})();