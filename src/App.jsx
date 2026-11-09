import { useCallback, useEffect, useState } from 'react'
import Clothesline from './apps/Clothesline'
import PuppetBoardroom from './apps/PuppetBoardroom'
import PairDrawer from './apps/PairDrawer'
import Sockonomics from './apps/Sockonomics'
import Dryer from './apps/Dryer'
import Sock from './components/Sock'
import SockConfetti from './components/SockConfetti'
import { COPY, CopyContext } from './lib/copy'
import { usePersistentReducer, usePersistentState } from './lib/storage'
import { seedTasks, tasksReducer } from './lib/tasks'

const APPS = [
  { key: 'clothesline', icon: '🧺', Component: Clothesline },
  { key: 'puppet', icon: '🎭', Component: PuppetBoardroom },
  { key: 'pairing', icon: '🧦', Component: PairDrawer },
  { key: 'sockonomics', icon: '📈', Component: Sockonomics },
  { key: 'dryer', icon: '🌀', Component: Dryer },
]

const tabFromHash = () => {
  const key = window.location.hash.slice(1)
  return APPS.some((a) => a.key === key) ? key : APPS[0].key
}

function useHashTab() {
  const [tab, setTab] = useState(tabFromHash)
  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return tab
}

export default function App() {
  const tab = useHashTab()
  const [gaslight, setGaslight] = usePersistentState('sockoffice.gaslight', false)
  const [tasks, dispatch] = usePersistentReducer('sockoffice.tasks', tasksReducer, seedTasks)
  const [celebrations, setCelebrations] = useState(0)
  const copy = gaslight ? COPY.victorian : COPY.modern

  useEffect(() => {
    document.documentElement.dataset.theme = gaslight ? 'gaslight' : 'sock'
    document.title = copy.appName
  }, [gaslight, copy.appName])

  const celebrate = useCallback(() => setCelebrations((n) => n + 1), [])
  const endCelebration = useCallback(() => setCelebrations(0), [])

  const { Component } = APPS.find((a) => a.key === tab)
  const dryerCount = tasks.filter((t) => t.status === 'dryer').length

  return (
    <CopyContext.Provider value={copy}>
      <div className="shell">
        <header className="masthead">
          <div className="masthead__brand">
            <span className="masthead__logo">
              <Sock seed="logo" look={{ base: '#ff5fa2', accent: '#ffd23f', pattern: 'stripes' }} height={64} />
            </span>
            <div>
              <h1 className="masthead__title">{copy.appName}</h1>
              <p className="masthead__tagline">{copy.tagline}</p>
            </div>
          </div>
          <button className="btn btn--ghost" onClick={() => setGaslight((g) => !g)} aria-pressed={gaslight}>
            🕯️ {copy.gaslight}
          </button>
        </header>

        <nav className="drawer" aria-label="Apps">
          {APPS.map((a) => (
            <a key={a.key} href={`#${a.key}`} className="drawer__tab" aria-current={a.key === tab ? 'page' : undefined}>
              <span aria-hidden="true">{a.icon}</span> {copy.apps[a.key]}
              {a.key === 'dryer' && dryerCount > 0 && <span className="drawer__badge">{dryerCount}</span>}
            </a>
          ))}
        </nav>

        <main className="stage">
          <Component tasks={tasks} dispatch={dispatch} celebrate={celebrate} />
        </main>

        <footer className="footer">{copy.footer}</footer>
      </div>

      {celebrations > 0 && (
        <>
          <SockConfetti key={celebrations} onDone={endCelebration} />
          <div key={`burst-${celebrations}`} className="burst" role="status">
            {copy.knockedOff}
          </div>
        </>
      )}
    </CopyContext.Provider>
  )
}
