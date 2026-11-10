import { shuffle } from '../../lib/random'

export const W = 800
export const H = 640
export const LAUNCHER = { x: W / 2, y: 52 }
export const BALL_R = 9
export const PEG_R = 11
export const BUCKET = { y: H - 30, w: 116, h: 30, speed: 150 }
export const STARTING_BALLS = 10

const LAUNCH_SPEED = 640
const MAX_SPEED = 1100
const RESTITUTION = 0.78
const MAX_AIM = (84 * Math.PI) / 180
const SUBSTEPS = 4
const STUCK_SPEED = 45
const STUCK_SECONDS = 1.2
const FRENZY_HITS = 12
const FRENZY_BONUS = 2500
const LEFTOVER_BALL_BONUS = 1000
const POINTS = { plain: 10, stinky: 100, golden: 500, clone: 10 }

export function createGame(level) {
  const pegs = level.layout().map((spot, id) => ({
    id,
    x: spot.x,
    y: spot.y,
    orbit: spot.orbit ?? null,
    kind: 'plain',
    hit: false,
    gone: false,
  }))
  const order = shuffle(pegs.map((p) => p.id))
  const stinkyTotal = Math.round(pegs.length * 0.25)
  order.slice(0, stinkyTotal).forEach((id) => (pegs[id].kind = 'stinky'))
  order.slice(stinkyTotal, stinkyTotal + 2).forEach((id) => (pegs[id].kind = 'clone'))
  pegs[order[stinkyTotal + 2]].kind = 'golden'

  return {
    level,
    pegs,
    stinkyTotal,
    balls: [],
    popups: [],
    events: [],
    ballsLeft: STARTING_BALLS,
    score: 0,
    shotScore: 0,
    shotHits: 0,
    phase: 'aim',
    aim: 0,
    bucket: { x: W / 2 - BUCKET.w / 2, dir: 1 },
    slowMo: 0,
    time: 0,
  }
}

export const stinkyLeft = (game) => game.pegs.filter((p) => p.kind === 'stinky' && !p.hit).length

export function multiplier(game) {
  const cleared = 1 - stinkyLeft(game) / game.stinkyTotal
  if (cleared >= 0.85) return 5
  if (cleared >= 0.65) return 3
  if (cleared >= 0.4) return 2
  return 1
}

export function aimAt(game, x, y) {
  const angle = Math.atan2(x - LAUNCHER.x, Math.max(1, y - LAUNCHER.y))
  game.aim = Math.max(-MAX_AIM, Math.min(MAX_AIM, angle))
}

export function nudgeAim(game, radians) {
  game.aim = Math.max(-MAX_AIM, Math.min(MAX_AIM, game.aim + radians))
}

export function shoot(game) {
  if (game.phase !== 'aim' || game.ballsLeft === 0) return
  game.ballsLeft -= 1
  game.shotScore = 0
  game.shotHits = 0
  game.phase = 'flying'
  game.balls.push({
    x: LAUNCHER.x + Math.sin(game.aim) * 40,
    y: LAUNCHER.y + Math.cos(game.aim) * 40,
    vx: Math.sin(game.aim) * LAUNCH_SPEED,
    vy: Math.cos(game.aim) * LAUNCH_SPEED,
    rot: 0,
    slow: 0,
    done: false,
  })
  game.events.push({ type: 'shoot' })
}

export function drainEvents(game) {
  const events = game.events
  game.events = []
  return events
}

export function step(game, realDt) {
  const dtReal = Math.min(realDt, 1 / 30)
  game.time += dtReal
  game.slowMo = Math.max(0, game.slowMo - dtReal)
  const dt = dtReal * (game.slowMo > 0 ? 0.25 : 1)

  game.popups = game.popups.filter((p) => (p.age += dtReal) < 1.1)
  game.popups.forEach((p) => (p.y -= 40 * dtReal))
  moveBucket(game, dt)
  moveOrbits(game, dt)

  if (game.phase !== 'flying') return
  for (let i = 0; i < SUBSTEPS; i++) {
    for (const ball of game.balls) if (!ball.done) moveBall(game, ball, dt / SUBSTEPS)
  }
  game.balls = game.balls.filter((b) => !b.done)
  if (game.balls.length === 0) endShot(game)
}

// Path preview up to the first peg the shot would touch.
export function predictPath(game, maxSteps = 70) {
  const points = []
  let x = LAUNCHER.x + Math.sin(game.aim) * 40
  let y = LAUNCHER.y + Math.cos(game.aim) * 40
  let vx = Math.sin(game.aim) * LAUNCH_SPEED
  let vy = Math.cos(game.aim) * LAUNCH_SPEED
  const h = 1 / 60
  for (let i = 0; i < maxSteps; i++) {
    vy += game.level.gravity * h
    x += vx * h
    y += vy * h
    if (x < BALL_R || x > W - BALL_R || y > H) break
    points.push({ x, y })
    if (game.pegs.some((p) => !p.gone && Math.hypot(x - p.x, y - p.y) < BALL_R + PEG_R)) break
  }
  return points
}

