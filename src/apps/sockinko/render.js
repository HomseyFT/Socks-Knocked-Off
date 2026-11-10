import { BALL_R, BUCKET, H, LAUNCHER, PEG_R, W } from './engine'
import { hexagramTriangles } from './levels'

const INK = '#2b1d4e'
const KIND_FILL = { stinky: '#9ccc3c', golden: '#ffd23f', clone: '#ff5fa2' }
const TAU = Math.PI * 2

function circle(ctx, x, y, r, fill, stroke = INK, width = 2.5) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.lineWidth = width
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

function drawBackground(ctx, { sky, decor }, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, sky[0])
  grad.addColorStop(1, sky[1])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  if (decor === 'bubbles') {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 2
    for (let i = 0; i < 18; i++) {
      const x = (i * 97) % W
      const y = H - ((t * (20 + (i % 5) * 8) + i * 61) % (H + 40))
      ctx.beginPath()
      ctx.arc(x + Math.sin(t + i) * 10, y, 6 + (i % 4) * 4, 0, TAU)
      ctx.stroke()
    }
  } else if (decor === 'deadsea') {
    circle(ctx, 680, 90, 46, '#ffd23f', null)
    ctx.fillStyle = 'rgba(255,210,63,0.35)'
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + t * 0.2
      ctx.fillRect(680 + Math.cos(a) * 58 - 3, 90 + Math.sin(a) * 58 - 3, 6, 6)
    }
    ctx.fillStyle = 'rgba(0,56,184,0.12)'
    for (let band = 0; band < 3; band++) {
      ctx.beginPath()
      ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 470 + band * 40 + Math.sin(x / 60 + t + band) * 8)
      ctx.lineTo(W, H)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    for (let i = 0; i < 14; i++) ctx.fillRect((i * 131) % W, 600 + (i % 3) * 8, 5, 5)
    ctx.strokeStyle = 'rgba(0,56,184,0.22)'
    ctx.lineWidth = 10
    ctx.lineJoin = 'round'
    for (const [a, b, c] of hexagramTriangles()) {
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.lineTo(c.x, c.y)
      ctx.closePath()
      ctx.stroke()
    }
  } else if (decor === 'dryer') {
    ctx.translate(400, 360)
    ctx.rotate(t * 0.3)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 18
    for (let r = 60; r < 520; r += 70) {
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, TAU * 0.8)
      ctx.stroke()
    }
  } else if (decor === 'polka') {
    ctx.fillStyle = 'rgba(255,95,162,0.15)'
    for (let y = 20; y < H; y += 48) for (let x = (y / 48) % 2 ? 24 : 0; x < W; x += 48) circle(ctx, x, y, 8, ctx.fillStyle, null)
  }
  ctx.restore()
}

function drawPeg(ctx, peg, plainFill, t) {
  const fill = peg.kind === 'plain' ? plainFill : KIND_FILL[peg.kind]
  if (peg.hit) {
    circle(ctx, peg.x, peg.y, PEG_R + 5, 'rgba(255,255,255,0.75)', null)
  }
  circle(ctx, peg.x, peg.y, PEG_R, fill, INK, peg.hit ? 3.5 : 2.5)

  ctx.fillStyle = INK
  if (peg.kind === 'plain') {
    for (const [dx, dy] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) {
      ctx.beginPath()
      ctx.arc(peg.x + dx, peg.y + dy, 1.4, 0, TAU)
      ctx.fill()
    }
  } else if (peg.kind === 'stinky' && !peg.hit) {
    ctx.strokeStyle = 'rgba(80,110,20,0.8)'
    ctx.lineWidth = 2
    for (const dx of [-5, 0, 5]) {
      ctx.beginPath()
      for (let k = 0; k <= 8; k++) {
        const y = peg.y - PEG_R - 2 - k * 2
        const x = peg.x + dx + Math.sin(k * 0.9 + t * 6 + dx) * 2
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      }
      ctx.stroke()
    }
  } else if (peg.kind === 'golden') {
    ctx.font = '700 13px Fredoka, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('★', peg.x, peg.y + 1)
  } else if (peg.kind === 'clone') {
    ctx.font = '700 11px Fredoka, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('×2', peg.x, peg.y + 1)
  }
}

const SKINS = {
  sockball(ctx) {
    circle(ctx, 0, 0, BALL_R, '#ff5fa2')
    ctx.save()
    ctx.clip()
    ctx.fillStyle = '#ffd23f'
    for (let y = -BALL_R; y < BALL_R; y += 6) ctx.fillRect(-BALL_R, y, BALL_R * 2, 3)
    ctx.restore()
    circle(ctx, 0, 0, BALL_R, 'transparent')
  },
  falafel(ctx) {
    circle(ctx, 0, 0, BALL_R, '#a86b2d')
    ctx.fillStyle = '#6b3f14'
    for (const [x, y] of [[-3, -2], [3, 1], [-1, 4], [2, -5]]) ctx.fillRect(x, y, 2, 2)
    ctx.fillStyle = '#fff3c4'
    for (const [x, y] of [[-5, 2], [4, -3], [0, -1]]) {
      ctx.beginPath()
      ctx.ellipse(x, y, 1.6, 0.9, x, 0, TAU)
      ctx.fill()
    }
    ctx.fillStyle = '#5fbf4a'
    ctx.fillRect(-1, 2, 3, 2)
  },
  dustbunny(ctx) {
    ctx.fillStyle = '#b8b2c8'
    ctx.beginPath()
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * TAU
      const r = k % 2 ? BALL_R + 3 : BALL_R - 1
      k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.5
    ctx.stroke()
    circle(ctx, -3, -2, 2.2, '#fff', INK, 1)
    circle(ctx, 3, -2, 2.2, '#fff', INK, 1)
  },
}

