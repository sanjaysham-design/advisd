# Advisd — Portfolio Intelligence

A modern portfolio reporting tool for family office advisors, built with React + Vite + Recharts.

## Features
- **Multi-client dashboard** — switch between 5 clients instantly
- **Natural Language Query (NLQ)** — ask questions in plain English about your portfolio
- **Capital Calls tracker** — urgency-ranked, with 12-month cash flow forecast
- **Holdings table** — IRR, TVPI, DPI for alternatives; filterable by asset class
- **Performance attribution** — by manager, with benchmark comparison
- **Risk metrics** — Sharpe, VaR, beta, drawdown
- **Report Builder** — templates, scheduled distributions, archive

---

## Local Development

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- Git ([download](https://git-scm.com))

```bash
cd advisd
npm install
npm run dev
```
Open **http://localhost:5173**

---

## Deployment (GitHub + Vercel)

### Step 1 — Push to GitHub

1. Go to **https://github.com/new** and create a new repository named `advisd`
2. Set it to **Private** (recommended for financial data)
3. Don't initialize with README (you already have one)
4. Copy the commands GitHub shows you, they'll look like:

```bash
cd advisd
git init
git add .
git commit -m "Initial commit — Advisd portfolio app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/advisd.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to **https://vercel.com** and sign up / log in with your GitHub account
2. Click **"Add New Project"**
3. Click **"Import"** next to your `advisd` repository
4. Vercel auto-detects Vite — no settings to change
5. Click **"Deploy"**

Your app will be live at `https://advisd-[random].vercel.app` in ~60 seconds.

### Step 3 — Set a custom domain (optional)
In Vercel → Project Settings → Domains → add `app.advisd.com` or similar.

### Automatic deploys
Every `git push` to `main` triggers a new deploy automatically. Your workflow becomes:
```bash
# make changes locally, then:
git add .
git commit -m "describe your change"
git push
# Vercel deploys automatically
```

---

## Environment Variables

**Never commit secrets to Git.** Use `.env.local` locally and Vercel's dashboard for production.

Copy `.env.example` to `.env.local` and fill in values as you add services:
```bash
cp .env.example .env.local
```

To add env vars to Vercel: Project Settings → Environment Variables.

---

## Roadmap

| Phase | Status |
|---|---|
| ✅ Phase 1 — Rename to Advisd | Done |
| ✅ Phase 2 — GitHub + Vercel deployment | Done |
| 🔜 Phase 3 — Supabase database | Next |
| 🔜 Phase 4 — Document upload + AI ingestion | Upcoming |
| 🔜 Phase 5 — UI/UX expansion | Upcoming |

## Project Structure

```
advisd/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx       # Navigation + client selector
│   │   ├── NLQBar.jsx        # Natural language query bar
│   │   ├── Dashboard.jsx     # Main overview view
│   │   ├── CapitalCalls.jsx  # Capital calls + commitments
│   │   └── Reports.jsx       # Report builder + scheduler
│   ├── data/
│   │   └── mockData.js       # All mock portfolio data
│   ├── App.jsx               # Root component + routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles + CSS variables
├── index.html
├── vite.config.js
└── package.json
```

## Connecting Real Data

All mock data lives in `src/data/mockData.js`. To wire up real Addepar / Tamarac / Orion data:

1. Replace exports in `mockData.js` with API fetch calls
2. Add an API service layer in `src/services/`
3. For NLQ, replace the static `nlqAnswers` map with a call to an LLM backend (Claude API recommended)

## Design System

CSS variables are defined in `src/index.css`. The palette uses:
- `--bg` / `--bg2` / `--bg3` / `--bg4` — layered dark backgrounds
- `--surf` / `--surf2` — surface/card colors
- `--blue`, `--green`, `--red`, `--amber`, `--purple`, `--teal` — semantic accents
- `--tx`, `--tx2`, `--tx3` — text hierarchy

## Tech Stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool / dev server |
| Recharts | Charts (performance, cash flow) |
| Lucide React | Icons |

## Next Steps (Production Roadmap)

- [ ] Auth / multi-user login (Auth0 or Clerk)
- [ ] Real Addepar API integration
- [ ] Claude API for true NLQ
- [ ] PDF generation (react-pdf or Puppeteer)
- [ ] Email report scheduler (SendGrid)
- [ ] Morningstar data feed for ESG + ratings
- [ ] White-label theming per client
