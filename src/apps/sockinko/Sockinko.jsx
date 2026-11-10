import { useEffect, useRef, useState } from 'react'
import Sock from '../../components/Sock'
import { useCopy } from '../../lib/copy'
import { usePersistentState } from '../../lib/storage'
import { H, W, aimAt, createGame, drainEvents, multiplier, nudgeAim, predictPath, shoot, step, stinkyLeft } from './engine'
import { LEVELS } from './levels'
import { quip } from './quips'
import { SKIN_NAMES, drawGame } from './render'
import { sounds } from './sound'
import './Sockinko.css'

const NUDGE = (2 * Math.PI) / 180
const STREAK_QUIPS = { 5: 'streak5', 10: 'streak10', 15: 'streak15' }

function readHud(game) {
  return {
    ballsLeft: game.ballsLeft,
    score: game.score + (game.phase === 'flying' ? game.shotScore : 0),
    multiplier: multiplier(game),
    stinkyLeft: stinkyLeft(game),
    phase: game.phase,
  }
}

export default function Sockinko({ celebrate }) {
  const t = useCopy()
  const [levelKey, setLevelKey] = useState(LEVELS[0].key)
  const [round, setRound] = useState(0)
  const [skin, setSkin] = usePersistentState('sockoffice.sockinko.skin', 'sockball')
  const [muted, setMuted] = usePersistentState('sockoffice.sockinko.muted', false)
  const [best, setBest] = usePersistentState('sockoffice.sockinko.best', 0)
  const [hud, setHud] = useState(null)
  const [line, setLine] = useState(() => quip('start'))
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const live = useRef({})
  const level = LEVELS.find((l) => l.key === levelKey)
  const levelIndex = LEVELS.indexOf(level)

  useEffect(() => {
    live.current = { skin, muted, celebrate }
  }, [skin, muted, celebrate])

  useEffect(() => {
    const game = createGame(level)
    gameRef.current = game
    setLine(quip(level.key === 'deadsea' ? 'deadsea' : 'start'))

    const canvas = canvasRef.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const play = (name, arg) => !live.current.muted && sounds[name](arg)

    const handle = (e) => {
      if (e.type === 'shoot') play('shoot')
      if (e.type === 'hit') {
        play('peg', e.streak)
        if (e.kind === 'golden') setLine(quip('golden'))
        else if (e.kind === 'clone') {
          play('clone')
          setLine(quip('clone'))
        } else if (STREAK_QUIPS[e.streak]) setLine(quip(STREAK_QUIPS[e.streak]))
      }
      if (e.type === 'bucket') {
        play('bucket')
        setLine(quip('bucket'))
      }
      if (e.type === 'unstuck') setLine(quip('unstuck'))
      if (e.type === 'finale') play('finale')
      if (e.type === 'shotEnd') {
        if (e.bonus) setLine(quip('frenzy'))
        else if (e.hits === 0) setLine(quip('miss'))
      }
      if (e.type === 'won' || e.type === 'lost') {
        play(e.type)
        setLine(quip(e.type))
        setBest((b) => Math.max(b, game.score))
        if (e.type === 'won') live.current.celebrate('EXTREME SOCK KNOCK!')
      }
    }

    let last = performance.now()
    let hudKey = ''
    let raf
    const frame = (now) => {
      step(game, (now - last) / 1000)
      last = now
      drainEvents(game).forEach(handle)
      drawGame(ctx, game, { skin: live.current.skin, aimPath: game.phase === 'aim' ? predictPath(game) : null })
      const next = readHud(game)
      const key = JSON.stringify(next)
      if (key !== hudKey) {
        hudKey = key
        setHud(next)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [level, round, setBest])

  const toGame = (e) => {
    const box = canvasRef.current.getBoundingClientRect()
    return [((e.clientX - box.left) / box.width) * W, ((e.clientY - box.top) / box.height) * H]
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    aimAt(gameRef.current, ...toGame(e))
  }
  const onPointerMove = (e) => {
    if (e.pointerType === 'mouse' || e.buttons) aimAt(gameRef.current, ...toGame(e))
  }
  const onPointerUp = () => shoot(gameRef.current)

  const onKeyDown = (e) => {
    const game = gameRef.current
    if (e.key === 'ArrowLeft') nudgeAim(game, NUDGE)
    else if (e.key === 'ArrowRight') nudgeAim(game, -NUDGE)
    else if (e.key === ' ' || e.key === 'Enter') shoot(game)
    else return
    e.preventDefault()
  }

  const restart = () => setRound((r) => r + 1)
  const nextLevel = () => setLevelKey(LEVELS[(levelIndex + 1) % LEVELS.length].key)
  const over = hud && (hud.phase === 'won' || hud.phase === 'lost')

  return (
    <section className="sockinko">
      <div className="app-head">
        <div>
          <h2>{t.apps.sockinko}</h2>
          <p>Fire socks from a washing machine. Knock off every <span className="stinky-word">stinky sock</span>. Catch the basket for a free sock. Science has no explanation.</p>
        </div>
        <div className="sockinko__toggles">
          <button className="btn btn--small btn--ghost" onClick={() => setMuted((m) => !m)} aria-pressed={!muted}>
            {muted ? '🔇 Sound off' : '🔊 Sound on'}
          </button>
          <button className="btn btn--small btn--ghost" onClick={restart}>↻ Restart</button>
        </div>
      </div>

      <div className="sockinko__layout">
        <div className="sockinko__board">
          {hud && (
            <div className="hud">
              <span className="hud__balls" aria-label={`${hud.ballsLeft} socks left`}>
                {Array.from({ length: Math.min(hud.ballsLeft, 10) }, (_, i) => (
                  <Sock key={i} look={{ base: '#ff5fa2', accent: '#ffd23f', pattern: 'stripes' }} height={26} />
                ))}
                {hud.ballsLeft > 10 && <b>+{hud.ballsLeft - 10}</b>}
              </span>
              <span className="hud__stat"><small>Score</small>{hud.score.toLocaleString()}</span>
              <span className={`hud__stat hud__mult hud__mult--${hud.multiplier}`}><small>Multiplier</small>×{hud.multiplier}</span>
              <span className="hud__stat"><small>Stinky left</small>{hud.stinkyLeft}</span>
            </div>
          )}
          <div className="sockinko__canvas-wrap">
            <canvas
              ref={canvasRef}
              tabIndex={0}
              aria-label="Sockinko board. Move to aim, click or press space to fire, arrow keys to fine-tune."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onKeyDown={onKeyDown}
            />
            {over && (
              <div className="sockinko__over">
                <h3>{hud.phase === 'won' ? '🧦 ALL SOCKS KNOCKED OFF 🧦' : '💨 The stink prevails'}</h3>
                <p className="sockinko__final">{hud.score.toLocaleString()} points</p>
                {hud.score >= best && hud.score > 0 && <p className="sockinko__record">New personal best!</p>}
                <div className="sockinko__over-actions">
                  <button className="btn btn--pink" onClick={restart}>Again!</button>
                  <button className="btn btn--green" onClick={nextLevel}>Next level →</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="sockinko__side">
          <div className="narrator">
            <Sock look={{ base: '#b388ff', accent: '#ffd23f', pattern: 'argyle' }} height={70} className="narrator__sock" />
            <p className="narrator__line" aria-live="polite">{line}</p>
          </div>

          <div className="sockinko__levels" role="radiogroup" aria-label="Level">
            {LEVELS.map((l) => (
              <button key={l.key} role="radio" aria-checked={l.key === levelKey} className="level-pick" onClick={() => setLevelKey(l.key)}>
                <strong>{l.name}</strong>
                <small>{l.blurb}</small>
              </button>
            ))}
          </div>

          <fieldset className="skins">
            <legend>Ammunition</legend>
            {Object.entries(SKIN_NAMES).map(([key, name]) => (
              <label key={key} className={`skin ${skin === key ? 'is-picked' : ''}`}>
                <input type="radio" name="skin" value={key} checked={skin === key} onChange={() => setSkin(key)} />
                <span className={`skin__dot skin__dot--${key}`} aria-hidden="true" /> {name}
              </label>
            ))}
          </fieldset>

          <dl className="legend">
            <div><dt><span className="peg peg--stinky" /></dt><dd>Stinky sock. Knock off all of them.</dd></div>
            <div><dt><span className="peg peg--golden" /></dt><dd>Golden sock. 500 points. Moves every turn.</dd></div>
            <div><dt><span className="peg peg--clone" /></dt><dd>Clone sock. Splits your shot in two.</dd></div>
            <div><dt><span className="peg peg--plain" /></dt><dd>Button. Ten points of pure dignity.</dd></div>
          </dl>

          <p className="best">Personal best: <strong>{best.toLocaleString()}</strong></p>
        </aside>
      </div>
    </section>
  )
}
