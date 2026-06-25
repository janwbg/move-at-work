import { APP_NAME } from '../data/brand.js'

function BrandLogo({
  className = '',
  markClassName = '',
  textClassName = '',
  variant = 'wordmark',
}) {
  const isMarkOnly = variant === 'mark'

  return (
    <span
      aria-label={isMarkOnly ? `${APP_NAME} Logo` : APP_NAME}
      className={`inline-flex items-center gap-2 ${className}`}
      role="img"
    >
      <svg
        aria-hidden="true"
        className={`h-9 w-9 shrink-0 ${markClassName}`}
        fill="none"
        viewBox="0 0 64 64"
      >
        <rect height="64" rx="18" width="64" fill="#0f766e" />
        <path
          d="M15 43V22.5c0-2.6 3.3-3.7 4.9-1.7l9.3 11.7 9.3-11.7c1.6-2 4.9-.9 4.9 1.7V43"
          stroke="#ecfdf5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
        />
        <path
          d="M16 48c9.2-3.2 18.9-3.2 29 0"
          stroke="#99f6e4"
          strokeLinecap="round"
          strokeWidth="5"
        />
      </svg>
      {!isMarkOnly && (
        <span className={`font-extrabold tracking-normal ${textClassName}`}>
          {APP_NAME}
        </span>
      )}
    </span>
  )
}

export default BrandLogo

