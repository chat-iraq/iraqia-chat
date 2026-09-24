/** دمج أسماء الفئات بأمان */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

/** توليد معرّف فريد */
export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** خلط قائمة (Fisher–Yates) */
export function shuffle(source) {
  const arr = source.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** اختيار عنصر عشوائي */
export function pick(source) {
  return source[Math.floor(Math.random() * source.length)]
}