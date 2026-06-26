import BrandLogo from './BrandLogo.jsx'
import LineIcon from './LineIcon.jsx'
import { APP_NAME, BRAND_CLAIM } from '../data/brand.js'

const benefits = [
  {
    icon: 'benefit-calendar',
    title: 'Passt in deinen Tagesablauf',
    text: 'Bewegungsimpulse, die um deinen Kalender herum funktionieren.',
  },
  {
    icon: 'benefit-check',
    title: 'Keine Planung nötig',
    text: 'Vorgeplante Routinen für verschiedene Arbeitstage.',
  },
  {
    icon: 'benefit-heart',
    title: 'Besser fühlen, besser arbeiten',
    text: 'Kleine Pausen, die im Alltag einen spürbaren Unterschied machen.',
  },
]

function StartScreen({ onStart }) {
  return (
    <section className="w-full max-w-3xl text-center">
      <BrandLogo
        className="justify-center"
        markClassName="h-16 w-16 sm:h-20 sm:w-20"
        textClassName="sr-only"
      />
      <p className="mt-7 text-sm font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
        {APP_NAME}
      </p>
      <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-6xl">
        {BRAND_CLAIM}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
        {APP_NAME} gibt dir kurze Bewegungsimpulse für lange Schreibtischtage —
        passend zu deinem Tag, deiner Umgebung und deiner Zeit.
      </p>

      <div className="mx-auto mt-7 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]"
          >
            <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-extrabold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              <LineIcon className="h-4 w-4" name={benefit.icon} />
            </span>
            <p className="font-bold leading-snug text-slate-900 dark:text-white">
              {benefit.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {benefit.text}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-9 w-full rounded-full bg-teal-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
      >
        Loslegen
      </button>
    </section>
  )
}

export default StartScreen
