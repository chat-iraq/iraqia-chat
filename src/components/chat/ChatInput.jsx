import { useState } from 'react'
import { EmojiPicker } from './EmojiPicker'

/** حقل إدخال الدردشة مع الإرسال عبر Enter أو الزر */
export function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')

  const submit = () => {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="relative flex items-end gap-2 border-t border-white/10 bg-night-800/80 p-3">
      <EmojiPicker onPick={(emoji) => setValue((v) => v + emoji)} />

      <div className="relative flex-1">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          aria-label="اكتب رسالتك"
          placeholder="اكتب رسالتك هنا…"
          disabled={disabled}
          className="input max-h-32 min-h-[2.75rem] resize-none overflow-y-auto py-2.5 scrollbar-thin"
          style={{ fieldSizing: 'content' }}
        />
        <span className="pointer-events-none absolute bottom-2 start-3 text-xs text-slate-600 hidden" aria-hidden="true">
          Enter للإرسال · Shift+Enter لسطر جديد
        </span>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="إرسال الرسالة"
        className="btn-primary h-[2.75rem] shrink-0 px-4 text-base"
      >
        إرسال
        <span aria-hidden="true" className="inline-block -scale-x-100">
          ➤
        </span>
      </button>
    </div>
  )
}

export default ChatInput