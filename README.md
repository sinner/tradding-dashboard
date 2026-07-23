# BTC Reports Dashboard

Static React + TypeScript app for BTC morning / midday / end-day reports, with live Binance overlays. Deployed to GitHub Pages.

## Stack

- Vite · React 19 · TypeScript · Tailwind · TanStack Query · D3 · Zod · React Router

## Develop

```bash
pnpm install
pnpm dev
```

App base path is `/btc-dashboard/` (GitHub Pages project site). Open:

`http://localhost:5173/btc-dashboard/`

```bash
pnpm build && pnpm preview
pnpm lint
pnpm format        # Prettier write
pnpm format:check
```

Editor: `.vscode/settings.json` enables **format on save** via the Prettier extension (`esbenp.prettier-vscode`).

## Data

Drop report files under `public/data/`:

| File                                      | Purpose                  |
| ----------------------------------------- | ------------------------ |
| `manifest.json`                           | Index of days / sessions |
| `YYYY/MM/YYYY-MM-DD-{session}.json`       | Machine-readable report  |
| `calibration.json`                        | Track-record rows        |
| `reports/YYYY/MM/YYYY-MM-DD-{session}.md` | Optional narrative       |

The app validates every JSON file with Zod. Replace the placeholder seed files with your real reports.

## Routes

| Path                          | Screen                       |
| ----------------------------- | ---------------------------- |
| `/`                           | Daily dashboard              |
| `/history`                    | Date browser                 |
| `/day/:date`                  | Three-session contrast       |
| `/studies` · `/studies/:date` | RSI / MACD / levels          |
| `/calibration`                | Track record                 |
| `/report/:id`                 | Full markdown + decision box |

## Security

Public Binance market-data endpoints only. **Never** put an account API key in this client.
