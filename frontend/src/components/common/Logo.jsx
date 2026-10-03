import { Link } from 'react-router-dom'
import { SITE_NAME } from '../../config'
import { ROUTES } from '../../config/siteLinks'

const SIZES = {
  sm: { icon: 20, font: 'text-lg' },
  md: { icon: 28, font: 'text-xl' },
  lg: { icon: 36, font: 'text-2xl' },
}

export function LogoMark({ size = 28, className = '' }) {
  const pixelSize = typeof size === 'number' ? size : SIZES[size]?.icon || 28

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-accent-grad" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgb(var(--accent))" />
          <stop offset="100%" stopColor="rgb(var(--accent-strong))" />
        </linearGradient>
      </defs>
      {/* 3 Ascending bars flowing like an algorithm step stream */}
      <rect x="4" y="16" width="6" height="12" rx="2" fill="url(#logo-accent-grad)" />
      <rect x="13" y="10" width="6" height="18" rx="2" fill="url(#logo-accent-grad)" />
      <rect x="22" y="4" width="6" height="24" rx="2" fill="rgb(var(--state-sorted))" />
    </svg>
  )
}

export default function Logo({ size = 'md', showWordmark = true, className = '' }) {
  const sizeConfig = SIZES[size] || SIZES.md

  return (
    <Link
      to={ROUTES.HOME}
      className={`inline-flex items-center gap-2.5 group focus-ring rounded-md p-1 -ml-1 transition-opacity hover:opacity-90 ${className}`}
      aria-label={`${SITE_NAME} Homepage`}
    >
      <LogoMark size={sizeConfig.icon} />
      {showWordmark && (
        <span className={`font-display font-semibold tracking-tight text-ink group-hover:text-accent transition-colors ${sizeConfig.font}`}>
          {SITE_NAME}
        </span>
      )}
    </Link>
  )
}
