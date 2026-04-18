CREATE TABLE IF NOT EXISTS equipamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_me TEXT,
  tag_re TEXT,
  desc_motor TEXT,
  desc_redutor TEXT,
  hp TEXT,
  kw TEXT,
  source TEXT,
  status TEXT,
  row_key TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipamentos_status ON equipamentos(status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_source ON equipamentos(source);
CREATE INDEX IF NOT EXISTS idx_equipamentos_tag_me ON equipamentos(tag_me);
CREATE INDEX IF NOT EXISTS idx_equipamentos_tag_re ON equipamentos(tag_re);

CREATE TABLE IF NOT EXISTS marcacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  row_key TEXT NOT NULL UNIQUE,
  is_checked INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordens_servico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_os TEXT,
  data_os TEXT,
  tag_me TEXT,
  tag_re TEXT,
  potencia TEXT,
  status_equipamento TEXT,
  responsavel TEXT,
  setor TEXT,
  descricao TEXT,
  servico TEXT,
  observacao TEXT,
  payload_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
