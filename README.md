# Texas Cancer Compass

A comprehensive, interactive web application for exploring cancer data, environmental risk factors, and healthcare access across Texas counties.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Sources](#data-sources)
- [Tech Stack](#tech-stack)
- [Attribution](#attribution)
- [License](#license)

---

## Features

- **Interactive Map**: Visualize Texas counties with overlays for cancer incidence, mortality, poverty, healthcare access, pollution, and more.
- **Environmental Sites**: Toggle and view environmental risk sites (e.g., power plants, landfills, chemical plants) per county.
- **Detailed County Panels**: Click a county to see detailed statistics, trends, and associated environmental sites.
- **Data Overlays**: Switch between different data overlays (population, cancer rates, poverty, etc.) for comparative analysis.
- **Admin Dashboard**: Manage counties, carcinogens, cancers, and environmental sites (requires authentication).
- **Dark/Light Mode**: Fully responsive UI with dark and light theme support.
- **Accessible UI**: Built with accessibility and usability in mind.

---

## Demo

https://texas-cancer-compass.lovable.app/

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/texas-cancer-compass.git
   cd texas-cancer-compass
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - The app uses [Supabase](https://supabase.com/) for backend data and authentication.
   - Update `src/lib/supabaseClient.ts` with your own Supabase project URL and anon key if deploying your own instance.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
public/
  ├── favicon.png                # App icon (see Attribution)
  ├── Texas_County_Boundaries.geojson  # County boundaries for the map
  ├── Texas_County_Boundaries.json     # County boundaries (JSON)
  ├── Cancer Data.csv            # Main cancer statistics data
  └── robots.txt                 # Search engine rules

src/
  ├── App.tsx, main.tsx          # App entry points
  ├── pages/                     # Main pages (Index, AdminDashboard, Login, NotFound)
  ├── components/                # Main and UI components (map, panels, toggles, etc.)
  ├── lib/                       # Supabase client and utilities
  ├── hooks/                     # Custom React hooks
  └── types/                     # TypeScript types
```

### Main Pages

- `Index.tsx`: Main interactive map and data explorer.
- `AdminDashboard.tsx`: Admin interface for managing data.
- `Login.tsx`: Admin login page.
- `NotFound.tsx`: 404 error page.

### Key Components

- `TexasMap.tsx`: Interactive Leaflet map of Texas counties.
- `CountyDetailPanel.tsx`: Detailed county info and stats.
- `DataOverlayToggle.tsx`: Overlay selector for map data.
- `EnvSitePopup.tsx`: Environmental site info popups.
- `components/ui/`: Reusable UI primitives (button, card, toggle, etc.)

---

## Data Sources

- **Cancer Data**: `public/Cancer Data.csv`  
  Contains age-adjusted incidence rates, trends, and statistics per county/region.
- **County Boundaries**: `public/Texas_County_Boundaries.geojson`  
  Used for rendering the interactive map.
- **Environmental Sites**: Managed via Supabase and displayed on the map.

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI, Lucide icons
- **Map**: React-Leaflet, Leaflet
- **State/Data**: React Query, Supabase
- **Auth**: Supabase Auth
- **Charts**: Recharts
- **Other**: CSV parsing, modern accessibility best practices

---

## Attribution

- **Favicon**:  
  <a href="https://www.flaticon.com/free-icons/cancer" title="cancer icons">Cancer icons created by Freepik - Flaticon</a>
- **Map Data**: Texas county boundaries from public GIS sources.
- **Cancer Data**: Sourced from public health datasets (see `Cancer Data.csv` for details).
- **Development Tools**: This project was developed using [Cursor](https://www.cursor.so/) and [Lovable](https://lovable.dev/) for AI-assisted coding and project generation.

---

## License

MIT License.  
See [LICENSE](LICENSE) for details.

---

_If you use or build on this project, please consider crediting the original authors and data sources!_
