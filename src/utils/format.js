/** تنسيق الوقت بالعربية */
export function formatTime(ts) {
  return new Intl.DateTimeFormat('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(ts)
}

/** تاريخ نسبي بالعربية */
export function formatRelative(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  return `منذ ${days} يوم`
}

/** عدد جمهور نحسب به النشاط الوهمي في الوقت الحقيقي */
export function jitter(base, spread = 6) {
  return Math.max(0, base + Math.floor(Math.random() * spread) - Math.floor(spread / 2))
}

/** مدة زمنية عشوائية بين حدّين (بالمللي ثانية) */
export function randomDelay(minMs, maxMs) {
  return minMs + Math.floor(Math.random() * (maxMs - minMs))
}