<script>
  let { history = [], favorites = [], onselect, onremove, onremoveFavorite } = $props();
  let activeTab = $state('history');
</script>

{#if history.length > 0 || favorites.length > 0}
  <section class="panel history-section" aria-label="Location records">
    <div class="tabs" role="tablist">
      <button
        class="tab-btn"
        class:active={activeTab === 'history'}
        onclick={() => activeTab = 'history'}
        role="tab"
        aria-selected={activeTab === 'history'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="tab-icon">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Recent Searches</span>
        {#if history.length > 0}
          <span class="count-badge mono-metric">{history.length}</span>
        {/if}
      </button>

      <button
        class="tab-btn"
        class:active={activeTab === 'favorites'}
        onclick={() => activeTab = 'favorites'}
        role="tab"
        aria-selected={activeTab === 'favorites'}
      >
        <svg viewBox="0 0 24 24" fill={activeTab === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" width="14" height="14" class="tab-icon fav">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span>Saved Locations</span>
        {#if favorites.length > 0}
          <span class="count-badge mono-metric fav">{favorites.length}</span>
        {/if}
      </button>
    </div>

    {#if activeTab === 'history' && history.length > 0}
      <div class="chips-container">
        {#each history as city, i}
          <div
            class="city-chip"
            onclick={() => onselect?.(city)}
            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onselect?.(city)}
            role="button"
            tabindex="0"
            title="Inspect weather for {city.name}"
          >
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="chip-name">{city.name}</span>
            <span class="chip-country">{city.country}</span>
            <button
              class="chip-delete"
              onclick={(e) => { e.stopPropagation(); onremove?.(i); }}
              aria-label="Remove {city.name}"
              title="Delete record"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'history'}
      <div class="empty-notice">
        <span>No recent search queries recorded.</span>
      </div>
    {/if}

    {#if activeTab === 'favorites' && favorites.length > 0}
      <div class="chips-container">
        {#each favorites as city, i}
          <div
            class="city-chip is-saved"
            onclick={() => onselect?.(city)}
            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onselect?.(city)}
            role="button"
            tabindex="0"
            title="Inspect saved weather for {city.name}"
          >
            <svg class="chip-icon fav" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" width="12" height="12">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span class="chip-name">{city.name}</span>
            <span class="chip-country">{city.country}</span>
            <button
              class="chip-delete"
              onclick={(e) => { e.stopPropagation(); onremoveFavorite?.(i); }}
              aria-label="Remove saved {city.name}"
              title="Delete saved location"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'favorites'}
      <div class="empty-notice">
        <span>No saved locations. Click the star icon on any report to store a location.</span>
      </div>
    {/if}
  </section>
{/if}

<style>
  .history-section {
    padding: 1.15rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.5rem;
  }

  .tab-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.35rem 0.65rem;
    transition: color var(--transition-fast);
    display: flex;
    align-items: center;
    gap: 0.45rem;
    position: relative;
    border-radius: var(--radius-sm);
  }

  .tab-btn:hover {
    color: var(--text-primary);
  }

  .tab-btn.active {
    color: var(--text-primary);
    background: var(--bg-surface-elevated);
  }

  .tab-icon {
    color: var(--text-muted);
  }

  .tab-icon.fav {
    color: #f59e0b;
  }

  .count-badge {
    font-size: 0.68rem;
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-sm);
    background: var(--border-subtle);
    color: var(--text-secondary);
  }

  .count-badge.fav {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .city-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.78rem;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .city-chip:hover {
    background: var(--bg-surface-hover);
    border-color: var(--border-strong);
  }

  .city-chip.is-saved {
    border-color: rgba(245, 158, 11, 0.25);
  }

  .chip-icon {
    color: var(--text-muted);
  }

  .chip-name {
    font-weight: 600;
  }

  .chip-country {
    color: var(--text-muted);
    font-size: 0.72rem;
  }

  .chip-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background: transparent;
    color: var(--text-muted);
    border: none;
    cursor: pointer;
    margin-left: 0.2rem;
    transition: all var(--transition-fast);
  }

  .chip-delete:hover {
    background: rgba(239, 68, 68, 0.2);
    color: var(--color-danger);
  }

  .empty-notice {
    font-size: 0.8rem;
    color: var(--text-muted);
    padding: 0.5rem 0;
  }
</style>
