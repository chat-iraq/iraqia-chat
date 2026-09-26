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
          '<button type="button" class="pxc-icon pxc-icon--rooms" title="نافذة الغرف">🗂️<span>الغرف</span></button>' +
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
        '<footer class="pxc-composer">' +
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

    /* الحالة */
    var pro = loadPro();
    var me = { n: nick, a: pro.a, c: Math.floor(Math.random() * NAME_COLORS.length), s: pro.s };
    var room = { id: 'room-' + slug(), title: roomTitle(), desc: roomDesc() };
    var detached = false;
    var members = {};           /* جزئية presence */
    var firebaseReady = false;
    var db = null;
    var curMsgListeners = null;
    var lastMsg = null;         /* للتجميع */
    var roomPollTimer = null;
    var uploadBusy = false;

    function $(s) { return qs(s, root); }

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

    field.addEventListener('input', function () { autosize(); sendForm(); });
    function autosize() { field.style.height = 'auto'; field.style.height = Math.min(132, field.scrollHeight) + 'px'; }
    function sendForm() { var v = cleanMsg(field.value); var val = v && !uploadBusy && firebaseReady; send.disabled = !val; }
    field.addEventListener('keydown', function (ev) {
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
      var scripts = ['firebase-app-compat.js', 'firebase-database-compat.js'];
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
    loadFirebase(function () {
      appRef = window.firebase.initializeApp(cfg, 'ds-chat');
      db = window.firebase.database(appRef);
      firebaseReady = true;
      sendForm();
      attachRoom(function () {
        infoLine('تم الاتصال بالغرفة — تفضل أدردش!');
        field.focus();
      });
    }, function () {
      infoLine('تعذر تحميل خدمة الدردشة الآن — جرّب بعد قليل.');
    });

    /* ───────── الربط بالغرفة ───────── */
    function attachRoom(okCb) {
      var msgRef = db.ref('chat/' + room.id);
      var presRef = db.ref('presence/' + room.id);
      var myKey = tabKey();

      var myPres = presRef.child(myKey);
      myPres.onDisconnect().remove();
      myPres.set({ n: me.n, a: me.a, c: me.c, s: me.s, t: Date.now() });

      curMsgListeners = { msgRef: msgRef, presRef: presRef, myPres: myPres, myKey: myKey, on: true };

      presRef.on('value', function (snap) {
        if (detached || !curMsgListeners || !curMsgListeners.on) return;
        members = {};
        snap.forEach(function (ch) { members[ch.key] = ch.val() || {}; });
        renderMembers();
        updateCount();
      });

      msgRef.orderByChild('ts').limitToLast(80).on('child_added', function (snap) {
        if (detached || !curMsgListeners || !curMsgListeners.on) return;
        var d = snap.val();
        if (d && (d.t || d.img)) addMsg(d, snap.key);
      });

      var cutoff = Date.now() - 86400000;
      msgRef.orderByChild('ts').endAt(cutoff).limitToLast(200).once('value', function (snap) {
        if (detached || !snap.numChildren()) return;
        var updates = {};
        snap.forEach(function (ch) { updates[ch.key] = null; });
        msgRef.update(updates);
      });

      if (okCb) okCb();
    }

    function detachRoom() {
      if (!curMsgListeners) return;
      var L = curMsgListeners;
      L.on = false;
      try { L.presRef.off(); L.msgRef.off(); L.myPres.remove(); L.myPres.onDisconnect().cancel(); } catch (e) {}
      curMsgListeners = null;
    }

    function switchRoom(id, title) {
      if (!firebaseReady || !curMsgListeners || id === room.id) { closeRooms(); return; }
      detachRoom();
      room = { id: id, title: title || id, desc: '' };
      titleEl.textContent = room.title;
      feed.innerHTML = '';
      lastMsg = null;
      members = {};
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
      Object.keys(members).forEach(function (k) { list.push(members[k]); });
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
        row('الحالة', isMe ? 'متصل في الغرفة' : ((m && Object.prototype.hasOwnProperty.call(m, 'n')) ? 'متصل في الغرفة' : 'غير معروف'));
        body.appendChild(rows);

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
            me.s = cleanStatus(ta.value);
            savePro(me);
            updateMyPresence();
            st.textContent = me.s || 'لم يكتب حالة بعد';
            toast('حُفظ ملفك الشخصي ✓', 1500);
          });
          f2.appendChild(bt);
          body.appendChild(f2);
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
      var name = String(d.n || 'زائر').slice(0, 20);
      var text = (typeof d.t === 'string') ? d.t : '';
      var isMe = name === me.n && (d.c === undefined || d.c === me.c);
      var row = document.createElement('div');
      row.className = 'pxc-msg' + (isMe ? ' pxc-msg--me' : '');

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
      body.appendChild(who);

      if (text) {
        var tx = document.createElement('span');
        tx.className = 'pxc-msg__text';
        tx.innerHTML = emojiAndSafe(text);
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

      row.appendChild(body);

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
      while (feed.children.length > 250) feed.removeChild(feed.firstChild);
      scrollBottom();
    }
    var lastDay = 0;
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
      var payload = { n: me.n, a: me.a, c: me.c, ts: data.ts || Date.now() };
      if (data.t) payload.t = data.t;
      if (data.img) { payload.img = data.img; if (data.w) payload.w = data.w; if (data.h) payload.h = data.h; }
      try { curMsgListeners.msgRef.push(payload); } catch (e) {}
    }

    function doSend() {
      if (send.disabled) return;
      var text = cleanMsg(field.value);
      if (!text) return;
      field.value = '';
      autosize(); sendForm();
      pushMsg({ t: text, ts: Date.now() });
      field.focus();
    }

    /* ───────── خروج ───────── */
    function close() {
      if (detached) return;
      detached = true;
      if (roomPollTimer) { clearInterval(roomPollTimer); }
      closeRooms();
      sheets.slice().forEach(function (rm) { try { rm(); } catch (e) {} });
      try { if (curMsgListeners) { curMsgListeners.presRef.off(); curMsgListeners.msgRef.off(); curMsgListeners.myPres.remove(); curMsgListeners.myPres.onDisconnect().cancel(); } } catch (e) {}
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