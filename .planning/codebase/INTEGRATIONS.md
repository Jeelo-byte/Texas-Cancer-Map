# External Integrations

**Analysis Date:** 2026-04-26

## APIs & External Services

**Mapping & GIS:**
- Leaflet / OpenStreetMap - Interactive map tiles and geographic data visualization
  - SDK/Client: `leaflet`, `react-leaflet`
  - Integration method: Client-side rendering of GeoJSON and map tiles

**Database & Backend:**
- Supabase - Primary data store and backend logic
  - Client: `@supabase/supabase-js`
  - Connection: Hardcoded in `src/lib/supabaseClient.ts`
  - Usage: Cancers, carcinogens, and county data

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Relational data storage
  - Integration: `supabaseClient.ts`
  - Tables: `cancers`, `carcinogens`, `counties` (inferred from CRUD components)

**File Storage:**
- None detected (potential for Supabase Storage usage in future)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - User authentication for admin access
  - Implementation: `src/hooks/useAuth.tsx`
  - Integration: Supabase client SDK
  - Pages: `src/pages/Login.tsx`

## Monitoring & Observability

**Error Tracking:**
- None detected

**Analytics:**
- None detected

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured in codebase (Vite-based static site)

**CI Pipeline:**
- None detected

## Environment Configuration

**Development:**
- Required credentials: Supabase URL and Anon Key
- Configuration: Currently hardcoded in `src/lib/supabaseClient.ts`

**Production:**
- Not documented (assumed to use same hardcoded credentials or environment variables in build process)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2026-04-26*
*Update when adding/removing external services*
