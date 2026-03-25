import { useEffect, useState } from 'react'
import { Target, Trophy, Crosshair, Zap, Percent } from 'lucide-react'
import { api } from '../api'
import StatCard from '../components/StatCard'
import MatchTable from '../components/MatchTable'
import { KillsLineChart, PlacementLineChart, KillsBarChart, WinRateBarChart } from '../components/Charts'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

export default function Fortnite() {
  const [stats,   setStats]   = useState(null)
  const [matches, setMatches] = useState([])
  const [filter,  setFilter]  = useState('')
  const [error,   setError]   = useState(null)

  useEffect(() => {
    Promise.all([api.fortniteStats(), api.fortniteMatches({ limit: 100 })])
      .then(([s, m]) => { setStats(s); setMatches(m) })
      .catch(e => setError(e.message))
  }, [])

  if (error) return <div className="max-w-3xl"><ErrorBanner message={error} /></div>
  if (!stats) return <LoadingSpinner label="Loading Fortnite stats..." />

  // Prepare chart data
  const modeData = Object.entries(stats.mode_breakdown || {}).map(([name, v]) => ({
    name,
    kills: Math.round(v.kills / v.matches),
    win_rate: Math.round(v.wins / v.matches * 100),
    matches: v.matches,
  }))

  // Filtered matches for table
  const filtered = filter
    ? matches.filter(m => m.game_mode === filter)
    : matches

  const tableData = filtered.map(m => ({
    game: 'Fortnite',
    date: m.match_date,
    outcome: m.placement === 1 ? 'Win' : 'Loss',
    kills: m.kills,
    deaths: null,
    assists: m.assists,
    detail: `Placement #${m.placement} • ${m.game_mode}`,
  }))

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target size={28} className="text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Fortnite</h1>
          <p className="text-gray-500 text-sm">{stats.total_matches} matches tracked</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Win Rate"     value={`${stats.win_rate}%`}     color="text-green-400"  icon={Trophy}    />
        <StatCard label="Top 5 Rate"   value={`${stats.top5_rate}%`}    color="text-yellow-400" icon={Trophy}    />
        <StatCard label="Top 10 Rate"  value={`${stats.top10_rate}%`}   color="text-orange-400" icon={Trophy}    />
        <StatCard label="Avg Kills"    value={stats.avg_kills}          color="text-white"      icon={Crosshair} />
        <StatCard label="Avg Placement"value={`#${stats.avg_placement}`}color="text-gray-300"   icon={Target}    />
        <StatCard label="Avg Accuracy" value={`${stats.avg_accuracy}%`} color="text-accent-blue"icon={Percent}   />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KillsLineChart   data={stats.timeline} title="Kills Per Match (Last 30)" color="#f39c12" />
        <PlacementLineChart data={stats.timeline} title="Placement Over Time (Last 30)" />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KillsBarChart  data={modeData} dataKey="kills"    xKey="name" color="#f39c12" title="Avg Kills by Mode" />
        <WinRateBarChart data={modeData} title="Win Rate by Mode" />
      </div>

      {/* Match history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Match History</h2>
          <div className="flex gap-2">
            {['', 'Solo', 'Duos', 'Trios', 'Squads'].map(mode => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filter === mode
                    ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-600/50'
                    : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                {mode || 'All'}
              </button>
            ))}
          </div>
        </div>
        <MatchTable data={tableData} showGame={false} />
      </div>
    </div>
  )
}
