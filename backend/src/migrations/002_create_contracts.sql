CREATE TABLE IF NOT EXISTS contracts (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id   VARCHAR(50) NOT NULL,
  nombre        VARCHAR(255) NOT NULL,
  variables     JSONB NOT NULL,
  cuerpo        TEXT NOT NULL,
  estado        VARCHAR(20) NOT NULL DEFAULT 'borrador',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
