import { plusPlan } from '../data/premiumPlans.js'
import { useAuth } from '../auth/useAuth.js'
import { isPlusUser, loadPremiumStatus } from '../utils/premiumStatus.js'

function UpgradeScreen({
  auth: providedAuth,
  onBack,
  plan = plusPlan,
  premiumStatus = loadPremiumStatus(),
}) {
  const contextAuth = useAuth()
  const auth = providedAuth ?? contextAuth
  const plusActive = isPlusUser(premiumStatus)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl bg-teal-700 p-6 text-white shadow-xl shadow-teal-700/20 sm:p-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-5 min-h-10 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Zurück
          </button>
        )}
        <p className="text-sm font-bold uppercase tracking-normal text-teal-100">
          Upgrade
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
          {plan.title}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-teal-50">
          {plan.tagline}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {plan.prices.map((price) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
            key={price.id}
          >
            <p className="text-sm font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
              {price.label}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
              {price.value}
            </p>
          </article>
        ))}
      </section>

      <p className="rounded-lg border border-teal-700/20 bg-teal-50 p-4 text-sm font-semibold leading-6 text-slate-600 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-slate-200">
        {plan.earlyAccessNote}
      </p>

      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {auth.isAuthenticated
          ? 'Du bist angemeldet. Plus kann später diesem Konto zugeordnet werden.'
          : 'Für ein späteres Plus-Abo brauchst du ein Konto.'}
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <h2 className="text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Heute enthalten
        </h2>
        <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          {plan.includedToday.map((feature) => (
            <li className="rounded-lg bg-slate-50 p-3 dark:bg-white/5" key={feature}>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <h2 className="text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Free vs. Plus
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-3 pr-4 font-extrabold text-slate-950 dark:text-white">
                  Funktion
                </th>
                <th className="px-4 py-3 font-extrabold text-slate-950 dark:text-white">
                  Free
                </th>
                <th className="px-4 py-3 font-extrabold text-slate-950 dark:text-white">
                  Plus
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.comparisonRows.map((row) => (
                <tr
                  className="border-b border-slate-100 last:border-b-0 dark:border-white/10"
                  key={row.feature}
                >
                  <td className="py-3 pr-4 font-semibold text-slate-600 dark:text-slate-300">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">
                    {row.free}
                  </td>
                  <td className="px-4 py-3 font-bold text-teal-700 dark:text-teal-100">
                    {row.plus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <h2 className="text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Als Nächstes geplant
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Diese Funktionen sind geplant und noch nicht Teil des aktuellen Plus-Umfangs.
        </p>
        <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
          {plan.plannedNext.map((feature) => (
            <li className="rounded-lg bg-slate-50 p-3 dark:bg-white/5" key={feature}>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-teal-700/20 bg-teal-50 p-5 dark:border-teal-300/20 dark:bg-teal-300/10 sm:p-6">
        {plusActive ? (
          <p className="text-lg font-extrabold text-slate-950 dark:text-white">
            Plus ist aktiv
          </p>
        ) : (
          <>
            <p className="text-lg font-extrabold text-slate-950 dark:text-white">
              Plus wird vorbereitet
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Checkout folgt im nächsten Schritt.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 min-h-11 cursor-not-allowed rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white opacity-80"
            >
              Checkout folgt im nächsten Schritt
            </button>
          </>
        )}
      </section>
    </div>
  )
}

export default UpgradeScreen
