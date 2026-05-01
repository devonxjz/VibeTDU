-- ============================================================
-- Virtual Chemistry Lab – PostgreSQL Schema (Supabase)
-- Supabase tự tạo schema "public" – chỉ cần tạo tables.
-- Spring Boot ddl-auto=update cũng tự tạo nếu chưa có.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. chemical_cache
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chemical_cache (
    id                BIGSERIAL PRIMARY KEY,
    input_query       VARCHAR(255) NOT NULL,
    canonical_name    VARCHAR(512),
    canonical_formula VARCHAR(255),
    smiles            VARCHAR(1024),
    inchi             TEXT,
    inchikey          VARCHAR(27),
    source            VARCHAR(50),
    raw_response      TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chemical_input ON chemical_cache(input_query);

-- ──────────────────────────────────────────────────────────────
-- 2. reaction_api_cache
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reaction_api_cache (
    id                       BIGSERIAL PRIMARY KEY,
    reaction_key             VARCHAR(1024) NOT NULL,
    input_payload            TEXT,
    raw_prediction_response  TEXT,
    normalized_result        TEXT,
    source                   VARCHAR(50),
    confidence               DOUBLE PRECISION,
    verified                 BOOLEAN DEFAULT FALSE,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reaction_key ON reaction_api_cache(reaction_key);

-- ──────────────────────────────────────────────────────────────
-- 3. experiment_sessions
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiment_sessions (
    id              BIGSERIAL PRIMARY KEY,
    session_code    VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_session_code ON experiment_sessions(session_code);

-- ──────────────────────────────────────────────────────────────
-- 4. experiment_logs
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiment_logs (
    id               BIGSERIAL PRIMARY KEY,
    session_code     VARCHAR(100) NOT NULL,
    action_type      VARCHAR(50)  NOT NULL,
    request_payload  TEXT,
    response_payload TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_log_session ON experiment_logs(session_code);

-- ──────────────────────────────────────────────────────────────
-- 5. api_error_logs
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_error_logs (
    id               BIGSERIAL PRIMARY KEY,
    api_name         VARCHAR(100) NOT NULL,
    request_payload  TEXT,
    error_message    TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
