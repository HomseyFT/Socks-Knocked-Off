import { useCallback, useEffect, useState } from 'react'
import Sockinko from './apps/sockinko/Sockinko'
import Clothesline from './apps/Clothesline'
import PuppetBoardroom from './apps/PuppetBoardroom'
import Sockstrology from './apps/Sockstrology'
import PairDrawer from './apps/PairDrawer'
import Sockonomics from './apps/Sockonomics'
import Dryer from './apps/Dryer'
import Sock from './components/Sock'
import SockConfetti from './components/SockConfetti'
import SockGremlin from './components/SockGremlin'
import { COPY, CopyContext } from './lib/copy'
import { usePersistentReducer, usePersistentState } from './lib/storage'
import { seedTasks, tasksReducer } from './lib/tasks'

const APPS = [
  { key: 'sockinko', icon: '🎯', Component: Sockinko },
  { key: 'clothesline', icon: '🧺', Component: Clothesline },
  { key: 'puppet', icon: '🎭', Component: PuppetBoardroom },
  { key: 'sockstrology', icon: '🔮', Component: Sockstrology },
  { key: 'pairing', icon: '🧦', Component: PairDrawer },
  { key: 'sockonomics', icon: '📈', Component: Sockonomics },
  { key: 'dryer', icon: '🌀', Component: Dryer },
]

const TAGLINE_MS = 5000

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

function useRotatingIndex(length, ms) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => i + 1), ms)
    return () => clearInterval(timer)
  }, [ms])
  return index % length
}

export default function App() {
  const tab = useHashTab()
  const [gaslight, setGaslight] = usePersistentState('sockoffice.gaslight', false)
  const [gremlins, setGremlins] = usePersistentState('sockoffice.gremlins', 0)
  const [tasks, dispatch] = usePersistentReducer('sockoffice.tasks', tasksReducer, seedTasks)
  const [celebration, setCelebration] = useState(null)
  const copy = gaslight ? COPY.victorian : COPY.modern
  const tagline = copy.taglines[useRotatingIndex(copy.taglines.length, TAGLINE_MS)]

  useEffect(() => {
    document.documentElement.dataset.theme = gaslight ? 'gaslight' : 'sock'
    document.title = copy.appName
  }, [gaslight, copy.appName])

  const celebrate = useCallback(
    (message, count = 28) => setCelebration({ id: Date.now(), message: message ?? copy.knockedOff, count }),
    [copy.knockedOff],
  )
  const endCelebration = useCallback(() => setCelebration(null), [])
  const catchGremlin = useCallback(() => {
    setGremlins((n) => n + 1)
    celebrate('GREMLIN APPREHENDED!')
  }, [setGremlins, celebrate])

  const { Component } = APPS.find((a) => a.key === tab)
  const dryerCount = tasks.filter((t) => t.status === 'dryer').length

  return (
    <CopyContext.Provider value={copy}>
      <div className="shell">
        <header className="masthead">
          <div className="masthead__brand">
            <button className="masthead__logo" onClick={() => celebrate(copy.knockedOff, 12)} aria-label="Kick the logo sock">
              <Sock seed="logo" look={{ base: '#ff5fa2', accent: '#ffd23f', pattern: 'stripes' }} height={64} />
            </button>
            <div>
              <h1 className="masthead__title">{copy.appName}</h1>
              <p key={tagline} className="masthead__tagline">{tagline}</p>
            </div>
          </div>
          <div className="masthead__actions">
            {gremlins > 0 && (
              <span className="masthead__gremlins">
                👾 {copy.gremlins}: <strong>{gremlins}</strong>
              </span>
            )}
            <button className="btn btn--pink" onClick={() => celebrate(`${copy.storm.toUpperCase()}!!!`, 90)}>
              🌪️ {copy.storm}
            </button>
            <button className="btn btn--ghost" onClick={() => setGaslight((g) => !g)} aria-pressed={gaslight}>
              🕯️ {copy.gaslight}
            </button>
          </div>
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
          <Component tasks={tasks} dispatch={dispatch} celebrate={celebrate} gremlins={gremlins} />
        </main>

        <footer className="footer">{copy.footer}</footer>
      </div>

      <SockGremlin onCatch={catchGremlin} />

      {celebration && (
        <>
          <SockConfetti key={celebration.id} count={celebration.count} onDone={endCelebration} />
          <div key={`burst-${celebration.id}`} className="burst" role="status">
            {celebration.message}
          </div>
        </>
      )}
    </CopyContext.Provider>
  )
}
