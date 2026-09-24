/**
 * حافلة دردشة محلية: تخزين + مزامنة instant بين التبويبات عبر BroadcastChannel.
 * تُستخدم كطبقة تشغيل ثابتة (GitHub Pages) أو يمكن استبدالها ب Socket.io عبر socket.js.
 */

import { readJson, writeJson } from './storage'
import { uid } from '../utils/className'

const CHANNEL = 'iraqiachat:bus'
const KEY = (slug) => `history:${slug}`
const MAX_HISTORY = 120

let channel = null
const listen = new Set()

function ensureChannel() {
  if (channel) return channel
  if (typeof BroadcastChannel === 'undefined') return null
  channel = new BroadcastChannel(CHANNEL)
  channel.onmessage = (e) => {
    const { type, room, message } = e.data || {}
    if (type === 'message') {
      emit({ type, room, message })
    }
  }
  return channel
}

function emit(payload) {
  listen.forEach((cb) => {
    try {
      cb(payload)
    } catch {
      /* ignore */
    }
  })
}

export function subscribe(callback) {
  listen.add(callback)
  return () => listen.delete(callback)
}

export function getHistory(slug) {
  return readJson(KEY(slug), [])
}

export function seedHistory(slug, initialMessages) {
  const existing = getHistory(slug)
  if (existing.length) return existing
  const seeded = initialMessages.map((text, i) => ({
    id: uid('sys'),
    room: slug,
    author: 'نظام',
    text,
    ts: Date.now() - (initialMessages.length - i) * 9000,
    own: false,
    system: true,
  }))
  writeJson(KEY(slug), seeded)
  return seeded
}

export function appendMessage(room, message) {
  const history = getHistory(room)
  const next = [...history, message].slice(-MAX_HISTORY)
  writeJson(KEY(room), next)
  const ch = ensureChannel()
  if (ch) {
    ch.postMessage({ type: 'message', room, message })
  }
  emit({ type: 'message', room, message })
  return next
}

export function userMessage(room, author, text) {
  return appendMessage(room, {
    id: uid('msg'),
    room,
    author,
    text,
    ts: Date.now(),
    own: true,
    system: false,
  })
}

export function dropRoom(slug) {
  try {
    localStorage.removeItem(`chatiraq:${KEY(slug)}`)
  } catch {
    /* ignore */
  }
}

export default { subscribe, getHistory, seedHistory, appendMessage, userMessage, dropRoom }