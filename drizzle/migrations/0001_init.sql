-- Release Checklist — Initial Schema
-- Run this SQL in your Neon console (or any PostgreSQL instance) to initialize the database.

-- Table: releases
CREATE TABLE IF NOT EXISTS releases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    release_date    TIMESTAMPTZ NOT NULL,
    additional_info TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: step_states (one row per release per step; step_index 0-8)
CREATE TABLE IF NOT EXISTS step_states (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id  UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    step_index  SMALLINT NOT NULL CHECK (step_index >= 0 AND step_index <= 8),
    is_done     BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (release_id, step_index)
);

CREATE INDEX IF NOT EXISTS idx_step_states_release_id ON step_states (release_id);
