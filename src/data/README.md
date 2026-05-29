# Data layer

Printila-inspired clean architecture slice, adapted for ERP:

```
data/
  datasources/remote/   # HTTP calls + raw response parsing
  repositories/         # Stable facades consumed by TanStack Query hooks
```

Feature hooks in `platform/*/api/` and `modules/*/api/` call repositories — never `apiFetch` directly.
