from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import asyncio
import httpx
from typing import Optional
from functools import partial

PANDASCORE_BASE = "https://api.pandascore.co"

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PANDASCORE_TOKEN = os.getenv("PANDASCORE_TOKEN")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="E-sports Stats API", version="1.0.0")

_origins_env = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()] or [
    "http://localhost:3000",
    "https://esports-stats-dashboard.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PLAYER_ID = "00000000-0000-0000-0000-000000000001"


# ── helpers ────────────────────────────────────────────────────────────────────

def safe_div(a, b, decimals=2):
    return round(a / b, decimals) if b else 0.0


async def run_query(fn, *args, **kwargs):
    """Run a synchronous Supabase query in a thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(fn, *args, **kwargs))


def _fetch_table(table: str):
    return supabase.table(table).select("*").eq("player_id", PLAYER_ID).execute().data or []


# ── players ────────────────────────────────────────────────────────────────────

@app.get("/api/player")
def get_player():
    res = supabase.table("players").select("*").eq("id", PLAYER_ID).single().execute()
    if not res.data:
        raise HTTPException(404, "Player not found")
    return res.data


# ── dashboard summary ──────────────────────────────────────────────────────────

@app.get("/api/dashboard")
async def get_dashboard():
    fn, vl, cs = await asyncio.gather(
        run_query(_fetch_table, "fortnite_matches"),
        run_query(_fetch_table, "valorant_matches"),
        run_query(_fetch_table, "csgo_matches"),
    )

    # Fortnite summary
    fn_wins = sum(1 for m in fn if m["placement"] == 1)
    fn_kills = sum(m["kills"] for m in fn)
    fn_summary = {
        "total_matches": len(fn),
        "wins": fn_wins,
        "win_rate": round(fn_wins / len(fn) * 100, 1) if fn else 0,
        "avg_kills": round(fn_kills / len(fn), 1) if fn else 0,
        "avg_placement": round(sum(m["placement"] for m in fn) / len(fn), 1) if fn else 0,
        "avg_accuracy": round(sum(m["accuracy"] for m in fn) / len(fn), 1) if fn else 0,
    }

    # Valorant summary
    vl_wins = sum(1 for m in vl if m["outcome"] == "Win")
    vl_kills = sum(m["kills"] for m in vl)
    vl_deaths = sum(m["deaths"] for m in vl)
    vl_summary = {
        "total_matches": len(vl),
        "wins": vl_wins,
        "win_rate": round(vl_wins / len(vl) * 100, 1) if vl else 0,
        "kd_ratio": safe_div(vl_kills, vl_deaths),
        "avg_kills": round(vl_kills / len(vl), 1) if vl else 0,
        "avg_hs_percent": round(sum(m["headshot_percent"] for m in vl) / len(vl), 1) if vl else 0,
    }

    # CS:GO summary
    cs_wins = sum(1 for m in cs if m["outcome"] == "Win")
    cs_kills = sum(m["kills"] for m in cs)
    cs_deaths = sum(m["deaths"] for m in cs)
    cs_mvps = sum(1 for m in cs if m["mvp"])
    cs_summary = {
        "total_matches": len(cs),
        "wins": cs_wins,
        "win_rate": round(cs_wins / len(cs) * 100, 1) if cs else 0,
        "kd_ratio": safe_div(cs_kills, cs_deaths),
        "avg_kills": round(cs_kills / len(cs), 1) if cs else 0,
        "mvp_count": cs_mvps,
    }

    # Recent matches (last 5 across all games, sorted by date)
    recent = []
    for m in fn[-5:]:
        recent.append({"game": "Fortnite", "result": "Win" if m["placement"] == 1 else f"#{m['placement']}", "kills": m["kills"], "date": m["match_date"]})
    for m in vl[-5:]:
        recent.append({"game": "Valorant", "result": m["outcome"], "kills": m["kills"], "date": m["match_date"]})
    for m in cs[-5:]:
        recent.append({"game": "CS:GO", "result": m["outcome"], "kills": m["kills"], "date": m["match_date"]})
    recent.sort(key=lambda x: x["date"], reverse=True)

    return {
        "fortnite": fn_summary,
        "valorant": vl_summary,
        "csgo": cs_summary,
        "recent_matches": recent[:10],
    }


# ── fortnite ───────────────────────────────────────────────────────────────────

@app.get("/api/fortnite/matches")
def get_fortnite_matches(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    game_mode: Optional[str] = None,
):
    q = supabase.table("fortnite_matches").select("*").eq("player_id", PLAYER_ID).order("match_date", desc=True)
    if game_mode:
        q = q.eq("game_mode", game_mode)
    res = q.range(offset, offset + limit - 1).execute()
    return res.data or []


@app.get("/api/fortnite/stats")
async def get_fortnite_stats():
    data = await run_query(_fetch_table, "fortnite_matches")
    if not data:
        return {}
    wins = sum(1 for m in data if m["placement"] == 1)
    top5 = sum(1 for m in data if m["placement"] <= 5)
    top10 = sum(1 for m in data if m["placement"] <= 10)
    total_kills = sum(m["kills"] for m in data)
    total_assists = sum(m["assists"] for m in data)

    # Per-mode breakdown
    modes = {}
    for m in data:
        gm = m["game_mode"]
        if gm not in modes:
            modes[gm] = {"matches": 0, "wins": 0, "kills": 0}
        modes[gm]["matches"] += 1
        if m["placement"] == 1:
            modes[gm]["wins"] += 1
        modes[gm]["kills"] += m["kills"]

    # Performance over time (last 30 matches)
    timeline = [
        {"date": m["match_date"][:10], "kills": m["kills"], "placement": m["placement"]}
        for m in sorted(data, key=lambda x: x["match_date"])[-30:]
    ]

    return {
        "total_matches": len(data),
        "wins": wins,
        "win_rate": round(wins / len(data) * 100, 1),
        "top5_rate": round(top5 / len(data) * 100, 1),
        "top10_rate": round(top10 / len(data) * 100, 1),
        "avg_kills": round(total_kills / len(data), 2),
        "avg_assists": round(total_assists / len(data), 2),
        "avg_placement": round(sum(m["placement"] for m in data) / len(data), 1),
        "avg_accuracy": round(sum(m["accuracy"] for m in data) / len(data), 1),
        "total_kills": total_kills,
        "mode_breakdown": modes,
        "timeline": timeline,
    }


# ── valorant ───────────────────────────────────────────────────────────────────

@app.get("/api/valorant/matches")
def get_valorant_matches(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    agent: Optional[str] = None,
    map: Optional[str] = None,
    outcome: Optional[str] = None,
):
    q = supabase.table("valorant_matches").select("*").eq("player_id", PLAYER_ID).order("match_date", desc=True)
    if agent:
        q = q.eq("agent", agent)
    if map:
        q = q.eq("map", map)
    if outcome:
        q = q.eq("outcome", outcome)
    res = q.range(offset, offset + limit - 1).execute()
    return res.data or []


@app.get("/api/valorant/stats")
async def get_valorant_stats():
    data = await run_query(_fetch_table, "valorant_matches")
    if not data:
        return {}
    wins = sum(1 for m in data if m["outcome"] == "Win")
    total_kills = sum(m["kills"] for m in data)
    total_deaths = sum(m["deaths"] for m in data)
    total_assists = sum(m["assists"] for m in data)

    # Per-agent breakdown
    agents = {}
    for m in data:
        a = m["agent"]
        if a not in agents:
            agents[a] = {"matches": 0, "wins": 0, "kills": 0, "deaths": 0}
        agents[a]["matches"] += 1
        if m["outcome"] == "Win":
            agents[a]["wins"] += 1
        agents[a]["kills"] += m["kills"]
        agents[a]["deaths"] += m["deaths"]
    for a in agents:
        agents[a]["kd"] = safe_div(agents[a]["kills"], agents[a]["deaths"])
        agents[a]["win_rate"] = round(agents[a]["wins"] / agents[a]["matches"] * 100, 1)

    # Per-map breakdown
    maps = {}
    for m in data:
        mp = m["map"]
        if mp not in maps:
            maps[mp] = {"matches": 0, "wins": 0}
        maps[mp]["matches"] += 1
        if m["outcome"] == "Win":
            maps[mp]["wins"] += 1
    for mp in maps:
        maps[mp]["win_rate"] = round(maps[mp]["wins"] / maps[mp]["matches"] * 100, 1)

    timeline = [
        {"date": m["match_date"][:10], "kills": m["kills"], "deaths": m["deaths"], "kd": safe_div(m["kills"], m["deaths"])}
        for m in sorted(data, key=lambda x: x["match_date"])[-30:]
    ]

    return {
        "total_matches": len(data),
        "wins": wins,
        "win_rate": round(wins / len(data) * 100, 1),
        "kd_ratio": safe_div(total_kills, total_deaths),
        "avg_kills": round(total_kills / len(data), 2),
        "avg_deaths": round(total_deaths / len(data), 2),
        "avg_assists": round(total_assists / len(data), 2),
        "avg_hs_percent": round(sum(m["headshot_percent"] for m in data) / len(data), 1),
        "total_kills": total_kills,
        "agent_breakdown": agents,
        "map_breakdown": maps,
        "timeline": timeline,
    }


# ── csgo ───────────────────────────────────────────────────────────────────────

@app.get("/api/csgo/matches")
def get_csgo_matches(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    map: Optional[str] = None,
    outcome: Optional[str] = None,
):
    q = supabase.table("csgo_matches").select("*").eq("player_id", PLAYER_ID).order("match_date", desc=True)
    if map:
        q = q.eq("map", map)
    if outcome:
        q = q.eq("outcome", outcome)
    res = q.range(offset, offset + limit - 1).execute()
    return res.data or []


@app.get("/api/csgo/stats")
async def get_csgo_stats():
    data = await run_query(_fetch_table, "csgo_matches")
    if not data:
        return {}
    wins = sum(1 for m in data if m["outcome"] == "Win")
    total_kills = sum(m["kills"] for m in data)
    total_deaths = sum(m["deaths"] for m in data)
    total_assists = sum(m["assists"] for m in data)
    mvps = sum(1 for m in data if m["mvp"])

    # Per-map breakdown
    maps = {}
    for m in data:
        mp = m["map"]
        if mp not in maps:
            maps[mp] = {"matches": 0, "wins": 0, "kills": 0, "deaths": 0, "mvps": 0}
        maps[mp]["matches"] += 1
        if m["outcome"] == "Win":
            maps[mp]["wins"] += 1
        maps[mp]["kills"] += m["kills"]
        maps[mp]["deaths"] += m["deaths"]
        if m["mvp"]:
            maps[mp]["mvps"] += 1
    for mp in maps:
        maps[mp]["kd"] = safe_div(maps[mp]["kills"], maps[mp]["deaths"])
        maps[mp]["win_rate"] = round(maps[mp]["wins"] / maps[mp]["matches"] * 100, 1)

    timeline = [
        {"date": m["match_date"][:10], "kills": m["kills"], "deaths": m["deaths"], "kd": safe_div(m["kills"], m["deaths"])}
        for m in sorted(data, key=lambda x: x["match_date"])[-30:]
    ]

    return {
        "total_matches": len(data),
        "wins": wins,
        "win_rate": round(wins / len(data) * 100, 1),
        "kd_ratio": safe_div(total_kills, total_deaths),
        "avg_kills": round(total_kills / len(data), 2),
        "avg_deaths": round(total_deaths / len(data), 2),
        "avg_assists": round(total_assists / len(data), 2),
        "mvp_count": mvps,
        "mvp_rate": round(mvps / len(data) * 100, 1),
        "total_kills": total_kills,
        "map_breakdown": maps,
        "timeline": timeline,
    }


# ── match history (all games) ──────────────────────────────────────────────────

@app.get("/api/matches")
def get_all_matches(
    limit: int = Query(100, ge=1, le=500),
    game: Optional[str] = Query(None, description="fortnite | valorant | csgo"),
    outcome: Optional[str] = None,
):
    results = []

    if not game or game == "fortnite":
        fn = supabase.table("fortnite_matches").select("*").eq("player_id", PLAYER_ID).order("match_date", desc=True).execute().data or []
        for m in fn:
            results.append({
                "game": "Fortnite",
                "result": "Win" if m["placement"] == 1 else f"#{m['placement']}",
                "outcome": "Win" if m["placement"] == 1 else "Loss",
                "kills": m["kills"],
                "deaths": None,
                "assists": m["assists"],
                "detail": f"Placement #{m['placement']} • {m['game_mode']}",
                "date": m["match_date"],
                "map": None,
            })

    if not game or game == "valorant":
        vl = supabase.table("valorant_matches").select("*").eq("player_id", PLAYER_ID).order("match_date", desc=True).execute().data or []
        for m in vl:
            results.append({
                "game": "Valorant",
                "result": m["outcome"],
                "outcome": m["outcome"],
                "kills": m["kills"],
                "deaths": m["deaths"],
                "assists": m["assists"],
                "detail": f"{m['agent']} • {m['map']}",
                "date": m["match_date"],
                "map": m["map"],
            })

    if not game or game == "csgo":
        cs = supabase.table("csgo_matches").select("*").eq("player_id", PLAYER_ID).order("match_date", desc=True).execute().data or []
        for m in cs:
            results.append({
                "game": "CS:GO",
                "result": m["outcome"],
                "outcome": m["outcome"],
                "kills": m["kills"],
                "deaths": m["deaths"],
                "assists": m["assists"],
                "detail": m["map"] + (" • MVP" if m["mvp"] else ""),
                "date": m["match_date"],
                "map": m["map"],
            })

    if outcome:
        results = [r for r in results if r["outcome"] == outcome]

    results.sort(key=lambda x: x["date"], reverse=True)
    return results[:limit]


@app.get("/health")
def health():
    return {"status": "ok"}


# ── PandaScore helpers ─────────────────────────────────────────────────────────

def ps_headers():
    return {"Authorization": f"Bearer {PANDASCORE_TOKEN}"}


def ps_get(path: str, params: dict = None):
    url = f"{PANDASCORE_BASE}{path}"
    with httpx.Client(timeout=10) as client:
        r = client.get(url, headers=ps_headers(), params=params or {})
    if r.status_code != 200:
        raise HTTPException(r.status_code, f"PandaScore error: {r.text[:200]}")
    return r.json()


def clean_match(m: dict) -> dict:
    """Flatten a PandaScore match object into something frontend-friendly."""
    opponents = m.get("opponents") or []
    teams = [o["opponent"] for o in opponents if o.get("opponent")]
    results = m.get("results") or []

    winner_id = None
    if m.get("winner"):
        winner_id = m["winner"].get("id")

    team_info = []
    for i, t in enumerate(teams[:2]):
        score = results[i]["score"] if i < len(results) else None
        team_info.append({
            "name": t.get("name", "TBD"),
            "acronym": t.get("acronym", ""),
            "image_url": t.get("image_url"),
            "score": score,
            "winner": t.get("id") == winner_id,
        })

    serie = m.get("serie") or {}
    league = m.get("league") or {}
    tournament = m.get("tournament") or {}

    return {
        "id": m.get("id"),
        "name": m.get("name"),
        "status": m.get("status"),
        "scheduled_at": m.get("scheduled_at"),
        "begin_at": m.get("begin_at"),
        "end_at": m.get("end_at"),
        "game": m.get("videogame", {}).get("name") if m.get("videogame") else None,
        "league": league.get("name"),
        "league_image": league.get("image_url"),
        "serie": serie.get("full_name") or serie.get("name"),
        "tournament": tournament.get("name"),
        "match_type": m.get("match_type"),
        "number_of_games": m.get("number_of_games"),
        "teams": team_info,
        "stream_url": (m.get("streams_list") or [{}])[0].get("raw_url") if m.get("streams_list") else None,
    }


def clean_tournament(t: dict) -> dict:
    league = t.get("league") or {}
    serie = t.get("serie") or {}
    return {
        "id": t.get("id"),
        "name": t.get("name"),
        "slug": t.get("slug"),
        "begin_at": t.get("begin_at"),
        "end_at": t.get("end_at"),
        "game": t.get("videogame", {}).get("name") if t.get("videogame") else None,
        "league": league.get("name"),
        "league_image": league.get("image_url"),
        "serie": serie.get("full_name") or serie.get("name"),
        "tier": t.get("tier"),
        "prizepool": t.get("prizepool"),
        "has_bracket": t.get("has_bracket"),
        "live_supported": t.get("live_supported"),
    }


# ── PandaScore: matches ────────────────────────────────────────────────────────

# Maps our frontend keys to PandaScore URL prefixes
GAME_PREFIX = {
    "csgo":     "csgo",
    "valorant": "valorant",
    "lol":      "lol",
    "dota2":    "dota2",
    "ow2":      "ow2",
    "r6":       "r6siege",
    "rl":       "rl",
}


def ps_path(game: Optional[str], suffix: str) -> str:
    """Return e.g. /csgo/matches/running or /matches/running."""
    if game and game in GAME_PREFIX:
        return f"/{GAME_PREFIX[game]}{suffix}"
    return suffix


@app.get("/api/tournaments/matches/live")
def get_live_matches(
    game: Optional[str] = None,
    per_page: int = Query(20, ge=1, le=50),
):
    data = ps_get(ps_path(game, "/matches/running"), {"per_page": per_page, "sort": "begin_at"})
    return [clean_match(m) for m in data]


@app.get("/api/tournaments/matches/upcoming")
def get_upcoming_matches(
    game: Optional[str] = None,
    per_page: int = Query(20, ge=1, le=50),
):
    data = ps_get(ps_path(game, "/matches/upcoming"), {"per_page": per_page, "sort": "begin_at"})
    return [clean_match(m) for m in data]


@app.get("/api/tournaments/matches/past")
def get_past_matches(
    game: Optional[str] = None,
    per_page: int = Query(20, ge=1, le=50),
):
    data = ps_get(ps_path(game, "/matches/past"), {"per_page": per_page, "sort": "-end_at"})
    return [clean_match(m) for m in data]


# ── PandaScore: tournaments ────────────────────────────────────────────────────

@app.get("/api/tournaments/list/running")
def get_running_tournaments(
    game: Optional[str] = None,
    per_page: int = Query(10, ge=1, le=50),
):
    data = ps_get(ps_path(game, "/tournaments/running"), {"per_page": per_page, "sort": "begin_at"})
    return [clean_tournament(t) for t in data]


@app.get("/api/tournaments/list/upcoming")
def get_upcoming_tournaments(
    game: Optional[str] = None,
    per_page: int = Query(10, ge=1, le=50),
):
    data = ps_get(ps_path(game, "/tournaments/upcoming"), {"per_page": per_page, "sort": "begin_at"})
    return [clean_tournament(t) for t in data]


@app.get("/api/tournaments/list/past")
def get_past_tournaments(
    game: Optional[str] = None,
    per_page: int = Query(10, ge=1, le=50),
):
    data = ps_get(ps_path(game, "/tournaments/past"), {"per_page": per_page, "sort": "-end_at"})
    return [clean_tournament(t) for t in data]


@app.get("/api/tournaments/games")
def get_supported_games():
    return [{"key": k, "prefix": v} for k, v in GAME_PREFIX.items()]
