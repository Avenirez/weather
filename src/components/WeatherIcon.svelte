<script>
  let { condition = 'sunny', size = '48px', animated = true, class: customClass = '' } = $props();

  // Normalize condition key: if an object is passed, extract .type or fallback
  let condKey = $derived.by(() => {
    if (typeof condition === 'string') return condition;
    if (condition && typeof condition === 'object') {
      return condition.type || condition.iconKey || 'sunny';
    }
    return 'sunny';
  });
</script>

<div
  class="weather-icon-svg {customClass}"
  class:animated
  style="--icon-size: {typeof size === 'number' ? size + 'px' : size}; width: var(--icon-size); height: var(--icon-size);"
  aria-hidden="true"
>
  {#if condKey === 'sunny'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="60%" stop-color="#facc15" />
          <stop offset="100%" stop-color="#eab308" />
        </radialGradient>
        <filter id="sunBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Rotating Rays -->
      <g class="sun-rays">
        {#each [0, 45, 90, 135, 180, 225, 270, 315] as angle}
          <line
            x1="32"
            y1="8"
            x2="32"
            y2="14"
            stroke="#facc15"
            stroke-width="3"
            stroke-linecap="round"
            transform="rotate({angle} 32 32)"
          />
        {/each}
      </g>
      <!-- Sun Core with Glow -->
      <circle cx="32" cy="32" r="14" fill="url(#sunGlow)" filter="url(#sunBlur)" class="sun-body" />
    </svg>

  {:else if condKey === 'partly_cloudy'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <radialGradient id="sunHalf" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </radialGradient>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
      </defs>
      <!-- Sun behind -->
      <g class="sun-behind">
        <circle cx="26" cy="24" r="11" fill="url(#sunHalf)" />
        {#each [0, 45, 90, 135, 180, 225, 270, 315] as angle}
          <line
            x1="26"
            y1="7"
            x2="26"
            y2="11"
            stroke="#f59e0b"
            stroke-width="2.5"
            stroke-linecap="round"
            transform="rotate({angle} 26 24)"
          />
        {/each}
      </g>
      <!-- Cloud front -->
      <path
        d="M22 48h26a10 10 0 0 0 2-19.8 14 14 0 0 0-26.6-4.2A11 11 0 0 0 22 48z"
        fill="url(#cloudGrad)"
        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
        class="cloud-drifting"
      />
    </svg>

  {:else if condKey === 'cloudy'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <linearGradient id="cloudBack" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        <linearGradient id="cloudFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
      </defs>
      <!-- Back cloud -->
      <path
        d="M26 38h20a8 8 0 0 0 1.6-15.8 11.2 11.2 0 0 0-21.3-3.4A8.8 8.8 0 0 0 26 38z"
        fill="url(#cloudBack)"
        opacity="0.8"
        class="cloud-back"
      />
      <!-- Front cloud -->
      <path
        d="M18 48h28a11 11 0 0 0 2.2-21.8 15.4 15.4 0 0 0-29.3-4.6A12.1 12.1 0 0 0 18 48z"
        fill="url(#cloudFront)"
        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.18))"
        class="cloud-front"
      />
    </svg>

  {:else if condKey === 'light_rain' || condKey === 'rain'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <linearGradient id="rainCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#94a3b8" />
        </linearGradient>
      </defs>
      <!-- Cloud -->
      <path
        d="M18 40h28a11 11 0 0 0 2.2-21.8 15.4 15.4 0 0 0-29.3-4.6A12.1 12.1 0 0 0 18 40z"
        fill="url(#rainCloud)"
      />
      <!-- Drops -->
      <g class="rain-drops">
        <line x1="24" y1="46" x2="21" y2="54" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" class="drop d1" />
        <line x1="33" y1="46" x2="30" y2="54" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" class="drop d2" />
        <line x1="42" y1="46" x2="39" y2="54" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" class="drop d3" />
      </g>
    </svg>

  {:else if condKey === 'heavy_rain'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <linearGradient id="stormCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
      </defs>
      <path
        d="M18 38h28a11 11 0 0 0 2.2-21.8 15.4 15.4 0 0 0-29.3-4.6A12.1 12.1 0 0 0 18 38z"
        fill="url(#stormCloud)"
      />
      <!-- Torrential drops -->
      <g class="rain-drops heavy">
        <line x1="22" y1="44" x2="18" y2="56" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" class="drop d1" />
        <line x1="31" y1="44" x2="27" y2="56" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" class="drop d2" />
        <line x1="40" y1="44" x2="36" y2="56" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" class="drop d3" />
        <line x1="48" y1="44" x2="44" y2="56" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="drop d4" />
      </g>
    </svg>

  {:else if condKey === 'thunderstorm'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <linearGradient id="thunderCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <path
        d="M18 36h28a11 11 0 0 0 2.2-21.8 15.4 15.4 0 0 0-29.3-4.6A12.1 12.1 0 0 0 18 36z"
        fill="url(#thunderCloud)"
      />
      <!-- Lightning bolt -->
      <polygon
        points="34,34 26,46 32,46 28,58 42,44 35,44"
        fill="#facc15"
        stroke="#eab308"
        stroke-width="1"
        class="lightning-flash"
      />
    </svg>

  {:else if condKey === 'snow'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <path
        d="M18 38h28a11 11 0 0 0 2.2-21.8 15.4 15.4 0 0 0-29.3-4.6A12.1 12.1 0 0 0 18 38z"
        fill="#e2e8f0"
      />
      <!-- Snowflakes -->
      <g class="snowflakes">
        <g class="flake f1" transform="translate(20, 48)">
          <line x1="-3" y1="0" x2="3" y2="0" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round" />
          <line x1="-2" y1="-2" x2="2" y2="2" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round" />
        </g>
        <g class="flake f2" transform="translate(32, 52)">
          <line x1="-3" y1="0" x2="3" y2="0" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
          <line x1="-2" y1="-2" x2="2" y2="2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
        </g>
        <g class="flake f3" transform="translate(44, 48)">
          <line x1="-3" y1="0" x2="3" y2="0" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round" />
          <line x1="-2" y1="-2" x2="2" y2="2" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round" />
        </g>
      </g>
    </svg>

  {:else if condKey === 'fog'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <g class="fog-lines">
        <line x1="16" y1="24" x2="48" y2="24" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" class="fog-line fl1" />
        <line x1="12" y1="32" x2="52" y2="32" stroke="#cbd5e1" stroke-width="3.5" stroke-linecap="round" class="fog-line fl2" />
        <line x1="18" y1="40" x2="46" y2="40" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" class="fog-line fl3" />
        <line x1="14" y1="48" x2="50" y2="48" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" class="fog-line fl4" />
      </g>
    </svg>

  {:else if condKey === 'clear_night'}
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <radialGradient id="moonGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="70%" stop-color="#fde047" />
          <stop offset="100%" stop-color="#ca8a04" />
        </radialGradient>
      </defs>
      <!-- Twinkling stars -->
      <g class="night-stars">
        <circle cx="16" cy="18" r="1.5" fill="#fef08a" class="star s1" />
        <circle cx="48" cy="20" r="1.2" fill="#ffffff" class="star s2" />
        <circle cx="20" cy="44" r="1.4" fill="#ffffff" class="star s3" />
        <circle cx="46" cy="46" r="1.8" fill="#fef08a" class="star s4" />
      </g>
      <!-- Moon crescent -->
      <path
        d="M36 14c-11 0-20 9-20 20s9 20 20 20c4.5 0 8.7-1.5 12.1-4.1-9-1.2-16.1-8.9-16.1-18.2 0-8.8 6.5-16.1 15.2-17.6-3.4-0.1-7.2-0.1-11.2-0.1z"
        fill="url(#moonGrad)"
        filter="drop-shadow(0 0 10px rgba(254, 240, 138, 0.4))"
        class="moon-body"
      />
    </svg>

  {:else}
    <!-- cloudy_night fallback -->
    <svg viewBox="0 0 64 64" fill="none" class="icon-svg">
      <defs>
        <radialGradient id="moonG" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#eab308" />
        </radialGradient>
      </defs>
      <!-- Moon behind -->
      <path
        d="M28 16c-7.7 0-14 6.3-14 14s6.3 14 14 14c3.1 0 6-1 8.5-2.8-6.3-0.8-11.2-6.2-11.2-12.7 0-6.2 4.5-11.3 10.6-12.3-2.4-0.1-5.1-0.2-7.9-0.2z"
        fill="url(#moonG)"
        class="moon-behind"
      />
      <!-- Cloud front -->
      <path
        d="M22 48h26a10 10 0 0 0 2-19.8 14 14 0 0 0-26.6-4.2A11 11 0 0 0 22 48z"
        fill="#94a3b8"
        opacity="0.9"
        class="cloud-drifting"
      />
    </svg>
  {/if}
</div>

<style>
  .weather-icon-svg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    user-select: none;
    flex-shrink: 0;
  }

  .icon-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /* Animations */
  .animated .sun-rays {
    transform-origin: 32px 32px;
    animation: rotateRays 24s linear infinite;
  }

  @keyframes rotateRays {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animated .sun-body {
    animation: pulseSun 4s ease-in-out infinite;
  }

  @keyframes pulseSun {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
  }

  .animated .cloud-drifting {
    animation: driftCloud 6s ease-in-out infinite alternate;
  }

  @keyframes driftCloud {
    from { transform: translateX(-2px); }
    to { transform: translateX(2px); }
  }

  .animated .cloud-back {
    animation: driftBack 8s ease-in-out infinite alternate;
  }

  @keyframes driftBack {
    from { transform: translateX(1px); }
    to { transform: translateX(-3px); }
  }

  .animated .cloud-front {
    animation: driftFront 5s ease-in-out infinite alternate;
  }

  @keyframes driftFront {
    from { transform: translateY(0); }
    to { transform: translateY(-2px); }
  }

  /* Rain animation */
  .animated .drop {
    animation: fallRain 1s linear infinite;
  }

  .animated .drop.d1 { animation-delay: 0s; }
  .animated .drop.d2 { animation-delay: 0.35s; }
  .animated .drop.d3 { animation-delay: 0.7s; }
  .animated .drop.d4 { animation-delay: 0.15s; }

  @keyframes fallRain {
    0% { opacity: 0; transform: translateY(-4px); }
    40% { opacity: 1; }
    100% { opacity: 0; transform: translateY(8px); }
  }

  /* Lightning animation */
  .animated .lightning-flash {
    animation: flashBolt 3.2s infinite;
  }

  @keyframes flashBolt {
    0%, 88%, 94%, 100% { opacity: 0; transform: scale(0.9); }
    90%, 93% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 8px #fde047); }
    91% { opacity: 0.4; }
  }

  /* Snowflakes */
  .animated .flake {
    animation: flutterSnow 3s ease-in-out infinite;
    display: inline-block;
  }

  .animated .f1 { animation-delay: 0s; }
  .animated .f2 { animation-delay: 1s; }
  .animated .f3 { animation-delay: 1.8s; }

  @keyframes flutterSnow {
    0% { transform: translateY(-2px) rotate(0deg); opacity: 0.3; }
    50% { opacity: 1; }
    100% { transform: translateY(6px) rotate(180deg); opacity: 0.2; }
  }

  /* Fog */
  .animated .fog-line {
    animation: waveFog 4s ease-in-out infinite alternate;
  }
  .animated .fl1 { animation-delay: 0s; }
  .animated .fl2 { animation-delay: 0.8s; }
  .animated .fl3 { animation-delay: 1.6s; }
  .animated .fl4 { animation-delay: 2.4s; }

  @keyframes waveFog {
    from { transform: translateX(-3px); opacity: 0.6; }
    to { transform: translateX(3px); opacity: 0.95; }
  }

  /* Stars */
  .animated .star {
    animation: twinkleStar 2.5s ease-in-out infinite;
  }
  .animated .s1 { animation-delay: 0s; }
  .animated .s2 { animation-delay: 0.6s; }
  .animated .s3 { animation-delay: 1.2s; }
  .animated .s4 { animation-delay: 1.8s; }

  @keyframes twinkleStar {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  .animated .moon-body {
    animation: glowMoon 5s ease-in-out infinite alternate;
  }

  @keyframes glowMoon {
    from { filter: drop-shadow(0 0 6px rgba(254, 240, 138, 0.3)); }
    to { filter: drop-shadow(0 0 14px rgba(254, 240, 138, 0.7)); }
  }
</style>
