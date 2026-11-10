import { useEffect, useMemo, useState } from 'react'
import Sock from '../components/Sock'
import { useCopy } from '../lib/copy'
import './Sockonomics.css'

const DAYS_SHOWN = 7
const TICKERS = ['ARGYL', 'TUBE', 'KNEE', 'ANKL', 'CREW', 'TOE', 'WOOL', 'LINT']

// Chart geometry in SVG user units.
const W = 700
const LEFT = 36
const FLOOR = 228
const ZERO = 210
const TOP = 24
const SLOT = (W - LEFT) / DAYS_SHOWN
const LEG = 34

function lastDays(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const start = new Date(today)
    start.setDate(today.getDate() - (DAYS_SHOWN - 1 - i))
    return start
  })
}

function niceMax(n) {
  return Math.max(4, Math.ceil(n / 2) * 2)
}

function sockPath(x, legTop) {
  const r = 4
  return [
    `M${x} ${legTop + r}`,
    `Q${x} ${legTop} ${x + r} ${legTop}`,
    `H${x + LEG - r}`,
    `Q${x + LEG} ${legTop} ${x + LEG} ${legTop + r}`,
    `V${ZERO}`,
    `H${x + LEG + 12}`,
    `Q${x + LEG + 24} ${ZERO} ${x + LEG + 24} ${(ZERO + FLOOR) / 2}`,
    `Q${x + LEG + 24} ${FLOOR} ${x + LEG + 12} ${FLOOR}`,
    `H${x}`,
    'Z',
  ].join(' ')
}

