import { useEffect, useState } from 'react'
import { Crosshair, Trophy, Target, Zap } from 'lucide-react'
import { api } from '../api'
import StatCard from '../components/StatCard'
import MatchTable from '../components/MatchTable'
import { KDLineChart, KillsBarChart, WinRateBarChart } from '../components/Charts'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

export default function Valorant() {
  const [stats,   setStats]   = useState(null)
  const [matches, setMatches] = useState([])
  const [agentFilter, setAgentFilter] = useState('')
  const [error,   setError]   = useState(null)

  useEffect(() => {
    Promise.all([api.valorantStats(), api.valorantMatches({ limit: 100 })])
      .then(([s, m]) => { setStats(s); setMatches(m) })
      .catch(e => setError(e.message))
  }, [])

  if (error) return <div className="max-w-3xl"><ErrorBanner message={error} /></div>
  if (!stats) return <LoadingSpinner label="Loading Valorant stats..." />

  // Agent breakdown chart data
  const agentData = Object.entries(stats.agent_breakdown || {}).map(([name, v]) => ({
    name,
    kills: Math.round(v.kills / v.matches),
    win_rate: v.win_rate,
    kd: v.kd,
    matches: v.matches,
  })).sort((a, b) => b.matches - a.matches)

  // Map breakdown chart data
  const mapData = Object.entries(stats.map_breakdown || {}).map(([name, v]) => ({
    name,
    win_rate: v.win_rate,
    matches: v.matches,
  })).sort((a, b) => b.matches - a.matches)

  // Unique agents
  const agents = [...new Set(matches.map(m => m.agent))]

  const filtered = agentFilter
    ? matches.filter(m => m.agent === agentFilter)
    : matches

  const tableData = filtered.map(m => ({
    game: 'Valorant',
    date: m.match_date,
    outcome: m.outcome,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    detail: `${m.agent} • ${m.map}`,
  }))

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Crosshair size={28} className="text-accent-red" />
        <div>
          <h1 className="text-2xl font-bold text-white">Valorant</h1>
          <p className="text-gray-500 text-sm">{stats.total_matches} matches tracked</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Win Rate"   value={`${stats.win_rate}%`}      color="text-green-400"    icon={Trophy}    />
        <StatCard label="KD Ratio"   value={stats.kd_ratio}            color="text-accent-red"   icon={Crosshair} />
        <StatCard label="Avg Kills"  value={stats.avg_kills}           color="text-white"        icon={Zap}       />
        <StatCard label="Avg Deaths" value={stats.avg_deaths}          color="text-red-400"      icon={Target}    />
        <StatCard label="Avg Assists"value={stats.avg_assists}         color="text-gray-300"     icon={Zap}       />
        <StatCard label="HS%"        value={`${stats.avg_hs_percent}%`}color="text-yellow-400"   icon={Crosshair} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KDLineChart data={stats.timeline} color="#ff4655" title="K/D Over Time (Last 30)" />
        <KillsBarChart data={agentData} dataKey="kills" xKey="name" color="#ff4655" title="Avg Kills by Agent" />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WinRateBarChart data={agentData} title="Win Rate by Agent" />
        <WinRateBarChart data={mapData}   title="Win Rate by Map" />
      </div>

      {/* Agent KD breakdown table */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Agent Breakdown</h2>
        <div className="overflow-x-auto rounded-xl border border-dark-600">
          <table className="w-full text-sm">
            <thead className="bg-dark-900 border-b border-dark-600">
              <tr>
                {['Agent', 'Matches', 'Win%', 'KD', 'Avg Kills'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentData.map((a, i) => (
                <tr key={i} className="border-b border-dark-700 hover:bg-dark-700">
                  <td className="px-4 py-3 font-medium text-white">{a.name}</td>
                  <td className="px-4 py-3 text-gray-400">{a.matches}</td>
                  <td className="px-4 py-3">
                    <span className={a.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}>{a.win_rate}%</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{a.kd}</td>
                  <td className="px-4 py-3 text-gray-300">{a.kills}</td>
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
              onClick={() => setAgentFilter('')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                !agentFilter
                  ? 'bg-red-900/30 text-red-300 border border-red-800/50'
                  : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >All</button>
            {agents.map(agent => (
              <button
                key={agent}
                onClick={() => setAgentFilter(agent)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  agentFilter === agent
                    ? 'bg-red-900/30 text-red-300 border border-red-800/50'
                    : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >{agent}</button>
            ))}
          </div>
        </div>
        <MatchTable data={tableData} showGame={false} />
      </div>
    </div>
  )
}
