import { W } from './engine'

function dedupe(points, minGap = 20) {
  return points.filter((p, i) => points.slice(0, i).every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= minGap))
}

function insidePolygon({ x, y }, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function lagoon() {
  const pegs = []
  for (let row = 0; row < 8; row++) {
    const offset = row % 2 ? 30 : 0
    for (let col = 0, x = 70 + offset; x <= W - 70; col++, x += 60) {
      if ((row + col) % 5 === 0) continue
      pegs.push({ x, y: 165 + row * 50 + Math.sin(x / 90 + row) * 12 })
    }
  }
  return pegs
}

export const HEXAGRAM = { cx: 400, cy: 330, r: 200 }

export function hexagramTriangles({ cx, cy, r } = HEXAGRAM) {
  const corner = (deg) => ({ x: cx + Math.cos((deg * Math.PI) / 180) * r, y: cy + Math.sin((deg * Math.PI) / 180) * r })
  return [[-90, 30, 150], [90, 210, 330]].map((t) => t.map(corner))
}

function deadSea() {
  const PER_EDGE = 6
  const star = hexagramTriangles().flatMap((tri) =>
    tri.flatMap((a, i) => {
      const b = tri[(i + 1) % 3]
      return Array.from({ length: PER_EDGE }, (_, k) => ({
        x: a.x + ((b.x - a.x) * k) / PER_EDGE,
        y: a.y + ((b.y - a.y) * k) / PER_EDGE,
      }))
    }),
  )
  const waves = Array.from({ length: 11 }, (_, k) => ({ x: 80 + k * 64, y: 565 + Math.sin(k) * 10 }))
  return dedupe([...star, { x: HEXAGRAM.cx, y: HEXAGRAM.cy }, ...waves], 24)
}

function dryer() {
  const rings = [
    { radius: 85, count: 8, speed: 0.7 },
    { radius: 155, count: 14, speed: -0.5 },
    { radius: 225, count: 20, speed: 0.35 },
  ]
  return rings.flatMap(({ radius, count, speed }) =>
    Array.from({ length: count }, (_, k) => {
      const angle = (k / count) * Math.PI * 2
      return { x: 0, y: 0, orbit: { cx: 400, cy: 360, radius, speed, angle } }
    }),
  )
}

const SOCK_OUTLINE = [[250, 140], [450, 140], [450, 380], [600, 430], [650, 480], [640, 545], [580, 575], [300, 520], [250, 460]]

function bigSock() {
  const pegs = []
  for (let row = 0, y = 170; y < 580; row++, y += 42) {
    for (let x = 230 + (row % 2) * 22; x < 680; x += 44) {
      if (insidePolygon({ x, y }, SOCK_OUTLINE)) pegs.push({ x, y })
    }
  }
  for (let x = 262; x <= 440; x += 44) pegs.push({ x, y: 128 })
  return pegs
}

export const LEVELS = [
  {
    key: 'lagoon',
    name: 'Laundromat Lagoon',
    blurb: 'Where socks go to rinse their sorrows.',
    gravity: 620,
    layout: lagoon,
    theme: { sky: ['#7fe3ff', '#d6f8ff'], plain: '#b388ff', decor: 'bubbles' },
  },
  {
    key: 'deadsea',
    name: 'Dead Sea Spa 🇮🇱',
    blurb: 'So salty your socks float. Low gravity. Sababa!',
    gravity: 230,
    layout: deadSea,
    theme: { sky: ['#fff1c1', '#6ec3f4'], plain: '#ffffff', decor: 'deadsea' },
  },
  {
    key: 'dryer',
    name: 'The Dryer Dimension',
    blurb: 'The pegs spin. Socks enter. Socks do not leave.',
    gravity: 600,
    layout: dryer,
    theme: { sky: ['#3a2d6b', '#14102b'], plain: '#5ad1ff', decor: 'dryer' },
  },
  {
    key: 'bigsock',
    name: 'The Big Sock',
    blurb: 'A sock made of pegs, for knocking off socks. Sockception.',
    gravity: 560,
    layout: bigSock,
    theme: { sky: ['#ffd6e8', '#fff6e9'], plain: '#5ad1ff', decor: 'polka' },
  },
]
