import {
  goalOptions,
  getOptionLabel,
  getSelectedWorkplaces,
  intensityOptions,
  normalizeProfileAnswers,
  setupOptions,
  toggleWorkplaceSelection,
  updateDefaultWorkplace,
  updateWorkplaceSetup,
  workplaceOptions,
  workdayOptions,
} from '../data/profileOptions.js'

function ProfileSettings({ answers, onChange }) {
  const normalizedAnswers = normalizeProfileAnswers(answers)

  function updateAnswer(nextAnswer) {
    onChange((current) => normalizeProfileAnswers({ ...current, ...nextAnswer }))
  }

  function toggleWorkplace(workplaceId) {
    onChange((current) => toggleWorkplaceSelection(current, workplaceId))
  }

  function toggleSetup(workplaceId, setupId) {
    onChange((current) => updateWorkplaceSetup(current, workplaceId, setupId))
  }

  function setDefaultWorkplace(workplaceId) {
    onChange((current) => updateDefaultWorkplace(current, workplaceId))
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
          value={normalizedAnswers.goal}
          options={goalOptions}
          onChange={(goal) => updateAnswer({ goal })}
        />

        <WorkplaceSettings
          answers={normalizedAnswers}
          onDefaultChange={setDefaultWorkplace}
          onSetupToggle={toggleSetup}
          onWorkplaceToggle={toggleWorkplace}
        />

        <SelectField
          label="Intensitaet"
          value={normalizedAnswers.fitnessLevel}
          options={intensityOptions}
          onChange={(fitnessLevel) => updateAnswer({ fitnessLevel })}
        />

        <SelectField
          label="Typischer Arbeitstag"
          value={normalizedAnswers.situation}
          options={workdayOptions}
          onChange={(situation) => updateAnswer({ situation })}
        />
      </div>
    </section>
  )
}

function WorkplaceSettings({
  answers,
  onDefaultChange,
  onSetupToggle,
  onWorkplaceToggle,
}) {
  const selectedWorkplaces = getSelectedWorkplaces(answers)

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
          Arbeitsorte und Setup
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Du kannst Arbeitsorte und das jeweilige Setup jederzeit anpassen.
        </p>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          Aktive Arbeitsorte
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {workplaceOptions.map((workplace) => (
            <label
              key={workplace.id}
              className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <input
                type="checkbox"
                checked={selectedWorkplaces.includes(workplace.id)}
                onChange={() => onWorkplaceToggle(workplace.id)}
                className="h-4 w-4 accent-[#2563eb]"
              />
              {workplace.label}
            </label>
          ))}
        </div>
      </fieldset>

      {selectedWorkplaces.length > 1 && (
        <div className="mt-4">
          <SelectField
            label="Standard-Arbeitsort"
            value={answers.defaultWorkplace}
            options={selectedWorkplaces.map((workplace) => ({
              id: workplace,
              label: getOptionLabel(workplaceOptions, workplace),
            }))}
            helper="Diesen Arbeitsort nutzt Move at work standardmaessig fuer den Tagesplan."
            onChange={onDefaultChange}
          />
        </div>
      )}

      <div className="mt-4 grid gap-4">
        {selectedWorkplaces.map((workplace) => (
          <SetupFieldset
            key={workplace}
            setup={answers.workplaceSetups[workplace]}
            title={`Setup ${workplace === 'homeoffice' ? 'im Homeoffice' : 'im Buero'}`}
            onToggle={(setupId) => onSetupToggle(workplace, setupId)}
          />
        ))}
      </div>
    </section>
  )
}

function SetupFieldset({ onToggle, setup, title }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        {title}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {setupOptions.map((setupOption) => (
          <label
            key={setupOption.id}
            className="flex min-h-14 items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <input
              type="checkbox"
              checked={setup.includes(setupOption.id)}
              onChange={() => onToggle(setupOption.id)}
              className="mt-1 h-4 w-4 accent-[#2563eb]"
            />
            <span>
              <span className="block font-bold">{setupOption.label}</span>
              <span className="mt-1 block leading-5 text-slate-500 dark:text-slate-400">
                {setupOption.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function SelectField({ helper, label, onChange, options, value }) {
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
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="text-sm leading-5 text-slate-500 dark:text-slate-400">
        {helper ?? options.find((option) => option.id === value)?.description}
      </span>
    </label>
  )
}

export default ProfileSettings
