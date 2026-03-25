import { useEffect, useState } from 'react'
import { Trophy, Wifi, Clock, CheckCircle, ExternalLink, Calendar } from 'lucide-react'
import { api } from '../api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

const GAME_FILTERS = [
  { key: '',        label: 'All Games' },
  { key: 'csgo',    label: 'CS2 / CS:GO' },
  { key: 'valorant',label: 'Valorant' },
  { key: 'lol',     label: 'League of Legends' },
  { key: 'dota2',   label: 'Dota 2' },
  { key: 'r6',      label: 'Rainbow Six' },
  { key: 'rl',      label: 'Rocket League' },
]

const GAME_COLORS = {
  'CS:GO':              'bg-blue-900/40 text-blue-300',
  'CS2':                'bg-blue-900/40 text-blue-300',
  'Valorant':           'bg-red-900/40 text-red-300',
  'League of Legends':  'bg-yellow-900/40 text-yellow-300',
  'Dota 2':             'bg-red-900/40 text-orange-300',
  'Rainbow Six Siege':  'bg-gray-800 text-gray-300',
  'Rocket League':      'bg-blue-900/40 text-cyan-300',
}

function GameBadge({ game }) {
  const cls = GAME_COLORS[game] || 'bg-gray-800 text-gray-400'
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>{game || 'Unknown'}</span>
}

