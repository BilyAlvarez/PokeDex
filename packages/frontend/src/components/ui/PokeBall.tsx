import { useId } from 'react'

export type BallVariant = 'standard' | 'great' | 'ultra' | 'master' | 'premier'

interface PokeBallProps {
  variant?: BallVariant
  size?: number
  className?: string
}

const TOP_COLOR: Record<BallVariant, string> = {
  standard: '#cc1f1f',
  great: '#1a6fe0',
  ultra: '#c8920f',
  master: '#7c3aed',
  premier: '#eeeeee',
}

const BUTTON_DOT: Record<BallVariant, string> = {
  standard: '#e8e0d0',
  great: '#bfdbfe',
  ultra: '#fcd34d',
  master: '#c4b5fd',
  premier: '#e8e0d0',
}

export function PokeBall({ variant = 'standard', size = 24, className = '' }: PokeBallProps) {
  const clipId = useId()

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r="9.5" />
        </clipPath>
      </defs>

      {/* Clipped interior */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <rect x="0" y="0" width="24" height="12" fill={TOP_COLOR[variant]} />
        <rect x="0" y="10.5" width="24" height="3" fill="#1a1a1a" />

        {/* Great Ball — two curved red stripes on blue top */}
        {variant === 'great' && (
          <>
            <path d="M2.5,7 Q12,5.5 21.5,7" stroke="#cc1f1f" strokeWidth="1.3" fill="none" />
            <path d="M2,9.2 Q12,7.7 22,9.2" stroke="#cc1f1f" strokeWidth="1.3" fill="none" />
          </>
        )}

        {/* Ultra Ball — two black wedge shapes on yellow top */}
        {variant === 'ultra' && (
          <>
            <path d="M2.5,12 L7.5,4 L5.5,12 Z" fill="#1a1a1a" />
            <path d="M21.5,12 L16.5,4 L18.5,12 Z" fill="#1a1a1a" />
          </>
        )}

        {/* Master Ball — pink M + side dots on purple top */}
        {variant === 'master' && (
          <>
            <path
              d="M5.5,10.5 L7.5,5.5 L10,9.5 L12.5,5.5 L14.5,10.5"
              stroke="#f472b6" strokeWidth="1.4" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="3.5" cy="9" r="1.1" fill="#f472b6" />
            <circle cx="20.5" cy="9" r="1.1" fill="#f472b6" />
          </>
        )}

        {/* Premier Ball — single thin red band */}
        {variant === 'premier' && (
          <rect x="2.5" y="7" width="19" height="2" fill="#cc1f1f" rx="0.5" />
        )}
      </g>

      {/* Outer ring */}
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />

      {/* Center button */}
      <circle cx="12" cy="12" r="3" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.2" fill={BUTTON_DOT[variant]} />
    </svg>
  )
}

/* ── Larger decorative variant for hero/splash use ───────────────────────── */
export function PokeBallLarge({ variant = 'standard', size = 64, className = '' }: PokeBallProps) {
  const clipId = useId() + '-lg'

  const r = size * 0.44
  const cx = size / 2
  const cy = size / 2
  const bandH = size * 0.125
  const bandY = cy - bandH / 2
  const btnR = size * 0.135
  const dotR = size * 0.055

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className}>
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width={size} height={size} fill="white" />
        <rect x="0" y="0" width={size} height={cy} fill={TOP_COLOR[variant]} />
        <rect x="0" y={bandY} width={size} height={bandH} fill="#1a1a1a" />

        {variant === 'great' && (
          <>
            <path d={`M${cx * 0.2},${cy * 0.58} Q${cx},${cy * 0.46} ${size - cx * 0.2},${cy * 0.58}`}
              stroke="#cc1f1f" strokeWidth={size * 0.04} fill="none" />
            <path d={`M${cx * 0.1},${cy * 0.77} Q${cx},${cy * 0.65} ${size - cx * 0.1},${cy * 0.77}`}
              stroke="#cc1f1f" strokeWidth={size * 0.04} fill="none" />
          </>
        )}
        {variant === 'ultra' && (
          <>
            <path d={`M${cx * 0.2},${cy} L${cx * 0.65},${cy * 0.33} L${cx * 0.46},${cy} Z`} fill="#1a1a1a" />
            <path d={`M${size - cx * 0.2},${cy} L${size - cx * 0.65},${cy * 0.33} L${size - cx * 0.46},${cy} Z`} fill="#1a1a1a" />
          </>
        )}
        {variant === 'master' && (
          <>
            <path
              d={`M${cx * 0.46},${cy * 0.88} L${cx * 0.62},${cy * 0.46} L${cx * 0.84},${cy * 0.81} L${cx},${cy * 0.46} L${cx * 1.16},${cy * 0.81} L${cx * 1.38},${cy * 0.46} L${cx * 1.54},${cy * 0.88}`}
              stroke="#f472b6" strokeWidth={size * 0.045} fill="none"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx={cx * 0.29} cy={cy * 0.75} r={size * 0.045} fill="#f472b6" />
            <circle cx={size - cx * 0.29} cy={cy * 0.75} r={size * 0.045} fill="#f472b6" />
          </>
        )}
        {variant === 'premier' && (
          <rect x={cx * 0.2} y={cy * 0.58} width={size - cx * 0.4} height={size * 0.065} fill="#cc1f1f" rx="2" />
        )}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a1a" strokeWidth={size * 0.045} />
      <circle cx={cx} cy={cy} r={btnR} fill="white" stroke="#1a1a1a" strokeWidth={size * 0.045} />
      <circle cx={cx} cy={cy} r={dotR} fill={BUTTON_DOT[variant]} />
    </svg>
  )
}
