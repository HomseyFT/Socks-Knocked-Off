import { useEffect, useState } from 'react'
import Sock from './Sock'
import './SockGremlin.css'

const MIN_WAIT = 20_000
const MAX_WAIT = 60_000

// Scurries across the page every so often carrying a stolen sock. Click to apprehend.
export default function SockGremlin({ onCatch }) {
  const [run, setRun] = useState(null)

  useEffect(() => {
    if (run) return
    const timer = setTimeout(
      () => setRun({ id: Date.now(), reverse: Math.random() < 0.5, top: 30 + Math.random() * 55 }),
      MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT),
    )
    return () => clearTimeout(timer)
  }, [run])

  if (!run) return null

  return (
    <button
      key={run.id}
      className={`gremlin ${run.reverse ? 'gremlin--reverse' : ''}`}
      style={{ top: `${run.top}vh` }}
      onAnimationEnd={() => setRun(null)}
      onClick={() => {
        setRun(null)
        onCatch()
      }}
      aria-label="Catch the sock gremlin"
    >
      <svg className="gremlin__body" viewBox="0 0 80 70" width="80" height="70" aria-hidden="true">
        <path d="M14 50 Q6 22 28 14 L22 2 L34 12 Q40 10 46 12 L58 2 L52 14 Q74 22 66 50 Q60 64 40 64 Q20 64 14 50 Z" fill="#a3e635" stroke="#2b1d4e" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="30" cy="34" r="8" fill="#fff" stroke="#2b1d4e" strokeWidth="2" />
        <circle cx="50" cy="34" r="8" fill="#fff" stroke="#2b1d4e" strokeWidth="2" />
        <circle cx="32" cy="35" r="3.5" fill="#2b1d4e" />
        <circle cx="52" cy="35" r="3.5" fill="#2b1d4e" />
        <path d="M30 50 Q40 58 50 50" fill="none" stroke="#2b1d4e" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 52 v4 M44 52 v4" stroke="#fff" strokeWidth="2.5" />
        <path className="gremlin__leg" d="M28 62 v7 M52 62 v7" stroke="#2b1d4e" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="gremlin__loot">
        <Sock seed={`loot-${run.id}`} height={44} />
      </span>
    </button>
  )
}
