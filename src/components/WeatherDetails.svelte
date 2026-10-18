<script>
  import { getUvLevel, getWindLevel, toFahrenheit } from '../lib/weatherData.js';

  let { weather, useFahrenheit = false, airQuality = null } = $props();

  let uvVal = $derived(airQuality?.uv_index !== undefined ? Math.round(airQuality.uv_index) : weather.uvIndex);
  let uvInfo = $derived(getUvLevel(uvVal));
  let windLabel = $derived(getWindLevel(weather.windSpeed));
  let dewPointDisplay = $derived(useFahrenheit ? toFahrenheit(weather.dewPoint) : weather.dewPoint);
  let dewUnit = $derived(useFahrenheit ? 'F' : 'C');

  let needleAngle = $derived(weather.windDegree !== undefined ? weather.windDegree : 0);

  function getAqiInfo(aqi) {
    if (aqi === null || aqi === undefined) return { label: 'Unavailable', color: 'var(--text-muted)' };
    if (aqi <= 20) return { label: 'Excellent', color: 'var(--color-success)' };
    if (aqi <= 40) return { label: 'Good', color: 'var(--color-success)' };
    if (aqi <= 60) return { label: 'Moderate', color: 'var(--color-warning)' };
    if (aqi <= 80) return { label: 'Poor', color: '#ea580c' };
    if (aqi <= 100) return { label: 'Very Poor', color: 'var(--color-danger)' };
    return { label: 'Hazardous', color: '#b91c1c' };
  }
  let aqiInfo = $derived(getAqiInfo(airQuality?.european_aqi));

  let extremeAlerts = $derived.by(() => {
    const alerts = [];
    if (weather.windSpeed > 40) alerts.push("Gale-force wind warning");
    if (uvVal >= 8) alerts.push("High solar radiation");
    if (airQuality?.european_aqi >= 80) alerts.push("Elevated particulate matter");
    if (weather.conditionKey === 'thunderstorm' || weather.conditionKey === 'heavy_rain') alerts.push("Severe precipitation alert");
    return alerts;
  });

  function formatTime(isoString) {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '--:--';
    }
  }

  let sunriseTime = $derived(formatTime(weather.sunrise));
  let sunsetTime = $derived(formatTime(weather.sunset));

  let sunProgress = $derived.by(() => {
    if (!weather.sunrise || !weather.sunset) return 0.5;
    try {
      const now = new Date();
      const rise = new Date(weather.sunrise);
      const set = new Date(weather.sunset);
      if (now < rise) return 0;
      if (now > set) return 1;
      return (now - rise) / (set - rise);
    } catch {
      return 0.5;
    }
  });

  let sunAngle = $derived(Math.PI * (1 - sunProgress));
  let sunCx = $derived(60 + 45 * Math.cos(sunAngle));
  let sunCy = $derived(50 - 40 * Math.sin(sunAngle));
</script>

