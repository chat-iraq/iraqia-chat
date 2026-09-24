import { cn } from '../../utils/className'

/** بطاقة سطح جاهزة للاستخدام */
export function Card({ children, className, interactive = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'surface-strong p-5',
        interactive && 'cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Card