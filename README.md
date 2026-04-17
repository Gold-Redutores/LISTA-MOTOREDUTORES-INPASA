# Estrutura completa: salvar marcações no GitHub

Este projeto usa:
- **GitHub Pages / site estático** para o dashboard
- **Netlify Functions** como backend seguro
- **GitHub REST API** para ler e gravar `data/selections.json`

## Arquivos principais

- `index.html` → dashboard com checkbox e botão salvar
- `table-data.js` → dados da tabela
- `netlify/functions/save-selection.mjs` → grava no GitHub
- `netlify/functions/get-selection.mjs` → lê do GitHub
- `netlify.toml` → configuração do Netlify
- `data/selections.json` → arquivo que receberá as marcações

## Como configurar

### 1) Suba estes arquivos para o seu repositório
Sugestão de estrutura:

```text
/
├─ index.html
├─ table-data.js
├─ gold-redutores.png
├─ netlify.toml
├─ package.json
├─ data/
│  └─ selections.json
└─ netlify/
   └─ functions/
      ├─ get-selection.mjs
      └─ save-selection.mjs
```

### 2) Publique o site no Netlify
Conecte o repositório no Netlify.

### 3) Configure as variáveis de ambiente no Netlify
Crie estas variáveis:

- `GITHUB_TOKEN` = token do GitHub com permissão de escrita no repositório
- `GITHUB_OWNER` = seu usuário ou organização
- `GITHUB_REPO` = nome do repositório
- `GITHUB_BRANCH` = `main`
- `GITHUB_FILE_PATH` = `data/selections.json`

### 4) Crie o token do GitHub
O token precisa conseguir atualizar conteúdo do repositório.

### 5) Teste
Ao clicar em **Salvar no GitHub**, a função:
1. recebe as marcações
2. chama a API do GitHub
3. atualiza `data/selections.json`
4. grava um commit no branch configurado

## Formato salvo no GitHub

```json
{
  "updated_at": "2026-04-17T12:00:00.000Z",
  "selections": {
    "ME-601011|RE-601011|5|REDUTOR DOSADOR DE CAVACOS 1|lista1.jpeg": true
  }
}
```

## Observações importantes

- **Não coloque o token no HTML.**
- O token deve ficar somente no Netlify.
- O site estático chama a função `/.netlify/functions/save-selection`, e a função faz o commit usando a API do GitHub.

## Fluxo técnico

- O GitHub Contents API permite criar e atualizar arquivos do repositório.
- As Functions do Netlify conseguem usar variáveis de ambiente no runtime.
- Por isso, o frontend continua seguro e o token não fica exposto.

## Personalizações
Se quiser, depois você pode:
- salvar por usuário
- salvar por data
- criar histórico de alterações
- salvar em outro arquivo por equipamento
