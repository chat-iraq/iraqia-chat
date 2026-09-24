import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Badge } from '../ui/Badge'

/**
 * منطقة الدردشة الكبرى: ترويسة الغرفة + الرسائل + حقل الإدخال.
 * @param {{ room: any; messages: any[]; nickname: string; typing: Set<string>; onSend: (t: string) => void; mode: string }} props
 */
export function ChatArea({ room, messages, nickname, typing, onSend, mode }) {
  return (
    <section className="flex h-[calc(100dvh-10rem)] min-h-[26rem] flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-night-800/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">{room.emoji}</span>
          <div>
            <h1 className="font-display text-base font-bold text-slate-50">{room.name}</h1>
            <p className="text-xs text-slate-400">غرفة المحادثة المباشرة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="mint" dot className="hidden sm:inline-flex">
            {room.online}+ متصل
          </Badge>
          <Badge tone="slate">{mode === 'live' ? 'مباشر' : 'فوري'}</Badge>
        </div>
      </header>

      <MessageList messages={messages} nickname={nickname} typingNames={[...typing]} />
      <ChatInput onSend={onSend} />
    </section>
  )
}

export default ChatArea