# ContractMotion — Marketing Website

Static HTML/CSS/JS site for ContractMotion.com (ECAS enterprise contract acquisition system).

## Files

```
index.html      — Full single-page site (9 sections)
style.css       — Design system + all component styles
script.js       — Nav, forms, queue timestamp, scroll animations
favicon.ico     — Placeholder favicon
Dockerfile      — nginx:alpine static file server
railway.json    — Railway deployment config
```

## Local Preview

```bash
# Python (no install needed)
cd ~/Desktop/contractmotion-site
python3 -m http.server 8080
# Open http://localhost:8080
```

## Deploy to Railway

### Option 1 — Railway CLI

```bash
cd ~/Desktop/contractmotion-site
railway login
railway init
railway up
```

### Option 2 — GitHub + Railway Dashboard

1. Push repo to GitHub (already done if you ran the init commands)
2. Go to railway.app → New Project → Deploy from GitHub
3. Select `Entmarketingteam/contractmotion-site`
4. Railway auto-detects `Dockerfile` and deploys
5. Add custom domain: `contractmotion.com` in Railway → Settings → Domains

## Deploy to Vercel

```bash
npx vercel --prod
# Follow prompts — static site, no framework
```

Or connect GitHub repo at vercel.com → New Project → Import from GitHub.

## Form Endpoints

Both forms POST JSON to placeholder endpoints. Wire these to your backend or a form service:

- `POST /api/signal-audit` — Signal Audit request form
  - Body: `{ company, role, region, revenue }`
- `POST /api/subscribe` — Signal Report email subscribe
  - Body: `{ email }`

**Quick options for form handling:**
- Formspree.io — replace form action with Formspree endpoint
- n8n webhook — POST to n8n webhook URL, route to Airtable/email
- Netlify Forms — add `netlify` attribute to form element if deploying to Netlify

## Design System

| Token | Value |
|-------|-------|
| Background | `#0D1117` |
| Accent | `#00FF94` |
| Text | `#E6EDF3` |
| Muted | `#8B949E` |
| Border | `#21262D` |
| Font (headings/data) | JetBrains Mono |
| Font (body) | Inter |

## Custom Domain (Railway)

1. In Railway project → Settings → Networking → Add Custom Domain
2. Add `contractmotion.com` and `www.contractmotion.com`
3. Update DNS at your registrar:
   - CNAME `www` → Railway-provided hostname
   - A record `@` → Railway IP (or CNAME if apex domain is supported)
4. SSL is auto-provisioned by Railway
