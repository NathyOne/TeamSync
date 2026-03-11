const BADGE_STYLES = {
  BASIC: 'bg-slate-800/60 text-slate-200',
  SILVER: 'bg-slate-500/20 text-slate-100',
  GOLD: 'bg-amber-500/20 text-amber-200',
  DIAMOND: 'bg-cyan-500/20 text-cyan-200',
}

export const formatBadgeLabel = (badge) => {
  const normalized = String(badge || 'BASIC').toUpperCase()
  return normalized.charAt(0) + normalized.slice(1).toLowerCase()
}

function BadgePill({ badge, className = '' }) {
  const normalized = String(badge || 'BASIC').toUpperCase()
  const label = formatBadgeLabel(normalized)
  const styleClass = BADGE_STYLES[normalized] || BADGE_STYLES.BASIC

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styleClass} ${className}`}>
      {label}
    </span>
  )
}

export default BadgePill
