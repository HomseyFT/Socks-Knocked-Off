import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Sock, { PatternTile } from '../components/Sock'
import { useCopy } from '../lib/copy'
import './PuppetBoardroom.css'

const CAST = [
  { key: 'ceo', name: 'Sockrates', role: 'Chief Executive Sock', look: { base: '#b388ff', accent: '#ffd23f', pattern: 'argyle' }, pitch: 0.6, rate: 0.95, accessory: 'tie' },
  { key: 'cfo', name: 'Argyle Annie', role: 'Chief Financial Sock', look: { base: '#ff5fa2', accent: '#ffffff', pattern: 'dots' }, pitch: 1.2, rate: 1, accessory: 'bowtie' },
  { key: 'intern', name: 'Tube Tom', role: 'Unpaid Intern', look: { base: '#5ad1ff', accent: '#ff6b6b', pattern: 'stripes' }, pitch: 1.8, rate: 1.2, accessory: 'badge' },
]

const SPEECHES = [
  {
    title: 'Q4 Earnings Call',
    text: 'Good morning, shareholders. I am pleased to report that this quarter we knocked off more socks than ever before. Argyle is up. Tube socks are stable. The dryer continues to underperform, consuming eleven percent of all inventory. We have formed a task force. The task force is also missing. Thank you.',
  },
  {
    title: 'All-Hands Pep Talk',
    text: 'Team! Every one of you is a sock. Different patterns, different lengths, some of you with a small hole near the toe. But together? Together we are a drawer. And a drawer that works together knocks socks off. Now go forth and be cozy.',
  },
  {
    title: 'Hostile Takeover',
    text: 'Attention. The left socks have seized control of the company. Right socks, please report to the hamper for reassignment. There is no cause for alarm. There is only cause for laundry.',
  },
  {
    title: 'Dead Sea Retreat',
    text: 'Shalom, team! This year our company retreat is at the Dead Sea. The water is so salty that every sock floats, even the ones with low self esteem. Pack sunscreen, pack hummus, and do not, under any circumstances, rub salt water in your eyes. Sababa.',
  },
  {
    title: 'The Dryer Incident',
    text: 'It has come to our attention that forty two socks entered the dryer on Tuesday and only thirty nine came out. We take this very seriously. We have hired a lint consultant. To the three socks we lost: your pairs miss you. We all miss you.',
  },
]

const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window
const AUDIENCE = ['#ff5fa2', '#ffd23f', '#5ad1ff', '#7ee081', '#b388ff', '#ff8c42', '#3ddbd9']

function Accessory({ kind }) {
  if (kind === 'tie')
    return <path d="M124 182 h16 l-4 10 l10 60 l-14 16 l-14 -16 l10 -60 z" fill="#ff6b6b" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
  if (kind === 'bowtie')
    return (
      <g stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round">
        <path d="M132 196 l-26 -14 v28 z M132 196 l26 -14 v28 z" fill="#7ee081" />
        <circle cx="132" cy="196" r="6" fill="#ffd23f" />
      </g>
    )
  return (
    <g>
      <path d="M100 176 L132 214 L164 176" fill="none" stroke="#ffd23f" strokeWidth="4" />
      <rect x="110" y="212" width="44" height="30" rx="5" fill="#fff" stroke="var(--ink)" strokeWidth="3" />
      <text x="132" y="232" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">INTERN</text>
    </g>
  )
}

function Puppet({ puppet, mouthOpen, gaze }) {
  const uid = useId().replace(/:/g, '')
  const fill = `puppet-${uid}`
  const head = 'M60 160 V110 Q60 34 132 34 Q204 34 204 110 V160 Z'
  const body = 'M60 160 H204 V300 H60 Z'

  return (
    <svg className="puppet sock" viewBox="0 0 264 300" role="img" aria-label={`${puppet.name}, a sock puppet`}>
      <defs>
        <PatternTile id={fill} pattern={puppet.look.pattern} accent={puppet.look.accent} />
      </defs>

      {/* Hidden behind the head until the jaw tilts open. */}
      <ellipse cx="140" cy="160" rx="66" ry="36" fill="#5b1530" stroke="var(--ink)" strokeWidth="3" />
      <ellipse cx="168" cy="154" rx="26" ry="8" fill="#ff8fab" />

      <g>
        <path d={body} fill={puppet.look.base} />
        <path d={body} fill={`url(#${fill})`} />
        <rect x="60" y="268" width="144" height="32" fill={puppet.look.accent} />
        <path d={body} fill="none" stroke="var(--ink)" strokeWidth="4" />
        <Accessory kind={puppet.accessory} />
      </g>

      <g className="puppet__head" style={{ transform: mouthOpen ? 'rotate(-12deg)' : 'none' }}>
        <path d={head} fill={puppet.look.base} />
        <path d={head} fill={`url(#${fill})`} />
        <path d={head} fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
        {[104, 160].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="92" r="20" fill="#fff" stroke="var(--ink)" strokeWidth="3" />
            <circle cx={cx + gaze.x} cy={92 + gaze.y} r="9" fill="var(--ink)" />
          </g>
        ))}
      </g>
    </svg>
  )
}

