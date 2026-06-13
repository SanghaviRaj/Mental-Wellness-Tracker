import type { CopingStrategy } from '../types'
 
interface InsightCardProps {
  strategy: CopingStrategy
}
 
const TYPE_CONFIG = {
  breathing: {
    icon: '🫁',
    color: '#6377ff',
    border: 'rgba(99,119,255,0.25)',
    bg: 'rgba(99,119,255,0.05)',
    tagClass: 'tag-blue'
  },
  mindfulness: {
    icon: '🧘',
    color: '#2dd4bf',
    border: 'rgba(45,212,191,0.25)',
    bg: 'rgba(45,212,191,0.05)',
    tagClass: 'tag-teal'
  },
  study: {
    icon: '📚',
    color: '#a855f7',
    border: 'rgba(168,85,247,0.25)',
    bg: 'rgba(168,85,247,0.05)',
    tagClass: 'tag-purple'
  },
  motivation: {
    icon: '🚀',
    color: '#fbbf24',
    border: 'rgba(251,191,36,0.25)',
    bg: 'rgba(251,191,36,0.05)',
    tagClass: 'tag-yellow'
  }
}
 
export default function InsightCard({ strategy }: InsightCardProps) {
  const config = TYPE_CONFIG[strategy.type] || TYPE_CONFIG.mindfulness
 
  return (
    <div 
      className="card flex gap-4 items-start card-hover transition-all duration-300"
      style={{ 
        background: config.bg,
        borderColor: config.border
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 select-none"
        style={{ 
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${config.border}`
        }}
      >
        {config.icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="font-semibold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
            {strategy.title}
          </h4>
          <span 
            className={`tag ${config.tagClass} text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0`}
            style={{ border: `1px solid ${config.border}` }}
          >
            ⏱ {strategy.duration}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {strategy.description}
        </p>
        <span className="inline-block text-[10px] uppercase font-bold tracking-wider opacity-60" style={{ color: config.color }}>
          {strategy.type}
        </span>
      </div>
    </div>
  )
}
