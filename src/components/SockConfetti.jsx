import { useEffect, useMemo } from 'react'
import Sock from './Sock'
import { makeId } from '../lib/random'
import './SockConfetti.css'

export default function SockConfetti({ count = 28, onDone }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        id: makeId(),
        x: Math.random() * 100,
        drift: (Math.random() - 0.5) * 40,
        spin: (Math.random() - 0.5) * 1440,
        delay: Math.random() * 0.4,
        size: 24 + Math.random() * 36,
      })),
    [count],
  )

  useEffect(() => {
    const timer = setTimeout(onDone, 2600)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti__piece"
          style={{ left: `${p.x}%`, '--drift': `${p.drift}vw`, '--spin': `${p.spin}deg`, animationDelay: `${p.delay}s` }}
        >
          <Sock seed={p.id} height={p.size} />
        </span>
      ))}
    </div>
  )
}
