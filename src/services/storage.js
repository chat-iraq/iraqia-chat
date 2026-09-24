/** وصول آمن إلى localStorage مع تسمية موحّدة */

const PREFIX = 'iraqiachat:'

export function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

export function clearNamespace() {
  try {
    const doomed = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) doomed.push(k)
    }
    doomed.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

export default { readJson, writeJson, removeKey, clearNamespace }