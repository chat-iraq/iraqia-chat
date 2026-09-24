import { useState } from 'react'
import { cn } from '../../utils/className'
import { emojiPalette } from '../../data/messages'
import { Tooltip } from '../ui/Tooltip'

/** منتقي وجوه خفيف للتبديل السريع */
export function EmojiPicker({ onPick, align = 'start' }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Tooltip label="إضافة وجه">
        <button
          type="button"
          aria-label="إضافة وجه تعبيري"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-xl text-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          😊
        </button>
      </Tooltip>

      {open && (
        <div
          className={cn(
            'absolute bottom-12 z-20 w-72 rounded-2xl border border-white/10 bg-night-800 p-3 shadow-2xl',
            align === 'end' ? 'end-0' : 'start-0',
          )}
        >
          <p className="mb-2 px-1 text-xs font-medium text-slate-400">وجوه تعبيرية</p>
          <div className="grid grid-cols-10 gap-1">
            {emojiPalette.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onPick(emoji)
                  setOpen(false)
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-lg transition-transform hover:scale-125 hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiPicker