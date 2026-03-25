import { useEffect, useState, useMemo } from 'react'
import { History, Search } from 'lucide-react'
import { api } from '../api'
import MatchTable from '../components/MatchTable'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

const GAMES   = ['All', 'Fortnite', 'Valorant', 'CS:GO']
const OUTCOMES = ['All', 'Win', 'Loss', 'Draw']

export default function MatchHistory() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [game,    setGame]    = useState('All')
  const [outcome, setOutcome] = useState('All')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    api.allMatches({ limit: 200 })
      .then(data => { setMatches(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (game    !== 'All' && m.game    !== game)    return false
      if (outcome !== 'All' && m.outcome !== outcome) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          m.game?.toLowerCase().includes(q) ||
          m.detail?.toLowerCase().includes(q) ||
          m.result?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [matches, game, outcome, search])

  // Summary stats from filtered
  const summary = useMemo(() => {
    const wins   = filtered.filter(m => m.outcome === 'Win').length
    const losses = filtered.filter(m => m.outcome === 'Loss').length
    const totalK = filtered.reduce((s, m) => s + (m.kills || 0), 0)
    return {
      total: filtered.length,
      wins,
      losses,
      win_rate: filtered.length ? Math.round(wins / filtered.length * 100) : 0,
      avg_kills: filtered.length ? (totalK / filtered.length).toFixed(1) : '0',
    }
  }, [filtered])

  if (error)   return <div className="max-w-3xl"><ErrorBanner message={error} /></div>
  if (loading) return <LoadingSpinner label="Loading match history..." />

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <History size={28} className="text-accent-blue" />
        <div>
          <h1 className="text-2xl font-bold text-white">Match History</h1>
          <p className="text-gray-500 text-sm">{matches.length} total matches across all games</p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Showing',  value: filtered.length },
          { label: 'Wins',     value: summary.wins,     color: 'text-green-400' },
          { label: 'Losses',   value: summary.losses,   color: 'text-red-400' },
          { label: 'Win Rate', value: `${summary.win_rate}%` },
          { label: 'Avg Kills',value: summary.avg_kills },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card py-3">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-xl font-bold ${color || 'text-white'}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search matches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-dark-500 w-52"
          />
        </div>

        {/* Game filter */}
        <div className="flex gap-1.5">
          {GAMES.map(g => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                game === g
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                  : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >{g}</button>
          ))}
        </div>

        {/* Outcome filter */}
        <div className="flex gap-1.5">
          {OUTCOMES.map(o => (
            <button
              key={o}
              onClick={() => setOutcome(o)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                outcome === o
                  ? o === 'Win'  ? 'bg-green-900/40  text-green-300  border border-green-800/50'
                  : o === 'Loss' ? 'bg-red-900/40    text-red-300    border border-red-800/50'
                  : o === 'Draw' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-800/50'
                  :                'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                  : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >{o}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <MatchTable data={filtered} showGame={game === 'All'} />
    </div>
  )
}
