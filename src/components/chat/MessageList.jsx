import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

/** قائمة الرسائل مع تمرير تلقائي نحو الأحدث */
export function MessageList({ messages, nickname, typingNames }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, typingNames.size])

  return (
    <ul className="flex-1 space-y-1 overflow-y-auto py-3 scrollbar-thin">
      <li className="px-4 py-2">
        <div className="surface flex items-start gap-3 p-3 text-xs text-slate-400">
          <span aria-hidden="true" className="text-base">💡</span>
          <p className="leading-relaxed">
            أهلاً بك في الدردشة! احترم الجميع، تجنّب الإساءة، ولا تشارك معلوماتك الشخصية مع الغرباء.
          </p>
        </div>
      </li>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} nickname={nickname} />
      ))}
      {typingNames.length > 0 && <TypingIndicator names={typingNames} />}
      <li ref={endRef} className="h-px" />
    </ul>
  )
}

export default MessageList