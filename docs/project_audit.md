Project Audit — AvicolaFront
===========================

Date: 2025-11-23

Summary
-------
This document summarizes an automated + manual scan of the workspace for: hardcoded/test data, TODO/FIXME markers, console/debug prints, TypeScript errors, OpenAPI/drf-spectacular issues and other maintainability or security concerns. It proposes a prioritized route to fix issues so the frontend reflects the backend and test DB reliably.

Scope
-----
- Backend: `BACK/backend` (Django + DRF + drf-spectacular)
- Frontend: root (Next.js + TypeScript)
- Focus: hardcoded data, contract mismatches, missing implementations, TypeScript errors, schema warnings, infra issues.

Findings (by area)
-------------------

1) Frontend — hardcoded / placeholder data
- `components/charts/mortality-chart.tsx`: contains a fallback static dataset (array of weekly samples). This is visible in UI if backend returns missing/invalid data. Keep as temporary fallback but mark for removal in production.
- `lib/config/api.config.ts`: `baseURL` fallback uses `http://127.0.0.1:8000/api` when `NEXT_PUBLIC_API_URL` is not set. OK for dev but should be documented and overridable for staging/CI.
- `next.config.mjs`: includes a rewrite/destination pointing to `'http://localhost:8000/api/:path*'`. This will hard-route requests in dev and can leak when misunderstood.
- Placeholders across UI: many inputs use placeholder values (e.g., `prediction-form.tsx` placeholders, `role-selector.tsx`, `farm-selector.tsx` default placeholders). Placeholders are fine for UX but any real data should come from API.

2) Frontend — TypeScript and missing imports
- `npx tsc --noEmit` reported multiple errors blocking a clean typecheck:
  - `app/inventario/page.tsx`: `<StockAlerts />` used without required props `alerts` and `onCreateOrder`.
  - `components/cameras/video-player.tsx`: missing import `@/components/ui/slider` (module not found).
  - `components/date-picker-range.tsx`: missing `@/components/ui/calendar` and `@/components/ui/popover`.
These prevent CI from running a clean `tsc` check and likely cause runtime breakage if these components are used.

3) Frontend — debug prints
- `lib/services/email.service.tsx` contains `console.log` statements printing email content. Remove or guard in non-dev environments to avoid leaking data in logs.

4) Backend — schema, docs and warnings
- drf-spectacular/OpenAPI: previous runs produced warnings (was ~14 warnings after some fixes). I added targeted `@extend_schema_field` and explicit field types in several serializers, but a final `--fail-on-warn` run should be performed to capture remaining warnings. These usually correspond to `SerializerMethodField` or `ReadOnlyField` without explicit type.
- `apps/flocks` has sample/default fields like `sample_size = PositiveIntegerField(default=10)` — not an error but review if used only in dev.

5) Backend — DB in repo
- `BACK/backend/avicolatrack/db.sqlite3` exists (file tracked). Shipping a DB file in repo can leak test data and cause confusion. Prefer migrations + seed scripts or fixtures and exclude DB file from VCS. If it's intentionally included as test data, document it clearly.

6) Tests & infra
- Tests run and passed in the environment, and a new pytest checks `docs/openapi_schema.yml` contains the mortality-stats path.
- `pytest` was not in PATH in a previous shell, but tests ran successfully using the project's virtualenv python `.venv\Scripts\python -m pytest -q`.

7) Other maintainability points
- Several UI components and serializers have `read_only` fields and `SerializerMethodField`s; ensure these are typed for the OpenAPI generator to avoid type defaults to string.
- Search results found console logs and other dev artifacts that should be cleaned prior to production releases.

Concrete recommended remediation plan (prioritized)
-------------------------------------------------