function drawBall(ctx, ball, skin, upright) {
  ctx.save()
  ctx.translate(ball.x, ball.y)
  if (!upright) ctx.rotate(ball.rot)
  SKINS[skin](ctx)
  ctx.restore()
}

function basketPath(ctx, x, y) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + BUCKET.w, y)
  ctx.lineTo(x + BUCKET.w - 12, y + BUCKET.h)
  ctx.lineTo(x + 12, y + BUCKET.h)
  ctx.closePath()
}

function drawBucket(ctx, bucket) {
  const { x } = bucket
  const y = BUCKET.y
  basketPath(ctx, x, y)
  ctx.fillStyle = '#c98c55'
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.strokeStyle = '#8a5a2e'
  ctx.lineWidth = 2
  for (let i = x - 30; i < x + BUCKET.w + 30; i += 10) {
    ctx.beginPath()
    ctx.moveTo(i, y)
    ctx.lineTo(i + 14, y + BUCKET.h)
    ctx.stroke()
  }
  ctx.restore()
  basketPath(ctx, x, y)
  ctx.lineWidth = 3
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.fillStyle = '#ffd23f'
  ctx.fillRect(x - 4, y - 5, BUCKET.w + 8, 7)
  ctx.strokeRect(x - 4, y - 5, BUCKET.w + 8, 7)
}

function drawLauncher(ctx, aim, t, ready) {
  const { x, y } = LAUNCHER
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-aim)
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.fillRect(-9, 10, 18, 34)
  ctx.strokeRect(-9, 10, 18, 34)
  ctx.restore()

  ctx.fillStyle = '#f2f2f7'
  ctx.lineWidth = 3
  ctx.strokeStyle = INK
  ctx.beginPath()
  ctx.roundRect(x - 48, -10, 96, 62, 12)
  ctx.fill()
  ctx.stroke()
  circle(ctx, x + 30, 4, 4, ready ? '#7ee081' : '#ff6b6b', INK, 2)
  circle(ctx, x, y - 8, 22, '#5ad1ff', INK, 3)
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y - 8, 20, 0, TAU)
  ctx.clip()
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.beginPath()
  ctx.ellipse(x + Math.cos(t * 5) * 6, y - 8 + Math.sin(t * 5) * 6, 9, 4, t * 5, 0, TAU)
  ctx.fill()
  ctx.restore()
}

function drawAim(ctx, points) {
  ctx.fillStyle = 'rgba(43,29,78,0.55)'
  points.forEach((p, i) => {
    if (i % 3) return
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2.5, 0, TAU)
    ctx.fill()
  })
}

function drawPopups(ctx, popups) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const p of popups) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / 1.1)
    ctx.font = `700 ${p.big ? 24 : 15}px Fredoka, sans-serif`
    ctx.lineWidth = 4
    ctx.strokeStyle = INK
    ctx.fillStyle = p.big ? '#ffd23f' : '#ffffff'
    ctx.strokeText(p.text, p.x, p.y)
    ctx.fillText(p.text, p.x, p.y)
  }
  ctx.globalAlpha = 1
}

function drawFinale(ctx, t) {
  ctx.fillStyle = 'rgba(255,95,162,0.18)'
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.rotate(Math.sin(t * 12) * 0.06)
  ctx.scale(1 + Math.sin(t * 9) * 0.06, 1 + Math.sin(t * 9) * 0.06)
  ctx.font = '700 64px Fredoka, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 10
  ctx.strokeStyle = INK
  const hue = (t * 360) % 360
  ctx.fillStyle = `hsl(${hue} 95% 65%)`
  ctx.strokeText('EXTREME', 0, -40)
  ctx.fillText('EXTREME', 0, -40)
  ctx.fillStyle = `hsl(${(hue + 120) % 360} 95% 65%)`
  ctx.strokeText('SOCK KNOCK!!!', 0, 30)
  ctx.fillText('SOCK KNOCK!!!', 0, 30)
  ctx.restore()
}

export function drawGame(ctx, game, { skin, aimPath }) {
  const { theme } = game.level
  drawBackground(ctx, theme, game.time)
  for (const peg of game.pegs) if (!peg.gone) drawPeg(ctx, peg, theme.plain, game.time)
  drawBucket(ctx, game.bucket)
  if (aimPath) drawAim(ctx, aimPath)
  for (const ball of game.balls) drawBall(ctx, ball, skin, skin === 'dustbunny')
  drawLauncher(ctx, game.aim, game.time, game.phase === 'aim')
  drawPopups(ctx, game.popups)
  if (game.slowMo > 0) drawFinale(ctx, game.time)
}

export const SKIN_NAMES = { sockball: 'Rolled Sock', falafel: 'Falafel', dustbunny: 'Dust Bunny' }
