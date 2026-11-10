import { useId } from 'react'
import { sockStyle } from '../lib/sockStyle'

const OUTLINE = 'M28 8 H68 V92 Q68 102 76 108 L90 118 Q104 128 98 142 Q92 156 76 152 L40 134 Q26 126 28 112 Z'

export function PatternTile({ id, pattern, accent }) {
  const tiles = {
    stripes: [20, 16, <rect width="20" height="7" fill={accent} />],
    dots: [16, 16, <circle cx="8" cy="8" r="3.5" fill={accent} />],
    argyle: [
      24, 28,
      <>
        <polygon points="12,0 24,14 12,28 0,14" fill={accent} />
        <path d="M0 0 L24 28 M24 0 L0 28" stroke="#fff" strokeWidth="1" opacity="0.7" />
      </>,
    ],
    zigzag: [20, 14, <polyline points="0,10 5,4 10,10 15,4 20,10" fill="none" stroke={accent} strokeWidth="3" />],
    hearts: [20, 20, <path d="M10 16 L4 10 A3 3 0 0 1 10 6 A3 3 0 0 1 16 10 Z" fill={accent} />],
    stars: [20, 20, <polygon points="10,3 12,8 17,8 13,11 15,16 10,13 5,16 7,11 3,8 8,8" fill={accent} />],
    magen: [
      24, 24,
      <g fill="none" stroke={accent} strokeWidth="1.8" strokeLinejoin="round">
        <polygon points="12,4 19,16 5,16" />
        <polygon points="12,20 5,8 19,8" />
      </g>,
    ],
  }
  const [w, h, shape] = tiles[pattern]
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      {shape}
    </pattern>
  )
}

export default function Sock({ seed, look, height = 120, label, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const { base, accent, pattern } = look ?? sockStyle(seed)
  const clip = `clip-${uid}`
  const fill = `pat-${uid}`

  return (
    <svg
      className={`sock ${className}`}
      viewBox="0 0 106 160"
      height={height}
      width={(height * 106) / 160}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={clip}>
          <path d={OUTLINE} />
        </clipPath>
        <PatternTile id={fill} pattern={pattern} accent={accent} />
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="106" height="160" fill={base} />
        <rect y="26" width="106" height="134" fill={`url(#${fill})`} />
        <circle cx="30" cy="124" r="14" fill={accent} />
        <circle cx="98" cy="148" r="16" fill={accent} />
        <rect x="28" y="8" width="40" height="18" fill={accent} />
        <path d="M34 8v18M40 8v18M46 8v18M52 8v18M58 8v18M64 8v18" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
      </g>
      <path d={OUTLINE} fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  )
}
