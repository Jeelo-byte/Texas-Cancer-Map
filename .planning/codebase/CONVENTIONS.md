# Coding Conventions

**Analysis Date:** 2026-04-26

## Naming Patterns

**Files:**
- `PascalCase.tsx` for React components (`TexasMap.tsx`)
- `camelCase.ts` or `kebab-case.ts` for hooks and utilities (`useAuth.tsx`, `use-toast.ts`)
- `camelCase.ts` for library clients (`supabaseClient.ts`)

**Functions:**
- `camelCase` for all functions
- `PascalCase` for React component definitions
- `useHookName` for custom hooks

**Variables:**
- `camelCase` for local variables and properties
- `UPPER_SNAKE_CASE` for constants (e.g., in configuration files)

**Types:**
- `PascalCase` for interfaces and type aliases
- No specific prefix (like `I`) for interfaces

## Code Style

**Formatting:**
- Indentation: 2 spaces
- Semicolons: Required
- Quotes: Double quotes preferred (matching Vite/Prettier defaults)
- Line length: Standard (around 80-100 characters)

**Linting:**
- Tool: ESLint with `typescript-eslint`
- Config: `eslint.config.js`
- Style: Recommended TypeScript and React Hook rules

## Import Organization

**Order:**
1. React and core hooks
2. External packages (`@supabase/supabase-js`, `lucide-react`, etc.)
3. Internal path-aliased modules (`@/components`, `@/hooks`, `@/lib`)
4. Relative imports (`./types`, `../utils`)

**Grouping:**
- Blank line between groups (usually enforced by IDE or Prettier)

**Path Aliases:**
- `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)

## Error Handling

**Patterns:**
- Try/catch blocks in asynchronous event handlers
- `use-toast.ts` for displaying errors to the user
- Guard clauses to return early on invalid state

## Logging

**Framework:**
- `console.log` / `console.error` for development debugging
- No dedicated logging library detected

## Comments

**Usage:**
- Minimal commenting in existing code
- JSDoc-style comments for complex logic or external client setup (e.g., `supabaseClient.ts`)

## Function Design

**React Components:**
- Functional components with arrow function syntax
- Named exports
- Destructuring props directly in the parameter list

## Module Design

**Exports:**
- Named exports for utilities, hooks, and components
- Default exports only for Vite configurations or specific entry points if required by frameworks

---

*Convention analysis: 2026-04-26*
*Update when patterns change*
