CREATE TABLE IF NOT EXISTS signatures (
  id            SERIAL PRIMARY KEY,
  contract_id   INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  firmante_email VARCHAR(255) NOT NULL,
  firmante_nombre VARCHAR(255) NOT NULL,
  token         VARCHAR(64) UNIQUE NOT NULL,
  estado        VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  ip            VARCHAR(45),
  signed_at     TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
