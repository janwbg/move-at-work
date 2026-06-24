import { replacementReasonOptions } from './replacementReasons.js'

function ReplacementReasonPicker({
  idPrefix,
  onCancel,
  onSelectReason,
  title = 'Was passt gerade nicht?',
}) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${idPrefix}-replace-title`}
      className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-md shadow-slate-200/60 dark:border-white/10 dark:bg-[#1b1b1b] dark:shadow-black/20"
    >
      <p
        id={`${idPrefix}-replace-title`}
        className="text-sm font-extrabold text-slate-900 dark:text-white"
      >
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {replacementReasonOptions.map((reason) => (
          <button
            type="button"
            key={reason.id}
            onClick={() => onSelectReason(reason.id)}
            className="min-h-8 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:bg-white hover:text-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            {reason.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-3 min-h-8 rounded-full px-1 text-sm font-bold text-slate-500 transition hover:text-[#2563eb] dark:text-slate-400"
      >
        Abbrechen
      </button>
    </div>
  )
}

export default ReplacementReasonPicker
