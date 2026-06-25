const tabs = [
  { id: 'today', label: 'Heute', icon: '●' },
  { id: 'progress', label: 'Routine', icon: '↗' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙' },
]

function BottomNavigation({ activeTab, onChange }) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-2xl shadow-slate-950/10 backdrop-blur dark:border-white/10 dark:bg-[#171717]/95 sm:px-6"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:text-sm ${
                isActive
                  ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/20'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation
