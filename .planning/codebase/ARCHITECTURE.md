# Architecture

**Analysis Date:** 2026-04-26

## Pattern Overview

**Overall:** React Single Page Application (SPA) with Serverless Backend (Supabase)

**Key Characteristics:**
- Component-based UI with React
- Client-side routing with React Router
- Backend-as-a-Service (BaaS) integration with Supabase
- Map-centric data visualization with Leaflet
- Atomic UI design using Shadcn UI

## Layers

**Page Layer:**
- Purpose: Top-level route components and layout assembly
- Contains: Route handlers, page-specific layout, high-level data orchestration
- Location: `src/pages/*.tsx`
- Depends on: Component layer, hooks, lib

**Component Layer:**
- Purpose: Reusable UI blocks and domain-specific widgets
- Contains: `TexasMap.tsx`, `Header.tsx`, CRUD components
- Location: `src/components/*.tsx`
- Depends on: UI components, lib, hooks

**UI Layer (Shadcn):**
- Purpose: Design system primitives
- Contains: Buttons, cards, dialogs, inputs
- Location: `src/components/ui/*.tsx`
- Depends on: External headless libraries (Radix UI)

**Service/Lib Layer:**
- Purpose: External client initialization and shared utilities
- Contains: `supabaseClient.ts`, `utils.ts`
- Location: `src/lib/*.ts`

**Hook Layer:**
- Purpose: Shared stateful logic and data fetching
- Contains: `useAuth.tsx`, `use-toast.ts`, TanStack Query hooks
- Location: `src/hooks/*.tsx`

## Data Flow

**Map Visualization Flow:**
1. User interacts with `TexasMap.tsx`
2. Component fetches data from Supabase via TanStack Query hooks
3. Data is processed and rendered as Leaflet layers
4. Selecting a county updates `CountyDetailPanel.tsx` via state/props

**Admin CRUD Flow:**
1. Admin logs in via `Login.tsx`
2. `AdminDashboard.tsx` fetches lists (cancers, carcinogens)
3. User interacts with `CancerCrud.tsx` or `CarcinogenCrud.tsx`
4. Requests are sent to Supabase via `supabaseClient.ts`
5. UI updates on success/failure using `use-toast.ts`

**State Management:**
- Server state: Managed by TanStack Query
- Local UI state: Managed by React `useState` and `useContext`
- Auth state: Managed by Supabase Auth and `useAuth.tsx`

## Key Abstractions

**Supabase Client:**
- Purpose: Unified entry point for DB and Auth
- File: `src/lib/supabaseClient.ts`
- Pattern: Singleton client instance

**Custom Hooks:**
- Purpose: Encapsulate complex logic (Auth, UI utilities)
- Location: `src/hooks/*.tsx`
- Examples: `useAuth`, `useMobile`

**UI Components:**
- Purpose: Consistent design language
- Location: `src/components/ui/`
- Pattern: Composition of Radix UI primitives with Tailwind styling

## Entry Points

**Main Entry:**
- Location: `src/main.tsx`
- Responsibilities: Render `App.tsx` into the DOM, provide global contexts

**Application Root:**
- Location: `src/App.tsx`
- Responsibilities: Configure routing, providers (QueryClient, Toaster)

## Error Handling

**Strategy:** 
- UI-level error reporting via toasts
- Fallback UI for non-existent routes (`NotFound.tsx`)

**Patterns:**
- Try/catch in async handlers within components
- TanStack Query `onError` callbacks for data fetching errors

## Cross-Cutting Concerns

**Authentication:**
- Approach: Supabase Auth with `useAuth` hook and `Login.tsx` page

**Styling:**
- Approach: Utility-first CSS with Tailwind, theming with `next-themes`

**Data Validation:**
- Approach: Zod schemas for form validation and API response typing

---

*Architecture analysis: 2026-04-26*
*Update when major patterns change*
