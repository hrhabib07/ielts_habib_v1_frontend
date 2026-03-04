# GAMLISH — Frontend Architecture (Next.js App Router)

The Game of English. Production-grade, minimalistic frontend for GAMLISH. Backend: JWT auth, manual subscription, level-based mastery, reading module (MVP), band-based unlock, profile summary, content gating.

---

## 1. Product Style

**Not** a SaaS dashboard. It is:

- **Academic** — structured learning, band targets, progress
- **Clean** — minimal UI, no clutter
- **Premium** — calm, serious tone
- **Structured** — level → step → practice/test → result

**Design feel:** Minimal like Claude / Linear. Calm UI. Serious tone. Focused reading experience.

---

## 2. Folder Architecture

```
ielts-habib-frontend/
├── app/
│   ├── layout.tsx                    # Root: Header + Footer, ThemeProvider
│   ├── globals.css
│   ├── page.tsx                      # Public: /
│   ├── about/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── verify-otp/
│   │       └── page.tsx
│   └── profile/
│       ├── layout.tsx                # Minimal internal layout (no full dashboard)
│       ├── page.tsx                  # Redirect to /profile/reading
│       └── reading/
│           ├── page.tsx             # Profile summary (core intelligence screen)
│           ├── level/
│           │   └── [levelId]/
│           │       └── page.tsx
│           ├── practice/
│           │   └── [stepId]/
│           │       └── page.tsx
│           └── test/
│               └── [testId]/
│                   └── page.tsx
├── src/
│   ├── components/
│   │   ├── ui/                       # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── LevelCard.tsx
│   │   │   ├── AttemptTable.tsx
│   │   │   ├── BandIndicator.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ThemeProvider.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios/fetch wrapper + token injection
│   │   │   ├── profile.ts           # Profile summary, levels, etc.
│   │   │   └── types.ts             # API response types
│   │   ├── auth.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useSubscription.ts
│   ├── providers/
│   │   └── AuthProvider.tsx
│   └── middleware.ts                 # Route protection, redirects
├── public/
├── FRONTEND_ARCHITECTURE.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Route Structure

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing |
| `/about` | Public | About |
| `/pricing` | Public | Plans, CTA; redirect target for unsubscribed |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/verify-otp` | Public | OTP verification |
| `/profile` | Auth | Redirect to `/profile/reading` |
| `/profile/reading` | Auth + Subscription | **Profile summary** (target band, current band, streak, level, progress %, continue, weaknesses, recent attempts) |
| `/profile/reading/level/[levelId]` | Auth + Subscription | Level detail, steps |
| `/profile/reading/practice/[stepId]` | Auth + Subscription | Practice step |
| `/profile/reading/test/[testId]` | Auth + Subscription | Test attempt |

**No full dashboard layout.** Root layout = Header + Footer. Profile layout = minimal internal layout (breadcrumb + content).

---

## 4. Layout Structure

### Root layout (`app/layout.tsx`)

- Fonts (Geist or similar)
- `ThemeProvider` (next-themes, `class` strategy)
- Header (logo, nav: About, Pricing, Login/Profile, theme toggle)
- `<main>{children}</main>`
- Footer

### Profile layout (`app/profile/layout.tsx`)

- Minimal: optional breadcrumb, max-width content area
- No sidebar. Server component by default; client only where needed (e.g. continue button, theme toggle)

---

## 5. Theme Setup (Tailwind + next-themes)

- **TailwindCSS** only. **darkMode: "class"**.
- **Semantic tokens (no hardcoded colors):**

| Token | Light | Dark (soft) |
|-------|--------|-------------|
| `--bg-primary` | Light bg | `#0f1115` |
| `--bg-secondary` | Slightly darker | `#161a22` |
| `--text-primary` | Dark text | `#e5e7eb` |
| `--text-secondary` | Muted | `#9ca3af` |
| `--border-muted` | Light border | `#2a2f3a` |
| `--accent` | Muted deep blue | Muted deep blue |
| `--danger` | Error/destructive | Same |
| `--success` | Success | Same |

- **next-themes:** `ThemeProvider` from `next-themes`, `attribute="class"`, `defaultTheme`, `storageKey`.
- All UI uses Tailwind classes that map to these CSS variables (e.g. `bg-[var(--bg-primary)]` or theme layer in Tailwind v4).

---

## 6. Auth Strategy

- **Storage:** Access token in **httpOnly cookie** (preferred) or **cookie + localStorage** for middleware + client. Current: cookie (`ielts_habib_token`) + localStorage for client read.
- **Middleware:** Run before protected routes; redirect unauthenticated to `/login`; optionally redirect subscribed users away from `/login` to `/profile/reading`.
- **Redirect unsubscribed:** From protected reading routes, if no active subscription → redirect to `/pricing`.
- **useAuth hook:** Returns `{ user, isLoading, isAuthenticated, logout }`. User can be decoded from token (userId, role).
- **AuthProvider:** Wraps app (client); provides auth state; listens to token/cookie changes if needed.
- **API client:** Axios/fetch wrapper that injects `Authorization: Bearer <token>` from cookie or storage; on 401 clear auth and redirect to login.

---

## 7. Protected Route Middleware

**Logic:**