function moveBucket(game, dt) {
  const b = game.bucket
  b.x += b.dir * BUCKET.speed * dt
  if (b.x < 0 || b.x + BUCKET.w > W) {
    b.dir *= -1
    b.x = Math.max(0, Math.min(W - BUCKET.w, b.x))
  }
}

function moveOrbits(game, dt) {
  for (const p of game.pegs) {
    if (!p.orbit) continue
    p.orbit.angle += p.orbit.speed * dt
    p.x = p.orbit.cx + Math.cos(p.orbit.angle) * p.orbit.radius
    p.y = p.orbit.cy + Math.sin(p.orbit.angle) * p.orbit.radius
  }
}

function moveBall(game, ball, h) {
  ball.vy += game.level.gravity * h
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  ball.x += ball.vx * h
  ball.y += ball.vy * h
  ball.rot += (ball.vx * h) / BALL_R

  if (ball.x < BALL_R || ball.x > W - BALL_R) {
    ball.x = Math.max(BALL_R, Math.min(W - BALL_R, ball.x))
    ball.vx *= -0.9
  }
  if (ball.y < BALL_R) {
    ball.y = BALL_R
    ball.vy = Math.abs(ball.vy)
  }

  for (const peg of game.pegs) {
    if (peg.gone) continue
    const dx = ball.x - peg.x
    const dy = ball.y - peg.y
    const dist = Math.hypot(dx, dy)
    const minDist = BALL_R + PEG_R
    if (dist >= minDist || dist === 0) continue
    const nx = dx / dist
    const ny = dy / dist
    ball.x = peg.x + nx * minDist
    ball.y = peg.y + ny * minDist
    const vn = ball.vx * nx + ball.vy * ny
    if (vn < 0) {
      ball.vx -= (1 + RESTITUTION) * vn * nx
      ball.vy -= (1 + RESTITUTION) * vn * ny
    }
    if (!peg.hit) hitPeg(game, peg, ball)
  }

  const b = game.bucket
  if (ball.vy > 0 && ball.y + BALL_R >= BUCKET.y && ball.y < BUCKET.y + 14 && ball.x > b.x && ball.x < b.x + BUCKET.w) {
    ball.done = true
    game.ballsLeft += 1
    game.popups.push({ x: ball.x, y: BUCKET.y - 20, text: 'FREE SOCK!', age: 0, big: true })
    game.events.push({ type: 'bucket' })
    return
  }

  if (ball.y > H + BALL_R * 2) ball.done = true

  // A ball resting on pegs would never finish the shot; clear what it has lit.
  ball.slow = Math.hypot(ball.vx, ball.vy) < STUCK_SPEED ? ball.slow + h : 0
  if (ball.slow > STUCK_SECONDS) {
    game.pegs.forEach((p) => p.hit && (p.gone = true))
    ball.slow = 0
    game.events.push({ type: 'unstuck' })
  }
}

function hitPeg(game, peg, ball) {
  peg.hit = true
  game.shotHits += 1
  const points = POINTS[peg.kind] * multiplier(game)
  game.shotScore += points
  game.popups.push({ x: peg.x, y: peg.y - 14, text: `+${points}`, age: 0, big: peg.kind === 'golden' })
  game.events.push({ type: 'hit', kind: peg.kind, streak: game.shotHits })

  if (peg.kind === 'clone') {
    game.balls.push({ ...ball, vx: -ball.vx || 120, vy: ball.vy, slow: 0, done: false })
    game.popups.push({ x: peg.x, y: peg.y - 34, text: 'SOCK CLONED!', age: 0, big: true })
  }
  if (peg.kind === 'stinky' && stinkyLeft(game) === 0) {
    game.slowMo = 1.6
    game.events.push({ type: 'finale' })
  }
}

function endShot(game) {
  game.pegs.forEach((p) => p.hit && (p.gone = true))
  const bonus = game.shotHits >= FRENZY_HITS ? FRENZY_BONUS : 0
  game.score += game.shotScore + bonus
  game.events.push({ type: 'shotEnd', hits: game.shotHits, points: game.shotScore, bonus })

  if (stinkyLeft(game) === 0) {
    game.score += game.ballsLeft * LEFTOVER_BALL_BONUS
    game.phase = 'won'
    game.events.push({ type: 'won' })
  } else if (game.ballsLeft === 0) {
    game.phase = 'lost'
    game.events.push({ type: 'lost' })
  } else {
    game.phase = 'aim'
    relocateGolden(game)
  }
}

function relocateGolden(game) {
  const current = game.pegs.find((p) => p.kind === 'golden' && !p.gone)
  if (current) current.kind = 'plain'
  const candidates = game.pegs.filter((p) => p.kind === 'plain' && !p.gone)
  if (candidates.length) candidates[Math.floor(Math.random() * candidates.length)].kind = 'golden'
}
