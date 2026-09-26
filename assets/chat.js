/* شات احترافي v2 — شات عسل تايم / درر العرب
   يعمل على صفحات ثابتة دون خادم: Firebase RTDB (رسائل + حضور) + Firebase Storage (صور).
   يتم حقن ورقة الأنماط chat.css تلقائيًا. لا يتطلب تعديل HTML. */
(function () {
  'use strict';
  var cfg = window.CHAT_FIREBASE || null;
  var READY = !!(cfg && cfg.databaseURL && cfg.apiKey && cfg.roomPrefix);

  /* ───────── دلائل التطوير (لون الاسم + تدرج الصورة) ───────── */
  var NAME_COLORS = ['#e17055', '#d63031', '#e1701e', '#e5a50a', '#00a86b', '#0aa895', '#0a6cd6', '#8e44ad', '#5c4fd0', '#c039a5', '#e0489a', '#2c7ad6', '#00b894', '#e6a23c', '#e21845', '#607d8b', '#7c6bd6', '#3e4c59'];
  var AVA_GRADS = [
    'linear-gradient(135deg,#ff7e5f,#feb47b)', 'linear-gradient(135deg,#e43a15,#b8272c)', 'linear-gradient(135deg,#f7971e,#ffd200)',
    'linear-gradient(135deg,#42e695,#3bb2b8)', 'linear-gradient(135deg,#00c6fb,#005bea)', 'linear-gradient(135deg,#7f00ff,#e100ff)',
    'linear-gradient(135deg,#fa709a,#fee140)', 'linear-gradient(135deg,#30cfd0,#330867)', 'linear-gradient(135deg,#f83600,#f9d423)',
    'linear-gradient(135deg,#02aab0,#00cdac)', 'linear-gradient(135deg,#d53369,#cbad6d)', 'linear-gradient(135deg,#aa076b,#61045f)',
    'linear-gradient(135deg,#1e9600,#fff200)', 'linear-gradient(135deg,#ec6ead,#3494e6)', 'linear-gradient(135deg,#fc4a1a,#f7b733)',
    'linear-gradient(135deg,#5a3f37,#2c7744)', 'linear-gradient(135deg,#b79891,#94716b)', 'linear-gradient(135deg,#c31432,#240b36)'
  ];
  var ROOMS = [
    { id: 'zhrh-alaaraq', t: 'شات زهره العراق', g: 4 },
    { id: 'aaraq-aamry', t: 'شات عراق عمري', g: 3 },
    { id: 'aaraq-alhryh', t: 'شات عراق الحرية', g: 0 },
    { id: 'aaraq-alnbla', t: 'شات عراق النبلاء', g: 7 },
    { id: 'aaraq-alrwmansyh', t: 'شات عراق الرومانسية', g: 9 },
    { id: 'aaraq-alrafdyn', t: 'شات عراق الرافدين', g: 5 },
    { id: 'aaraq-blw', t: 'شات عراق بلو', g: 8 },
    { id: 'aaraq-rwz', t: 'شات عراق روز', g: 13 },
    { id: 'aaraqna-kwl', t: 'شات عراقنا كول', g: 1 },
    { id: 'aaraqywn', t: 'شات عراقيون', g: 11 },
    { id: 'aajybh', t: 'شات عجيبه', g: 6 },
    { id: 'aaly-alqhwh', t: 'شات علي القهوة', g: 12 }
  ];
  var ROOMS_FULL = ROOMS.map(function (r) { return { id: cfg.roomPrefix + '-' + r.id, t: r.t, g: r.g }; });
  var EMOJI = ['😀','😁','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😋','😜','🤪','🤗','🤔','😎','🥳','😢','😭','😅','🙃','😴','🤤','😱','🤯','😳','🥺','😡','😈','💀','👻','🤖','👋','🤝','👍','👎','👏','🙏','💪','👀','🫶','💘','💕','💞','💓','💗','💖','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤍','🖤','💯','✨','🔥','🌹','🌸','🌺','🌷','💐','🌻','🌙','⭐','🌈','☀️','🌊','🌴','🍀','🎉','🎊','🎁','🎶','🎵','🏆','👑','💎','🍕','🍔','🌭','🍿','🥤','☕','🍩','🍰','🎂','⚽','🏀','🎮','🎯','🎲','🚗','✈️','🗺️','💡','📚','✍️','🤝','💬','📱','❤️‍🔥'];

  /* ───────── أدوات ───────── */
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function storeGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function cleanName(raw) {
    var s = String(raw || '').replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
    s = s.replace(/[<>{}[\]\\\t\r\n]/g, '').replace(/\s{2,}/g, ' ');
    if (s.length < 2) return '';
    return s.slice(0, 20);
  }
  function cleanMsg(raw) { return String(raw || '').trim().replace(/[\u200e\u200f]/g, '').slice(0, 300); }
  function cleanStatus(raw) { return String(raw || '').trim().replace(/[\n\t<>{}[\]\\]/g, ' ').slice(0, 60); }
  function slug() {
    var link = qs('link[rel="canonical"]');
    var p = '';
    if (link) { try { p = new URL(link.href).pathname; } catch (e) { p = link.getAttribute('href') || ''; } }
    p = p.replace(/^\/|\/$/g, '').replace(/\/index\.html$/, '');
    var s = p.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
    return (s && s.length > 1) ? s : 'lobby';
  }
  function roomTitle() {
    var h = qs('.px-hero h1') || qs('h1');
    if (h && h.textContent.trim()) return h.textContent.trim().slice(0, 40);
    return document.title.replace(/\s*[-|]\s*شات عسل تايم\s*$/i, '').replace(/\s*[-|]\s*درر العرب\s*$/i, '').trim() || 'الغرفة';
  }
  function roomDesc() {
    var d = qs('meta[name="description"]');
    var v = d && d.content ? String(d.content).trim() : '';
    if (v.length > 60) v = v.slice(0, 57) + '…';
    return v;
  }
  function tabKey() {
    try {
      var k = sessionStorage.getItem('px-tab');
      if (!k) { k = 't' + (Math.random() * 1e9 | 0) + Date.now(); sessionStorage.setItem('px-tab', k); }
      return k;
    } catch (e) { return 't' + (Math.random() * 1e9 | 0) + Date.now(); }
  }
  function toast(msg, ms) {
    var t = document.createElement('div');
    t.className = 'px-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); }, (ms || 2500));
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, (ms || 2500) + 350);
  }
  function fmtTime(ts) {
    var d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  }
  function fmtClock(ts) {
    var d = new Date(ts);
    var now = new Date();
    if (d.toDateString() === now.toDateString()) return fmtTime(ts);
    return d.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long' }) + '، ' + fmtTime(ts);
  }
  function dayLabel(ts) {
    var d = new Date(ts); var n = new Date();
    if (d.toDateString() === n.toDateString()) return 'اليوم';
    var y = new Date(n); y.setDate(n.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'أمس';
    return d.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ───────── حقن ورقة الأنماط ───────── */
  function ensureChatCss() {
    if (qs('link[href*="chat.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/chat.css';
    document.head.appendChild(link);
  }
  ensureChatCss();

  /* ───────── البروفايل المحلي ───────── */
  var DEFAULT_AV = Math.floor(Math.random() * AVA_GRADS.length);
  function loadPro() {
    var d = { a: DEFAULT_AV, s: '' };
    try { var v = JSON.parse(localStorage.getItem('ds-pro') || 'null'); if (v && typeof v === 'object') { if (typeof v.a === 'number' && v.a >= 0 && v.a < AVA_GRADS.length) d.a = v.a; if (typeof v.s === 'string') d.s = v.s.slice(0, 60); } } catch (e) {}
    return d;
  }
  function savePro(p) { try { localStorage.setItem('ds-pro', JSON.stringify({ a: p.a, s: p.s })); } catch (e) {} }

  function avaEl(i, size, letter) {
    i = (typeof i === 'number') ? i : DEFAULT_AV;
    var el = document.createElement('span');
    el.className = 'pxc-ava' + (size ? ' pxc-ava--' + size : '');
    el.style.background = AVA_GRADS[i % AVA_GRADS.length];
    el.textContent = (letter || '؟').charAt(0);
    return el;
  }

  /* ───────── نموذج الدخول ───────── */
  var form = qs('.px-enter');
  if (!form) return;
  var nameInput = qs('.px-enter__name', form);
  var errEl = document.createElement('p');
  errEl.className = 'px-enter__err';
  errEl.hidden = true;
  var savedNick = storeGet('ds-nick');
  if (savedNick && nameInput && nameInput.type === 'text') nameInput.value = savedNick;

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (form.classList.contains('is-busy')) return;
    var nick = cleanName(nameInput ? nameInput.value : '');
    if (!nick) {
      errEl.textContent = 'اكتب اسمك المستعار أولاً (حرفان على الأقل)';
      errEl.hidden = false;
      if (nameInput) nameInput.focus();
      return;
    }
    errEl.hidden = true;
    storeSet('ds-nick', nick);
    form.classList.add('is-busy');
    if (!READY) {
      var href = form.getAttribute('data-href');
      toast('شغّلنا الدردشة الآن — خذك للدخول المباشر…', 1800);
      setTimeout(function () { if (href) window.location.href = href; }, 1700);
      return;
    }
    openChat(nick);
  });
  if (nameInput) {
    nameInput.insertAdjacentElement('afterend', errEl);
    nameInput.addEventListener('input', function () { errEl.hidden = true; });
  }

  /* ═══════════════ التطبيق ═══════════════ */
  function openChat(nick) {
    var root = document.createElement('div');
    root.className = 'pxc';
    root.innerHTML =
      '<div class="pxc-app" role="dialog" aria-modal="true" aria-label="الدردشة">' +
        '<header class="pxc-top">' +
          '<button type="button" class="pxc-icon pxc-icon--nav" title="القائمة">☰</button>' +
          '<button type="button" class="pxc-me" title="ملفك الشخصي"></button>' +
          '<div class="pxc-head"><strong class="pxc-title"></strong><span class="pxc-sub"><span class="pxc-count">0</span>متصل الآن</span></div>' +
          '<button type="button" class="pxc-icon pxc-icon--rooms" title="نافذة الغرف">🗂️<span>الغرف</span><i class="pxc-rooms-badge" hidden></i></button>' +
          '<button type="button" class="pxc-icon pxc-icon--share" title="مشاركة رابط الغرفة">🔗</button>' +
          '<button type="button" class="pxc-icon pxc-icon--theme" title="الوضع الليلي">🌙</button>' +
          '<button type="button" class="pxc-icon pxc-icon--close" title="خروج">&times;</button>' +
        '</header>' +
        '<div class="pxc-body">' +
          '<div class="pxc-sidefade"></div>' +
          '<aside class="pxc-side">' +
            '<nav class="pxc-tabs">' +
              '<button type="button" class="pxc-tab is-on" data-pane="members">الأعضاء</button>' +
              '<button type="button" class="pxc-tab" data-pane="roomslist">الغرف</button>' +
            '</nav>' +
            '<div class="pxc-pane is-on" data-pane="members"></div>' +
            '<div class="pxc-pane" data-pane="roomslist"></div>' +
          '</aside>' +
          '<section class="pxc-main"><div class="pxc-feed"></div></section>' +
        '</div>' +
        '<div class="pxc-typing" hidden></div>' +
        '<footer class="pxc-composer">' +
          '<div class="pxc-replychip" hidden></div>' +
          '<div class="pxc-editchip" hidden></div>' +
          '<div class="pxc-mentions" hidden></div>' +
          '<input type="file" class="pxc-file" accept="image/*" hidden>' +
          '<button type="button" class="pxc-icon pxc-icon--tool" title="إرسال صورة">🖼️</button>' +
          '<button type="button" class="pxc-icon pxc-icon--tool" title="ابتسامات">😊</button>' +
          '<textarea rows="1" maxlength="300" placeholder="اكتب رسالتك…" aria-label="اكتب رسالتك"></textarea>' +
          '<button type="button" class="pxc-send" disabled>إرسال</button>' +
        '</footer>' +
      '</div>';
    document.body.appendChild(root);

    /* عناصر */
    var titleEl = qs('.pxc-title', root);
    var countEl = qs('.pxc-count', root);
    var meBtn = qs('.pxc-me', root);
    var feed = qs('.pxc-feed', root);
    var field = qs('.pxc-composer textarea', root);
    var send = qs('.pxc-send', root);
    var paneMembers = qs('.pxc-pane[data-pane="members"]', root);
    var paneRooms = qs('.pxc-pane[data-pane="roomslist"]', root);
    var fileInput = qs('.pxc-file', root);
    var shareBtn = qs('.pxc-icon--share', root);
    var themeBtn = qs('.pxc-icon--theme', root);
    var typingLine = qs('.pxc-typing', root);
    var replyChip = qs('.pxc-replychip', root);
    var editChip = qs('.pxc-editchip', root);
    var mentionsBox = qs('.pxc-mentions', root);

    /* الحالة */
    var pro = loadPro();
    var me = { n: nick, a: pro.a, c: Math.floor(Math.random() * NAME_COLORS.length), s: pro.s };
    var room = { id: cfg.roomPrefix + '-' + slug(), title: roomTitle(), desc: roomDesc() };
    var detached = false;
    var members = {};           /* جزئية presence */
    var firebaseReady = false;
    var db = null;
    var curMsgListeners = null;
    var lastMsg = null;         /* للتجميع */
    var roomPollTimer = null;
    var uploadBusy = false;

    /* ─── الإعدادات والتفاصيل الاحترافية ─── */
    var settings = loadSettings();
    var dark = settings.dark;
    var sound = settings.sound;
    var unread = 0;
    var replyTo = null;          /* {key,n,t,img} للرد على رسالة */
    var editingKey = null;       /* مفتاح الرسالة قيد التحرير */
    var blocks = {};             /* قائمة الحظر: uid -> true */
    var typingTimer = null;
    var typingRef = null;
    var typingShowTimer = null;
    var typingKeys = {};         /* keys متصلين يكتبون الآن */
    var prevPresKeys = null;
    var firstPres = true;
    var feedKeys = {};           /* مفاتيح الرسائل الظاهرة */
    var oldestTs = Infinity;
    var oldestVis = true;
    var audioCtx = null;
    var notificationsOn = false;
    var rxCache = {};            /* ردود فعل الرسائل {key:{emoji:count}} */
    var rxMine = {};           /* ردودي أنا {key:{emoji:true}} */

    function loadSettings() {
      try {
        var s = JSON.parse(localStorage.getItem('ds-pro2') || '{}');
        return { dark: s.dark === true, sound: s.sound !== false };
      } catch (e) { return { dark: false, sound: true }; }
    }
    function saveSettings() {
      try { localStorage.setItem('ds-pro2', JSON.stringify({ dark: dark, sound: sound })); } catch (e) {}
    }
    function applyTheme() {
      root.classList.toggle('ds-dark', dark);
      qsa('.pxc-icon--theme', root).forEach(function (b) { b.title = dark ? 'الوضع النهاري' : 'الوضع الليلي'; b.textContent = dark ? '☀️' : '🌙'; });
    }

    function $(s) { return qs(s, root); }

    /* ───────── الوسائط الصوتية والإشعارات ───────── */
    function ensureAudio() {
      if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
      }
      if (audioCtx && audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch (e) {} }
    }
    function ring() {
      if (!sound || !audioCtx) return;
      try {
        var t = audioCtx.currentTime;
        [0, 0.14].forEach(function (off, i) {
          var o = audioCtx.createOscillator();
          var g = audioCtx.createGain();
          o.type = 'sine';
          o.frequency.value = i ? 988 : 790;
          g.gain.setValueAtTime(0.0001, t + off);
          g.gain.exponentialRampToValueAtTime(0.14, t + off + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.16);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(t + off); o.stop(t + off + 0.18);
        });
      } catch (e) {}
    }
    function notifyMsg(n, txt) {
      if (document.hidden && notificationsOn && ('Notification' in window) && Notification.permission === 'granted') {
        try { new Notification(room.title, { body: (n ? n + ': ' : '') + txt }); } catch (e) {}
      }
    }
    function bumpUnread() {
      unread++;
      var b = qs('.pxc-rooms-badge', root);
      if (b) { b.hidden = false; b.textContent = String(Math.min(99, unread)); }
      document.title = '(' + unread + ') ' + room.title;
    }
    function clearUnread() {
      unread = 0;
      var b = qs('.pxc-rooms-badge', root);
      if (b) b.hidden = true;
      document.title = room.title;
    }

    /* ───────── مؤشر الكتابة ───────── */
    function setTyping() {
      if (!typingRef || !curMsgListeners) return;
      try { typingRef.child(curMsgListeners.myKey).set({ n: me.n, t: Date.now(), u: authUid }); } catch (e) {}
      if (typingTimer) clearTimeout(typingTimer);
      typingTimer = setTimeout(stopTyping, 2800);
    }
    function stopTyping() {
      if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
      if (typingRef && curMsgListeners) { try { typingRef.child(curMsgListeners.myKey).remove(); } catch (e) {} }
    }
    function showTypingNow(names) {
      if (!names.length) { if (typingLine) typingLine.hidden = true; return; }
      typingLine.hidden = false;
      typingLine.innerHTML = '<span class="pxc-typing-dots">…</span><span>' + names.join('، ') + (names.length > 1 ? ' يكتبون' : ' يكتب') + ' الآن</span>';
    }

    /* ───────── إشعارات دخول/خروج ───────── */
    function sysLine(html, kind) {
      var li = document.createElement('div');
      li.className = 'pxc-sys' + (kind ? ' pxc-sys--' + kind : '');
      li.innerHTML = html;
      feed.appendChild(li);
      while (feed.children.length > 420) feed.removeChild(feed.firstChild);
      scrollBottom();
    }

    meBtn.innerHTML = '';
    meBtn.appendChild(avaEl(me.a, '', me.n));
    titleEl.textContent = room.title;

    /* ───────── حقول عامة ───────── */
    function paneTab(el) { return el && el.getAttribute('data-pane'); }

    qsa('.pxc-tab', root).forEach(function (t) {
      t.addEventListener('click', function () {
        qsa('.pxc-tab', root).forEach(function (x) { x.classList.toggle('is-on', x === t); });
        qsa('.pxc-pane', root).forEach(function (p) { p.classList.toggle('is-on', paneTab(p) === t.getAttribute('data-pane')); });
      });
    });

    $('.pxc-icon--nav').addEventListener('click', function () { root.classList.toggle('app-side'); });
    $('.pxc-sidefade').addEventListener('click', function () { root.classList.remove('app-side'); });
    $('.pxc-icon--close').addEventListener('click', close);
    $('.pxc-icon--rooms').addEventListener('click', openRooms);
    shareBtn.addEventListener('click', shareRoom);
    themeBtn.addEventListener('click', function () {
      dark = !dark;
      applyTheme();
      saveSettings();
      toast(dark ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل', 1400);
    });
    applyTheme();

    field.addEventListener('input', function () { autosize(); sendForm(); setTyping(); updateMentions(); });
    field.addEventListener('focus', function () {
      ensureAudio();
      clearUnread();
      if (!notificationsOn) {
        notificationsOn = true;
        if ('Notification' in window && Notification.permission === 'default') {
          try { Notification.requestPermission(); } catch (e) {}
        }
      }
    });

    /* ───────── مشاركة رابط الغرفة ───────── */
    function shareRoom() {
      var url = location.origin + location.pathname.split('/').filter(Boolean).slice(0, -1).join('/');
      var full = (url || location.href).replace(/\/$/, '') + '/' + slug();
      try {
        navigator.clipboard.writeText(full).then(function () { toast('رابط الغرفة مُنسخ ✓', 1600); }, function () { toast(full, 2600); });
      } catch (e) { toast(full, 2600); }
    }
    function autosize() { field.style.height = 'auto'; field.style.height = Math.min(132, field.scrollHeight) + 'px'; }
    function sendForm() { var v = cleanMsg(field.value); var val = v && !uploadBusy && firebaseReady; send.disabled = !val; }
    field.addEventListener('keydown', function (ev) {
      if (!mentionsBox.hidden && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp' || ev.key === 'Enter' || ev.key === 'Tab')) {
        if (ev.key === 'Enter' && ev.shiftKey) return;
        ev.preventDefault();
        if (!mentionsList.length) return;
        if (ev.key === 'ArrowDown') mentionsIdx = (mentionsIdx + 1) % mentionsList.length;
        else if (ev.key === 'ArrowUp') mentionsIdx = (mentionsIdx - 1 + mentionsList.length) % mentionsList.length;
        else { if (mentionsIdx >= 0 && mentionsIdx < mentionsList.length) selectMention(mentionsList[mentionsIdx]); return; }
        paintMentions();
        return;
      }
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); doSend(); }
    });
    qs('.pxc-composer', root).addEventListener('submit', function (ev) { ev.preventDefault(); doSend(); });
    send.addEventListener('click', doSend);

    /*────────── الإيموجي ──────────*/
    var emoPanel = null;
    $('.pxc-icon--tool[title="ابتسامات"]').addEventListener('click', function (ev) {
      ev.stopPropagation();
      toggleEmoji();
    });
    function toggleEmoji() {
      if (emoPanel) { emoPanel.remove(); emoPanel = null; return; }
      emoPanel = document.createElement('div');
      emoPanel.className = 'pxc-emoji-panel';
      EMOJI.forEach(function (e) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = e;
        b.addEventListener('click', function () {
          var st = field.selectionStart || field.value.length;
          field.value = field.value.slice(0, st) + e + field.value.slice(st);
          autosize(); sendForm(); field.focus();
        });
        emoPanel.appendChild(b);
      });
      qs('.pxc-composer', root).appendChild(emoPanel);
    }

    /*────────── @منشن الأعضاء المتصلين ──────────*/
    var mentionsList = [];
    var mentionsIdx = -1;
    function mentionCandidates() {
      var names = [];
      Object.keys(members).forEach(function (k) {
        var nm = String((members[k] && members[k].n) || '').trim().slice(0, 20);
        if (nm && nm !== 'زائر' && names.indexOf(nm) === -1) names.push(nm);
      });
      return names.map(function (nm) { return { name: nm }; });
    }
    function updateMentions() {
      var text = field.value;
      var pos = field.selectionStart || 0;
      var before = text.slice(0, pos);
      var m = /(?:^|\s)@([^\s@]*)$/.exec(before);
      if (!m) { hideMentions(); return; }
      var q = m[1].toLowerCase();
      var cands = mentionCandidates().filter(function (c) { return !q || c.name.toLowerCase().indexOf(q) === 0; });
      if (!cands.length) { hideMentions(); return; }
      mentionsList = cands.slice(0, 8);
      mentionsIdx = 0;
      paintMentions();
      mentionsBox.hidden = false;
    }
    function paintMentions() {
      mentionsBox.innerHTML = '';
      mentionsList.forEach(function (c, i) {
        var it = document.createElement('button');
        it.type = 'button';
        it.className = 'pxc-mention' + (i === mentionsIdx ? ' is-on' : '');
        it.appendChild(avaEl(0, 's', c.name));
        var sp = document.createElement('span');
        sp.textContent = c.name;
        it.appendChild(sp);
        it.addEventListener('click', function (ev) { ev.stopPropagation(); selectMention(c); });
        mentionsBox.appendChild(it);
      });
    }
    function selectMention(c) {
      var text = field.value;
      var pos = field.selectionStart || text.length;
      var start = pos;
      while (start > 0 && text.charAt(start - 1) !== ' ' && text.charAt(start - 1) !== '\n') start--;
      var word = text.slice(start, pos);
      var newSel = (word.charAt(0) === '@') ? '@' + c.name + ' ' : ((start > 0 ? ' ' : '') + '@' + c.name + ' ');
      field.value = text.slice(0, start) + newSel + text.slice(pos);
      var caret = start + newSel.length;
      field.setSelectionRange(caret, caret);
      hideMentions();
      autosize(); sendForm();
      field.focus();
    }
    function hideMentions() {
      mentionsBox.hidden = true;
      mentionsBox.innerHTML = '';
      mentionsList = [];
      mentionsIdx = -1;
    }
    document.addEventListener('click', function (ev) {
      if (ev.target === field || mentionsBox.contains(ev.target)) return;
      hideMentions();
    });

    /*────────── رفع صورة ──────────*/
    $('.pxc-icon--tool[title="إرسال صورة"]').addEventListener('click', function () { if (firebaseReady && !uploadBusy) fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (!f || !firebaseReady || uploadBusy) return;
      if (!/^image\//.test(f.type)) { toast('يُقبل ملف صور فقط'); return; }
      if (f.size > 6 * 1024 * 1024) { toast('حجم الصورة كبير — الحد 6MB'); return; }
      doUpload(f);
    });

    function showUpload(show) {
      var old = qs('.pxc-upload', root);
      if (old) old.remove();
      if (!show) return;
      uploadBusy = true;
      sendForm();
      var u = document.createElement('div');
      u.className = 'pxc-upload';
      u.innerHTML = '<span class="pxc-spin"></span><span>جارٍ رفع الصورة وتجهيزها…</span>';
      qs('.pxc-composer', root).appendChild(u);
    }

    function doUpload(file) {
      showUpload(true);
      downscale(file, function (blob, w, h) {
        if (!blob) {
          uploadBusy = false; showUpload(false); toast('تعذر قراءة الصورة');
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          if (detached) { uploadBusy = false; showUpload(false); return; }
          var dataUrl = String(reader.result || '');
          pushMsg({ img: dataUrl, w: w, h: h, ts: Date.now() });
          uploadBusy = false; showUpload(false); toast('وصلت الصورة ✓', 1600);
        };
        reader.onerror = function () { uploadBusy = false; showUpload(false); toast('فشل رفع الصورة — جرّب لاحقًا'); };
        reader.readAsDataURL(blob);
      });
    }

    function downscale(file, cb) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = 920;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { cb(b, w, h); }, 'image/webp', 0.74);
      };
      img.onerror = function () { URL.revokeObjectURL(url); cb(null, 0, 0); };
      img.src = url;
    }

    /* ───────── تحميل Firebase ───────── */
    function loadFirebase(cb, onFail, depth) {
      if (window.firebase && window.firebase.database && window.firebase.initializeApp) return cb();
      if ((depth || 0) > 4) return onFail();
      var base = 'https://www.gstatic.com/firebasejs/10.12.2/';
      var scripts = ['firebase-app-compat.js', 'firebase-database-compat.js', 'firebase-auth-compat.js'];
      var i = 0;
      (function next() {
        if (i >= scripts.length) {
          if (window.firebase && window.firebase.database && window.firebase.initializeApp) { cb(); }
          else setTimeout(loadFirebase, 500, cb, onFail, (depth || 0) + 1);
          return;
        }
        var s = document.createElement('script');
        s.src = base + scripts[i];
        s.onload = function () { i++; next(); };
        s.onerror = function () { setTimeout(loadFirebase, 500, cb, onFail, (depth || 0) + 1); };
        document.head.appendChild(s);
      })();
    }

    var appRef = null;
    var authRef = null;
    var authUid = null;
    var authBooted = false;
    function boot() {
      if (authBooted) return;
      authBooted = true;
      sendForm();
      attachRoom(function () {
        infoLine('تم الاتصال بالغرفة — تفضل أدردش!');
        field.focus();
      });
      watchBlocks();
    }
    loadFirebase(function () {
      appRef = window.firebase.initializeApp(cfg, 'ds-chat');
      db = window.firebase.database(appRef);
      firebaseReady = true;
      if (!window.firebase.auth) { boot(); return; }
      authRef = window.firebase.auth(appRef);
      var onUser = function (user) {
        if (!user || !user.uid) return;
        if (authUid === user.uid) { if (!authBooted) boot(); return; }
        authUid = user.uid;
        boot();
      };
      authRef.onAuthStateChanged(onUser);
      if (authRef.currentUser) onUser(authRef.currentUser);
      else { try { authRef.signInAnonymously().then(onUser); } catch (e) {} }
      setTimeout(function () {
        if (!authBooted) {
          boot();
          toast('تعذّر التحقق من الهوية — بعض الخصائص قد تُقيَّد', 2600);
        }
      }, 7000);
    }, function () {
      infoLine('تعذر تحميل خدمة الدردشة الآن — جرّب بعد قليل.');
    });

    /* ───────── الربط بالغرفة ───────── */
    function attachRoom(okCb) {
      var msgRef = db.ref('chat/' + room.id);
      var presRef = db.ref('presence/' + room.id);
      var typingR = db.ref('typing/' + room.id);
      var myKey = tabKey();

      var myPres = presRef.child(myKey);
      myPres.onDisconnect().remove();
      if (authUid) myPres.set({ n: me.n, a: me.a, c: me.c, s: me.s, t: Date.now(), u: authUid });
      else {
        try { myPres.remove(); } catch (e2) {}
        var w = setInterval(function () {
          if (!authUid) return;
          clearInterval(w);
          try { myPres.set({ n: me.n, a: me.a, c: me.c, s: me.s, t: Date.now(), u: authUid }); } catch (e2) {}
        }, 400);
      }

      typingRef = typingR;

      curMsgListeners = { msgRef: msgRef, presRef: presRef, typingRef: typingR, myPres: myPres, myKey: myKey, authUid: authUid, on: true };
      firstPres = true;
      prevPresKeys = null;

      presRef.on('value', function (snap) {
        if (detached || !curMsgListeners || !curMsgListeners.on) return;
        var nowList = {};
        snap.forEach(function (ch) { nowList[ch.key] = ch.val() || {}; });
        if (!firstPres && prevPresKeys) {
          Object.keys(nowList).forEach(function (k) {
            if (!prevPresKeys[k]) {
              var p = nowList[k];
              sysLine('دخل <b>' + esc(String(p.n || 'زائر').slice(0, 20)) + '</b> الغرفة', 'in');
            }
          });
          Object.keys(prevPresKeys).forEach(function (k) {
            if (!nowList[k] && prevPresKeys[k]) {
              var p = prevPresKeys[k];
              sysLine('خرج <b>' + esc(String(p.n || 'زائر').slice(0, 20)) + '</b> من الغرفة', 'out');
            }
          });
        }
        firstPres = false;
        prevPresKeys = nowList;
        members = nowList;
        renderMembers();
        updateCount();
      });

      typingR.on('value', function (snap) {
        if (detached) return;
        var names = [];
        var now = Date.now();
        typingKeys = {};
        snap.forEach(function (ch) {
if (ch.key === myKey) return;
        var v = ch.val() || {};
        if (isBlocked(v.u)) return;
          if ((v.t || 0) > now - 3200) {
            typingKeys[ch.key] = true;
            names.push(String(v.n || 'شخص').slice(0, 20));
          }
        });
        showTypingNow(names);
      });

      var msgHandler = function (snap) {
        if (detached || !curMsgListeners || !curMsgListeners.on) return;
        var d = snap.val();
        if (!d || (!d.t && !d.img)) return;
        addMsg(d, snap.key);
        var isMine = d.k === myKey || (String(d.n || '') === me.n && (d.c === undefined || d.c === me.c) && typeof d.k !== 'string');
        if (!isMine) {
          if (document.hidden) {
            bumpUnread();
            ring();
            notifyMsg(String(d.n || '').slice(0, 20), String(d.t || 'صورة').slice(0, 80));
          }
        }
      };

      msgRef.orderByChild('ts').limitToLast(96).on('child_added', msgHandler);

      msgRef.on('child_removed', function (snap) {
        if (detached) return;
        var key = snap.key;
        delete feedKeys[key];
        var row = qs('.pxc-msg[data-key="' + key + '"]', root);
        if (row) row.remove();
      });

      msgRef.on('child_changed', function (snap) {
        if (detached) return;
        var key = snap.key;
        var val = snap.val() || {};
        rxCache[key] = val.r || {};
        var actors = val.ra || {};
        var mine = {};
        Object.keys(actors).forEach(function (av) {
          if (actors[av] && actors[av][myKey]) mine[av] = true;
        });
        rxMine[key] = mine;
        var bar = qs('.pxc-msg[data-key="' + key + '"] .pxc-react-bar', root);
        if (bar) renderReactBar(bar, key);
        if (typeof val.t === 'string') {
          var tx = qs('.pxc-msg[data-key="' + key + '"] .pxc-msg__text', root);
          if (tx) tx.innerHTML = renderRich(val.t);
        }
        if (val.ed) {
          var ed = qs('.pxc-msg[data-key="' + key + '"] .pxc-edited', root);
          if (!ed) {
            var whoEl = qs('.pxc-msg[data-key="' + key + '"] .pxc-msg__who', root);
            if (whoEl) {
              var e2 = document.createElement('span');
              e2.className = 'pxc-edited';
              e2.textContent = 'تم التعديل';
              whoEl.appendChild(e2);
            }
          }
        }
      });

      /* التنظيف التلقائي: نصوص قبل 7 أيام، صور قبل 48 ساعة */
      var txtCut = Date.now() - 7 * 86400000;
      var imgCut = Date.now() - 2 * 86400000;
      msgRef.orderByChild('ts').endAt(txtCut).limitToLast(200).once('value', function (snap) {
        if (detached || !snap.numChildren()) return;
        var updates = {};
        snap.forEach(function (ch) { updates[ch.key] = null; });
        msgRef.update(updates);
      });
      msgRef.orderByChild('ts').endAt(imgCut).limitToLast(400).once('value', function (snap) {
        if (detached || !snap.numChildren()) return;
        var updates = {};
        snap.forEach(function (ch) { var v = ch.val(); if (v && v.img) updates[ch.key] = null; });
        if (Object.keys(updates).length) msgRef.update(updates);
      });

      if (okCb) okCb();
    }

    function detachRoom() {
      if (!curMsgListeners) return;
      var L = curMsgListeners;
      L.on = false;
      try { L.presRef.off(); L.msgRef.off(); if (L.typingRef) L.typingRef.off(); L.myPres.remove(); L.myPres.onDisconnect().cancel(); } catch (e) {}
      curMsgListeners = null;
      stopTyping();
      if (typingLine) typingLine.hidden = true;
      typingKeys = {};
    }

    function switchRoom(id, title) {
      if (!firebaseReady || !curMsgListeners || id === room.id) { closeRooms(); return; }
      clearReply();
      cancelEdit();
      detachRoom();
      room = { id: id, title: title || id, desc: '' };
      titleEl.textContent = room.title;
      document.title = room.title;
      feed.innerHTML = '';
      lastMsg = null;
      lastDay = 0;
      members = {};
      feedKeys = {};
      rxCache = {};
      rxMine = {};
      oldestTs = Infinity;
      oldestVis = true;
      paneMembers.innerHTML = '';
      renderRoomsList();
      attachRoom(function () {
        infoLine('انتقلت إلى غرفة «' + room.title + '»');
      });
      scheduleRoomPoll();
    }

    function updateCount() {
      var c = Object.keys(members).length;
      countEl.textContent = String(c);
    }

    /* ───────── قائمة الأعضاء ───────── */
    function renderMembers() {
      var list = [];
      Object.keys(members).forEach(function (k) { if (!isBlocked(members[k].u)) list.push(members[k]); });
      list.sort(function (x, y) { return (x.t || 0) - (y.t || 0); });
      if (!list.length) {
        paneMembers.innerHTML = '<p class="pxc-info">لا يوجد متصلون الآن — كن أول من يتحدث!</p>';
        return;
      }
      paneMembers.innerHTML = '';
      list.forEach(function (m) {
        var name = String(m.n || 'زائر').slice(0, 20);
        var row = document.createElement('button');
        row.type = 'button';
        row.className = 'pxc-member';
        row.appendChild(avaEl(typeof m.a === 'number' ? m.a : DEFAULT_AV, 's', name));
        var meta = document.createElement('span');
        meta.className = 'pxc-member__meta';
        var nm = document.createElement('span');
        nm.className = 'pxc-member__name';
        nm.style.color = NAME_COLORS[(typeof m.c === 'number') ? m.c % NAME_COLORS.length : 0];
        nm.textContent = name;
        var sn = document.createElement('span');
        sn.className = 'pxc-member__since';
        sn.textContent = 'دخل ' + fmtClock(m.t || Date.now());
        meta.appendChild(nm); meta.appendChild(sn);
        row.appendChild(meta);
        var dot = document.createElement('i');
        dot.className = 'pxc-online';
        dot.title = 'متصل الآن';
        row.appendChild(dot);
        row.addEventListener('click', function () { openProfile(m); });
        paneMembers.appendChild(row);
      });
    }

    /* ───────── قوائم الغرف ───────── */
    function roomCardEntry(id, title, grad, isCur, count) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'pxc-room-card' + (isCur ? ' pxc-room-card--cur' : '');
      var badge = document.createElement('span');
      badge.className = 'pxc-room-card__badge';
      badge.style.background = AVA_GRADS[grad % AVA_GRADS.length];
      badge.textContent = title.charAt(0);
      var meta = document.createElement('span');
      meta.className = 'pxc-room-card__meta';
      var n = document.createElement('span');
      n.className = 'pxc-room-card__name';
      n.textContent = title;
      var d = document.createElement('span');
      d.className = 'pxc-room-card__desc';
      d.textContent = isCur ? (room.desc || 'الغرفة الحالية') : 'انقر للدخول لهذه الغرفة';
      meta.appendChild(n); meta.appendChild(d);
      var on = document.createElement('span');
      on.className = 'pxc-room-card__on';
      on.innerHTML = '<b>' + (typeof count === 'number' ? count : '…') + '</b>';
      card.appendChild(badge); card.appendChild(meta); card.appendChild(on);
      card.dataset.rid = id;
      card.addEventListener('click', function () { switchRoom(id, title); });
      return card;
    }

    function renderRoomsList() {
      paneRooms.innerHTML = '';
      var all = ROOMS_FULL.slice();
      var found = false;
      all.forEach(function (r) { if (r.id === room.id) found = true; });
      if (!found) all.unshift({ id: room.id, t: room.title, g: me.a });
      all.forEach(function (r) {
        paneRooms.appendChild(roomCardEntry(r.id, r.t, r.g, r.id === room.id, window.__roomCounts && window.__roomCounts[r.id]));
      });
    }

    function scheduleRoomPoll() {
      if (roomPollTimer) { clearInterval(roomPollTimer); }
      pollRoomCounts();
      roomPollTimer = setInterval(pollRoomCounts, 12000);
    }
    function pollRoomCounts() {
      if (!firebaseReady || !db) return;
      var all = ROOMS_FULL.slice();
      var seen = false;
      all.forEach(function (r) { if (r.id === room.id) seen = true; });
      if (!seen) all.unshift({ id: room.id, t: room.title, g: me.a });
      window.__roomCounts = window.__roomCounts || {};
      all.forEach(function (r) {
        db.ref('presence/' + r.id).once('value').then(function (snap) {
          if (detached) return;
          window.__roomCounts[r.id] = snap.numChildren();
          var el = qs('.pxc-room-card[data-rid="' + r.id + '"]', root);
          if (el) el.querySelector('.pxc-room-card__on b').textContent = String(snap.numChildren());
        }).catch(function () {});
      });
    }

    /* ───────── نافذة الغرف (عنصر منفصل) ───────── */
    var roomsPanel = null;
    function openRooms() {
      if (roomsPanel) { closeRooms(); return; }
      roomsPanel = document.createElement('div');
      roomsPanel.className = 'pxc-rooms';
      roomsPanel.innerHTML =
        '<div class="pxc-rooms-top"><button type="button" class="pxc-icon" title="رجوع">&times;</button><strong>نافذة الغرف</strong></div>' +
        '<div class="pxc-rooms-pane"></div>';
      document.body.appendChild(roomsPanel);
      qs('.pxc-rooms-top .pxc-icon', roomsPanel).addEventListener('click', closeRooms);
      var pane = qs('.pxc-rooms-pane', roomsPanel);
      function renderFloat() {
        pane.innerHTML = '';
        var all = ROOMS_FULL.slice();
        var found = false;
        all.forEach(function (r) { if (r.id === room.id) found = true; });
        if (!found) all.unshift({ id: room.id, t: room.title, g: me.a });
        all.forEach(function (r) {
          pane.appendChild(roomCardEntry(r.id, r.t, r.g, r.id === room.id, window.__roomCounts && window.__roomCounts[r.id]));
        });
      }
      renderFloat();
      scheduleRoomPoll();
    }
    function closeRooms() {
      if (roomsPanel) { roomsPanel.remove(); roomsPanel = null; }
    }

    /* ───────── البروفايل ───────── */
    function openProfile(m) {
      var isMe = m && m.__me;
      var name = isMe ? me.n : String((m && m.n) || 'زائر').slice(0, 20);
      var av = isMe ? me.a : (m && typeof m.a === 'number') ? m.a : DEFAULT_AV;
      var cc = isMe ? me.c : (m && typeof m.c === 'number') ? m.c : 0;
      var status = isMe ? me.s : ((m && typeof m.s === 'string') ? m.s : '');
      var joined = (m && m.t) || Date.now();

      openSheet(name + ' — الملف الشخصي', function (body) {
        var top = document.createElement('div');
        top.className = 'pxc-prof-top';
        var av = avaEl(av, 'l', name);
        var info = document.createElement('div');
        info.className = 'pxc-prof-info';
        var h = document.createElement('h3');
        h.textContent = name;
        h.style.color = NAME_COLORS[cc % NAME_COLORS.length];
        var st = document.createElement('p');
        st.className = 'pxc-prof-status';
        st.textContent = status || 'لم يكتب حالة بعد';
        info.appendChild(h); info.appendChild(st);
        top.appendChild(av); top.appendChild(info);
        body.appendChild(top);

        var rows = document.createElement('div');
        rows.className = 'pxc-prof-rows';
        function row(k, v) {
          var r = document.createElement('div');
          r.className = 'pxc-prof-row';
          var kk = document.createElement('span'); kk.textContent = k;
          var vv = document.createElement('strong'); vv.textContent = v;
          r.appendChild(kk); r.appendChild(vv);
          rows.appendChild(r);
        }
        row('الغرفة', room.title);
        row('دخل منذ', fmtClock(joined));
        row('الحالة', isMe ? 'متصل الآن' : ((m && Object.prototype.hasOwnProperty.call(m, 'n')) ? 'متصل الآن' : 'غير معروف'));
        body.appendChild(rows);

        if (!isMe && m && m.u && m.u !== authUid) {
          var bwrap = document.createElement('div');
          bwrap.className = 'pxc-prof-block';
          var bb = document.createElement('button');
          bb.type = 'button';
          bb.className = 'pxc-btn-ghost';
          bb.textContent = isBlocked(m.u) ? 'إلغاء الحظر' : 'حظر العضو';
          bb.addEventListener('click', function () {
            toggleBlock(m.u, name);
            bb.textContent = isBlocked(m.u) ? 'إلغاء الحظر' : 'حظر العضو';
          });
          bwrap.appendChild(bb);
          body.appendChild(bwrap);
        }

        if (isMe) {
          var f1 = document.createElement('div');
          f1.className = 'pxc-field';
          var l1 = document.createElement('label'); l1.textContent = 'صورة رمزية';
          f1.appendChild(l1);
          var grid = document.createElement('div');
          grid.className = 'pxc-avas-grid';
          AVA_GRADS.forEach(function (g, i) {
            var b = document.createElement('span');
            b.className = 'pxc-ava' + (i === me.a ? ' is-sel' : '');
            b.style.background = g;
            b.textContent = me.n.charAt(0);
            b.dataset.i = i;
            b.addEventListener('click', function () {
              me.a = i;
              qsa('.pxc-avas-grid .pxc-ava', body).forEach(function (x) { x.classList.toggle('is-sel', x === b); });
              updateMyPresence();
              meBtn.innerHTML = ''; meBtn.appendChild(avaEl(me.a, '', me.n));
            });
            grid.appendChild(b);
          });
          f1.appendChild(grid);
          body.appendChild(f1);

          var f2 = document.createElement('div');
          f2.className = 'pxc-field';
          var l2 = document.createElement('label'); l2.textContent = 'حالتك (تظهر للجميع)';
          f2.appendChild(l2);
          var ta = document.createElement('textarea');
          ta.rows = 2; ta.maxLength = 60;
          ta.value = me.s;
          f2.appendChild(ta);
          var bt = document.createElement('button');
          bt.type = 'button';
          bt.className = 'pxc-send';
          bt.style.marginTop = '.7rem';
          bt.textContent = 'حفظ الحالة';
          bt.addEventListener('click', function () {
            ensureAudio();
            me.s = cleanStatus(ta.value);
            savePro(me);
            updateMyPresence();
            st.textContent = me.s || 'لم يكتب حالة بعد';
            toast('حُفظ ملفك الشخصي ✓', 1500);
          });
          f2.appendChild(bt);
          body.appendChild(f2);

          /* الإعدادات */
          var f3 = document.createElement('div');
          f3.className = 'pxc-field';
          var l3 = document.createElement('label'); l3.textContent = 'الإعدادات';
          f3.appendChild(l3);
          var setRow = function (txt, get, set) {
            var r = document.createElement('div');
            r.className = 'pxc-set';
            var s = document.createElement('span'); s.textContent = txt;
            var t = document.createElement('button');
            t.type = 'button';
            t.className = 'pxc-set__on';
            t.textContent = get() ? 'تفعيل ✓' : 'إيقاف';
            t.style.color = get() ? '#fff' : '';
            t.addEventListener('click', function () {
              set(!get());
              t.textContent = get() ? 'تفعيل ✓' : 'إيقاف';
              applyTheme();
              toast(get() ? 'مفعّل ✓' : 'متوقف', 1200);
            });
            r.appendChild(s); r.appendChild(t);
            f3.appendChild(r);
            return r;
          };
          setRow('الوضع الليلي', function () { return dark; }, function (v) { dark = v; saveSettings(); });
          setRow('صوت التنبيه', function () { return sound; }, function (v) { sound = v; saveSettings(); });
          body.appendChild(f3);
        }
      });
    }

    function updateMyPresence() {
      if (!curMsgListeners) return;
      savePro(me);
      curMsgListeners.myPres.update({ a: me.a, c: me.c, s: me.s });
    }

    /* ───────── نافذة (Sheet) عامة ───────── */
    var sheets = [];
    function openSheet(title, build) {
      var bd = document.createElement('div');
      bd.className = 'pxc-backdrop';
      var sh = document.createElement('div');
      sh.className = 'pxc-sheet';
      var head = document.createElement('div');
      head.className = 'pxc-sheet__head';
      var t = document.createElement('strong'); t.textContent = title;
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'pxc-sheet__close'; x.textContent = '✕';
      x.setAttribute('aria-label', 'إغلاق');
      head.appendChild(x); head.appendChild(t);
      sh.appendChild(head);
      var body = document.createElement('div');
      sh.appendChild(body);
      document.body.appendChild(bd);
      document.body.appendChild(sh);
      function rm() {
        if (bd.parentNode) bd.parentNode.removeChild(bd);
        if (sh.parentNode) sh.parentNode.removeChild(sh);
        var i = sheets.indexOf(rm); if (i >= 0) sheets.splice(i, 1);
      }
      x.addEventListener('click', rm);
      bd.addEventListener('click', rm);
      sheets.push(rm);
      if (build) build(body);
    }

    /* ───────── عرض الرسائل ───────── */
    function infoLine(text) {
      var d = document.createElement('div');
      d.className = 'pxc-info';
      d.textContent = text;
      feed.appendChild(d);
      scrollBottom();
    }

    function addMsg(d, key) {
      if (isBlocked(d.u)) return;
      var name = String(d.n || 'زائر').slice(0, 20);
      var text = (typeof d.t === 'string') ? d.t : '';
      var isMe = name === me.n && (d.c === undefined || d.c === me.c);
      if (isMe && typeof d.k === 'string' && curMsgListeners && d.k !== curMsgListeners.myKey) isMe = false;
      var row = document.createElement('div');
      row.className = 'pxc-msg' + (isMe ? ' pxc-msg--me' : '');
      row.dataset.key = key;
      if ('ts' in d && typeof d.ts === 'number') row.dataset.ts = String(d.ts);

      var av = avaEl(typeof d.a === 'number' ? d.a : DEFAULT_AV, 's', name);
      av.addEventListener('click', function () { openProfile(d); });
      row.appendChild(av);

      var body = document.createElement('div');
      body.className = 'pxc-msg__body';
      var who = document.createElement('div');
      who.className = 'pxc-msg__who';
      var nn = document.createElement('span');
      nn.className = 'pxc-msg__name';
      nn.style.color = isMe ? 'rgba(255,255,255,.92)' : NAME_COLORS[(typeof d.c === 'number') ? d.c % NAME_COLORS.length : 0];
      nn.textContent = isMe ? 'أنت' : name;
      who.appendChild(nn);
      var now = (typeof d.ts === 'number') ? d.ts : Date.now();
      var tm = document.createElement('time');
      tm.className = 'pxc-msg__time';
      tm.textContent = fmtTime(now);
      who.appendChild(tm);
      if (d.ed) {
        var eb = document.createElement('span');
        eb.className = 'pxc-edited';
        eb.textContent = 'تم التعديل';
        who.appendChild(eb);
      }
      body.appendChild(who);

      /* الرد على رسالة سابقة */
      if (d.rt && d.rt.n) {
        var rq = document.createElement('div');
        rq.className = 'pxc-quote';
        var rqn = document.createElement('span');
        rqn.className = 'pxc-quote__name';
        rqn.textContent = String(d.rt.n).slice(0, 18);
        rq.appendChild(rqn);
        if (d.rt.img) {
          var rqi = document.createElement('img');
          rqi.className = 'pxc-quote__img';
          rqi.loading = 'lazy';
          rqi.src = d.rt.img;
          rqi.alt = '';
          rqi.addEventListener('click', function (ev) { ev.stopPropagation(); lightbox(d.rt.img); });
          rq.appendChild(rqi);
        }
        if (d.rt.t) {
          var rqt = document.createElement('span');
          rqt.className = 'pxc-quote__text';
          rqt.innerHTML = renderRich(String(d.rt.t));
          rq.appendChild(rqt);
        }
        body.appendChild(rq);
      }

      if (text) {
        var tx = document.createElement('span');
        tx.className = 'pxc-msg__text';
        tx.innerHTML = renderRich(text);
        body.appendChild(tx);
      }
      if (d.img) {
        var im = document.createElement('img');
        im.className = 'pxc-img';
        im.loading = 'lazy';
        im.alt = 'صورة من ' + name;
        im.style.aspectRatio = (d.w && d.h) ? (d.w / d.h) + '' : '';
        im.src = d.img;
        im.addEventListener('click', function () { lightbox(d.img); });
        body.appendChild(im);
      }

      /* أزرار الرسالة: نسخ / رد / حذف / تفاعل */
      var act = document.createElement('div');
      act.className = 'pxc-msg__act';
      var btn = function (label, fn) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
        act.appendChild(b);
        return b;
      };
      btn('نسخ', function () { copyMsg(text); });
      btn('رد', function () { setReplyTo({ key: key, name: name, text: text, img: d.img }); });
      if (isMe && typeof d.t === 'string') btn('تعديل', function () { startEdit(d, key); });
      if (isMe) btn('حذف', function () {
        try { curMsgListeners.msgRef.child(key).remove(); } catch (e) {}
        toast('حُذفت رسالتك', 1200);
        if (editingKey === key) cancelEdit();
      });
      var rxNew = document.createElement('button');
      rxNew.textContent = '👍';
      rxNew.addEventListener('click', function (ev) {
        ev.stopPropagation();
        toggleReact(key);
      });
      act.appendChild(rxNew);
      row.appendChild(body);
      row.appendChild(act);

      /* شريط الردود الفعلية */
      var bar = document.createElement('div');
      bar.className = 'pxc-react-bar';
      renderReactBar(bar, key);
      row.appendChild(bar);

      /* تجميع الرسائل المتتالية */
      var same = lastMsg && lastMsg.name === name && lastMsg.isMe === isMe && (now - lastMsg.ts) < 120000 && !d.img;
      if (same) {
        row.classList.add('pxc-msg--group');
      }
      var day = dayKey(now);
      if (day !== lastDay) {
        var chip = document.createElement('div');
        chip.className = 'pxc-day';
        chip.textContent = dayLabel(now);
        feed.appendChild(chip);
        lastDay = day;
        lastMsg = null;
      }
      feed.appendChild(row);
      lastMsg = { name: name, isMe: isMe, ts: now };
      feedKeys[key] = true;
      if (now < oldestTs) oldestTs = now;

      /* زر تحميل الأقدم */
      ensureOlderBtn();

      while (feed.children.length > 420) feed.removeChild(feed.firstChild);
      scrollBottom();
    }
    var lastDay = 0;

    function copyMsg(text) {
      var s = text || '';
      if (!s) { toast('لا يوجد نص للنسخ'); return; }
      try {
        navigator.clipboard.writeText(s).then(function () { toast('نُسخ النص ✓', 1200); }, function () { toast('تعذر النسخ'); });
      } catch (e) { toast('تعذر النسخ'); }
    }

    /* ───────── الردود الفعلية ───────── */
    var REACT_EMOJI = ['❤️', '😂', '😍', '👍', '😲'];
    function renderReactBar(bar, key) {
      bar.innerHTML = '';
      var map = rxCache[key] || {};
      var mine = rxMine[key] || {};
      var has = false;
      REACT_EMOJI.forEach(function (e) {
        var c = map[e] || 0;
        if (!c) return;
        has = true;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pxc-react' + (mine[e] ? ' is-mine' : '');
        b.innerHTML = '<span>' + e + '</span><b>' + c + '</b>';
        b.addEventListener('click', function () { toggleReact(key, e); });
        bar.appendChild(b);
      });
      if (!has) bar.hidden = true; else bar.hidden = false;
    }
    function toggleReact(key, emoji) {
      if (!emoji) {
        var patchEl = qs('.pxc-msg[data-key="' + key + '"] .pxc-msg__act', root);
        if (!patchEl) return;
        var m = patchEl.getBoundingClientRect();
        var panel = qs('.pxc-react-panel', root);
        if (panel) { panel.remove(); return; }
        panel = document.createElement('div');
        panel.className = 'pxc-react-panel';
        REACT_EMOJI.forEach(function (e) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = e;
          b.addEventListener('click', function () { toggleReact(key, e); });
          panel.appendChild(b);
        });
        document.body.appendChild(panel);
        var style = panel.style;
        style.position = 'fixed';
        style.left = Math.max(6, Math.min(window.innerWidth - 200, m.left)) + 'px';
        style.top = Math.max(6, m.top - 56) + 'px';
        return;
      }
      var msgRef = curMsgListeners.msgRef;
      var meRef = msgRef.child(key).child('ra').child(emoji).child(curMsgListeners.myKey);
      meRef.transaction(function (cur) { return cur ? null : true; }, function (err, committed, snap) {
        if (err || !committed) return;
        var on = !!snap.val();
        var cntRef = msgRef.child(key).child('r').child(emoji);
        cntRef.transaction(function (c) { return Math.max(0, (Number(c) || 0) + (on ? 1 : -1)); });
      });
    }

    /* ───────── السجل الأقدم ───────── */
    function ensureOlderBtn() {
      if (buildingOlder) return;
      var old = qs('.pxc-older', root);
      if (old) old.remove();
      if (oldestVis) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pxc-older';
        b.textContent = '‏‏⤴ عرض رسائل أقدم';
        b.addEventListener('click', loadOlder);
        feed.insertBefore(b, feed.firstChild);
      }
    }
    var buildingOlder = false;
    var loadingOlder = false;
    function loadOlder() {
      if (!firebaseReady || !curMsgListeners || loadingOlder) return;
      loadingOlder = true;
      var real = feed;
      var oldFeedHeight = real.scrollHeight;
      var scrollPrev = real.scrollTop;
      var before = oldestTs - 1;
      curMsgListeners.msgRef.orderByChild('ts').endAt(before).limitToLast(60).once('value', function (snap) {
        loadingOlder = false;
        if (detached) return;
        if (!snap.numChildren()) { oldestVis = null; ensureOlderBtn(); toast('وصلت إلى بداية السجل'); return; }
        var rows = [];
        snap.forEach(function (ch) {
          if (feedKeys[ch.key]) return;
          var d = ch.val();
          if (!d || (!d.t && !d.img)) return;
          rows.push({ key: ch.key, d: d });
        });
        if (!rows.length) { oldestVis = null; ensureOlderBtn(); toast('وصلت إلى بداية السجل'); return; }
        rows.sort(function (a, b) { return (a.d.ts || 0) - (b.d.ts || 0); });

        /* نوجّه الإضافة مؤقتًا إلى مسودة ليبنيها addMsg حفظًا للتجميع وفواصل الأيام */
        var scratch = document.createElement('div');
        var holdLastMsg = lastMsg;
        var holdLastDay = lastDay;
        feed = scratch;
        buildingOlder = true;
        lastMsg = null; lastDay = 0;
        rows.forEach(function (r) { addMsg(r.d, r.key); });
        buildingOlder = false;
        var olderNodes = Array.prototype.slice.call(scratch.childNodes);
        feed = real;
        lastMsg = holdLastMsg; lastDay = holdLastDay;

        var current = Array.prototype.slice.call(real.childNodes);
        real.innerHTML = '';
        olderNodes.forEach(function (n) { real.appendChild(n); });
        current.forEach(function (n) { real.appendChild(n); });

        /* استعادة حالة التجميع من آخر رسالة ظاهرة */
        var lastRow = null;
        for (var i = real.children.length - 1; i >= 0; i--) {
          var el = real.children[i];
          if (el.classList && el.classList.contains('pxc-msg')) { lastRow = el; break; }
        }
        if (lastRow) {
          var whoEl = lastRow.querySelector('.pxc-msg__name');
          lastMsg = {
            name: whoEl ? whoEl.textContent : '',
            isMe: lastRow.classList.contains('pxc-msg--me'),
            ts: Number(lastRow.dataset.ts || 0)
          };
          lastDay = dayKey(lastMsg.ts || Date.now());
        } else {
          lastMsg = null; lastDay = 0;
        }
        real.scrollTop = scrollPrev + (real.scrollHeight - oldFeedHeight);
        ensureOlderBtn();
      });
    }
    function dayKey(ts) {
      var d = new Date(ts);
      return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    }

    function emojiAndSafe(s) {
      var toks = String(s).split(/(:[^:\s]{1,14}:)/g);
      var out = '';
      toks.forEach(function (tk) {
        if (/^:[\u0600-\u06FF\w\u0640]+:$/.test(tk)) {
          var e = SHORTCUTS[tk];
          out += e ? '<span class="pxc-emoji">' + esc(e) + '</span>' : esc(tk);
        } else out += esc(tk);
      });
      return out.replace(/\n/g, '<br>');
    }
    var SHORTCUTS = { ':قلب:': '❤️', ':ضحك:': '😂', ':حزين:': '😢', ':غاضب:': '😡', ':معجب:': '😍', ':كف:': '🙏', ':ممتاز:': '👌', ':ماشي:': '👍', ':ابتسامة:': '😊', ':عين:': '👀' };

    /* عرض غني: يلون @منشن المتصلين ثم يحول الاختصارات */
    function renderRich(s) {
      var text = String(s);
      var names = [];
      Object.keys(members).forEach(function (k) {
        var nm = String((members[k] && members[k].n) || '').trim().slice(0, 20);
        if (nm && names.indexOf(nm) === -1) names.push(nm);
      });
      names.sort(function (a, b) { return b.length - a.length; });
      if (!names.length) {
        return text.indexOf(':') < 0 ? esc(text).replace(/\n/g, '<br>') : emojiAndSafe(text);
      }
      var alt = names.map(function (nm) { return nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
      var mre = new RegExp('(:[^:\\s]{1,14}:)|(@(?:' + alt + '))(?=[\\s<]|$)', 'g');
      var out = '';
      text.split(mre).forEach(function (tk) {
        if (!tk) return;
        if (/^:[^:\s]{1,14}:$/.test(tk)) {
          var e = SHORTCUTS[tk];
          out += e ? '<span class="pxc-emoji">' + esc(e) + '</span>' : esc(tk);
        } else if (tk.charAt(0) === '@' && tk.length > 1) {
          var nm = tk.slice(1);
          out += '<span class="pxc-mention' + (nm === me.n ? ' pxc-mention--me' : '') + '" data-name="' + esc(nm) + '">@' + esc(nm) + '</span>';
        } else {
          out += esc(tk);
        }
      });
      return out.replace(/\n/g, '<br>');
    }

    function lightbox(url) {
      var lb = document.createElement('div');
      lb.className = 'pxc-lb';
      var im = document.createElement('img');
      im.src = url;
      im.alt = '';
      lb.appendChild(im);
      lb.addEventListener('click', function () { lb.remove(); });
      document.body.appendChild(lb);
    }

    function scrollBottom() { feed.scrollTop = feed.scrollHeight; }

    function pushMsg(data) {
      if (!firebaseReady || !curMsgListeners) return;
      var payload = { n: me.n, a: me.a, c: me.c, k: curMsgListeners.myKey, u: authUid, ts: data.ts || Date.now() };
      if (data.t) payload.t = data.t;
      if (data.img) { payload.img = data.img; if (data.w) payload.w = data.w; if (data.h) payload.h = data.h; }
      if (data.rt) payload.rt = data.rt;
      if (data.t || data.img) {
        var now = Date.now();
        if (now - lastSendTs < 700) { toast('تمهّل قليلًا ⏳', 1000); return; }
        lastSendTs = now;
        payload.ts = now;
        if (authUid) { try { db.ref('rate/' + authUid).child('ts').set(now); } catch (e) {} }
      }
      try { curMsgListeners.msgRef.push(payload); } catch (e) {}
    }
    var lastSendTs = 0;

    /* ───────── قائمة الحظر ───────── */
    function watchBlocks() {
      if (!db || !authUid) return;
      try {
        db.ref('block/' + authUid).on('value', function (snap) {
          var v = snap.val() || {};
          blocks = {};
          Object.keys(v).forEach(function (k) { if (v[k]) blocks[k] = true; });
          renderMembers();
        });
      } catch (e) {}
    }
    function isBlocked(u) { return !!(u && blocks[u]); }
    function toggleBlock(u, name) {
      if (!db || !authUid || !u || u === authUid) return;
      var r = db.ref('block/' + authUid).child(u);
      if (isBlocked(u)) { r.remove(); toast('ألغيت حظر ' + name, 1200); }
      else { r.set(true); toast('حظرت ' + name + ' — لن ترى رسائله', 1400); }
    }

    /* ───────── الرد على رسالة ───────── */
    function setReplyTo(m) {
      if (!m) return;
      replyTo = { key: m.key, n: m.name, t: m.text };
      if (m.img) replyTo.img = m.img;
      replyChip.hidden = false;
      replyChip.innerHTML = '';
      var label = document.createElement('span');
      label.innerHTML = 'رد على <b>' + esc(String(m.name).slice(0, 18)) + '</b>: ' + esc(String(m.text || 'صورة').slice(0, 40));
      label.className = 'pxc-replychip__label';
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'pxc-replychip__x';
      x.textContent = '✕';
      x.setAttribute('aria-label', 'إلغاء الرد');
      x.addEventListener('click', clearReply);
      replyChip.appendChild(label); replyChip.appendChild(x);
      field.focus();
    }
    function clearReply() {
      replyTo = null;
      if (replyChip) replyChip.hidden = true;
    }

    /* ───────── تعديل رسالتي ───────── */
    function startEdit(d, key) {
      if (!d || typeof d.t !== 'string' || !curMsgListeners) return;
      clearReply();
      editingKey = key;
      editChip.hidden = false;
      editChip.innerHTML = '';
      var label = document.createElement('span');
      label.className = 'pxc-editchip__label';
      label.textContent = 'أنت تحرر رسالتك — ثم اضغط إرسال';
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'pxc-editchip__x';
      x.textContent = '✕';
      x.setAttribute('aria-label', 'إلغاء التعديل');
      x.addEventListener('click', cancelEdit);
      editChip.appendChild(label); editChip.appendChild(x);
      field.value = d.t;
      autosize(); sendForm();
      field.focus();
    }
    function cancelEdit() {
      editingKey = null;
      if (editChip) editChip.hidden = true;
    }

    function doSend() {
      if (send.disabled) return;
      var text = cleanMsg(field.value);
      if (!text) return;
      stopTyping();
      if (editingKey) {
        var upd = { t: text, ed: 1, edt: Date.now() };
        try { curMsgListeners.msgRef.child(editingKey).update(upd); } catch (e) {}
        cancelEdit();
        field.value = '';
        autosize(); sendForm();
        field.focus();
        return;
      }
      field.value = '';
      autosize(); sendForm();
      var rt = null;
      if (replyTo && replyTo.key) {
        rt = { n: replyTo.n, t: replyTo.t };
        if (replyTo.img) rt.img = replyTo.img;
      }
      pushMsg(rt ? { t: text, rt: rt, ts: Date.now() } : { t: text, ts: Date.now() });
      clearReply();
      field.focus();
    }

    /* ───────── خروج ───────── */
    function close() {
      if (detached) return;
      detached = true;
      if (roomPollTimer) { clearInterval(roomPollTimer); }
      closeRooms();
      sheets.slice().forEach(function (rm) { try { rm(); } catch (e) {} });
      stopTyping();
      if (typingLine) typingLine.hidden = true;
      clearReply();
      cancelEdit();
      var oldBtn = qs('.pxc-older', root);
      if (oldBtn) oldBtn.remove();
      var rxP = qs('.pxc-react-panel', root);
      if (rxP) rxP.remove();
      document.title = room.title;
      try { if (curMsgListeners) { curMsgListeners.presRef.off(); curMsgListeners.msgRef.off(); if (curMsgListeners.typingRef) curMsgListeners.typingRef.off(); curMsgListeners.myPres.remove(); curMsgListeners.myPres.onDisconnect().cancel(); } } catch (e) {}
      if (root.parentNode) root.parentNode.removeChild(root);
      document.removeEventListener('keydown', onKey, false);
    }
    function onKey(ev) {
      if (ev.key !== 'Escape') return;
      if (sheetClose()) return;
      if (closeRooms() !== undefined || roomsPanel) { closeRooms(); return; }
      if (emoPanel) { toggleEmoji(); return; }
      if (root.classList.contains('app-side')) { root.classList.remove('app-side'); return; }
    }
    function sheetClose() {
      if (sheets.length) { sheets[sheets.length - 1](); return true; }
      return false;
    }
    document.addEventListener('keydown', onKey, false);

    /* تهيئة القوائم الجانبية */
    renderRoomsList();
    scheduleRoomPoll();
    meBtn.addEventListener('click', function () { openProfile({ __me: true }); });
  }
})();