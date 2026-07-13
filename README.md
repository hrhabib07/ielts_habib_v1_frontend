# Gamlish frontend

Next.js 14+ App Router app for [Gamlish](https://gamlish.com).

## Local

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_API_BASE_URL=http://localhost:5050/api
npm ci
npm run dev
```

## Production build

```bash
npm run build
```

## Deploy

Push `main` to GitHub. Vercel auto-deploys.

See [DEPLOY.md](./DEPLOY.md) for env vars and one-time setup.
