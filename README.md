# Cloudflare Pages + D1 - Ferramenta Industrial

## O que este projeto resolve
- Hospedagem estática no Cloudflare Pages
- API serverless via Pages Functions
- Banco D1 para:
  - equipamentos
  - marcações
  - ordens de serviço

## Por que essa arquitetura é melhor para crescer
A lista atual tem 120 equipamentos, mas o banco D1 permite aumentar sem reescrever o HTML. Você poderá:
- reimportar lotes maiores
- consultar histórico de OS
- guardar marcações reais
- evoluir para múltiplos usuários

## Estrutura
- `index.html`
- `functions/api/equipamentos.js`
- `functions/api/selections.js`
- `functions/api/os.js`
- `functions/api/import-equipamentos.js`
- `migrations/0001_schema.sql`
- `seed/equipamentos.json`
- `wrangler.jsonc`

## Passo a passo

### 1) Instalar Wrangler
```bash
npm install
```

### 2) Login
```bash
npx wrangler login
```

### 3) Criar banco D1
```bash
npx wrangler d1 create inpasa-industrial-db
```

O comando retorna `database_name` e `database_id`. Coloque esses valores em `wrangler.jsonc`.

### 4) Aplicar schema
```bash
npx wrangler d1 execute DB_NAME_PLACEHOLDER --file=./migrations/0001_schema.sql --remote
```

### 5) Criar projeto no Cloudflare Pages
No painel Cloudflare Pages, conecte o repositório.

### 6) Vincular o D1 ao Pages
No projeto Pages:
Settings > Bindings > Add > D1 database bindings
Binding name: `DB`

### 7) Importar a lista inicial
Com o projeto já publicado, faça um POST para:
`/api/import-equipamentos`

Use o arquivo `seed/equipamentos.json`.

### 8) Testar
- `/api/equipamentos`
- `/api/selections`
- salvar OS no painel
