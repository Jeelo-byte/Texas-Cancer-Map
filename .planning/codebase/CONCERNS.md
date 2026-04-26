# Codebase Concerns

**Analysis Date:** 2026-04-26

## Tech Debt

**Monolithic Components:**
- Issue: `TexasMap.tsx` (18kB) and `AdminDashboard.tsx` (37kB) are very large and handle too many responsibilities.
- Files: `src/components/TexasMap.tsx`, `src/pages/AdminDashboard.tsx`
- Impact: High complexity makes maintenance difficult and increases the risk of regression.
- Fix approach: Refactor `TexasMap.tsx` into smaller sub-components (MapLayers, Controls, Legend). Break `AdminDashboard.tsx` into smaller domain-specific sections.

**Inlined Data Fetching:**
- Issue: CRUD components handle data fetching and state management directly.
- Files: `src/components/CancerCrud.tsx`, `src/components/CarcinogenCrud.tsx`
- Impact: Logic is not reusable and makes testing harder.
- Fix approach: Extract data fetching into custom hooks (e.g., `useCancers`, `useCarcinogens`).

## Known Bugs

- None identified during initial mapping.

## Security Considerations

**Hardcoded Credentials:**
- Risk: Supabase URL and Anon Key are hardcoded in the source code.
- File: `src/lib/supabaseClient.ts`
- Current mitigation: None.
- Recommendations: Move credentials to `.env` files and access them via `import.meta.env.VITE_...`.

**Client-Side Admin Checks:**
- Risk: Admin access is managed primarily in the client.
- File: `src/pages/AdminDashboard.tsx`
- Current mitigation: Basic check in component logic.
- Recommendations: Ensure Supabase Row Level Security (RLS) policies are correctly configured to prevent unauthorized data access regardless of the UI state.

## Performance Bottlenecks

**Large Component Re-renders:**
- Problem: Large components like `TexasMap.tsx` may suffer from performance issues during state updates.
- Cause: Complex state management for map interactions and overlays.
- Improvement path: Optimize with `React.memo`, `useMemo`, and by breaking down into smaller components.

## Fragile Areas

**Map Interaction Logic:**
- Why fragile: Tightly coupled with Leaflet and React Leaflet lifecycle.
- File: `src/components/TexasMap.tsx`
- Safe modification: Use caution when updating Leaflet dependencies or changing map event handlers.

## Scaling Limits

**Client-Side Data Processing:**
- Current capacity: Efficient for Texas county-level data (254 counties).
- Limit: Performance may degrade if hundreds of thousands of individual data points are rendered directly on the client map.
- Scaling path: Implement server-side aggregation or use tiled geographic data if data volume increases significantly.

## Test Coverage Gaps

**Zero Automated Tests:**
- What's not tested: Entire codebase.
- Risk: Critical path failures (Auth, Data Import, CRUD) will only be discovered during manual use.
- Priority: High.

---

*Concerns audit: 2026-04-26*
*Update as issues are fixed or new ones discovered*
