<script>
  import { toFahrenheit } from '../lib/weatherData.js';
  import WeatherIcon from './WeatherIcon.svelte';
  import HourlyChart from './HourlyChart.svelte';

  let { forecast = [], hourly = [], useFahrenheit = false } = $props();

  let activeTab = $state('chart');

  let unit = $derived(useFahrenheit ? 'F' : 'C');

  function tempDisplay(temp) {
    return useFahrenheit ? toFahrenheit(temp) : temp;
  }
</script>

<section class="panel forecast-section" aria-label="Forecast timeline">
  <div class="forecast-header">
    <div class="header-title-group">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="title-icon">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <h2 class="section-title">Timeline & Forecast</h2>
    </div>

    <div class="segment-control" role="tablist">
      <button
        class="segment-btn"
        class:active={activeTab === 'chart'}
        onclick={() => activeTab = 'chart'}
        role="tab"
        aria-selected={activeTab === 'chart'}
      >
        24h Curve
      </button>
      <button
        class="segment-btn"
        class:active={activeTab === 'hourly'}
        onclick={() => activeTab = 'hourly'}
        role="tab"
        aria-selected={activeTab === 'hourly'}
      >
        Hourly
      </button>
      <button
        class="segment-btn"
        class:active={activeTab === 'daily'}
        onclick={() => activeTab = 'daily'}
        role="tab"
        aria-selected={activeTab === 'daily'}
      >
        7-Day
      </button>
    </div>
  </div>

  {#if activeTab === 'chart'}
    <div class="view-wrapper">
      <HourlyChart {hourly} {useFahrenheit} />
    </div>

  {:else if activeTab === 'hourly'}
    <div class="hourly-strip">
      {#each hourly as hour}
        <div class="hourly-slot" class:is-now={hour.isNow}>
          <span class="slot-time mono-metric">{hour.isNow ? 'Now' : hour.hour}</span>
          <div class="slot-icon">
            <WeatherIcon condition={hour.condition} size="28px" />
          </div>
          <span class="slot-temp mono-metric">{tempDisplay(hour.temp)}&deg;{unit}</span>
          {#if hour.rainChance > 0}
            <div class="slot-rain mono-metric">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              <span>{hour.rainChance}%</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>

  {:else if activeTab === 'daily'}
    <div class="daily-stack">
      {#each forecast as day}
        <div class="daily-item">
          <span class="daily-day">{day.dayName}</span>
          <div class="daily-icon-cell">
            <WeatherIcon condition={day.conditionKey || day.condition} size="24px" />
          </div>
          <div class="daily-rain-cell mono-metric">
            {#if day.rainChance > 0}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" class="rain-icon">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              <span>{day.rainChance}%</span>
            {/if}
          </div>
          <div class="daily-bar-range">
            <span class="range-low mono-metric">{tempDisplay(day.tempLow)}&deg;</span>
            <div class="range-track">
              <div
                class="range-fill"
                style="
                  left: {Math.max(0, Math.min(((day.tempLow + 5) / 50) * 100, 88))}%;
                  width: {Math.max(12, Math.min(((day.tempHigh - day.tempLow) / 50) * 100, 80))}%;
                "
              ></div>
            </div>
            <span class="range-high mono-metric">{tempDisplay(day.tempHigh)}&deg;</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .forecast-section {
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .forecast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .header-title-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .title-icon {
    color: var(--accent-primary);
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .segment-control {
    display: flex;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 2px;
  }

  .segment-btn {
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: transparent;
    transition: all var(--transition-fast);
  }

  .segment-btn.active {
    background: var(--bg-surface-hover);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }

  .segment-btn:hover:not(.active) {
    color: var(--text-primary);
  }

  .view-wrapper {
    width: 100%;
  }

  /* Hourly */
  .hourly-strip {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .hourly-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 0.65rem;
    border-radius: var(--radius-sm);
    min-width: 68px;
    flex-shrink: 0;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    transition: border-color var(--transition-fast);
  }

  .hourly-slot:hover {
    border-color: var(--border-strong);
  }

  .hourly-slot.is-now {
    border-color: var(--accent-primary);
    background: var(--accent-surface);
  }

  .slot-time {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .hourly-slot.is-now .slot-time {
    color: var(--accent-primary);
    font-weight: 600;
  }

  .slot-icon {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slot-temp {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .slot-rain {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.65rem;
    color: var(--accent-primary);
  }

  /* Daily */
  .daily-stack {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .daily-item {
    display: flex;
    align-items: center;
    padding: 0.65rem 0.85rem;
    border-radius: var(--radius-sm);
    gap: 0.75rem;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    transition: background-color var(--transition-fast);
  }

  .daily-item:hover {
    background: var(--bg-surface-hover);
  }

  .daily-day {
    width: 65px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  .daily-icon-cell {
    width: 28px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }

  .daily-rain-cell {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 45px;
    font-size: 0.72rem;
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .rain-icon {
    color: var(--accent-primary);
  }

  .daily-bar-range {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .range-low {
    font-size: 0.8rem;
    color: var(--text-muted);
    width: 32px;
    text-align: right;
  }

  .range-high {
    font-size: 0.8rem;
    font-weight: 600;
    width: 32px;
    color: var(--text-primary);
  }

  .range-track {
    flex: 1;
    height: 4px;
    background: var(--border-subtle);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }

  .range-fill {
    position: absolute;
    height: 100%;
    border-radius: 2px;
    background: var(--accent-primary);
  }
</style>
