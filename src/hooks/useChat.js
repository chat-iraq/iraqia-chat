import { useCallback, useEffect, useMemo, useState } from 'react'
import { seedHistory, appendMessage, subscribe } from '../services/chatBus'
import { connectRoom, leaveRoom, sendRemote, isSocketEnabled, startAmbient, fakeAttendees } from '../services/socket'
import { useLocalStorage } from './useLocalStorage'
import { uid, pick, shuffle } from '../utils/className'
import { jitter, randomDelay } from '../utils/format'
import { autoReplies } from '../data/messages'

const VISIBLE_ATTENDEES = 38

/**
 * محرك الغرفة: تاريخ الرسائل، الحاضرون، الإرسال، والأجواء الحيّة.
 * @param {import('../types').ChatRoom} room
 */
export function useChat(room) {
  const [nickname, setNickname] = useLocalStorage('nickname', 'زائر درر العرب')
  const [messages, setMessages] = useState(() => seedHistory(room.slug, room ? starterFor(room) : []))
  const [attendees, setAttendees] = useState(() => fakeAttendees(room.slug, Math.min(room.online, VISIBLE_ATTENDEES)))
  const [onlineCount, setOnlineCount] = useState(() => room.online)
  const [typing, setTyping] = useState(() => new Set())
  const [mode, setMode] = useState(() => (isSocketEnabled() ? 'live' : 'local'))

  useEffect(() => {
    setMessages(seedHistory(room.slug, starterFor(room)))

    const unsub = subscribe(({ type, room: r, message }) => {
      if (type === 'message' && r === room.slug) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev
          return [...prev, message].slice(-120)
        })
        setTyping((prev) => {
          if (!prev.size) return prev
          const next = new Set(prev)
          next.delete(message.author)
          return next
        })
      }
    })

    const conn = connectRoom(room.slug, nickname)
    setMode(isSocketEnabled() ? 'live' : 'local')
    const stopAmbient = startAmbient(room.slug, nickname, {
      onMessage: (message) => appendMessage(room.slug, message),
      onReply: (message) => appendMessage(room.slug, message),
    })

    const onlineTimer = setInterval(() => {
      setOnlineCount((prev) => jitter(prev))
      setAttendees(() => shuffle(fakeAttendees(room.slug, Math.min(room.online, VISIBLE_ATTENDEES) || 30)))
    }, 9000)

    return () => {
      unsub()
      stopAmbient()
      clearInterval(onlineTimer)
      leaveRoom(room.slug)
    }
  }, [room.slug, nickname])

  const send = useCallback(
    (rawText) => {
      const text = rawText.trim()
      if (!text) return

      const ok = sendRemote(room.slug, nickname, text)
      if (!ok) {
        appendMessage(room.slug, {
          id: uid('msg'),
          room: room.slug,
          author: nickname,
          text,
          ts: Date.now(),
          own: true,
          system: false,
        })
      }

      const replier = pick(['علي', 'مريم', 'زهراء', 'جوان', 'سارة', 'نشمي', 'دلير'])
      setTyping((prev) => new Set(prev).add(replier))
      setTimeout(() => {
        setTyping((prev) => {
          const next = new Set(prev)
          next.delete(replier)
          return next
        })
        appendMessage(room.slug, {
          id: uid('amb'),
          room: room.slug,
          author: replier,
          text: pick(autoReplies),
          ts: Date.now(),
          own: false,
          system: false,
        })
      }, randomDelay(1400, 3600))
    },
    [room.slug, nickname],
  )

  const online = useMemo(() => ({ count: onlineCount, list: attendees }), [onlineCount, attendees])

  return { nickname, setNickname, messages, send, attendees: online, typing, mode }
}

function starterFor(room) {
  return [
    `أهلاً بيكم في غرفة ${room.name} ${room.emoji} — منو جاي أول مرة؟`,
    `الغرفة حاضرة، نوّرتوا 🌟`,
    `يلا نبلّش الدردشة ونتعرف على بعض بالتعليقات`,
  ]
}

export default useChat