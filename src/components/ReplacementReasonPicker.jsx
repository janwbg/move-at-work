import { replacementReasonGroups } from './replacementReasons.js'

function ReplacementReasonPicker({
  idPrefix,
  onCancel,
  onSelectReason,
  title = 'Warum möchtest du diese Empfehlung wechseln?',
}) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${idPrefix}-replace-title`}
      className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5"
    >
      <p
        id={`${idPrefix}-replace-title`}
        className="text-sm font-extrabold text-slate-900 dark:text-white"
      >
        {title}
      </p>
      <div className="mt-3 grid gap-3">
        {replacementReasonGroups.map((group) => (
          <section key={group.id}>
            <p className="text-xs font-extrabold uppercase tracking-normal text-slate-500 dark:text-slate-400">
              {group.label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((reason) => (
                <button
                  type="button"
                  key={reason.id}
                  onClick={() => onSelectReason(reason.id)}
                  className="min-h-9 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-3 min-h-9 rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-[#2563eb]/40 dark:border-white/10 dark:text-slate-300"
      >
        Abbrechen
      </button>
    </div>
  )
}

export default ReplacementReasonPicker
