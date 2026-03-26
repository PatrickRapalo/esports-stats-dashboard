import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Crosshair, Swords, TrendingUp, Zap } from 'lucide-react'
import { api } from '../api'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

function GameSummaryCard({ title, icon: Icon, color, borderColor, data, linkTo, stats }) {
  return (
    <Link to={linkTo} className={`stat-card block hover:${borderColor} transition-all group`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className={color} />
          <span className="font-semibold text-white">{title}</span>
        </div>
        <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">View →</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <div className="text-xs text-gray-500 mb-0.5">{label}</div>
            <div className="text-lg font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
    </Link>
  )
}

function RecentMatchRow({ match }) {
  const gameBg = {
    Valorant: 'bg-red-900/30 text-red-300',
    'CS:GO':  'bg-blue-900/30 text-blue-300',
  }
  const outcomeColor =
    match.result === 'Win' ? 'text-green-400' :
    match.result?.startsWith('#') ? 'text-yellow-400' :
    'text-red-400'

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dark-700 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${gameBg[match.game]}`}>{match.game}</span>
        <span className={`text-sm font-semibold ${outcomeColor}`}>{match.result}</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-white font-medium">{match.kills}K</span>
        <span className="text-gray-500 text-xs">
          {match.date ? new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]   = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  if (error) return <div className="max-w-3xl"><ErrorBanner message={error} /></div>
  if (!data)  return <LoadingSpinner label="Loading dashboard..." />

  const { valorant: vl, csgo: cs, recent_matches } = data

  // Best highlight card
  const bestGame = [
    { name: 'Valorant', wr: vl.win_rate, color: 'text-red-400' },
    { name: 'CS:GO',    wr: cs.win_rate, color: 'text-blue-400' },
  ].sort((a, b) => b.wr - a.wr)[0]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your performance across all games</p>
      </div>

      {/* Highlight card */}
      <div className="bg-gradient-to-r from-dark-700 to-dark-900 rounded-xl p-5 border border-dark-600 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
          <Trophy size={24} className="text-yellow-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Best Performing Game</div>
          <div className={`text-xl font-bold ${bestGame.color}`}>{bestGame.name}</div>
          <div className="text-sm text-gray-400">{bestGame.wr}% win rate</div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-gray-600 mb-1">Total Matches</div>
          <div className="text-2xl font-bold text-white">{vl.total_matches + cs.total_matches}</div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Matches" value={vl.total_matches + cs.total_matches} icon={Zap} />
        <StatCard label="Best Win Rate" value={`${bestGame.wr}%`} icon={TrendingUp} color="text-green-400" />
        <StatCard label="Val KD Ratio"  value={vl.kd_ratio} icon={Crosshair} color="text-red-400" />
        <StatCard label="CSGO KD Ratio" value={cs.kd_ratio} icon={Swords} color="text-blue-400" />
      </div>

      {/* Game summaries */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Game Summaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GameSummaryCard
            title="Valorant" icon={Crosshair} color="text-accent-red" borderColor="border-red-500/30"
            linkTo="/valorant"
            stats={[
              { label: 'Matches', value: vl.total_matches },
              { label: 'Wins',    value: vl.wins },
              { label: 'Win%',    value: `${vl.win_rate}%` },
              { label: 'KD',      value: vl.kd_ratio },
              { label: 'Avg K',   value: vl.avg_kills },
              { label: 'HS%',     value: `${vl.avg_hs_percent}%` },
            ]}
          />
          <GameSummaryCard
            title="CS:GO" icon={Swords} color="text-accent-blue" borderColor="border-blue-500/30"
            linkTo="/csgo"
            stats={[
              { label: 'Matches', value: cs.total_matches },
              { label: 'Wins',    value: cs.wins },
              { label: 'Win%',    value: `${cs.win_rate}%` },
              { label: 'KD',      value: cs.kd_ratio },
              { label: 'Avg K',   value: cs.avg_kills },
              { label: 'MVPs',    value: cs.mvp_count },
            ]}
          />
        </div>
      </div>

      {/* Recent matches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recent Activity</h2>
          <Link to="/matches" className="text-xs text-accent-blue hover:text-blue-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="stat-card">
          {recent_matches.slice(0, 10).map((m, i) => (
            <RecentMatchRow key={i} match={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
