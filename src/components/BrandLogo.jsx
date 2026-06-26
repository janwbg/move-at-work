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
        <rect height="64" rx="20" width="64" fill="#0f766e" />
        <path
          d="M14 43V22c0-2.7 3.4-3.8 5-1.7l11.2 14.2L45 20.3c1.7-1.6 4.5-.4 4.5 2v20.6"
          stroke="#ecfdf5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5.5"
        />
        <path
          d="M13 48c8.7-5.2 19.6-5.8 32.5-1.7 2.5.8 4.1 1.1 5.8.6"
          stroke="#99f6e4"
          strokeLinecap="round"
          strokeWidth="4.8"
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
