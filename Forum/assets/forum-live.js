/* forum-live.js — RTDB layer for /Forum/.
 *
 * Reuses the site's Firebase project and its lazy compat-SDK loader style
 * (assets/chat.js), but under its own named app so the forum never disturbs
 * an open chat room.
 *
 * Data model (all under the `forum/` root, see forum-rules.json):
 * Every path is namespaced per site by CHAT_FIREBASE.roomPrefix, because
 * chat-iraq.com and iraqia-chat.com share ONE Firebase project. Without
 * this the two brands would read and write each other's threads.
 *
 *   forum/<prefix>/counts/<topicId>          number        reply counter
 *   forum/<prefix>/<cat>/<topicId>           {t,b,u,n,ts}  staff write
 *   forum/<prefix>/<cat>/<topicId>/r/<rid>   {t,u,n,ts}    author writes
 *   forum/<prefix>/votes/<topicId>/<uid>     true          own uid only
 *   forum/<prefix>/read/<uid>/<topicId>      ts            own uid only
 *   forum/<prefix>/reports/<rid>             {t,u,ts,why}  member creates
 *   forum/<prefix>/pending/<pid>             {..,state}    member asks
 *   forum/<prefix>/rate/<uid>/<bucket>       ts            1 write / 20s
 *   forum/staff/<uid>                        {n,ts}        NOT client-writable
 *
 * Every write goes through a rate bucket so the Spark plan (no Cloud
 * Functions) still gets server-side throttling via RTDB rules.
 *
 * If Firebase cannot load, the page keeps working: this file only ever adds
 * to what is already rendered.
 */
