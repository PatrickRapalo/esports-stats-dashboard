import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ label, value, sub, trend, color = 'text-white', icon: Icon }) {
  const trendIcon =
    trend === 'up'   ? <TrendingUp  size={14} className="text-green-400" /> :
    trend === 'down' ? <TrendingDown size={14} className="text-red-400" />  :
    trend === 'flat' ? <Minus        size={14} className="text-gray-500" /> : null

  return (
    <div className="stat-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="section-title mb-0">{label}</span>
        {Icon && <Icon size={16} className="text-gray-600" />}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value ?? '—'}</div>
      {(sub || trendIcon) && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {trendIcon}
          {sub}
        </div>
      )}
    </div>
  )
}
