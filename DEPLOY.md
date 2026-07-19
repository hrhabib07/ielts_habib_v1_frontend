# Frontend deploy (Vercel)

This GitHub repo is the **Next.js app only** (`ielts-habib-frontend`).

Repo: https://github.com/hrhabib07/ielts_habib_v1_frontend  
Live site: https://gamlish.com  
API (Railway): https://ieltshabibv1backend-production.up.railway.app

## One-time Vercel setup

1. Vercel → Import Git Repository → `hrhabib07/ielts_habib_v1_frontend`
2. Framework: **Next.js**
3. Root Directory: leave **empty** (this repo is already the app root)
4. Install / Build: uses `vercel.json` (`npm ci` → `npm run build`)
5. Production environment variables (Settings → Environment Variables → **Production**):

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://ieltshabibv1backend-production.up.railway.app/api` |
| `NEXT_PUBLIC_APP_URL` | `https://gamlish.com` |
| `JWT_SECRET` | **same value** as Railway `JWT_SECRET` |

6. Domains: attach `gamlish.com` / `www.gamlish.com`
7. Confirm **Production** auto-deploys from branch `main`

## Everyday deploy

```bash
git add -A
git commit -m "your message"
git push origin main
```

Vercel rebuilds Production from `main`. No manual upload needed after the project is linked.

## Local verify before push

```bash
npm ci
npm run build
```

Build must succeed with exit code 0. TypeScript runs as part of `next build`.

## Google sign-in

Configured on Railway only (`GOOGLE_*` vars). Frontend just needs `NEXT_PUBLIC_API_BASE_URL` ending in `/api` so the button can hit `{API}/auth/google`.

## After frontend domain changes

Update Railway `FRONTEND_ORIGIN` to match (comma-separated, no trailing slash), e.g.:

`https://gamlish.com,https://www.gamlish.com`

Then redeploy the API if CORS blocks login.
