/** مؤشر "يكتب الآن…" */
export function TypingIndicator({ names }) {
  const label =
    names.length <= 2 ? names.join(' و ') : `${names[0]} و ${names.length - 1} آخرون`
  return (
    <li className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400">
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300" />
      </span>
      {label} يكتب الآن…
    </li>
  )
}

export default TypingIndicator