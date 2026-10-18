<script>
  import { toFahrenheit } from '../lib/weatherData.js';
  import WeatherIcon from './WeatherIcon.svelte';

  let { weather, useFahrenheit = false, isFavorite = false, onToggleFavorite } = $props();

  let displayTemp = $derived(useFahrenheit ? toFahrenheit(weather.temperature) : weather.temperature);
  let displayFeels = $derived(useFahrenheit ? toFahrenheit(weather.feelsLike) : weather.feelsLike);
  let unit = $derived(useFahrenheit ? 'F' : 'C');
</script>

<section class="panel weather-card" aria-label="Current weather report">
  <div class="card-header">
    <div class="location-block">
      <div class="location-row">
        <svg class="icon-geo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <h1 class="city-name">{weather.city.name}</h1>
      </div>
      <p class="country-label">{weather.city.country}</p>
    </div>

    <div class="action-block">
      <button
        class="btn-favorite"
        onclick={onToggleFavorite}
        aria-label={isFavorite ? "Remove from saved locations" : "Save location"}
        title={isFavorite ? "Remove from saved" : "Save location"}
      >
        <svg viewBox="0 0 24 24" fill={isFavorite ? "#f59e0b" : "none"} stroke={isFavorite ? "#f59e0b" : "currentColor"} stroke-width="2" width="18" height="18">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>

      <div class="status-pill">
        <span class="status-dot"></span>
        <span class="status-text">LIVE</span>
      </div>
    </div>
  </div>

  <div class="hero-block">
    <div class="hero-visual">
      <WeatherIcon condition={weather.conditionKey || weather.condition} size="96px" />
    </div>
    <div class="hero-temperature">
      <div class="temp-display mono-metric">
        <span class="temp-digit">{displayTemp}</span>
        <span class="temp-unit">&deg;{unit}</span>
      </div>
      <div class="condition-summary">
        <span class="condition-name">{weather.condition.label}</span>
        <span class="feels-label">Feels like {displayFeels}&deg;{unit}</span>
      </div>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric-cell" title="Relative Humidity">
      <div class="metric-top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="metric-icon">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
        <span class="metric-label">Humidity</span>
      </div>
      <span class="metric-value mono-metric">{weather.humidity}%</span>
    </div>

    <div class="metric-cell" title="Wind Velocity">
      <div class="metric-top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="metric-icon">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
        </svg>
        <span class="metric-label">Wind</span>
      </div>
      <span class="metric-value mono-metric">{weather.windSpeed} km/h</span>
    </div>

    <div class="metric-cell" title="UV Radiation Index">
      <div class="metric-top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="metric-icon">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <span class="metric-label">UV Index</span>
      </div>
      <span class="metric-value mono-metric">{weather.uvIndex}</span>
    </div>

    <div class="metric-cell" title="Wind Direction">
      <div class="metric-top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="metric-icon">
          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
        </svg>
        <span class="metric-label">Bearing</span>
      </div>
      <span class="metric-value mono-metric">{weather.windDir}</span>
    </div>
  </div>
</section>

<style>
  .weather-card {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .location-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-geo {
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .city-name {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .country-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-left: 1.5rem;
    margin-top: 0.15rem;
  }

  .action-block {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .btn-favorite {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
  }

  .btn-favorite:hover {
    color: var(--text-primary);
    border-color: var(--border-strong);
    background: var(--bg-surface-hover);
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-sm);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    background: var(--color-success);
    border-radius: 50%;
  }

  .status-text {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  .hero-block {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.5rem 0;
  }

  .hero-visual {
    flex-shrink: 0;
  }

  .hero-temperature {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .temp-display {
    display: flex;
    align-items: flex-start;
    line-height: 0.95;
  }

  .temp-digit {
    font-size: 4.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .temp-unit {
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-top: 0.35rem;
    margin-left: 0.2rem;
  }

  .condition-summary {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .condition-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .feels-label {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-subtle);
  }

  .metric-cell {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.65rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .metric-top {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .metric-icon {
    color: var(--text-muted);
  }

  .metric-label {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .metric-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  @media (max-width: 520px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .temp-digit {
      font-size: 3.5rem;
    }
  }
</style>
