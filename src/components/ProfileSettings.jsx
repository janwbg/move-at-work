import {
  fitnessLevelOptions,
  goalOptions,
  setupOptions,
  workdayOptions,
} from '../data/profileOptions.js'

function ProfileSettings({ answers, onChange }) {
  function updateAnswer(nextAnswer) {
    onChange((current) => ({ ...current, ...nextAnswer }))
  }

  function toggleSetup(setup) {
    onChange((current) => {
      const exists = current.setup.includes(setup)

      if (exists && current.setup.length === 1) {
        return current
      }

      return {
        ...current,
        setup: exists
          ? current.setup.filter((item) => item !== setup)
          : [...current.setup, setup],
      }
    })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Einstellungen
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Dein Bewegungsprofil
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Passe deine Angaben einzeln an. Der Plan aktualisiert sich automatisch.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <SelectField
          label="Ziel"
          value={answers.goal}
          options={goalOptions.map((goal) => ({ label: goal, value: goal }))}
          onChange={(goal) => updateAnswer({ goal })}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            Setup
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {setupOptions.map((setup) => (
              <label
                key={setup}
                className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={answers.setup.includes(setup)}
                  onChange={() => toggleSetup(setup)}
                  className="h-4 w-4 accent-[#2563eb]"
                />
                {setup}
              </label>
            ))}
          </div>
        </fieldset>

        <SelectField
          label="Fitnesslevel"
          value={answers.fitnessLevel}
          options={fitnessLevelOptions.map((level) => ({
            label: level.label,
            value: level.value,
          }))}
          onChange={(fitnessLevel) => updateAnswer({ fitnessLevel })}
        />

        <SelectField
          label="Typischer Arbeitstag"
          value={answers.situation}
          options={workdayOptions.map((workday) => ({
            label: `${workday.label} - ${workday.description}`,
            value: workday.value,
          }))}
          onChange={(situation) => updateAnswer({ situation })}
        />
      </div>
    </section>
  )
}

function SelectField({ label, onChange, options, value }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 dark:border-white/10 dark:bg-[#1b1b1b] dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default ProfileSettings
