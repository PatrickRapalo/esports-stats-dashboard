const BASE = 'http://localhost:8000'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  player: () => get('/api/player'),
  dashboard: () => get('/api/dashboard'),

  fortniteMatches: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return get(`/api/fortnite/matches${q ? '?' + q : ''}`)
  },
  fortniteStats: () => get('/api/fortnite/stats'),

  valorantMatches: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return get(`/api/valorant/matches${q ? '?' + q : ''}`)
  },
  valorantStats: () => get('/api/valorant/stats'),

  csgoMatches: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return get(`/api/csgo/matches${q ? '?' + q : ''}`)
  },
  csgoStats: () => get('/api/csgo/stats'),

  allMatches: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return get(`/api/matches${q ? '?' + q : ''}`)
  },

  tournaments: {
    liveMatches:      (params = {}) => get(`/api/tournaments/matches/live?${new URLSearchParams(params)}`),
    upcomingMatches:  (params = {}) => get(`/api/tournaments/matches/upcoming?${new URLSearchParams(params)}`),
    pastMatches:      (params = {}) => get(`/api/tournaments/matches/past?${new URLSearchParams(params)}`),
    runningTourneys:  (params = {}) => get(`/api/tournaments/list/running?${new URLSearchParams(params)}`),
    upcomingTourneys: (params = {}) => get(`/api/tournaments/list/upcoming?${new URLSearchParams(params)}`),
    pastTourneys:     (params = {}) => get(`/api/tournaments/list/past?${new URLSearchParams(params)}`),
    games:            ()            => get('/api/tournaments/games'),
  },
}