(function () {
  'use strict'

  var cfg = window.CHAT_FIREBASE || null
  var DATA = window.FORUM_DATA || null
  if (!cfg || !DATA) return

  /* Cosmetic display only. It grants NO access: moderation is decided by the
     forum/staff/<uid> node, which only a privileged writer can create. */
  var STAFF_BADGE = { Kaz: 1, alwadi: 1 }

  /* per-site namespace: both brands share one RTDB instance */
  var NS = 'forum/' + (cfg.roomPrefix || 'default')

  var db = null
  var authRef = null
  var me = { uid: null, nick: '' }
  var nick = ''
  try { nick = (localStorage.getItem('ds-nick') || '').trim().slice(0, 24) } catch (e) {}

  var $ = function (s, r) { return (r || document).querySelector(s) }
  var el = function (tag, cls, txt) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (txt !== undefined) n.textContent = txt
    return n
  }

  /* ------------------------------------------------------------- SDK load */
  function loadFirebase(cb, fail, depth) {
    if (window.firebase && window.firebase.database && window.firebase.initializeApp) return cb()
    var base = 'https://www.gstatic.com/firebasejs/10.12.2/'
    var files = ['firebase-app-compat.js', 'firebase-database-compat.js', 'firebase-auth-compat.js']
    var i = depth || 0
    if (i >= files.length) return fail && fail()
    var s = document.createElement('script')
    s.src = base + files[i]
    s.onload = function () { loadFirebase(cb, fail, i + 1) }
    s.onerror = function () { fail && fail() }
    document.head.appendChild(s)
  }

  /* --------------------------------------------------------- rate limiter */
  /* one write per uid per window; enforced by rules, not by this file */
  function rateBucket() {
    var w = Math.floor(Date.now() / 20000) /* 20s */
    return { path: NS + '/rate/' + me.uid + '/' + w, id: String(w) }
  }
  function spendRate() {
    var b = rateBucket()
    return db.ref(b.path)
      .transaction(function (cur) {
        return cur === null ? Date.now() : undefined /* abort if already used */
      })
      .then(function (res) { return { committed: res.committed, k: b.id } })
  }

  /* URL-safe topic id: ascii from the title when possible, always suffixed
     with the tail of the push key so two identical titles never collide. */
  function topicId(title, pushKey) {
    var base = String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .replace(/-+$/, '')
    if (base.length < 3) base = 'q'
    return base + '-' + String(pushKey).slice(-6)
  }

  function hint(node, msg, kind) {
    if (!node) return
    node.textContent = msg
    node.className = 'fm-hint' + (kind ? ' is-' + kind : '')
  }

  /* ---------------------------------------------------------------- counts */
  function paintCounts(map) {
    var nodes = document.querySelectorAll('[data-count-for]')
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].getAttribute('data-count-for')
      var n = (map && map[id]) || 0
      nodes[i].textContent = n ? String(n) : '٠'
    }
  }
  function watchCounts() {
    db.ref(NS + '/counts').on('value', function (s) { paintCounts(s.val() || {}) })
  }
  function bumpCount(id, by) {
    db.ref(NS + '/counts/' + id).transaction(function (n) { return (Number(n) || 0) + by })
  }

  /* ---------------------------------------------------------- topic page */
  function topicPage() {
    var live = document.getElementById('fmLive')
    if (!live) return
    var id = live.getAttribute('data-topic')
    var cat = live.getAttribute('data-cat')
    var box = document.getElementById('fmReplies')
    var form = document.getElementById('fmCompose')
    var text = document.getElementById('fmText')
    var msg = document.getElementById('fmHint')
    var repliesRef = db.ref(NS + '/' + cat + '/' + id + '/r')

    function render(val) {
      if (!box) return
      box.textContent = ''
      var keys = Object.keys(val || {}).sort(function (a, b) { return (val[a].ts || 0) - (val[b].ts || 0) })
      if (!keys.length) {
        box.appendChild(el('p', 'fm-empty', 'لم تُكتب ردود بعد — كن أول من يشارك.'))
        return
      }
      for (var i = 0; i < keys.length; i++) {
        var r = val[keys[i]]
        var wrap = el('article', 'fm-reply' + (STAFF_BADGE[r.n] ? ' is-staff' : ''))
        var head = el('p', 'fm-reply-head')
        head.appendChild(el('span', 'fm-reply-who', r.n || 'عضو'))
        if (STAFF_BADGE[r.n]) head.appendChild(el('span', 'fm-badge fm-badge--ok', 'إدارة'))
        var tm = el('time', '', '')
        tm.setAttribute('data-ts', new Date(r.ts || Date.now()).toISOString())
        head.appendChild(tm)
        wrap.appendChild(head)
        wrap.appendChild(el('p', 'fm-reply-body', r.t || ''))
        box.appendChild(wrap)
      }
      try { document.dispatchEvent(new CustomEvent('forum:render')) } catch (e) {}
    }

    repliesRef.on('value', function (s) { render(s.val()) })

    if (form) {
      form.hidden = false
      if (!nick) hint(msg, 'اكتب اسمًا في صفحة الدردشة ليظهر ردك باسمك.', 'error')
      form.addEventListener('submit', function (e) {
        e.preventDefault()
        var v = String(text.value || '').replace(/\s+/g, ' ').trim()
        if (v.length < 2) return hint(msg, 'اكتب ردودًا مفيدة من فضلك.', 'error')
        if (v.length > 1200) return hint(msg, 'الرد طويل جدًا (الحد 1200 حرف).', 'error')
        if (!nick) return hint(msg, 'أدخل اسمًا أولًا.', 'error')
        if (!me.uid) return hint(msg, 'تعذّر التحقق من الجلسة، أعد تحميل الصفحة.', 'error')
        var btn = form.querySelector('button[type=submit]')
        btn.disabled = true
        hint(msg, 'جارٍ الإرسال…')
        spendRate()
          .then(function (res) {
            if (!res.committed) throw new Error('rate')
            return repliesRef.push({ t: v, u: me.uid, n: nick, ts: Date.now(), s: 0 })
          })
          .then(function () {
            bumpCount(id, 1)
            text.value = ''
            hint(msg, 'تم نشر ردك.', 'ok')
          })
          .catch(function (err) {
            hint(msg, err && err.message === 'rate' ? 'تمهّل قليلًا قبل إرسال رد جديد.' : 'تعذّر الإرسال، حاول مجددًا.', 'error')
          })
          .then(function () { btn.disabled = false })
      })
    }

    /* read marker */
    if (me.uid) db.ref(NS + '/read/' + me.uid + '/' + id).set(Date.now()).catch(function () {})

    /* like */
    var vote = document.getElementById('fmVote')
    var voteN = document.querySelector('[data-vote-for]')
    if (vote) {
      var vref = db.ref(NS + '/votes/' + id)
      vref.on('value', function (s) {
        var n = 0
        var mine = false
        s.forEach(function (c) { n++; if (c.val() === true && me.uid && c.key === me.uid) mine = true })
        if (voteN) voteN.textContent = n ? String(n) : '٠'
        vote.setAttribute('aria-pressed', mine ? 'true' : 'false')
      })
      vote.addEventListener('click', function () {
        if (!me.uid) return hint(msg, 'سجّل الدخول أولًا.', 'error')
        var r = db.ref(NS + '/votes/' + id + '/' + me.uid)
        r.once('value', function (s) {
          if (s.val() === true) r.remove()
          else r.set(true)
        })
      })
    }

    /* report */
    var rep = document.getElementById('fmReport')
    if (rep) {
      var asked = false
      rep.addEventListener('click', function () {
        if (asked) return
        var why = window.prompt('سبب الإبلاغ (اكتب «إزعاج» أو «محتوى مخالف»):')
        if (!why) return
        asked = true
        db.ref(NS + '/reports').push({ t: id, u: me.uid, n: nick || 'زائر', ts: Date.now(), why: String(why).slice(0, 200), cat: cat })
          .then(function () { hint(msg, 'شكرًا، بلّغنا عن الموضوع للمراجعة.', 'ok') })
          .catch(function () { asked = false; hint(msg, 'تعذّر الإرسال.', 'error') })
      })
    }
  }

  /* -------------------------------------------------------------- ask page */
  function askPage() {
    var form = document.getElementById('fmAsk')
    if (!form) return
    var msg = document.getElementById('askHint')
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var title = String(form.title.value || '').trim()
      var body = String(form.body.value || '').trim()
      var cat = form.cat.value
      if (title.length < 8) return hint(msg, 'العنوان قصير جدًا.', 'error')
      if (body.length < 15) return hint(msg, 'اشرح السؤال أكثر قليلًا.', 'error')
      var btn = form.querySelector('button[type=submit]')
      btn.disabled = true
      hint(msg, 'جارٍ الإرسال…')
      var tags = String(form.tags.value || '').split(/[\s,،]+/).filter(Boolean).slice(0, 5)
      spendRate()
        .then(function (res) {
          if (!res.committed) throw new Error('rate')
          return db.ref(NS + '/pending').push({
            t: title.slice(0, 140),
            b: body.slice(0, 2000),
            cat: cat,
            tags: tags,
            u: me.uid,
            n: nick || 'زائر',
            ts: Date.now(),
            k: res.k,
            state: 'pending'
          })
        })
        .then(function () {
          form.reset()
          hint(msg, 'وصل سؤالك، سيظهر بعد مراجعة الإدارة.', 'ok')
        })
        .catch(function (err) {
          hint(msg, err && err.message === 'rate' ? 'تمهّل قليلًا قبل إرسال سؤال جديد.' : 'تعذّر الإرسال.', 'error')
        })
        .then(function () { btn.disabled = false })
    })
  }

  /* ------------------------------------------------------------ staff page */
  function staffPage() {
    var host = document.getElementById('fmStaff')
    if (!host) return

    function denied() {
      host.setAttribute('data-state', 'denied')
      host.textContent = ''
      var p = el('p', 'fm-empty', 'هذه المنطقة للإدارة فقط. سجّل الدخول بحساب إدارة لعرض قائمة المراجعة.')
      host.appendChild(p)

      /* Nobody can grant staff from the browser - the rules deny writes to
         forum/staff/<uid> on purpose. So show the account's own uid and let
         the owner paste it into bootstrap-staff.mjs. Without this the owner
         has no way to learn which uid to grant. */
      if (!me.uid) {
        var anon = el('p', 'fm-state', 'تعذّر الحصول على معرّف الحساب. أعد تحميل الصفحة بعد تسجيل الدخول.')
        host.appendChild(anon)
        return
      }
      var w = el('div', 'fm-staff-item')
      w.appendChild(el('h3', '', 'معرّف حسابك (uid)'))
      w.appendChild(el('p', 'fm-state', 'أرسل هذا المعرّف لصاحب المشروع، أو نفّذ نيابةً عنه:'))
      w.appendChild(el('code', 'fm-code', me.uid))
      var row = el('div', 'fm-staff-acts')
      var cp = el('button', 'fm-btn fm-btn--ghost', 'نسخ المعرّف')
      cp.type = 'button'
      cp.addEventListener('click', function () {
        var m = el('p', 'fm-state', '')
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(me.uid).then(function () { m.textContent = 'نُسخ المعرّف ✔' }, function () { m.textContent = me.uid })
        } else m.textContent = me.uid
        w.appendChild(m)
      })
      row.appendChild(cp)
      var cmd = el('code', 'fm-code', 'node scripts/bootstrap-staff.mjs --uid ' + me.uid)
      row.appendChild(cmd)
      w.appendChild(row)
      host.appendChild(w)
    }

    function card(o, acts) {
      var d = el('div', 'fm-staff-item')
      d.appendChild(el('h3', '', o.t || '(بلا عنوان)'))
      var meta = el('p', 'fm-state', (o.n || 'زائر') + ' — ' + new Date(o.ts || Date.now()).toLocaleString('ar'))
      d.appendChild(meta)
      if (o.b) d.appendChild(el('p', 'fm-reply-body', o.b))
      if (o.why) d.appendChild(el('p', 'fm-reply-body', 'سبب الإبلاغ: ' + o.why))
      var row = el('div', 'fm-staff-acts')
      acts.forEach(function (a) {
        var b = el('button', 'fm-btn fm-btn--ghost', a.label)
        b.type = 'button'
        b.addEventListener('click', a.run)
        row.appendChild(b)
      })
      d.appendChild(row)
      return d
    }

    function render() {
      host.setAttribute('data-state', 'ready')
      host.textContent = ''
      var head = el('h2', 'fm-h2', 'بانتظار المراجعة')
      host.appendChild(head)

      db.ref(NS + '/pending').orderByChild('ts').on('value', function (s) {
        var wrap = el('div')
        var any = false
        s.forEach(function (c) {
          var o = c.val()
          if (!o || o.state !== 'pending') return
          any = true
          wrap.appendChild(
            card(o, [
              {
                label: 'اعتماد ونشر',
                run: function () {
                  /* the id must be identical in RTDB and in data/forum.json, so the
                     static page, the reply list, the counters and the votes all
                     agree. Derive it from the push key -> always unique. */
                  var id = topicId(o.t, c.key)
                  db.ref(NS + '/' + o.cat + '/' + id)
                    .set({ t: o.t, b: o.b, u: o.u, n: o.n, ts: o.ts, tags: o.tags || [], cat: o.cat, approved: true })
                    .then(function () { return db.ref(NS + '/counts/' + id).set(0) })
                    .then(function () {
                      return db.ref(NS + '/pending/' + c.key).update({ state: 'approved', pid: id })
                    })
                    .then(function () {
                      window.alert('تم الاعتماد. العنوان النهائي:\n/Forum/t/' + id + '/\n\nالخطوة التالية: نزّل البيانات من هذه الصفحة ثم شغّل:\nnode scripts/promote-topic.mjs && npm run forum:build')
                    })
                    .catch(function (e) { window.alert('تعذّر الاعتماد: ' + e.message) })
                }
              },
              { label: 'رفض', run: function () { db.ref(NS + '/pending/' + c.key + '/state').set('rejected') } }
            ])
          )
        })
        if (!any) wrap.appendChild(el('p', 'fm-empty', 'لا توجد مواضيع بانتظار المراجعة.'))
        host.appendChild(wrap)
      })

      /* ---------------------------------------------------------------- *
       * Awaiting publish. An approved thread is live in RTDB but has no
       * HTML page yet: this is a static host with no server to render it.
       * The operator exports the JSON here, runs promote-topic.mjs, then
       * forum:build. That is what makes the topic indexable and shareable.
       * ---------------------------------------------------------------- */
      var publishBox = el('div')

      function toData(o, pid) {
        return {
          id: pid,
          slug: String(o.t || '').trim().replace(/\s+/g, '-').slice(0, 70),
          cat: o.cat,
          tags: Array.isArray(o.tags) ? o.tags : [],
          pinned: false,
          title: String(o.t || '').slice(0, 140),
          author: { name: String(o.n || 'عضو').slice(0, 24) },
          datePublished: new Date(o.ts || Date.now()).toISOString(),
          body: String(o.b || '').slice(0, 2000)
        }
      }

      function renderPublish(list) {
        publishBox.textContent = ''
        var h = el('h2', 'fm-h2', 'معتمدة — بانتظار إنشاء الصفحة')
        publishBox.appendChild(h)

        if (!list.length) {
          publishBox.appendChild(el('p', 'fm-empty', 'لا توجد مواضيع معتمدة تنتظر النشر.'))
          host.appendChild(publishBox)
          return
        }

        var dl = el('p', 'fm-hint',
          'المواضيع أدناه معتمدة ومكتوبة في قاعدة البيانات، لكنها بلا صفحة HTML بعد. ' +
          'نزّل الملف ثم نفّذ الأمرين في مجلد المشروع: ' +
          'node scripts/promote-topic.mjs ثم npm run forum:build — لتصبح قابلة للفهرسة والمشاركة.')
        publishBox.appendChild(dl)

        var payload = []
        list.forEach(function (row) {
          payload.push(toData(row.o, row.pid))
          var url = location.origin + '/Forum/t/' + row.pid + '/'

          var d = el('div', 'fm-staff-item')
          d.appendChild(el('h3', '', row.o.t || '(بلا عنوان)'))
          var meta = el('p', 'fm-state', (row.o.n || 'زائر') + ' — ' + new Date(row.o.ts || Date.now()).toLocaleString('ar'))
          d.appendChild(meta)
          d.appendChild(el('p', 'fm-reply-body', row.o.b || ''))
          d.appendChild(el('code', 'fm-code', url))
          var acts = el('div', 'fm-staff-acts')
          var copy = el('button', 'fm-btn fm-btn--ghost', 'نسخ رابط الموضوع')
          copy.type = 'button'
          copy.addEventListener('click', function () {
            var done = function () { hint(meta, 'نُسخ الرابط ✔', 'ok') }
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () {})
            else hint(meta, 'انسخه يدويًا: ' + url, 'ok')
          })
          acts.appendChild(copy)

          var open = el('a', 'fm-btn fm-btn--ghost', 'فتح')
          open.href = '/Forum/t/' + row.pid + '/'
          open.target = '_blank'
          open.rel = 'noopener'
          acts.appendChild(open)

          var undo = el('button', 'fm-btn fm-btn--ghost', 'إلغاء الاعتماد')
          undo.type = 'button'
          undo.addEventListener('click', function () {
            db.ref(NS + '/' + row.o.cat + '/' + row.pid).remove()
              .then(function () { return db.ref(NS + '/counts/' + row.pid).remove() })
              .then(function () { return db.ref(NS + '/pending/' + row.key).update({ state: 'pending', pid: null }) })
              .catch(function (e) { window.alert('تعذّر الإلغاء: ' + e.message) })
          })
          acts.appendChild(undo)

          d.appendChild(acts)
          publishBox.appendChild(d)
        })

        var dl2 = el('div', 'fm-staff-acts')
        var save = el('button', 'fm-btn', 'تنزيل المواضيع المعتمدة (data/pending-topics.json)')
        save.type = 'button'
        save.addEventListener('click', function () {
          var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
          var a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = 'pending-topics.json'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(function () { URL.revokeObjectURL(a.href) }, 1000)
          hint(dl, 'نزّل الملف — ضعه في data/ ثم شغّل promote-topic.mjs', 'ok')
        })
        dl2.appendChild(save)
        publishBox.appendChild(dl2)

        host.appendChild(publishBox)
      }

      var publishRows = []
      db.ref(NS + '/pending').orderByChild('ts').on('value', function (s) {
        publishRows = []
        s.forEach(function (c) {
          var o = c.val()
          if (!o || o.state !== 'approved' || !o.pid) return
          publishRows.push({ o: o, pid: o.pid, key: c.key })
        })
        renderPublish(publishRows)
      })

      db.ref(NS + '/reports').orderByChild('ts').limitToLast(25).on('value', function (s) {
        var h = el('h2', 'fm-h2', 'البلاغات')
        host.appendChild(h)
        var wrap = el('div')
        var any = false
        s.forEach(function (c) {
          any = true
          wrap.appendChild(
            card({ t: 'موضوع: ' + c.val().t, why: c.val().why, n: c.val().n, ts: c.val().ts }, [
              { label: 'تجاهل', run: function () { db.ref(NS + '/reports/' + c.key).remove() } }
            ])
          )
        })
        if (!any) wrap.appendChild(el('p', 'fm-empty', 'لا توجد بلاغات.'))
        host.appendChild(wrap)
      })
    }

    db.ref('forum/staff/' + me.uid).once('value', function (s) {
      if (s.exists()) render()
      else denied()
    })
  }

  /* ----------------------------------------------------------------- boot */
  loadFirebase(function () {
    try {
      var app = window.firebase.initializeApp(cfg, 'ds-forum')
      db = window.firebase.database(app)
    } catch (e) { return }

    if (!window.firebase.auth) { afterAuth(); return }
    authRef = window.firebase.auth(app)
    authRef.signInAnonymously().then(afterAuth, function () { afterAuth() })

    function afterAuth(user) {
      me.uid = (user && user.uid) || null
      if (db) {
        try { db.goOnline() } catch (e) {}
      }
      watchCounts()
      topicPage()
      askPage()
      staffPage()
    }
  }, function () { /* offline: static pages stay as-is */ })
})()
