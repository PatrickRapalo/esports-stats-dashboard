import { useEffect, useState } from 'react'
import { Swords, Trophy, Zap, Star } from 'lucide-react'
import { api } from '../api'
import StatCard from '../components/StatCard'
import MatchTable from '../components/MatchTable'
import { KDLineChart, KillsBarChart, WinRateBarChart } from '../components/Charts'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

export default function CSGO() {
  const [stats,   setStats]   = useState(null)
  const [matches, setMatches] = useState([])
  const [mapFilter, setMapFilter] = useState('')
  const [error,   setError]   = useState(null)

  useEffect(() => {
    Promise.all([api.csgoStats(), api.csgoMatches({ limit: 100 })])
      .then(([s, m]) => { setStats(s); setMatches(m) })
      .catch(e => setError(e.message))
  }, [])

  if (error) return <div className="max-w-3xl"><ErrorBanner message={error} /></div>
  if (!stats) return <LoadingSpinner label="Loading CS:GO stats..." />

  // Map breakdown chart data
  const mapData = Object.entries(stats.map_breakdown || {}).map(([name, v]) => ({
    name,
    kills: Math.round(v.kills / v.matches),
    win_rate: v.win_rate,
    kd: v.kd,
    mvps: v.mvps,
    matches: v.matches,
  })).sort((a, b) => b.matches - a.matches)

  const maps = [...new Set(matches.map(m => m.map))]

  const filtered = mapFilter
    ? matches.filter(m => m.map === mapFilter)
    : matches

  const tableData = filtered.map(m => ({
    game: 'CS:GO',
    date: m.match_date,
    outcome: m.outcome,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    detail: m.map + (m.mvp ? ' • MVP' : ''),
  }))

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Swords size={28} className="text-accent-blue" />
        <div>
          <h1 className="text-2xl font-bold text-white">CS:GO</h1>
          <p className="text-gray-500 text-sm">{stats.total_matches} matches tracked</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Win Rate"   value={`${stats.win_rate}%`}  color="text-green-400"  icon={Trophy} />
        <StatCard label="KD Ratio"   value={stats.kd_ratio}        color="text-accent-blue"icon={Swords} />
        <StatCard label="Avg Kills"  value={stats.avg_kills}       color="text-white"      icon={Zap}    />
        <StatCard label="Avg Deaths" value={stats.avg_deaths}      color="text-red-400"    icon={Zap}    />
        <StatCard label="Avg Assists"value={stats.avg_assists}     color="text-gray-300"   icon={Zap}    />
        <StatCard label="MVPs"       value={stats.mvp_count}       color="text-yellow-400" icon={Star}   />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KDLineChart    data={stats.timeline} color="#00b4d8" title="K/D Over Time (Last 30)" />
        <KillsBarChart  data={mapData} dataKey="kills" xKey="name" color="#00b4d8" title="Avg Kills by Map" />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WinRateBarChart data={mapData} title="Win Rate by Map" />
        <div className="stat-card">
          <p className="section-title">MVP Rate by Map</p>
          <div className="space-y-3 mt-1">
            {mapData.map(m => (
              <div key={m.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-300 w-20 shrink-0">{m.name}</span>
                <div className="flex-1 bg-dark-600 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((m.mvps / m.matches) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">{m.mvps}/{m.matches}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map breakdown table */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Map Breakdown</h2>
        <div className="overflow-x-auto rounded-xl border border-dark-600">
          <table className="w-full text-sm">
            <thead className="bg-dark-900 border-b border-dark-600">
              <tr>
                {['Map', 'Matches', 'Win%', 'KD', 'Avg Kills', 'MVPs'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mapData.map((m, i) => (
                <tr key={i} className="border-b border-dark-700 hover:bg-dark-700">
                  <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                  <td className="px-4 py-3 text-gray-400">{m.matches}</td>
                  <td className="px-4 py-3">
                    <span className={m.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}>{m.win_rate}%</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{m.kd}</td>
                  <td className="px-4 py-3 text-gray-300">{m.kills}</td>
                  <td className="px-4 py-3 text-yellow-400">{m.mvps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Match History</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setMapFilter('')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                !mapFilter
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
                  : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >All</button>
            {maps.map(map => (
              <button
                key={map}
                onClick={() => setMapFilter(map)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  mapFilter === map
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
                    : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >{map}</button>
            ))}
          </div>
        </div>
        <MatchTable data={tableData} showGame={false} />
      </div>
    </div>
  )
}
