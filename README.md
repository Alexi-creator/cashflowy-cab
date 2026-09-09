# 🍋 LimeBalance

**LimeBalance** is a personal finance web app — your money in one clean dashboard. Track income and expenses, organize them into categories, set savings goals, follow your investment portfolio, and read it all back as charts and analytics.

This repository contains the **frontend** (the user cabinet). It talks to a separate backend over `/api`.

---

## ✨ Features

- **Dashboard** — balance overview, recent transactions, cashflow chart, goals and portfolio snippets.
- **Transactions** — add, edit and browse incomes & expenses in a sortable, paginated table.
- **Categories** — organize transactions with custom categories.
- **Analytics** — visual breakdowns of where your money goes and comes from.
- **Goals** — set and track savings targets.
- **Investments** — keep an eye on your asset portfolio.
- **Auth** — sign in with **Telegram** or **Google OAuth**, with protected/guest routing.
- **Light & dark theme** with a one-click toggle.
- **35 languages** out of the box (English, Russian, German, Spanish, French, Chinese, Japanese… ), with localized dates.

---

## 🛠 Tech Stack

| Area | Tooling |
|------|---------|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite](https://vitejs.dev/) |
| UI | [Mantine v9](https://mantine.dev/) + [Tabler Icons](https://tabler.io/icons) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| Forms & validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Routing | [React Router](https://reactrouter.com/) |
| i18n | [i18next](https://www.i18next.com/) / react-i18next |
| Dates | [Day.js](https://day.js.org/) + [date-fns](https://date-fns.org/) |
| Linting/format | [Biome](https://biomejs.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+** and npm
- A running instance of the LimeBalance **backend** (defaults to `http://localhost:3000`)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API endpoint. Use `/api` (Vite proxies it to the backend in dev). |
| `VITE_TELEGRAM_BOT_USERNAME` | Telegram bot username (without `@`) for the login widget. |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID. |

### 3. Run the dev server

```bash
npm run dev
```

The app starts on **http://localhost:5173**. In dev, requests to `/api` are proxied to the backend (`http://localhost:3000` by default — see [vite.config.ts](vite.config.ts)).

---

## 📦 Available Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Type-check and build the production bundle to `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Lint the project with Biome. |
| `npm run format` | Auto-format the codebase with Biome. |
| `npm run ngrok` | Expose the dev server via ngrok (handy for testing Telegram auth). |
| `npm run test:e2e` | Run the Playwright end-to-end tests. |
| `npm run test:e2e:ui` | Run the E2E tests in interactive UI mode. |

---

## 🧪 Testing

End-to-end tests are written with [Playwright](https://playwright.dev/) and live in [e2e/](e2e/). They run the real app in a browser **without a backend** — every `/api/**` request is mocked at the network layer (reusing the app's own stub data), so the suite is fast and deterministic.

```bash
npx playwright install chromium   # one-time: download the browser
npm run test:e2e                  # run the suite (auto-starts the dev server)
```

See [e2e/README.md](e2e/README.md) for how the mocking and fixtures work.

---

## 🐳 Docker

**Local development** (frontend in a container, backend on your host):

```bash
docker compose up
```

This runs the `dev` stage, mounts your source for hot reload, and proxies `/api` to `host.docker.internal:3000`.

**Production** — the multi-stage [Dockerfile](Dockerfile) builds the static SPA and serves it with **nginx**. Runtime env variables are injected at container start via [deploy/40-env-config.sh](deploy/40-env-config.sh), so the same image can be deployed to multiple environments.

```bash
docker build --target production -t limebalance-cab .
```

---

## 🌍 Internationalization

All translations live in [src/shared/i18n/locales/](src/shared/i18n/locales/). To add a new language, register it with a single line in `src/shared/i18n/languages.ts` (translation file + Day.js locale + date-fns locale) — everything else (language switcher, date formatting) wires up automatically.

---

## 📁 Project Structure

Four layers, one direction of dependency: **app → pages → modules → shared**.
One alias, `@/*` → `src/*`, so the layer is visible in every import.

```
src/
├── app/        # Composition root: entry point, routing, layout, cross-module modals
├── pages/      # Route-level screens — compose one or more modules
├── modules/    # Feature modules (slices) — each owns its data end to end
└── shared/     # Domain-free: request layer, config, ui primitives, stores, i18n, helpers
```

Modules: `analytics`, `auth`, `categories`, `dashboard`, `goals`, `investments`,
`notifications`, `settings`, `subscription`, `transactions`.

### Segments

A module holds only the segments it needs, each one a folder, named by purpose:

| segment | what goes in |
|---|---|
| `model/` | zod schemas and domain types |
| `config/` | concrete values — periods, palettes, page sizes |
| `api/` | `requests.ts` (HTTP) and `queries.ts` (react-query keys, stale times) |
| `ui/` | components |
| `hooks/` | React state and queries |
| `lib/` | pure functions — no React |

`model` vs `config` is the same split throughout the project: **`model` is types, `config`
is values**. `hooks` vs `lib` is the same idea one level down: the first is tied to React and
only works inside components, the second can be called from anywhere.

A hook or helper used by a single component lives next to that component, not in the module's
segment — grouping by purpose and grouping by block are two different axes.

### `api/` — every request in one place

Components never call `useQuery`/`useMutation` themselves. A module's `api/` segment holds three
kinds of file, told apart by name:

| file | what it is |
|---|---|
| `requests.ts` | plain HTTP functions — no React |
| `queries.ts` | react-query keys and stale times |
| `use*.ts` | one hook per operation: the request, its cache keys and its invalidation |

The split inside a hook is the same everywhere: **the hook owns the network and the cache, the
caller owns the UI.** Cache invalidation, optimistic updates and store writes live in the hook;
notifications, closing a modal and resetting form fields stay in the component and reach the
hook through optional `onSuccess`/`onError` options.

```ts
const mutation = useDeleteCategory({
  isExpense,
  categoryId: category.id,
  onSuccess: () => {
    notifications.show({ color: "green", message: t("categories.delete_success") })
    close()
  },
})
```

Where several mutations invalidate the same set, that set is a hook of its own —
`useInvalidateGoalData`, `useInvalidateTransactionData` — so the rule lives in one place instead
of being repeated in every caller.

### Public entry

Types and schemas come from the module barrel; components come from the `ui` segment index,
never by a path inside it:

```ts
import type { Goal } from "@/modules/goals"
import { GoalForm, GoalsSnippet } from "@/modules/goals/ui"
```

The barrel deliberately does not re-export components: `app/routesConfig` imports route guards
eagerly, and a barrel carrying the whole module would drag it into the entry chunk.

Every other segment is taken by an explicit path to the file:

```ts
import { goalKeys, GOALS_STALE_TIME } from "@/modules/goals/api/queries"
import { useGoalsTour } from "@/modules/goals/hooks/useGoalsTour"
```

Inside its own slice a module uses relative paths, so it can be renamed or moved without
touching its own files:

```ts
// modules/transactions/ui/TransactionsTable/index.tsx
import { PAGE_SIZE_OPTIONS } from "../../config"
import type { Transaction } from "../../model"
```

The boundary is visible in the import itself: `@/` means someone else's slice, so only through
its public entry; `./` and `../` mean your own, so you may go deep.

### Boundary rules

1. Imports only go **down** the layer list. `shared` knows nothing above it — where the
   dependency would have to point the wrong way it is inverted, see
   [src/shared/api/session.ts](src/shared/api/session.ts).
2. A relative path never leaves its layer.
3. A relative path never leaves into a neighbouring module slice.
4. A slice is not reached through the alias from inside itself.
5. The `ui` segment is imported only through its index.

Rules 1 and 5 are checked by Biome (so they surface in the editor); rules 2–4 need to know
where a path actually leads, which Biome's glob matching cannot do, so they live in
[scripts/check-boundaries.mjs](scripts/check-boundaries.mjs). Both run on `npm run lint`, and a
new module falls under all of them without any config change.

> **`sideEffects` in package.json is load-bearing.** The router imports route guards through
> `@/modules/<name>/ui` eagerly. Without the `sideEffects` declaration the bundler cannot drop
> the unused re-exports, so whole modules land in the entry chunk — measured at +16.7 kB gzip
> on first paint, with `InvestmentsPage` collapsing from 54 kB to a 3.6 kB stub. Keep the list
> accurate when adding a file that is imported purely for its side effects.
