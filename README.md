[Link](https://esports-stats-dashboard-hetmo2ki2-patrickrapalos-projects.vercel.app/)



# E-sports Stats Dashboard

A full-stack e-sports stats dashboard tracking player performance across Fortnite, Valorant, and CS:GO. Inspired by Tracker.gg — dark-themed, data-dense, and professional.

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18 + Tailwind CSS |
| Backend  | FastAPI (Python)        |
| Database | Supabase (PostgreSQL)   |
| Charts   | Recharts                |

---

## Project Structure

```
E-sports Website/
├── backend/
│   ├── main.py          # FastAPI app with all endpoints
│   ├── requirements.txt
│   ├── .env             # Your secrets (never commit)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api.js       # API client
│   │   ├── App.jsx      # Router
│   │   ├── components/  # Sidebar, StatCard, MatchTable, Charts
│   │   └── pages/       # Dashboard, Fortnite, Valorant, CSGO, MatchHistory
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/
│   ├── schema.sql       # Run first in Supabase SQL editor
│   └── seed.sql         # Run second (60 matches per game)
└── README.md
```

---

## Setup Instructions

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, run `database/schema.sql` to create the tables.
3. In the **SQL Editor**, run `database/seed.sql` to populate 60 matches per game.
4. From **Project Settings → API**, copy your:
   - Project URL (`https://xxxx.supabase.co`)
   - `anon` public key (or service role key for dev)

---

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Supabase URL and key

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint              | Description                         |
|--------|-----------------------|-------------------------------------|
| GET    | `/api/player`         | Player profile                      |
| GET    | `/api/dashboard`      | Aggregated summary across all games |
| GET    | `/api/fortnite/stats` | Fortnite aggregated stats           |
| GET    | `/api/fortnite/matches` | Fortnite match history (filterable) |
| GET    | `/api/valorant/stats` | Valorant aggregated stats           |
| GET    | `/api/valorant/matches` | Valorant match history (filterable) |
| GET    | `/api/csgo/stats`     | CS:GO aggregated stats              |
| GET    | `/api/csgo/matches`   | CS:GO match history (filterable)    |
| GET    | `/api/matches`        | All matches across games (filterable)|
| GET    | `/health`             | Health check                        |

### Query Parameters

- `limit` / `offset` — pagination
- `game_mode` (Fortnite) — Solo, Duos, Trios, Squads
- `agent` (Valorant) — e.g., Jett, Reyna
- `map` — filter by map name
- `outcome` — Win, Loss, Draw
- `game` (all matches) — fortnite, valorant, csgo

---

## Features

- **Dashboard** — overview stats, game summaries, recent activity, highlight card
- **Fortnite page** — win rate, top-5/10 rates, placement trend, kills by mode
- **Valorant page** — KD ratio, HS%, agent breakdown with per-agent stats table
- **CS:GO page** — KD ratio, MVP tracking, map breakdown, MVP rate progress bars
- **Match History** — unified filterable + sortable table across all games with live search
- **Charts** — line charts (kills over time, KD over time, placement over time), bar charts (kills by map/agent/mode, win rate breakdowns)
- **Dark theme** — `#0f1923` base, matching the Valorant tracker aesthetic

---

## Running Both Servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Then open `http://localhost:3000`.
