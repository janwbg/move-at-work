import {
  goalOptions,
  getOptionLabel,
  getSelectedWorkplaces,
  intensityOptions,
  normalizeProfileAnswers,
  setupOptions,
  toggleWorkplaceSelection,
  updateDefaultWorkplace,
  workplaceOptions,
  workdayOptions,
} from '../data/profileOptions.js'

function ProfileSettings({ answers, onBack, onChange, onEditSetup = () => {} }) {
  const normalizedAnswers = normalizeProfileAnswers(answers)
  const selectedWorkplaces = getSelectedWorkplaces(normalizedAnswers)

  function updateAnswer(nextAnswer) {
    onChange((current) => normalizeProfileAnswers({ ...current, ...nextAnswer }))
  }

  function toggleWorkplace(workplaceId) {
    onChange((current) => toggleWorkplaceSelection(current, workplaceId))
  }

  function setDefaultWorkplace(workplaceId) {
    onChange((current) => updateDefaultWorkplace(current, workplaceId))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Bewegungsprofil
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            Bewegungsprofil
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Passe Ziel, Arbeitsorte und Setups an.
          </p>
          <p className="mt-2 rounded-lg bg-[#2563eb]/5 p-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-[#2563eb]/10 dark:text-slate-200">
            Änderungen gelten für zukünftige und offene Empfehlungen. Bereits
            erledigte Übungen bleiben erhalten.
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
          >
            Zurück
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-5">
        <section className="grid gap-4">
          <SectionTitle
            title="Ziel & Tageslogik"
            text="Diese Angaben bestimmen Ton, Länge und Art deiner offenen Empfehlungen."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="Ziel"
              value={normalizedAnswers.goal}
              options={goalOptions}
              onChange={(goal) => updateAnswer({ goal })}
            />
            <SelectField
              label="Intensität"
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

        <section>
          <SectionTitle
            title="Arbeitsorte"
            text="Aktiviere die Orte, die Move at work für deinen Tagesplan berücksichtigen darf."
          />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {workplaceOptions.map((workplace) => {
              const isSelected = selectedWorkplaces.includes(workplace.id)
              const setup = normalizedAnswers.workplaceSetups[workplace.id] ?? []

              return (
                <article
                  key={workplace.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <WorkplaceIcon workplace={workplace.id} />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                          {workplace.label}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {isSelected ? 'Aktiv' : 'Aktuell nicht aktiv'}
                        </p>
                      </div>
                    </div>
                    <label className="flex min-h-10 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleWorkplace(workplace.id)}
                        className="h-4 w-4 accent-[#2563eb]"
                      />
                      Aktiv
                    </label>
                  </div>

                  {isSelected && (
                    <>
                      <SetupSummary setup={setup} />
                      <button
                        type="button"
                        onClick={() => onEditSetup(workplace.id)}
                        className="mt-3 min-h-10 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                      >
                        Setup bearbeiten
                      </button>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        {selectedWorkplaces.length > 1 && (
          <section>
            <SectionTitle
              title="Standard-Arbeitsort"
              text="Diesen Arbeitsort nutzt Move at work standardmäßig für den Tagesplan."
            />
            <div className="mt-3 max-w-sm">
              <SelectField
                label="Standard-Arbeitsort"
                value={normalizedAnswers.defaultWorkplace}
                options={selectedWorkplaces.map((workplace) => ({
                  id: workplace,
                  label: getOptionLabel(workplaceOptions, workplace),
                }))}
                onChange={setDefaultWorkplace}
              />
            </div>
          </section>
        )}
      </div>
    </section>
  )
}

function SectionTitle({ text, title }) {
  return (
    <div>
      <h3 className="text-sm font-extrabold uppercase tracking-normal text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  )
}

function SetupSummary({ setup }) {
  const labels = setup.map((setupId) => getOptionLabel(setupOptions, setupId))

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-200"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

function WorkplaceIcon({ workplace }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-white/10 dark:text-slate-300"
      data-testid={`workplace-icon-${workplace}`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        {workplace === 'homeoffice' ? (
          <>
            <path d="M4 11l8-7 8 7" />
            <path d="M6 10v10h12V10" />
            <path d="M10 20v-6h4v6" />
          </>
        ) : (
          <>
            <rect height="16" rx="2" width="12" x="6" y="4" />
            <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
          </>
        )}
      </svg>
    </span>
  )
}

export function SetupSettingsScreen({ onBack, onToggle, setup, workplace }) {
  const title =
    workplace === 'homeoffice' ? 'Setup im Homeoffice' : 'Setup im Büro'
  const workplaceLabel =
    workplace === 'homeoffice' ? 'Homeoffice' : 'Büro'
  const activeLabel =
    setup.length === 1 && setup.includes('no-equipment')
      ? 'Kein besonderes Equipment'
      : `${setup.length} Optionen aktiv`

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Setup
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Wähle aus, was dir {workplace === 'homeoffice' ? 'im Homeoffice' : 'im Büro'} zur Verfügung steht.
          </p>
          <p className="mt-3 w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200">
            {workplaceLabel} · {activeLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
        >
          Zurück
        </button>
      </div>

      <fieldset className="mt-4">
        <legend className="sr-only">{title}</legend>
        <div className="grid gap-2">
          {setupOptions.map((setupOption) => (
            <label
              key={setupOption.id}
              className="flex min-h-11 items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200"
            >
              <input
                type="checkbox"
                checked={setup.includes(setupOption.id)}
                onChange={() => onToggle(setupOption.id)}
                className="h-4 w-4 accent-[#2563eb]"
              />
              <span>
                <span className="block font-bold">{setupOption.label}</span>
                <span className="block text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {setupOption.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
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
