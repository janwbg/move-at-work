import BrandLogo from './BrandLogo.jsx'
import { BRAND_SHORT_DESCRIPTION } from '../data/brand.js'

function AppHeader({ isDark, onToggleTheme }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <BrandLogo
          markClassName="h-8 w-8"
          textClassName="text-base text-slate-950 dark:text-white"
        />
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {BRAND_SHORT_DESCRIPTION}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={isDark}
          onClick={onToggleTheme}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-700/40 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          {isDark ? 'Hell' : 'Dunkel'}
        </button>
      </div>
    </header>
  )
}

export default AppHeader
