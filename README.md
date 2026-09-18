# Churrasco POLI — 30 anos

Site para organizar o churrasco de 30 anos de formados da turma de Engenharia Química da POLI.

## Architecture

- Next.js static export
- GitHub Pages hosting
- Google Sheets persistence
- Google Apps Script API
- Google Identity Services for the single administrator
- External PIX payment; no payment processing

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without environment variables, public pages open in setup mode with zeroed totals. The attendance form and administration require the Apps Script integration.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

Full setup instructions are in [`docs/setup.md`](docs/setup.md).
