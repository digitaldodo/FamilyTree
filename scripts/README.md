These scripts were legacy one-off fix scripts discovered in the repository root.

Goal: Consolidate behavior into service-layer tests and Prisma migrations.

Files in this folder:
- fix-db.ts — one-off DB cleanup (move to a prisma migration if required)
- fix_engine.js — attempted replacement for parts of genealogy-engine (archive only)
- fix_json.js — code-mod to safely parse JSON (prefer using src/lib/fetcher.ts)
- fix_api_json.js — code-mod to make API endpoints return structured errors
- fix_frontend.mjs — frontend code-mod archival

Recommended next steps:
1. Add a Prisma migration for structural DB fixes (indexes, constraints, columns) instead of running raw SQL mutations.
2. Convert any automated code-mods into unit/integration tests that assert correct behavior, and keep codemods in a separate tools/ or scripts/ folder for maintenance.
3. Remove root-level ad-hoc scripts and rely on scripts/* only for documented maintenance tasks.

Use src/lib/fetcher.ts for uniform API fetch and JSON parsing.
