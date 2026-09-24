/**
 * اتصال Socket.io الاختياري — يُفعَّل عند ضبط VITE_SOCKET_URL.
 * في غياب الخادم تعمل المنصة عبر الحافلة المحلية (chatBus) بشكل كامل.
 */

import { io } from 'socket.io-client'
import { appendMessage } from './chatBus'
import { uid, pick, shuffle } from '../utils/className'
import { ambientUsers, ambientLines, autoReplies } from '../data/messages'

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || '').trim()

let socket = null
let socketEnabled = Boolean(SOCKET_URL)

export function isSocketEnabled() {
  return socketEnabled
}

export function getMode() {
  return socketEnabled ? 'live' : 'local'
}

function applyRemote(room) {
  socket.on('chat:message', (payload) => {
    const message = {
      id: payload.id || uid('net'),
      room,
      author: payload.author || 'زائر',
      text: payload.text,
      ts: Number(payload.ts) || Date.now(),
      own: false,
      system: false,
    }
    appendMessage(room, message)
  })
  socket.on('chat:join', (payload) => {
    appendMessage(room, {
      id: uid('sys'),
      room,
      author: 'نظام',
      text: `${payload.author || 'زائر'} انضم إلى الغرفة`,
      ts: Date.now(),
      own: false,
      system: true,
    })
  })
}

export function leaveRoom(room) {
  if (socket) {
    socket.emit('chat:leave', { room })
  }
}

export function connectRoom(room, nickname) {
  if (!socketEnabled) return { ok: false, local: true }
  try {
    if (!socket) {
      socket = io(SOCKET_URL, { transports: ['websocket'], reconnection: true })
    }
    applyRemote(room)
    socket.emit('chat:join', { room, nickname })
    return { ok: true, local: false }
  } catch {
    socketEnabled = false
    return { ok: false, local: true, fallback: true }
  }
}

export function sendRemote(room, nickname, text) {
  if (socket && socket.connected) {
    socket.emit('chat:message', { room, nickname, text })
    return true
  }
  return false
}

/**
 * محرك الأجواء الحيّة محلياً: نشاط دوري + ردود على رسائل المستخدم.
 * @returns {() => void} دالة الإيقاف
 */
export function startAmbient(room, nickname, { onMessage, onReply }) {
  const timers = []
  let nextReplyAt = Date.now() + 8000

  const loop = () => {
    const wait = 7000 + Math.floor(Math.random() * 11000)
    const id = setTimeout(() => {
      const user = pick(ambientUsers)
      const line = pick(ambientLines)
      onMessage?.({
        id: uid('amb'),
        room,
        author: user.name,
        emoji: user.emoji,
        text: line,
        ts: Date.now(),
        own: false,
        system: false,
      })
      loop()
    }, wait)
    timers.push(id)
  }

  const replyTimer = setInterval(() => {
    const now = Date.now()
    if (now < nextReplyAt) return
    const user = pick(ambientUsers)
    onReply?.({
      id: uid('amb'),
      room,
      author: user.name,
      emoji: user.emoji,
      text: pick(autoReplies),
      ts: Date.now(),
      own: false,
      system: false,
    })
    nextReplyAt = now + 18000 + Math.floor(Math.random() * 20000)
  }, 4000)
  timers.push(replyTimer)

  loop()

  return () => timers.forEach((t) => clearTimeout(t))
}

/**
 * قائمة أسماء مُولّدة عشوائياً لملء قائمة الحاضرين.
 */
export function fakeAttendees(room, seedCount) {
  return shuffle(ambientUsers)
    .slice(0, Math.min(seedCount, ambientUsers.length))
    .map((u) => ({ ...u }))
}

export default { isSocketEnabled, getMode, connectRoom, sendRemote, leaveRoom, startAmbient, fakeAttendees }