1. **Public routes:** `/`, `/about`, `/pricing`, `/login`, `/register`, `/verify-otp` — no auth required.
2. **Auth routes:** If token valid and role STUDENT → redirect to `/profile/reading`; ADMIN/INSTRUCTOR → respective area if any.
3. **Protected routes:** `/profile`, `/profile/reading`, `/profile/reading/**` — require token; else redirect to `/login`. Optionally: require active subscription for reading content; else redirect to `/pricing`.
4. **Matcher:** Include `/profile/:path*`, `/login`, `/register`, `/verify-otp`, `/pricing`.

Subscription check can be done in middleware (if backend exposes a lightweight “has access” cookie/header) or in layout/page (call API and redirect if no access).

---

## 8. Component Architecture

### UI components (build first)

| Component | Variants | Notes |
|-----------|----------|--------|
| **Button** | primary, secondary, ghost, danger | Semantic tokens |
| **Card** | default, muted | bg-secondary, border-muted |
| **Badge** | band, status, count | Small labels |
| **ProgressBar** | default, with label | Progress % |
| **LevelCard** | locked, current, completed | Level list item |
| **AttemptTable** | columns: date, type, band, score | Recent attempts |
| **BandIndicator** | number + color band | e.g. 6.5 |
| **ThemeToggle** | icon | Toggle light/dark |
| **Header** | logo, nav, auth + theme | Root only |
| **Footer** | links, copyright | Root only |
| **Skeleton** | line, card, table | Loading |
| **EmptyState** | icon + message + CTA | No data |

- **Server components by default.** Mark `"use client"` only for interactivity (theme, auth state, forms, continue button).
- **No hardcoded colors.** Use semantic tokens / Tailwind theme.

---

## 9. Profile Summary Page Structure

**Consumes:** `GET /api/students/reading/dashboard` (backend: reading dashboard aggregated).

**Display:**

- **Target band** (from profile)
- **Current estimated band**
- **Stability streak** (e.g. “2/3 passes” for level unlock)
- **Current level** (name, stage)
- **Progress %** (steps in level)
- **Continue button** (next step or next test)
- **Weakness snapshot** (e.g. question types with lowest accuracy)
- **Recent attempts** (table: date, type, band, score)

**Data shape (align with backend):**

- `targetBand`, `currentEstimatedBand`, `currentLevel`, `streakInfo`, `weaknesses`, `recentAttempts`, `performanceTrend`
- Optional: `performanceTrend` for simple “improving / stable / declining” UX.

**Page:** Server component that fetches dashboard (or passes to client section). Client: “Continue” button, theme toggle. Use Suspense + Skeleton for loading; EmptyState if no attempts yet.

---

## 10. Reading Flow Structure

**Flow:** Profile → Level → Step → Practice/Test → Submit → Result → Back to Profile.

- **Profile/reading:** Summary + “Continue” → level or step.
- **Level [levelId]:** List steps; show locked state if no access (band/step order).
- **Practice [stepId]:** Practice UI; respect content lock; show subscription warning if expired.
- **Test [testId]:** Full/passage test; submit → result page → back to profile.

**Content lock:** Backend enforces; frontend shows locked state and “Unlock at band X” (or similar) when API returns 403 or locked payload. Subscription: if 403 “no subscription”, show banner + redirect to `/pricing`.

---

## 11. API Integration Layer

- **Single client:** `src/lib/api/client.ts` — Axios instance or fetch wrapper; base URL from `NEXT_PUBLIC_API_BASE_URL`; inject `Authorization: Bearer <token>`; on 401 clear auth and redirect to login.
- **Domain modules:** e.g. `src/lib/api/profile.ts` — `getProfileSummary()`, `getLevels()`, `getStep()`, etc. All use the shared client.
- **Types:** `src/lib/api/types.ts` — interfaces for profile summary, level, step, attempt, subscription (align with backend DTOs).
- **Errors:** Map backend error shape (e.g. `message`) to UI (toast or inline). No hardcoded strings in components; centralise messages if needed.

---

## 12. Best Practices for Scaling

- **Server components first** — fetch in server components; pass data to client components as props.
- **Minimal client state** — avoid global state for data that can be fetched; use server state + refetch or router refresh.
- **Suspense** — wrap async sections in `<Suspense fallback={<Skeleton />}>`.
- **Fonts** — optimize with `next/font` (already Geist).
- **Few dependencies** — add only what’s needed (e.g. next-themes, axios already present).
- **Semantic tokens** — all new UI uses design tokens; no one-off hex in components.
- **TypeScript only** — strict types for API and props.
- **Responsiveness** — mobile: practice, passages, test attempt work; primary optimization desktop/laptop. Use responsive Tailwind (e.g. `max-w-[900px]` for readable content).

---

## 13. Design System Summary

| Decision | Value |
|----------|--------|
| Spacing scale | 8px |
| Max width (app) | 1200px |
| Readable content width | 800–900px |
| Border radius | 12px |
| Shadow | Subtle |
| Animation | Minimal (e.g. transition-colors 150ms) |
| Dark mode | Soft dark (#0f1115, #161a22, #2a2f3a, #e5e7eb, #9ca3af) |
| Accent | Muted deep blue |

---

## 14. Backend API Endpoints (Reference)

| Frontend use | Backend endpoint |
|--------------|------------------|
| Profile summary (reading) | `GET /api/students/reading/dashboard` |
| Levels | `GET /api/levels` |
| Level steps / content | Per level/step APIs |
| Test attempt submit | `POST /api/test-attempts` (reading) |
| Subscription status | From profile or dedicated subscription endpoint |
| Auth | `POST /api/auth/login`, register, verify-otp |

All authenticated requests send `Authorization: Bearer <access_token>`.
