import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getLocalDateKey } from '../utils/progressStorage.js'
import ResultScreen from './ResultScreen.jsx'

vi.mock('./TodayScreen.jsx', () => ({
  default: function MockTodayScreen(props) {
    return (
      <div
        data-can-replace={String(props.canReplaceRecommendation)}
        data-total-recommendations={props.plan.dailySchedule.length}
      >
        Mock Today
      </div>
    )
  },
}))

describe('ResultScreen premium replacement wiring', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps five recommendations and allows the first Free replacement', () => {
    const html = renderResultScreen()

    expect(html).toContain('data-total-recommendations="5"')
    expect(html).toContain('data-can-replace="true"')
  })

  it('blocks another Free replacement after one successful replacement today', () => {
    window.localStorage.setItem(
      'move-at-work-replacement-usage',
      JSON.stringify({
        date: getLocalDateKey(new Date()),
        replacementsUsed: 1,
      }),
    )

    const html = renderResultScreen()

    expect(html).toContain('data-total-recommendations="5"')
    expect(html).toContain('data-can-replace="false"')
  })

  it('allows Plus users to replace repeatedly even with existing usage', () => {
    window.localStorage.setItem('move-at-work-premium-status', 'plus')
    window.localStorage.setItem(
      'move-at-work-replacement-usage',
      JSON.stringify({
        date: getLocalDateKey(new Date()),
        replacementsUsed: 7,
      }),
    )

    const html = renderResultScreen()

    expect(html).toContain('data-total-recommendations="5"')
    expect(html).toContain('data-can-replace="true"')
  })
})

function renderResultScreen() {
  return renderToStaticMarkup(
    <ResultScreen
      answers={createCompleteAnswers()}
      onChangeAnswers={() => {}}
      onRestartOnboarding={() => {}}
    />,
  )
}

function createCompleteAnswers() {
  return {
    currentWorkplace: 'office',
    defaultWorkplace: 'office',
    fitnessLevel: 'balanced',
    goal: 'habit',
    situation: 'mixed-day',
    workplaces: ['office'],
    workplaceSetups: {
      office: ['no-equipment'],
      homeoffice: ['no-equipment'],
    },
  }
}

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    removeItem: (key) => store.delete(key),
    setItem: (key, value) => store.set(key, String(value)),
  }
}

