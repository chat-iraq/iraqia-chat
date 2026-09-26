/* forum.js — progressive enhancement for the static forum. No network, no
   auth, no dependencies: if this file never runs, every page still works.
   Loaded on all /Forum/ pages. See forum-live.js for the RTDB layer. */
(function () {
  'use strict'

  var AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  var rtf = null
  try {
    rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' })
  } catch (e) {}

  /* ---------------------------------------------------- arabic timestamps */
  function relTime(iso) {
    var then = new Date(iso).getTime()
    if (!then) return ''
    var diff = Math.round((then - Date.now()) / 1000) /* negative = past */
    var abs = Math.abs(diff)
    var v
    if (abs < 45) return diff < 0 ? 'الآن' : 'بعد لحظات'
    if (abs < 3600) { v = Math.round(diff / 60); return rtf ? rtf.format(v, 'minute') : (diff < 0 ? 'قبل ' + -v + ' دقيقة' : 'بعد ' + v + ' دقيقة') }
    if (abs < 86400) { v = Math.round(diff / 3600); return rtf ? rtf.format(v, 'hour') : (diff < 0 ? 'قبل ' + -v + ' ساعة' : 'بعد ' + v + ' ساعة') }
    if (abs < 2592000) { v = Math.round(diff / 86400); return rtf ? rtf.format(v, 'day') : (diff < 0 ? 'قبل ' + -v + ' يوم' : 'بعد ' + v + ' يوم') }
    if (abs < 31536000) { v = Math.round(diff / 2592000); return rtf ? rtf.format(v, 'month') : '' }
    v = Math.round(diff / 31536000)
    return rtf ? rtf.format(v, 'year') : ''
  }

  function absoluteTime(iso) {
    var d = new Date(iso)
    if (!d || isNaN(d)) return ''
    var h = d.getHours()
    var m = d.getMinutes()
    var ampm = h < 12 ? 'ص' : 'م'
    var h12 = h % 12 || 12
    return d.getDate() + ' ' + AR_MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' — ' + h12 + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm
  }

  function paintTimes() {
    var nodes = document.querySelectorAll('time[data-ts]')
    for (var i = 0; i < nodes.length; i++) {
      var iso = nodes[i].getAttribute('data-ts')
      var txt = relTime(iso)
      if (txt) {
        nodes[i].textContent = txt
        nodes[i].setAttribute('title', absoluteTime(iso))
      }
    }
  }

  /* ------------------------------------------------------------- search */
  function normalise(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ىي]/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[ً-ْـ]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function initSearch() {
    var form = document.getElementById('fmSearch')
    var input = document.getElementById('fmQ')
    var list = document.getElementById('fmList')
    if (!form || !input || !list) return
    var rows = [].slice.call(list.querySelectorAll('.fm-row'))
    var empty = document.getElementById('fmNoResult')
    var counter = document.getElementById('fmCount')

    function apply() {
      var q = normalise(input.value)
      var shown = 0
      for (var i = 0; i < rows.length; i++) {
        var hay = rows[i].getAttribute('data-search') || ''
        var hit = !q || normalise(hay).indexOf(q) !== -1
        rows[i].hidden = !hit
        if (hit) shown++
      }
      if (empty) empty.hidden = shown !== 0
      if (counter) counter.textContent = q ? shown + ' / ' + rows.length : ''
      if (q) {
        /* only touch history when the visitor actually submits */
      }
    }

    var params = new URLSearchParams(location.search)
    if (params.get('q')) input.value = params.get('q')
    apply()

    input.addEventListener('input', apply)
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      apply()
      var u = new URL(location.href)
      if (input.value.trim()) u.searchParams.set('q', input.value.trim())
      else u.searchParams.delete('q')
      history.replaceState(null, '', u)
      list.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  /* ------------------------------------------------------- copy link btn */
  function initCopy() {
    var btn = document.getElementById('fmCopy')
    if (!btn) return
    btn.addEventListener('click', function () {
      var done = function () {
        var old = btn.textContent
        btn.textContent = 'تم نسخ الرابط'
        setTimeout(function () { btn.textContent = old }, 1600)
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(done, function () {})
      }
    })
  }

  /* --------------------------------------------------------------- boot */
  function boot() {
    paintTimes()
    initSearch()
    initCopy()
    setInterval(paintTimes, 60000)

    /* forum-live.js re-renders reply nodes; re-localise their timestamps */
    document.addEventListener('forum:render', function () { paintTimes() })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
