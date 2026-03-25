-- E-sports Stats Dashboard Schema
-- Run this in your Supabase SQL editor

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fortnite matches table
CREATE TABLE IF NOT EXISTS fortnite_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  placement INTEGER NOT NULL CHECK (placement >= 1 AND placement <= 100),
  kills INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  match_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  game_mode TEXT NOT NULL DEFAULT 'Solo' CHECK (game_mode IN ('Solo', 'Duos', 'Trios', 'Squads'))
);

-- Valorant matches table
CREATE TABLE IF NOT EXISTS valorant_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  map TEXT NOT NULL,
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  headshot_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  outcome TEXT NOT NULL CHECK (outcome IN ('Win', 'Loss', 'Draw')),
  match_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CS:GO matches table
CREATE TABLE IF NOT EXISTS csgo_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  map TEXT NOT NULL,
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  mvp BOOLEAN NOT NULL DEFAULT FALSE,
  outcome TEXT NOT NULL CHECK (outcome IN ('Win', 'Loss', 'Draw')),
  match_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fortnite_player_id ON fortnite_matches(player_id);
CREATE INDEX IF NOT EXISTS idx_fortnite_match_date ON fortnite_matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_valorant_player_id ON valorant_matches(player_id);
CREATE INDEX IF NOT EXISTS idx_valorant_match_date ON valorant_matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_csgo_player_id ON csgo_matches(player_id);
CREATE INDEX IF NOT EXISTS idx_csgo_match_date ON csgo_matches(match_date DESC);

-- Enable Row Level Security (optional, disable for dev)
-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fortnite_matches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE valorant_matches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE csgo_matches ENABLE ROW LEVEL SECURITY;
