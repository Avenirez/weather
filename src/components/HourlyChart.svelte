<script>
  import { toFahrenheit } from '../lib/weatherData.js';
  import WeatherIcon from './WeatherIcon.svelte';

  let { hourly = [], useFahrenheit = false } = $props();

  let unit = $derived(useFahrenheit ? 'F' : 'C');

  function getDisplayTemp(temp) {
    return useFahrenheit ? toFahrenheit(temp) : temp;
  }

  const pointSpacing = 64;
  const chartHeight = 150;
  const paddingY = 28;

  let temps = $derived(hourly.map(h => getDisplayTemp(h.temp)));
  let minTemp = $derived(temps.length ? Math.min(...temps) : 0);
  let maxTemp = $derived(temps.length ? Math.max(...temps) : 35);
  let tempRange = $derived(Math.max(maxTemp - minTemp, 4));

  let totalWidth = $derived(Math.max((hourly.length - 1) * pointSpacing + 60, 560));

  let points = $derived.by(() => {
    return hourly.map((h, i) => {
      const x = 30 + i * pointSpacing;
      const t = getDisplayTemp(h.temp);
      const y = paddingY + ((maxTemp - t) / tempRange) * (chartHeight - paddingY * 2);
      return { x, y, hour: h, t };
    });
  });

  let pathD = $derived.by(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  });

  let areaD = $derived.by(() => {
    if (points.length < 2) return '';
    const last = points[points.length - 1];
    const first = points[0];
    return `${pathD} L ${last.x} ${chartHeight + 10} L ${first.x} ${chartHeight + 10} Z`;
  });
</script>

<div class="hourly-chart-container">
  <div class="chart-scroll-wrapper">
    <div class="chart-canvas" style="width: {totalWidth}px;">
      <svg class="chart-svg" width={totalWidth} height={chartHeight} viewBox="0 0 {totalWidth} {chartHeight}">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill="url(#chartFill)" />
        <path d={pathD} fill="none" stroke="var(--accent-primary)" stroke-width="2.5" stroke-linecap="round" />

        {#each points as pt}
          {#if pt.hour.isNow}
            <line
              x1={pt.x}
              y1="10"
              x2={pt.x}
              y2={chartHeight}
              stroke="var(--accent-primary)"
              stroke-width="1.5"
              stroke-dasharray="2 2"
            />
          {/if}
          <circle
            cx={pt.x}
            cy={pt.y}
            r={pt.hour.isNow ? 4.5 : 3.5}
            fill={pt.hour.isNow ? 'var(--text-primary)' : 'var(--bg-surface)'}
            stroke="var(--accent-primary)"
            stroke-width="2"
          />
        {/each}
      </svg>

      <div class="chart-labels">
        {#each points as pt}
          <div
            class="chart-column"
            class:is-now={pt.hour.isNow}
            style="left: {pt.x}px;"
          >
            <span class="chart-temp mono-metric" style="top: {pt.y - 22}px;">
              {pt.t}&deg;
            </span>

            <div class="chart-rain-col">
              {#if pt.hour.rainChance > 0}
                <div class="rain-bar-wrap">
                  <div
                    class="rain-bar"
                    style="height: {Math.max(pt.hour.rainChance * 0.35, 3)}px;"
                    title="Precipitation probability: {pt.hour.rainChance}%"
                  ></div>
                  <span class="rain-pct mono-metric">{pt.hour.rainChance}%</span>
                </div>
              {:else}
                <div class="rain-spacer"></div>
              {/if}
            </div>

            <div class="chart-icon">
              <WeatherIcon condition={pt.hour.condition} size="22px" />
            </div>

            <span class="chart-time mono-metric">{pt.hour.isNow ? 'Now' : pt.hour.hour}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .hourly-chart-container {
    width: 100%;
    position: relative;
    padding-top: 0.5rem;
  }

  .chart-scroll-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .chart-canvas {
    position: relative;
    height: 240px;
  }

  .chart-svg {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
  }

  .chart-labels {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .chart-column {
    position: absolute;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
  }

  .chart-temp {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .chart-column.is-now .chart-temp {
    color: var(--accent-primary);
    font-weight: 700;
  }

  .chart-rain-col {
    position: absolute;
    top: 155px;
    height: 38px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  .rain-bar-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .rain-bar {
    width: 12px;
    background: var(--accent-primary);
    border-radius: 2px;
    min-height: 3px;
  }

  .rain-pct {
    font-size: 0.65rem;
    color: var(--accent-primary);
    font-weight: 600;
  }

  .rain-spacer {
    height: 16px;
  }

  .chart-icon {
    position: absolute;
    top: 196px;
    transform: translateX(-50%);
  }

  .chart-time {
    position: absolute;
    top: 222px;
    transform: translateX(-50%);
    font-size: 0.72rem;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .chart-column.is-now .chart-time {
    color: var(--text-primary);
    font-weight: 700;
  }
</style>
