# Codebase Structure

**Analysis Date:** 2026-04-26

## Directory Layout

```
Texas-Cancer-Map/
├── public/             # Static assets (images, icons)
├── src/                # Application source code
│   ├── components/     # UI components
│   │   └── ui/         # Shadcn/UI primitives
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and clients
│   ├── pages/          # Page-level components
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── .planning/          # GSD project documentation
│   └── codebase/       # Codebase mapping (Current location)
├── index.html          # HTML template
├── package.json        # Project manifest
└── vite.config.ts      # Vite configuration
```

## Directory Purposes

**src/components/**
- Purpose: Reusable application components
- Contains: `TexasMap.tsx`, `Header.tsx`, CRUD components
- Key files: `TexasMap.tsx` (Map integration), `CancerCrud.tsx` (Data management)

**src/components/ui/**
- Purpose: Design system primitives (Shadcn UI)
- Contains: Atomic components like `button.tsx`, `dialog.tsx`, `input.tsx`

**src/pages/**
- Purpose: Main application views/routes
- Contains: `Index.tsx` (Public map view), `AdminDashboard.tsx` (Data management)
- Key files: `AdminDashboard.tsx` (Protected admin area)

**src/hooks/**
- Purpose: Encapsulated logic and stateful utilities
- Contains: `useAuth.tsx` (Auth logic), `use-toast.ts` (Notification state)

**src/lib/**
- Purpose: Third-party client initialization and core utilities
- Contains: `supabaseClient.ts`, `utils.ts` (Tailwind merging)

**src/types/**
- Purpose: Shared TypeScript definitions
- Key files: `carcinogen.ts`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React mounting point
- `src/App.tsx`: Routing and provider setup

**Configuration:**
- `vite.config.ts`: Vite build and dev settings
- `tailwind.config.ts`: Tailwind CSS theme configuration
- `tsconfig.json`: TypeScript compiler settings

**Core Logic:**
- `src/lib/supabaseClient.ts`: Database and Auth client
- `src/hooks/useAuth.tsx`: Authentication state management

## Naming Conventions

**Files:**
- `PascalCase.tsx`: React components (`TexasMap.tsx`, `Button.tsx`)
- `camelCase.ts`: Utilities and hooks (`useAuth.tsx`, `utils.ts`)
- `kebab-case.ts`: Configuration and some hooks (`use-toast.ts`)

**Directories:**
- `kebab-case`: All directories (`src`, `components/ui`)

## Where to Add New Code

**New Feature/Page:**
- Primary code: `src/pages/`
- Components: `src/components/`

**New UI Primitive:**
- Implementation: `src/components/ui/` (usually via `npx shadcn-ui@latest add [component]`)

**New Shared Logic:**
- Implementation: `src/hooks/` or `src/lib/`

**New Types:**
- Implementation: `src/types/`

## Special Directories

**node_modules/**
- Purpose: External dependencies
- Committed: No (in `.gitignore`)

**dist/**
- Purpose: Build output
- Committed: No (in `.gitignore`)

**.planning/**
- Purpose: Project documentation and memory
- Committed: Yes

---

*Structure analysis: 2026-04-26*
*Update when directory structure changes*
