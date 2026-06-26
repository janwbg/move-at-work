function LineIcon({ className = 'h-5 w-5', name }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-icon-name={name}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {getIconPath(name)}
    </svg>
  )
}

function getIconPath(name) {
  const icons = {
    'benefit-calendar': (
      <>
        <rect height="15" rx="2" width="16" x="4" y="5" />
        <path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3M8 17h2" />
      </>
    ),
    'benefit-check': (
      <>
        <path d="M5 12.5l4 4L19 6" />
        <path d="M5 19h14" />
      </>
    ),
    'benefit-heart': (
      <>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        <path d="M9 13h2l1-2 1.5 4 1-2H17" />
      </>
    ),
    'goal-back': (
      <>
        <path d="M12 4v16" />
        <path d="M9 7c2 1 4 1 6 0M9 11c2 1 4 1 6 0M9 15c2 1 4 1 6 0" />
        <path d="M7 19c2-1 8-1 10 0" />
      </>
    ),
    'goal-focus': (
      <>
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    'goal-motion': (
      <>
        <path d="M4 15c3-4 6 4 9 0s5-3 7-1" />
        <path d="M6 8h.01M10 6h.01M14 8h.01" />
        <path d="M7 18h10" />
      </>
    ),
    'goal-sit-less': (
      <>
        <path d="M8 7h6v5H9a2 2 0 0 1-2-2V7z" />
        <path d="M9 12v6M15 12v6M7 18h10" />
        <path d="M17 5l2 2-2 2M12 7h7" />
      </>
    ),
    'setup-band': (
      <>
        <path d="M5 15c2-6 5-6 7 0s5 6 7 0" />
        <path d="M5 9c2 6 5 6 7 0s5-6 7 0" />
      </>
    ),
    'setup-ball': <circle cx="12" cy="12" r="7" />,
    'setup-cushion': (
      <>
        <path d="M6 14a6 4 0 0 1 12 0" />
        <path d="M6 14c0 3 12 3 12 0" />
        <path d="M8 17h8" />
      </>
    ),
    'setup-desk': (
      <>
        <path d="M5 10h14M7 10v8M17 10v8M9 18h6" />
        <path d="M12 4v4M10 6l2-2 2 2" />
      </>
    ),
    'setup-ergonomic': (
      <>
        <path d="M8 6h6a3 3 0 0 1 3 3v4H9a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2z" />
        <path d="M9 13v6M16 13v6M7 19h11" />
      </>
    ),
    'setup-hallway': (
      <>
        <path d="M5 19V5h9v14" />
        <path d="M14 8h5v11" />
        <path d="M8 16c2-2 4-2 6 0" />
      </>
    ),
    'setup-none': (
      <>
        <rect height="10" rx="2" width="14" x="5" y="6" />
        <path d="M8 16v3M16 16v3M7 19h10" />
      </>
    ),
    'setup-space': (
      <>
        <rect height="12" rx="2" width="16" x="4" y="6" />
        <path d="M8 10h8M8 14h5" />
      </>
    ),
    'setup-stairs': (
      <>
        <path d="M4 18h4v-4h4v-4h4V6h4" />
        <path d="M6 8l2-2 2 2" />
      </>
    ),
    'setup-walking-pad': (
      <>
        <rect height="6" rx="3" width="16" x="4" y="14" />
        <path d="M9 10l2-4M13 10l2-4M10 10h4" />
      </>
    ),
    'workday-focus': (
      <>
        <circle cx="12" cy="12" r="6" />
        <path d="M12 8v4l3 2" />
      </>
    ),
    'workday-meeting': (
      <>
        <rect height="12" rx="2" width="14" x="5" y="6" />
        <path d="M8 4v4M16 4v4M5 10h14M8 14h4" />
      </>
    ),
    'workday-mixed': (
      <>
        <path d="M4 7h5v5H4zM15 7h5v5h-5zM9 17h6" />
        <path d="M9 9h6M12 12v5" />
      </>
    ),
    'workday-study': (
      <>
        <path d="M5 5h6a3 3 0 0 1 3 3v11H8a3 3 0 0 0-3-3z" />
        <path d="M14 8a3 3 0 0 1 3-3h2v11h-2a3 3 0 0 0-3 3" />
      </>
    ),
    'workday-tight': (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 7v5l3 2M9 3h6" />
      </>
    ),
    'workplace-homeoffice': (
      <>
        <path d="M4 11l8-7 8 7" />
        <path d="M6 10v9h12v-9" />
        <rect height="4" rx="1" width="8" x="8" y="13" />
      </>
    ),
    'workplace-office': (
      <>
        <rect height="16" rx="2" width="12" x="6" y="4" />
        <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
      </>
    ),
  }

  return icons[name] ?? <circle cx="12" cy="12" r="6" />
}

export default LineIcon
