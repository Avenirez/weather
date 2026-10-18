# Weatherez: Atmospheric Telemetry Engine

A client-side meteorological monitoring application built with Svelte 5 and Vite. It consumes open weather and air quality APIs to deliver real-time environmental metrics, 24-hour predictive curves, and geospatial telemetry.

## System Architecture

Weatherez connects to public upstream endpoints without an intermediate proxy server:

1. Open-Meteo Forecast API: Current weather vectors, 24-hour temperature steps, 7-day high/low boundaries, and solar ephemeris (sunrise and sunset timestamps).
2. Open-Meteo Air Quality API: European Air Quality Index (AQI), PM2.5, PM10, ozone, carbon monoxide, nitrogen dioxide, and solar UV radiation.
3. Open-Meteo Geocoding API: Substring lookup for global coordinates, administrative divisions, and timezones.
4. BigDataCloud Reverse Geocoding API: Resolves browser hardware coordinates (WGS84) to local municipal boundaries.
5. Deterministic Simulation Fallback: In offline states or during upstream outages, a local pseudo-random generator computes seasonal baseline data matched to geographic latitude.

## Core Capabilities

- High-Density Telemetry: Surface temperature, apparent temperature, relative humidity, barometric pressure, horizontal visibility, and cloud cover.
- 24-Hour Continuous Spline Chart: SVG cubic Bezier curve showing hourly temperature variation and rain probability bars.
- Vector Solar Trajectory: Computes diurnal sun position along an SVG geometric arc based on local sunrise and sunset timestamps.
- Directional Wind Compass: Visual dial showing bearing degrees and cardinal markers (N, E, S, W) linked to surface wind velocity.
- Debounced Query Engine: 250ms input debouncer with full keyboard navigation (Up, Down, Enter, Escape) and metro suggestions.
- Location Persistence: LocalStorage records for search history and saved locations with prototype pollution filtering.
- Visual Mode Override: State toggle between automatic solar cycle, permanent dark theme, and permanent light theme.

## Security Controls

The application enforces client-side controls aligned with standard web application security requirements:

- DOM XSS Mitigation: Leaflet map markers and popups use native DOM nodes (`document.createElement` and `textContent`) rather than raw string concatenation.
- Prototype Pollution Defense: Custom JSON deserializer reviver blocks `__proto__`, `constructor`, and `prototype` keys during storage retrieval.
- Parameter Bounds Enforcement: Latitude (-90 to 90) and longitude (-180 to 180) are strictly parsed and clamped before building query strings.
- Content Security Policy: Strict origin whitelisting in `index.html` restricts scripts to `self` and `unpkg.com`, blocking unverified third-party script execution.
- Clickjacking Prevention: `X-Frame-Options: DENY` and `frame-ancestors 'none'` rules block iframe embedding.
- MIME Sniffing Protection: `X-Content-Type-Options: nosniff` header active on all asset responses.

## Directory Structure

```text
├── public/
│   ├── favicon.svg          # Application vector icon
│   └── manifest.json        # Progressive Web App manifest
├── src/
│   ├── assets/              # Static vector illustrations
│   ├── components/
│   │   ├── AnimatedBackground.svelte # Subtle canvas micro-grid
│   │   ├── ForecastSection.svelte    # 24h curve, hourly and daily tabs
│   │   ├── HourlyChart.svelte        # Interactive SVG Bezier spline
│   │   ├── SearchHistory.svelte      # Query records and saved cities
│   │   ├── SkeletonCard.svelte       # Loading state placeholders
│   │   ├── Toast.svelte              # Non-blocking notification stack
│   │   ├── WeatherCard.svelte        # Primary temperature and metrics card
│   │   ├── WeatherDetails.svelte     # Bento telemetry grid
│   │   ├── WeatherIcon.svelte        # Pure SVG weather symbol system
│   │   └── WeatherMap.svelte         # Leaflet GIS container
│   ├── lib/
│   │   ├── security.js      # Input sanitization and storage guards
│   │   └── weatherData.js   # Open-Meteo engine and mock fallback
│   ├── App.svelte           # Root application shell and state coordinator
│   ├── app.css              # Zinc design tokens and typography rules
│   └── main.js              # Svelte 5 application entry point
├── index.html               # Document root, CSP, and viewport setup
├── package.json             # Dependencies and build scripts
├── vercel.json              # HTTP response security headers
└── vite.config.js           # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js version 18.0 or later
- npm version 9.0 or later

### Installation

1. Clone or extract the repository files to your local environment.
2. Install dependencies:

```bash
npm install
```

### Development Server

Start Vite in development mode with hot module replacement:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

Compile and bundle assets for production deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## License

Private project. Meteorological data provided by Open-Meteo under Creative Commons Attribution 4.0 International (CC BY 4.0).
