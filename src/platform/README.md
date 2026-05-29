# Platform modules

Domain-aligned with `erp-backend` `platform/` package.

Each feature folder follows Printila-style vertical slices:

```
platform/<feature>/
  api/           # TanStack Query hooks (call data/repositories)
  components/    # Page and feature UI
  schemas/       # Zod form validation
  index.ts       # Public barrel exports
```

| Folder | Backend area |
|--------|----------------|
| `tenants/` | Tenant lifecycle, health, modules |
| `subscriptions/` | Plans, billing, entitlements |
| `moduleaccess/` | Navigation registry, entitlements, workspace nav hook |
| `superadmin/` | Cross-tenant operations |
| `provisioning/` | Tenant setup wizard |
| `plans/` | Public and admin plan catalog |
| `home/` | Workspace dashboard |

Module metadata lives in `moduleaccess/config/module-registry.ts` and merges with server `/v1/me/navigation`.
