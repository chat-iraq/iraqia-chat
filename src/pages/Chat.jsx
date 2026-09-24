import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { useChat } from '../hooks/useChat'
import { getRoom } from '../data/rooms'
import { ChatArea } from '../components/chat/ChatArea'
import { Sidebar } from '../components/chat/Sidebar'
import { RoomSwitcher } from '../components/chat/RoomSwitcher'
import { UserList } from '../components/chat/UserList'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const guestNames = ['عسل', 'نشمي', 'حلا', 'سوالف', 'همس', 'نسيم', 'دلع', 'نور']

export default function Chat() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const online = useOnlineStatus()

  const currentSlug = getRoom(slug) ? slug : 'general'
  const room = getRoom(currentSlug)
  const { nickname, setNickname, messages, send, attendees, typing, mode } = useChat(room)

  const [nameOpen, setNameOpen] = useState(false)
  const [usersOpen, setUsersOpen] = useState(false)
  const [draftNick, setDraftNick] = useState(nickname)

  useSeo({
    title: `الدردشة المباشرة — غرفة ${room.name}`,
    description: room.description,
    path: `/chat/${currentSlug}`,
  })

  const changeRoom = (nextSlug) => navigate(`/chat/${nextSlug}`)
  const saveNickname = () => {
    const clean = draftNick.trim().slice(0, 24)
    if (clean) setNickname(clean)
    else setDraftNick(nickname)
    setNameOpen(false)
  }

  const randomNick = () => {
    setDraftNick(`زائر${Math.floor(Math.random() * 900) + 100} ${guestNames[Math.floor(Math.random() * guestNames.length)]}`)
  }

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-10rem)]">
      <RoomSwitcher current={currentSlug} onChange={changeRoom} />

      <div className="container-px flex min-h-0 flex-1 items-stretch gap-5 py-5">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-night-800/40 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className={online ? 'text-emerald-400' : 'text-rose-400'} aria-hidden="true">
                {online ? '●' : '○'}
              </span>
              <span className="text-slate-300">{online ? 'متصل بالإنترنت' : 'لا يوجد اتصال بالإنترنت'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">اسمك:</span>
              <button
                type="button"
                onClick={() => {
                  setDraftNick(nickname)
                  setNameOpen(true)
                }}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm font-semibold text-brand-200 transition-colors hover:bg-white/10"
              >
                {nickname}
              </button>
              <button
                type="button"
                onClick={() => setUsersOpen(true)}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 lg:hidden"
              >
                الحاضرون ({attendees.count})
              </button>
            </div>
          </div>

          <ChatArea
            room={room}
            messages={messages}
            nickname={nickname}
            typing={typing}
            onSend={send}
            mode={mode}
          />
        </div>

        <Sidebar room={room} attendees={attendees} currentNickname={nickname} mode={mode} />
      </div>

      <Modal
        open={nameOpen}
        onClose={() => setNameOpen(false)}
        title="تغيير اسم العرض"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={randomNick}>
              🎲 اقترح اسماً
            </Button>
            <Button size="sm" onClick={saveNickname}>
              حفظ الاسم
            </Button>
          </>
        }
      >
        <Input
          label="اسمك في الدردشة"
          value={draftNick}
          onChange={(e) => setDraftNick(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveNickname()
          }}
          maxLength={24}
          hint="يظهر اسمك فقط ضمن الغرف، ويمكن تغييره في أي وقت."
          autoFocus
        />
      </Modal>

      <Modal open={usersOpen} onClose={() => setUsersOpen(false)} title="الحاضرون" size="sm">
        <UserList room={room} attendees={attendees} currentNickname={nickname} />
      </Modal>
    </div>
  )
}