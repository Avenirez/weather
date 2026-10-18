<script>
  let { weather } = $props();
</script>

<div class="ambient-canvas" aria-hidden="true">
  <!-- Subtle architectural micro-grid -->
  <div class="grid-overlay"></div>

  <!-- Rain particle effect (clean, sharp vertical lines) -->
  {#if weather?.conditionKey?.includes('rain') || weather?.conditionKey === 'thunderstorm'}
    <div class="rain-canvas">
      {#each Array(45) as _, i}
        <div
          class="rain-line"
          style="
            left: {(i * 2.2 + (i % 7) * 3)}%;
            animation-delay: {((i * 0.07) % 1.5).toFixed(2)}s;
            animation-duration: {(0.45 + (i % 4) * 0.1).toFixed(2)}s;
            opacity: {(0.15 + (i % 3) * 0.08).toFixed(2)};
          "
        ></div>
      {/each}
    </div>
  {/if}

  <!-- Thunderstorm strobe -->
  {#if weather?.conditionKey === 'thunderstorm'}
    <div class="storm-strobe"></div>
  {/if}
</div>

<style>
  .ambient-canvas {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
    background: var(--bg-app);
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
      linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.18;
    mask-image: radial-gradient(circle at 50% 30%, black 40%, transparent 85%);
    -webkit-mask-image: radial-gradient(circle at 50% 30%, black 40%, transparent 85%);
  }

  .rain-canvas {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .rain-line {
    position: absolute;
    top: -40px;
    width: 1px;
    height: 32px;
    background: linear-gradient(180deg, transparent, #38bdf8);
    animation: rainStreak linear infinite;
  }

  @keyframes rainStreak {
    0% { transform: translateY(-30px); }
    100% { transform: translateY(105vh); }
  }

  .storm-strobe {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.04);
    animation: strobeFlash 5s infinite;
  }

  @keyframes strobeFlash {
    0%, 94%, 98%, 100% { opacity: 0; }
    95% { opacity: 1; }
    97% { opacity: 0.5; }
  }
</style>
