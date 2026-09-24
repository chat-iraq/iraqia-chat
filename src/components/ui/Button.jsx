import { Link } from 'react-router-dom'
import { cn } from '../../utils/className'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.98]',
}

const sizes = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

/**
 * زر موحّد لكل الموقع (يدعم التنقل الداخلي عبر react-router).
 * @param {{ variant?: keyof typeof variants; size?: keyof typeof sizes; to?: string; href?: string; className?: string; children: import('react').ReactNode }} props
 */
export function Button({ variant = 'primary', size = 'md', to, href, className, children, ...rest }) {
  const classes = cn(variants[variant], sizes[size], className)

  if (to && !to.startsWith('http')) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (href || (to && to.startsWith('http'))) {
    return (
      <a href={href || to} className={classes} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button