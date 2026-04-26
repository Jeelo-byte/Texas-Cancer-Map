# Technology Stack

**Analysis Date:** 2026-04-26

## Languages

**Primary:**
- TypeScript 5.5 - All application code
- TSX - React components

**Secondary:**
- JavaScript (ES Modules) - Build scripts (`import_data.mjs`), configuration files

## Runtime

**Environment:**
- Browser - Client-side execution
- Node.js 22.x - Build time and scripts

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3 - UI library
- Vite 5.4 - Build tool and dev server
- Tailwind CSS 3.4 - Styling engine

**Testing:**
- None - No automated test framework detected

**Build/Dev:**
- Vite 5.4 - Bundling and HMR
- TypeScript 5.5 - Type checking
- PostCSS 8.4 - CSS transformations

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.50.4 - Backend-as-a-Service (DB, Auth)
- `leaflet` 1.9.4 & `react-leaflet` 4.2.1 - Interactive mapping
- `@tanstack/react-query` 5.56.2 - Data fetching and state management
- `react-router-dom` 6.26.2 - Client-side routing
- `zod` 3.23.8 - Schema validation

**UI Components:**
- Radix UI (various packages) - Headless UI primitives
- Shadcn/UI (via `class-variance-authority`, `tailwind-merge`) - Styled components
- `lucide-react` 0.462.0 - Icon set
- `recharts` 2.12.7 - Data visualization

## Configuration

**Environment:**
- No `.env` files detected in workspace (hardcoded in `src/lib/supabaseClient.ts`)
- Key configs: `DATABASE_URL` (implied), `SUPABASE_URL`, `SUPABASE_ANON_KEY`

**Build:**
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` & `tsconfig.app.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind theme and plugins
- `postcss.config.js` - PostCSS configuration

## Platform Requirements

**Development:**
- Windows (Current environment)
- Node.js & npm required

**Production:**
- Static site hosting (Vercel/Netlify/GitHub Pages)
- External Supabase project required

---

*Stack analysis: 2026-04-26*
*Update after major dependency changes*