<section class="details-section" aria-label="Atmospheric telemetry">
  {#if extremeAlerts.length > 0}
    <div class="alert-banner" role="alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="alert-icon">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div class="alert-content">
        <span class="alert-title">Advisory:</span>
        <span class="alert-text">{extremeAlerts.join(", ")}</span>
      </div>
    </div>
  {/if}

  <div class="bento-grid">
    <!-- Solar Trajectory Card -->
    <div class="panel bento-cell cell-wide">
      <div class="cell-head">
        <div class="cell-label-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
          <span class="cell-title">Solar Trajectory</span>
        </div>
        <span class="cell-meta mono-metric">{weather.isNight ? 'Night cycle' : 'Daylight cycle'}</span>
      </div>

      <div class="solar-arc-wrap">
        <svg viewBox="0 0 120 56" class="solar-svg">
          <path
            d="M 15 50 A 45 40 0 0 1 105 50"
            fill="none"
            stroke="var(--border-subtle)"
            stroke-width="1.5"
            stroke-dasharray="3 3"
          />
          <line x1="10" y1="50" x2="110" y2="50" stroke="var(--border-subtle)" stroke-width="1" />
          <circle
            cx={sunCx}
            cy={sunCy}
            r="4.5"
            fill="var(--accent-primary)"
            stroke="var(--text-primary)"
            stroke-width="1.5"
          />
        </svg>
      </div>

      <div class="solar-data-row">
        <div class="solar-point">
          <span class="solar-tag">Dawn</span>
          <span class="solar-time mono-metric">{sunriseTime}</span>
        </div>
        <div class="solar-divider"></div>
        <div class="solar-point">
          <span class="solar-tag">Dusk</span>
          <span class="solar-time mono-metric">{sunsetTime}</span>
        </div>
      </div>
    </div>

    <!-- Wind Dial Card -->
    <div class="panel bento-cell">
      <div class="cell-head">
        <div class="cell-label-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          <span class="cell-title">Wind Vector</span>
        </div>
        <span class="cell-meta mono-metric">{needleAngle}&deg;</span>
      </div>

      <div class="dial-container">
        <div class="dial-visual">
          <svg viewBox="0 0 54 54" class="dial-svg">
            <circle cx="27" cy="27" r="25" fill="none" stroke="var(--border-subtle)" stroke-width="1.5"/>
            <text x="27" y="10" text-anchor="middle" font-size="6" font-weight="700" fill="var(--color-danger)">N</text>
            <text x="46" y="29" text-anchor="middle" font-size="6" font-weight="600" fill="var(--text-muted)">E</text>
            <text x="27" y="48" text-anchor="middle" font-size="6" font-weight="600" fill="var(--text-muted)">S</text>
            <text x="8" y="29" text-anchor="middle" font-size="6" font-weight="600" fill="var(--text-muted)">W</text>
            <g style="transform-origin: 27px 27px; transform: rotate({needleAngle}deg); transition: transform 200ms ease-out;">
              <polygon points="27,11 23.5,27 27,24 30.5,27" fill="var(--accent-primary)" />
              <polygon points="27,43 23.5,27 27,24 30.5,27" fill="var(--border-strong)" />
              <circle cx="27" cy="27" r="2" fill="var(--text-primary)" />
            </g>
          </svg>
        </div>

        <div class="dial-stats">
          <div class="cell-stat mono-metric">{weather.windSpeed} <small>km/h</small></div>
          <span class="cell-note">{weather.windDir} ({windLabel})</span>
        </div>
      </div>
    </div>

    <!-- UV Radiation Card -->
    <div class="panel bento-cell">
      <div class="cell-head">
        <div class="cell-label-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
          <span class="cell-title">UV Index</span>
        </div>
        <span class="cell-meta" style="color: {uvInfo.color}">{uvInfo.label}</span>
      </div>

      <div class="cell-stat mono-metric" style="color: {uvInfo.color}">{uvVal}</div>

      <div class="uv-track">
        {#each [1,2,3,4,5,6,7,8,9,10,11] as lvl}
          <div
            class="uv-seg"
            class:filled={uvVal >= lvl}
            style="background: {uvVal >= lvl ? uvInfo.color : 'var(--border-subtle)'}"
          ></div>
        {/each}
      </div>

      <span class="cell-note">{uvVal >= 6 ? 'Protective eyewear advised' : 'Low skin risk'}</span>
    </div>

    <!-- Air Quality Index Card -->
    {#if airQuality}
      <div class="panel bento-cell">
        <div class="cell-head">
          <div class="cell-label-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            </svg>
            <span class="cell-title">Air Quality</span>
          </div>
          <span class="cell-meta" style="color: {aqiInfo.color}">{aqiInfo.label}</span>
        </div>

        <div class="cell-stat mono-metric" style="color: {aqiInfo.color}">
          {Math.round(airQuality.european_aqi)} <small>AQI</small>
        </div>

        <div class="pollutant-row mono-metric">
          <span>PM2.5: {airQuality.pm2_5 || '--'}</span>
          <span>PM10: {airQuality.pm10 || '--'}</span>
        </div>
        <span class="cell-note">European AQI standard</span>
      </div>
    {/if}

    <!-- Barometric Pressure Card -->
    <div class="panel bento-cell">
      <div class="cell-head">
        <div class="cell-label-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
          <span class="cell-title">Pressure</span>
        </div>
        <span class="cell-meta mono-metric">Surface</span>
      </div>

      <div class="cell-stat mono-metric">{weather.pressure} <small>hPa</small></div>

      <div class="progress-bar-wrap">
        <div
          class="progress-fill"
          style="width: {Math.min(Math.max(((weather.pressure - 980) / 60) * 100, 5), 100)}%; background: var(--accent-primary);"
        ></div>
      </div>
      <span class="cell-note">
        {weather.pressure > 1018 ? 'High pressure system' : weather.pressure < 1008 ? 'Low pressure trough' : 'Nominal barometric range'}
      </span>
    </div>

    <!-- Humidity & Dew Point Card -->
    <div class="panel bento-cell">
      <div class="cell-head">
        <div class="cell-label-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
          <span class="cell-title">Moisture</span>
        </div>
        <span class="cell-meta mono-metric">{dewPointDisplay}&deg;{dewUnit} dp</span>
      </div>

      <div class="cell-stat mono-metric">{weather.humidity}%</div>

      <div class="progress-bar-wrap">
        <div
          class="progress-fill"
          style="width: {weather.humidity}%; background: #0284c7;"
        ></div>
      </div>
      <span class="cell-note">Dew point calculated at surface level</span>
    </div>

    <!-- Visibility Card -->
    <div class="panel bento-cell">
      <div class="cell-head">
        <div class="cell-label-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span class="cell-title">Sight Range</span>
        </div>
        <span class="cell-meta mono-metric">{weather.visibility} km</span>
      </div>

      <div class="cell-stat mono-metric">{weather.visibility} <small>km</small></div>

      <div class="progress-bar-wrap">
        <div
          class="progress-fill"
          style="width: {Math.min((weather.visibility / 20) * 100, 100)}%; background: var(--color-success);"
        ></div>
      </div>
      <span class="cell-note">{weather.visibility >= 10 ? 'Unrestricted visibility' : 'Haze or localized fog'}</span>
    </div>

    <!-- Cloud Cover Card -->
    <div class="panel bento-cell">
      <div class="cell-head">
        <div class="cell-label-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="cell-icon">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
          </svg>
          <span class="cell-title">Cloud Cover</span>
        </div>
        <span class="cell-meta mono-metric">{weather.cloudCover}%</span>
      </div>

      <div class="cell-stat mono-metric">{weather.cloudCover}%</div>

      <div class="progress-bar-wrap">
        <div
          class="progress-fill"
          style="width: {weather.cloudCover}%; background: var(--text-muted);"
        ></div>
      </div>
      <span class="cell-note">{weather.cloudCover < 30 ? 'Clear sky ceiling' : weather.cloudCover < 70 ? 'Scattered cloud layers' : 'Overcast deck'}</span>
    </div>
  </div>
</section>

<style>
  .details-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .alert-banner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    color: var(--color-danger);
  }

  .alert-icon {
    flex-shrink: 0;
  }

  .alert-content {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    flex-wrap: wrap;
  }

  .alert-title {
    font-weight: 700;
  }

  .alert-text {
    color: var(--text-primary);
  }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }

  .bento-cell {
    padding: 1.15rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .cell-wide {
    grid-column: span 2;
  }

  .cell-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cell-label-wrap {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .cell-icon {
    color: var(--accent-primary);
  }

  .cell-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cell-meta {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .cell-stat {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .cell-stat small {
    font-size: 0.82rem;
    font-weight: 400;
    color: var(--text-muted);
  }

  .cell-note {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  /* Solar Trajectory */
  .solar-arc-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0.25rem 0;
  }

  .solar-svg {
    width: 170px;
    height: 60px;
    overflow: visible;
  }

  .solar-data-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.75rem;
  }

  .solar-point {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
  }

  .solar-tag {
    font-size: 0.68rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .solar-time {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .solar-divider {
    width: 1px;
    height: 22px;
    background: var(--border-subtle);
  }

  /* Dial */
  .dial-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .dial-visual {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .dial-svg {
    width: 100%;
    height: 100%;
  }

  .dial-stats {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* UV */
  .uv-track {
    display: flex;
    gap: 3px;
  }

  .uv-seg {
    flex: 1;
    height: 4px;
    border-radius: 2px;
  }

  /* Progress Bar */
  .progress-bar-wrap {
    width: 100%;
    height: 4px;
    background: var(--bg-surface-elevated);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 200ms ease-out;
  }

  .pollutant-row {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  @media (max-width: 580px) {
    .bento-grid {
      grid-template-columns: 1fr;
    }
    .cell-wide {
      grid-column: span 1;
    }
  }
</style>