function StatusBadge({ status }) {
  if (status === 'running')   return <span className="flex items-center gap-1 text-xs text-green-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE</span>
  if (status === 'not_started') return <span className="text-xs text-gray-500">Upcoming</span>
  if (status === 'finished')    return <span className="text-xs text-gray-600">Finished</span>
  return <span className="text-xs text-gray-500">{status}</span>
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function MatchCard({ match }) {
  const [t1, t2] = match.teams || []
  const isLive = match.status === 'running'
  const isDone = match.status === 'finished'

  return (
    <div className={`stat-card flex flex-col gap-3 ${isLive ? 'border-green-800/50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {match.league_image && (
            <img src={match.league_image} alt="" className="w-5 h-5 object-contain opacity-80" onError={e => e.target.style.display='none'} />
          )}
          <span className="text-xs text-gray-500 truncate">{match.league} {match.serie ? `· ${match.serie}` : ''}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <GameBadge game={match.game} />
          <StatusBadge status={match.status} />
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2">
        {/* Team 1 */}
        <div className={`flex-1 flex flex-col items-center gap-1.5 ${isDone && t1 && !t1.winner ? 'opacity-40' : ''}`}>
          {t1?.image_url
            ? <img src={t1.image_url} alt={t1.name} className="w-10 h-10 object-contain" onError={e => e.target.style.display='none'} />
            : <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-xs text-gray-500">{t1?.acronym?.slice(0,2) || '?'}</div>
          }
          <span className="text-xs font-semibold text-white text-center leading-tight">{t1?.name || 'TBD'}</span>
          {isDone && <span className={`text-xl font-bold ${t1?.winner ? 'text-green-400' : 'text-gray-500'}`}>{t1?.score ?? '—'}</span>}
        </div>

        {/* VS / score */}
        <div className="flex flex-col items-center gap-1">
          {isLive
            ? <span className="text-green-400 font-bold text-sm">LIVE</span>
            : <span className="text-gray-600 text-sm font-bold">VS</span>
          }
          {match.match_type && <span className="text-xs text-gray-600">Bo{match.number_of_games}</span>}
        </div>

        {/* Team 2 */}
        <div className={`flex-1 flex flex-col items-center gap-1.5 ${isDone && t2 && !t2.winner ? 'opacity-40' : ''}`}>
          {t2?.image_url
            ? <img src={t2.image_url} alt={t2.name} className="w-10 h-10 object-contain" onError={e => e.target.style.display='none'} />
            : <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-xs text-gray-500">{t2?.acronym?.slice(0,2) || '?'}</div>
          }
          <span className="text-xs font-semibold text-white text-center leading-tight">{t2?.name || 'TBD'}</span>
          {isDone && <span className={`text-xl font-bold ${t2?.winner ? 'text-green-400' : 'text-gray-500'}`}>{t2?.score ?? '—'}</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-dark-600">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(match.scheduled_at || match.begin_at)}
        </span>
        {match.stream_url && (
          <a href={match.stream_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-accent-blue hover:text-blue-300 transition-colors">
            <Wifi size={11} /> Watch
          </a>
        )}
      </div>
    </div>
  )
}

function TournamentRow({ t }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-700 last:border-0">
      <div className="flex items-center gap-3">
        {t.league_image && (
          <img src={t.league_image} alt="" className="w-8 h-8 object-contain opacity-80" onError={e => e.target.style.display='none'} />
        )}
        <div>
          <div className="text-sm font-semibold text-white">{t.name}</div>
          <div className="text-xs text-gray-500">{t.league} {t.serie ? `· ${t.serie}` : ''}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <GameBadge game={t.game} />
          {t.prizepool && <div className="text-xs text-yellow-500 mt-1">{t.prizepool}</div>}
        </div>
        <div className="text-xs text-gray-500 hidden sm:block">
          {t.begin_at ? new Date(t.begin_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          {t.end_at ? ` – ${new Date(t.end_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
        </div>
      </div>
    </div>
  )
}

export default function Tournaments() {
  const [tab,        setTab]        = useState('live')
  const [game,       setGame]       = useState('')
  const [matches,    setMatches]    = useState([])
  const [tourneys,   setTourneys]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = game ? { game } : {}

    const fetchData = async () => {
      try {
        const [live, upcoming, past, runningT, upcomingT] = await Promise.all([
          api.tournaments.liveMatches(params),
          api.tournaments.upcomingMatches(params),
          api.tournaments.pastMatches(params),
          api.tournaments.runningTourneys(params),
          api.tournaments.upcomingTourneys(params),
        ])
        setMatches({ live, upcoming, past })
        setTourneys({ running: runningT, upcoming: upcomingT })
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [game])

  const activeMatches =
    tab === 'live'     ? matches.live     :
    tab === 'upcoming' ? matches.upcoming :
    matches.past

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy size={28} className="text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-gray-500 text-sm">Live scores, upcoming matches & results via PandaScore</p>
        </div>
      </div>

      {/* Game filter */}
      <div className="flex flex-wrap gap-2">
        {GAME_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setGame(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              game === key
                ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/40'
                : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >{label}</button>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Active Tournaments */}
      {!loading && !error && tourneys.running?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Active Tournaments
          </h2>
          <div className="stat-card divide-y divide-dark-700">
            {tourneys.running.map(t => <TournamentRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {/* Upcoming Tournaments */}
      {!loading && !error && tourneys.upcoming?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-gray-500" />
            Upcoming Tournaments
          </h2>
          <div className="stat-card divide-y divide-dark-700">
            {tourneys.upcoming.map(t => <TournamentRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {/* Match tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Matches</h2>
          <div className="flex gap-1.5">
            {[
              { key: 'live',     label: 'Live',     icon: <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> },
              { key: 'upcoming', label: 'Upcoming', icon: <Clock size={12} /> },
              { key: 'past',     label: 'Results',  icon: <CheckCircle size={12} /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === key
                    ? 'bg-dark-600 text-white border border-dark-500'
                    : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {loading
          ? <LoadingSpinner label="Fetching matches..." />
          : !error && (
            <>
              {activeMatches?.length === 0
                ? (
                  <div className="stat-card text-center py-10 text-gray-600">
                    No {tab} matches found{game ? ` for selected game` : ''}.
                  </div>
                )
                : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeMatches.map(m => <MatchCard key={m.id} match={m} />)}
                  </div>
                )
              }
            </>
          )
        }
      </div>
    </div>
  )
}
