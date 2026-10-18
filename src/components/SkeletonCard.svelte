<script>
  let { type = 'main' } = $props();
</script>

{#if type === 'main'}
  <div class="panel skeleton-card main-skeleton" aria-hidden="true">
    <div class="skeleton-header">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line subtitle"></div>
    </div>
    <div class="skeleton-center">
      <div class="skeleton-circle icon"></div>
      <div class="skeleton-line temp"></div>
    </div>
    <div class="skeleton-stats">
      <div class="skeleton-line stat"></div>
      <div class="skeleton-line stat"></div>
      <div class="skeleton-line stat"></div>
      <div class="skeleton-line stat"></div>
    </div>
  </div>

{:else if type === 'details'}
  <div class="skeleton-details-grid" aria-hidden="true">
    {#each Array(6) as _}
      <div class="panel skeleton-card detail-skeleton">
        <div class="skeleton-line label"></div>
        <div class="skeleton-line val"></div>
        <div class="skeleton-line bar"></div>
        <div class="skeleton-line hint"></div>
      </div>
    {/each}
  </div>

{:else if type === 'forecast'}
  <div class="panel skeleton-forecast" aria-hidden="true">
    <div class="skeleton-line subtitle"></div>
    {#each Array(5) as _}
      <div class="skeleton-forecast-row">
        <div class="skeleton-line f-day"></div>
        <div class="skeleton-circle f-icon"></div>
        <div class="skeleton-line f-rain"></div>
        <div class="skeleton-line f-bar"></div>
        <div class="skeleton-line f-temp"></div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .skeleton-card {
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .main-skeleton {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .skeleton-line,
  .skeleton-circle {
    background: linear-gradient(
      90deg,
      var(--bg-surface-elevated) 0%,
      var(--border-subtle) 50%,
      var(--bg-surface-elevated) 100%
    );
    background-size: 200% 100%;
    animation: pulseScan 1.6s infinite ease-out;
    border-radius: var(--radius-sm);
  }

  @keyframes pulseScan {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .skeleton-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .skeleton-line.title { width: 50%; height: 26px; }
  .skeleton-line.subtitle { width: 30%; height: 16px; }

  .skeleton-center {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.5rem 0;
  }

  .skeleton-circle.icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
  }

  .skeleton-line.temp {
    width: 100px;
    height: 60px;
  }

  .skeleton-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-subtle);
  }

  .skeleton-line.stat {
    height: 38px;
  }

  .skeleton-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }

  .detail-skeleton {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1.15rem;
  }

  .skeleton-line.label { width: 45%; height: 14px; }
  .skeleton-line.val { width: 35%; height: 24px; }
  .skeleton-line.bar { width: 100%; height: 4px; }
  .skeleton-line.hint { width: 65%; height: 12px; }

  .skeleton-forecast {
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .skeleton-forecast-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.35rem 0;
  }

  .skeleton-line.f-day { width: 55px; height: 15px; }
  .skeleton-circle.f-icon { width: 22px; height: 22px; border-radius: 50%; }
  .skeleton-line.f-rain { width: 35px; height: 14px; }
  .skeleton-line.f-bar { flex: 1; height: 4px; }
  .skeleton-line.f-temp { width: 45px; height: 15px; }
</style>
