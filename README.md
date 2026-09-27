# Gamlish frontend

Next.js 14+ App Router app for [Gamlish](https://gamlish.com).

## Local

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The API example expects the backend on `http://localhost:5000/api`. Use Node.js 20 (same as Vercel and Railway).

## Production build

```bash
npm run build
```

## Deploy

Push `main` to GitHub. Vercel auto-deploys.

See [DEPLOY.md](./DEPLOY.md) for env vars and one-time setup.
