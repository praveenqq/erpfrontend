# ERP Frontend

Next.js frontend for the multi-tenant ERP platform. Mirrors backend domain boundaries (`platform/`, `modules/`, `security/`, `tenancy/`, `common/`).

## Stack

- **Framework:** React 19, Next.js 16 (App Router), TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui patterns, Radix UI primitives
- **Data:** TanStack Query, OpenAPI-generated client (`@hey-api/openapi-ts`)
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Charts:** Recharts + ECharts
- **Auth:** Keycloak OIDC (`keycloak-js`)
- **Testing:** Vitest, React Testing Library, Playwright
- **Deploy:** Docker (standalone Next.js) + Nginx, or Vercel

## Project structure

```
src/
  app/                 # Thin routes — delegate to platform/modules components
  common/              # Shared UI, navigation, config, types
  domain/models/       # Domain entities + parse* mappers
  data/                # Remote datasources + repositories
  lib/                 # API client, query setup, generated OpenAPI
  platform/            # Platform domains (tenants, superadmin, moduleaccess, …)
  modules/             # Business modules (expenses, …)
  security/            # Keycloak auth, guards
  tenancy/             # Tenant context & headers
openapi/               # OpenAPI spec (sync with backend)
```

Printila-inspired additions: repository layer, `ROUTES`/`API_ENDPOINTS` constants, module registry + page metadata, workspace shell with descriptive sidebar, feature barrel exports. ERP patterns retained: server-driven navigation, tenant/role guards, TanStack Query, OpenAPI codegen.

## Getting started

```bash
cp .env.example .env.local
npm install
npm run codegen   # generate src/lib/api/generated
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Configure Keycloak realm/client to match `.env.local`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Codegen + production build |
| `npm run codegen` | Regenerate API client from `openapi/openapi.yaml` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |

## Docker

```bash
docker compose up --build
```

Nginx serves the app on port 80 and proxies `/api/` to the backend.

## Vercel

Connect the repo and set environment variables from `.env.example`. `vercel.json` is included.

## API contract

Update `openapi/openapi.yaml` when backend controllers change, then run `npm run codegen`. The hand-written `apiFetch` wrapper in `src/lib/api/client.ts` attaches Bearer tokens and tenant headers for all feature modules.
