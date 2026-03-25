import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

function OutcomeBadge({ outcome }) {
  if (outcome === 'Win')  return <span className="badge-win">Win</span>
  if (outcome === 'Loss') return <span className="badge-loss">Loss</span>
  return <span className="badge-draw">Draw</span>
}

function GameBadge({ game }) {
  const colors = {
    Fortnite: 'bg-yellow-900/40 text-yellow-300',
    Valorant: 'bg-red-900/40 text-red-300',
    'CS:GO':  'bg-blue-900/40 text-blue-300',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[game] || 'bg-gray-800 text-gray-300'}`}>
      {game}
    </span>
  )
}

function SortIcon({ dir }) {
  if (dir === 'asc')  return <ChevronUp   size={14} className="text-accent-blue" />
  if (dir === 'desc') return <ChevronDown size={14} className="text-accent-blue" />
  return <ChevronsUpDown size={14} className="text-gray-600" />
}

export default function MatchTable({ data, showGame = true }) {
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sort.dir === 'asc' ? av - bv : bv - av
    })
  }, [data, sort])

  const toggle = key => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))

  const Th = ({ children, sortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-300 transition-colors"
      onClick={() => sortKey && toggle(sortKey)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortKey && <SortIcon dir={sort.key === sortKey ? sort.dir : null} />}
      </span>
    </th>
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-dark-600">
      <table className="w-full text-sm">
        <thead className="bg-dark-900 border-b border-dark-600">
          <tr>
            {showGame && <Th sortKey="game">Game</Th>}
            <Th sortKey="date">Date</Th>
            <Th sortKey="outcome">Result</Th>
            <Th sortKey="kills">K</Th>
            <Th sortKey="deaths">D</Th>
            <Th sortKey="assists">A</Th>
            <Th>Details</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => (
            <tr
              key={i}
              className="border-b border-dark-700 hover:bg-dark-700 transition-colors"
            >
              {showGame && (
                <td className="px-4 py-3">
                  <GameBadge game={m.game} />
                </td>
              )}
              <td className="px-4 py-3 text-gray-400 text-xs">
                {m.date ? new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </td>
              <td className="px-4 py-3">
                <OutcomeBadge outcome={m.outcome} />
              </td>
              <td className="px-4 py-3 font-semibold text-white">{m.kills ?? '—'}</td>
              <td className="px-4 py-3 text-gray-400">{m.deaths ?? '—'}</td>
              <td className="px-4 py-3 text-gray-400">{m.assists ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{m.detail || '—'}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={showGame ? 7 : 6} className="px-4 py-10 text-center text-gray-600">
                No matches found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
