import { seededRandom } from './random'

export const SOCK_COLORS = [
  '#ff5fa2', '#ffd23f', '#5ad1ff', '#7ee081', '#b388ff',
  '#ff8c42', '#ff6b6b', '#3ddbd9', '#f9a8d4', '#a3e635',
]

export const PATTERNS = ['stripes', 'dots', 'argyle', 'zigzag', 'hearts', 'stars']

export function sockStyle(seed) {
  const rand = seededRandom(seed)
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const base = pick(SOCK_COLORS)
  let accent = pick(SOCK_COLORS)
  while (accent === base) accent = pick(SOCK_COLORS)
  return { base, accent, pattern: pick(PATTERNS) }
}
