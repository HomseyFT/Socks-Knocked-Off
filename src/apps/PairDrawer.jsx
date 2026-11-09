import { useState } from 'react'
import Sock from '../components/Sock'
import { useCopy } from '../lib/copy'
import { makeId, shuffle } from '../lib/random'
import { sockStyle } from '../lib/sockStyle'
import { usePersistentState } from '../lib/storage'
import './PairDrawer.css'

const DEFAULT_ROSTER = ['Argyle Annie', 'Tube Tom', 'Ankle Andy', 'Knee-High Nora', 'Crew Cassidy', 'Toe-Sock Theo', 'Compression Carl'].join('\n')

const MODES = {
  pairs: { label: 'Coffee-chat pairs', blurb: 'Random 1:1s. An odd sock joins the last pair as a trio.' },
  sockta: { label: 'Secret Sock-ta', blurb: 'Gift-exchange chain. Everyone gives to exactly one person and nobody draws themselves.' },
}

function parseRoster(text) {
  const seen = new Set()
  return text
    .split('\n')
    .map((name) => name.trim())
    .filter((name) => name && !seen.has(name.toLowerCase()) && seen.add(name.toLowerCase()))
}

function makePairs(names) {
  const order = shuffle(names)
  const groups = []
  for (let i = 0; i + 1 < order.length; i += 2) groups.push([order[i], order[i + 1]])
  if (order.length % 2) groups[groups.length - 1].push(order.at(-1))
  return groups
}

function makeChain(names) {
  const order = shuffle(names)
  return order.map((giver, i) => ({ giver, receiver: order[(i + 1) % order.length] }))
}

function PairCard({ names, index }) {
  const look = sockStyle(names.join('+'))
  return (
    <li className="pair" style={{ '--delay': `${index * 0.12}s` }}>
      <div className="pair__socks">
        {names.map((name, i) => (
          <div key={name} className={`pair__member ${i % 2 ? 'pair__member--flip' : ''}`}>
            <Sock look={look} height={names.length > 2 ? 72 : 96} />
            <span>{name}</span>
          </div>
        ))}
      </div>
      {names.length > 2 && <small className="pair__note">Three-sock pile. Someone has a spare foot.</small>}
    </li>
  )
}

function GiftCard({ giver, receiver, index }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <li className="gift" style={{ '--delay': `${index * 0.1}s` }}>
      <Sock seed={giver} height={64} />
      <div>
        <strong>{giver}</strong> stuffs a stocking for
        <button className="gift__reveal" onClick={() => setRevealed((r) => !r)} aria-expanded={revealed}>
          {revealed ? receiver : '🎁 tap to reveal'}
        </button>
      </div>
    </li>
  )
}

export default function PairDrawer() {
  const t = useCopy()
  const [roster, setRoster] = usePersistentState('sockoffice.roster', DEFAULT_ROSTER)
  const [mode, setMode] = useState('pairs')
  const [result, setResult] = useState(null)
  const names = parseRoster(roster)

  const tumble = () => {
    const groups = mode === 'pairs' ? makePairs(names) : makeChain(names)
    setResult({ id: makeId(), mode, groups })
  }

  return (
    <section>
      <div className="app-head">
        <div>
          <h2>{t.apps.pairing}</h2>
          <p>Toss your team in the drawer and let fate fold them into matching pairs.</p>
        </div>
      </div>

      <div className="drawer-app">
        <div className="drawer-app__input">
          <label htmlFor="roster" className="drawer-app__label">
            Team roster <small>(one per line, {names.length} socks)</small>
          </label>
          <textarea id="roster" className="field" rows={9} value={roster} onChange={(e) => setRoster(e.target.value)} />

          <div className="modes" role="radiogroup" aria-label="Pairing mode">
            {Object.entries(MODES).map(([key, m]) => (
              <button key={key} role="radio" aria-checked={mode === key} className="mode" onClick={() => setMode(key)}>
                <strong>{m.label}</strong>
                <small>{m.blurb}</small>
              </button>
            ))}
          </div>

          <button className="btn btn--blue" onClick={tumble} disabled={names.length < 2}>
            🌀 Tumble &amp; match
          </button>
          {names.length < 2 && <small className="drawer-app__hint">Add at least two socks to make a pair.</small>}
        </div>

        <div className="drawer-app__output" aria-live="polite">
          {!result ? (
            <div className="drawer-app__empty">
              <Sock seed="lonely" height={110} />
              <p>The drawer is closed. Hit <strong>Tumble &amp; match</strong> to sort your socks.</p>
            </div>
          ) : result.mode === 'pairs' ? (
            <ul key={result.id} className="pairs">
              {result.groups.map((names, i) => (
                <PairCard key={names.join()} names={names} index={i} />
              ))}
            </ul>
          ) : (
            <ul key={result.id} className="gifts">
              {result.groups.map((g, i) => (
                <GiftCard key={g.giver} {...g} index={i} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