export default function PuppetBoardroom({ celebrate }) {
  const t = useCopy()
  const [castKey, setCastKey] = useState(CAST[0].key)
  const [script, setScript] = useState(SPEECHES[0].text)
  const [speaking, setSpeaking] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(false)
  const [wordIndex, setWordIndex] = useState(null)
  const [ovation, setOvation] = useState(false)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [miming, setMiming] = useState(!hasSpeech)
  const timerRef = useRef(null)
  const watchdogRef = useRef(null)
  const utteranceRef = useRef(null)
  const stageRef = useRef(null)

  const puppet = CAST.find((c) => c.key === castKey)
  const words = useMemo(() => script.split(/\s+/).filter(Boolean), [script])

  const stopAll = useCallback(() => {
    clearInterval(timerRef.current)
    clearTimeout(watchdogRef.current)
    utteranceRef.current = null
    if (hasSpeech) window.speechSynthesis.cancel()
  }, [])

  useEffect(() => stopAll, [stopAll])

  useEffect(() => {
    if (!speaking) return
    const flap = setInterval(() => setMouthOpen((open) => !open && Math.random() > 0.2), 120)
    return () => {
      clearInterval(flap)
      setMouthOpen(false)
    }
  }, [speaking])

  useEffect(() => {
    if (!ovation) return
    const timer = setTimeout(() => setOvation(false), 2600)
    return () => clearTimeout(timer)
  }, [ovation])

  const finish = (applause) => {
    stopAll()
    setSpeaking(false)
    setWordIndex(null)
    if (applause) {
      setOvation(true)
      celebrate()
    }
  }

  const mime = () => {
    stopAll()
    setMiming(true)
    let i = 0
    setWordIndex(0)
    timerRef.current = setInterval(() => {
      i += 1
      if (i >= words.length) finish(true)
      else setWordIndex(i)
    }, 380 / puppet.rate)
  }

  const present = () => {
    if (words.length === 0) return
    stopAll()
    setSpeaking(true)
    setWordIndex(null)
    if (!hasSpeech) return mime()

    const u = new SpeechSynthesisUtterance(script)
    u.pitch = puppet.pitch
    u.rate = puppet.rate
    // Cancelling an old utterance fires its end event later; ignore stale ones.
    const current = () => utteranceRef.current === u
    u.onstart = () => clearTimeout(watchdogRef.current)
    u.onboundary = (e) => current() && setWordIndex(script.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length)
    u.onend = () => current() && finish(true)
    u.onerror = () => current() && mime()
    utteranceRef.current = u
    // Some browsers expose the API but have no voices and never start; mime instead.
    watchdogRef.current = setTimeout(() => current() && mime(), 1500)
    window.speechSynthesis.speak(u)
  }

  const lookAt = (e) => {
    const box = stageRef.current.getBoundingClientRect()
    const dx = e.clientX - (box.left + box.width / 2)
    const dy = e.clientY - (box.top + box.height / 3)
    const len = Math.hypot(dx, dy) || 1
    const reach = Math.min(8, len / 20)
    setGaze({ x: (dx / len) * reach, y: (dy / len) * reach })
  }

  return (
    <section onPointerMove={lookAt}>
      <div className="app-head">
        <div>
          <h2>{t.apps.puppet}</h2>
          <p>Write your speech. A sock puppet executive delivers it to the board, out loud. Shareholders react accordingly.</p>
        </div>
      </div>

      <div className="boardroom">
        <div className="boardroom__stage" ref={stageRef}>
          <div className="curtain curtain--left" aria-hidden="true" />
          <div className="curtain curtain--right" aria-hidden="true" />
          <div className={`boardroom__puppet ${speaking ? 'is-speaking' : ''}`}>
            <Puppet puppet={puppet} mouthOpen={mouthOpen} gaze={gaze} />
          </div>
          <div className="nameplate">
            <strong>{puppet.name}</strong>
            <span>{puppet.role}</span>
          </div>
          <ul className={`audience ${ovation ? 'audience--ovation' : ''}`} aria-label="Shareholders">
            {AUDIENCE.map((color, i) => (
              <li key={color} style={{ '--delay': `${i * 0.07}s` }}>
                <Sock look={{ base: color, accent: '#ffffff', pattern: 'stripes' }} height={54} />
              </li>
            ))}
          </ul>
        </div>

        <div className="boardroom__controls">
          <fieldset className="cast">
            <legend>Presenter</legend>
            {CAST.map((c) => (
              <label key={c.key} className={`cast__option ${c.key === castKey ? 'is-picked' : ''}`}>
                <input type="radio" name="cast" value={c.key} checked={c.key === castKey} onChange={() => setCastKey(c.key)} disabled={speaking} />
                <Sock look={c.look} height={40} />
                <span>{c.name}</span>
              </label>
            ))}
          </fieldset>

          <div className="presets" role="group" aria-label="Speech presets">
            {SPEECHES.map((s) => (
              <button key={s.title} className="btn btn--small btn--ghost" onClick={() => setScript(s.text)} disabled={speaking}>
                {s.title}
              </button>
            ))}
          </div>

          <label className="visually-hidden" htmlFor="script">Speech</label>
          {speaking ? (
            <p className="caption" aria-live="off">
              {words.map((w, i) => (
                <span key={i} className={i === wordIndex ? 'caption__now' : undefined}>
                  {w}{' '}
                </span>
              ))}
            </p>
          ) : (
            <textarea id="script" className="field script" value={script} onChange={(e) => setScript(e.target.value)} rows={7} />
          )}

          <div className="boardroom__go">
            {speaking ? (
              <button className="btn btn--pink" onClick={() => finish(false)}>⏹ Stop presentation</button>
            ) : (
              <button className="btn btn--green" onClick={present} disabled={words.length === 0}>🎤 Present to the board</button>
            )}
            {miming && <small>Your browser can't talk, so the puppet will mime.</small>}
          </div>
        </div>
      </div>
    </section>
  )
}