Phase 1 — High priority (stability & contract)
- 1.1 Run `python manage.py spectacular --fail-on-warn` in a reproducible environment (the backend venv). Capture all warnings and add `@extend_schema_field(OpenApiTypes.*)` or concrete serializer fields where needed. Files to inspect first:
    - `apps/inventory/serializers.py` (FoodBatchSerializer: `is_depleted`, `consumption_rate`)
    - `apps/farms/serializers.py` (ShedSerializer: `current_occupancy`, `occupancy_percentage`)
    - `apps/reports/serializers.py` (ReportSerializer: `duration_days` — already typed in this codebase)
    - Any other serializer referencing `SerializerMethodField` or `ReadOnlyField`.
- 1.2 Regenerate `docs/openapi_schema.yml` and confirm zero warnings.
- 1.3 Add CI gate: a job that runs spectacular with `--fail-on-warn` so PRs can't introduce undocumented changes.

Phase 2 — Frontend type correctness & real-data wiring
- 2.1 Fix TypeScript errors uncovered by `npx tsc --noEmit`:
    - `app/inventario/page.tsx`: supply required props to `StockAlerts` or change component to accept optional props.
    - Add or correct missing UI component modules `@/components/ui/slider`, `calendar`, `popover` (either implement stubs or correct import paths).
    - Re-run `npx tsc --noEmit` until green.
- 2.2 Replace UI fallback hard-coded datasets with explicit UX states:
    - Keep a lightweight fallback message (e.g., `No data`) instead of sample arrays.
    - Ensure components show loading/error states when backend returns empty or error responses.
- 2.3 Generate strong typed API client for frontend (optional but recommended):
    - Use `openapi-typescript` or similar to generate TypeScript types/clients from `docs/openapi_schema.yml`.
    - Integrate generated types into `lib/api` so `httpClient` calls are typed (eliminate `any`).

Phase 3 — Data & deployment hygiene
- 3.1 Remove or document `db.sqlite3` in repo:
    - Preferred: add `db.sqlite3` to `.gitignore`, remove from repo, and create a `scripts/seed_dev_db.py` or Django fixtures (`fixtures/dev/*.json`) to populate sample data for local development.
    - If it's required as a canonical test DB, move it to `BACK/backend/docs/sample_db/` and clearly document its purpose.
- 3.2 Remove `console.log` debug prints (email service and any other places) or guard with `if (process.env.NODE_ENV === 'development')`.

Phase 4 — CI, tests & contract enforcement
- 4.1 Add CI steps (GitHub Actions or similar):
    - `pnpm` / `npm ci` install
    - `npx tsc --noEmit`
    - `python -m pip install -r BACK/backend/requirements.txt` and `.venv` setup (or use the project's environment)
    - `python manage.py spectacular --fail-on-warn`
    - `python -m pytest -q`
- 4.2 Add an end-to-end smoke test (Playwright or Cypress) that starts the frontend and backend in CI and validates essential flows: auth, farm selector, mortality chart fetch.

Phase 5 — UX polish
- 5.1 Replace placeholders with live-synced data where possible.
- 5.2 Improve error feedback and empty states across the app.

Suggested immediate next steps (I can do these now)
------------------------------------------------
1) Run `python manage.py spectacular --fail-on-warn -v 3` and collect remaining warnings. I can patch the top 6 serializers immediately.
2) Fix the TypeScript blocking errors: add a small stub for missing UI modules and/or fix `StockAlerts` usage so `npx tsc --noEmit` clears.
3) Remove or guard `console.log` in `lib/services/email.service.tsx`.
4) Add CI job snippets for spectacular + tsc + pytest.

Deliverables I will produce if you say "Go":
- Patch files that add `@extend_schema_field` annotations and explicit serializer fields for the identified warnings.
- Patch files to fix the TypeScript errors (stubs or correct props) and re-run `npx tsc --noEmit` until it is green.
- `docs/project_audit.md` (this file) and an updated `TODO` list with concrete tasks.
- Optional: CI workflow YAML that runs the checks mentioned above.

---
If you want me to start, tell me which of the suggested immediate next steps to run now (I recommend starting with Phase 1: run spectacular with `--fail-on-warn` and I will fix the top serializer warnings). If you prefer, I can begin by fixing the TypeScript errors so the frontend builds cleanly.