function SockChart({ days }) {
  const [hover, setHover] = useState(null)
  const [showTable, setShowTable] = useState(false)
  const max = niceMax(Math.max(...days.map((d) => d.count)))
  const scale = (ZERO - TOP) / max
  const peak = days.reduce((best, d, i) => (d.count > days[best].count ? i : best), 0)
  const ticks = [0, max / 2, max]
  const fmt = (date) => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <figure className="chart">
      <figcaption className="chart__title">
        Socks knocked off per day <small>last {DAYS_SHOWN} days · leg length = socks</small>
      </figcaption>
      <div className="chart__plot">
        <svg viewBox={`0 0 ${W} 260`} role="img" aria-label="Bar chart of socks knocked off per day">
          <defs>
            <pattern id="chart-stripes" width="10" height="12" patternUnits="userSpaceOnUse">
              <rect width="10" height="5" fill="#fff" fillOpacity="0.35" />
            </pattern>
          </defs>
          {ticks.map((v) => (
            <g key={v} className="chart__grid">
              <line x1={LEFT} x2={W} y1={ZERO - v * scale} y2={ZERO - v * scale} />
              <text x={LEFT - 8} y={ZERO - v * scale + 4} textAnchor="end">{v}</text>
            </g>
          ))}
          {days.map((d, i) => {
            const x = LEFT + i * SLOT + (SLOT - LEG - 24) / 2
            const legTop = ZERO - d.count * scale
            const path = sockPath(x, legTop)
            return (
              <g
                key={d.date.toISOString()}
                className={`chart__bar ${hover === i ? 'is-hover' : ''}`}
                tabIndex={0}
                aria-label={`${fmt(d.date)}: ${d.count} socks knocked off`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                <rect className="chart__hit" x={LEFT + i * SLOT} y={TOP - 20} width={SLOT} height={FLOOR - TOP + 20} />
                <path d={path} className="chart__sock" />
                <path d={path} fill="url(#chart-stripes)" pointerEvents="none" />
                {d.count > 0 && i === peak && (
                  <text className="chart__peak" x={x + LEG / 2} y={legTop - 8} textAnchor="middle">{d.count} 🏆</text>
                )}
                <text className="chart__day" x={x + LEG / 2 + 6} y={FLOOR + 22} textAnchor="middle">
                  {d.date.toLocaleDateString(undefined, { weekday: 'short' })}
                </text>
              </g>
            )
          })}
          <line className="chart__floor" x1={LEFT} x2={W} y1={FLOOR} y2={FLOOR} />
        </svg>
        {hover !== null && (
          <div className="chart__tooltip" style={{ left: `${((LEFT + (hover + 0.5) * SLOT) / W) * 100}%` }} role="status">
            <span>
              <strong>{days[hover].count}</strong> {days[hover].count === 1 ? 'sock' : 'socks'} knocked off
            </span>
            <small>{fmt(days[hover].date)}</small>
            {days[hover].count === 0 && <small>A no-show sock day.</small>}
          </div>
        )}
      </div>
      <button className="btn btn--small btn--ghost" onClick={() => setShowTable((s) => !s)} aria-expanded={showTable}>
        {showTable ? 'Hide' : 'Show'} as table
      </button>
      {showTable && (
        <table className="chart__table">
          <thead>
            <tr><th scope="col">Day</th><th scope="col">Socks knocked off</th></tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date.toISOString()}><td>{fmt(d.date)}</td><td>{d.count}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  )
}

function useTicker() {
  const [prices, setPrices] = useState(() =>
    TICKERS.map((symbol) => ({ symbol, price: 20 + Math.random() * 80, change: 0 })),
  )
  useEffect(() => {
    const timer = setInterval(() => {
      setPrices((list) =>
        list.map((s) => {
          // LINT only ever goes down. Nobody wants more lint.
          const pct = s.symbol === 'LINT' ? -Math.random() * 3 : (Math.random() - 0.42) * 6
          return { ...s, price: Math.max(1, s.price * (1 + pct / 100)), change: pct }
        }),
      )
    }, 2500)
    return () => clearInterval(timer)
  }, [])
  return prices
}

function Ticker() {
  const prices = useTicker()
  const row = prices.map((s) => (
    <span key={s.symbol} className={`ticker__item ${s.change < 0 ? 'is-down' : 'is-up'}`}>
      <strong>{s.symbol}</strong> {s.price.toFixed(2)} {s.change < 0 ? '▼' : '▲'} {Math.abs(s.change).toFixed(1)}%
    </span>
  ))
  return (
    <div className="ticker" aria-label="Fictional sock stock ticker">
      <div className="ticker__track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  )
}

export default function Sockonomics({ tasks, gremlins }) {
  const t = useCopy()
  const days = useMemo(() => {
    return lastDays().map((date) => {
      const end = new Date(date)
      end.setDate(date.getDate() + 1)
      const [from, to] = [date.getTime(), end.getTime()]
      const count = tasks.filter((x) => x.status === 'off' && x.knockedOffAt >= from && x.knockedOffAt < to).length
      return { date, count }
    })
  }, [tasks])

  const count = (status) => tasks.filter((x) => x.status === status).length
  const off = count('off')
  const active = count('hamper') + count('line') + off
  const week = days.reduce((sum, d) => sum + d.count, 0)
  const rate = active ? Math.round((off / active) * 100) : 0

  const tiles = [
    { label: 'Socks knocked off', value: off, color: 'var(--green)' },
    { label: 'Knocked off this week', value: week, color: 'var(--yellow)' },
    { label: 'Knock-off rate', value: `${rate}%`, color: 'var(--blue)' },
    { label: 'Lost to the dryer', value: count('dryer'), color: 'var(--purple)' },
    { label: 'Gremlins apprehended', value: gremlins, color: '#a3e635' },
  ]

  return (
    <section>
      <div className="app-head">
        <div>
          <h2>{t.apps.sockonomics}</h2>
          <p>The quarterly hosiery report, live from your Clothesline. Show this to shareholders. Watch their socks leave.</p>
        </div>
      </div>

      <Ticker />

      <div className="tiles">
        {tiles.map((tile) => (
          <div key={tile.label} className="tile" style={{ '--tile': tile.color }}>
            <span className="tile__value">{tile.value}</span>
            <span className="tile__label">{tile.label}</span>
          </div>
        ))}
      </div>

      <div className="report">
        <SockChart days={days} />
        <aside className="letter">
          <Sock seed="letter" look={{ base: '#ffd23f', accent: '#ff5fa2', pattern: 'hearts' }} height={80} />
          <h3>Letter to shareholders</h3>
          <p>
            Dear shareholders, this week our people knocked off <strong>{week}</strong> socks for a lifetime knock-off rate of{' '}
            <strong>{rate}%</strong>. {count('line') > 0 ? `${count('line')} more are drying on the line as we speak.` : 'The line is clear.'}{' '}
            {count('dryer') > 0 ? `We regret to report ${count('dryer')} in the dryer. We are monitoring the situation.` : 'The dryer has claimed no one. For now.'}
          </p>
          <p className="letter__sign">— Sockrates, Chief Executive Sock</p>
        </aside>
      </div>

      <p className="disclaimer">Ticker is entirely fictional hosiery. Not financial advice. Please do not invest in socks.</p>
    </section>
  )
}
