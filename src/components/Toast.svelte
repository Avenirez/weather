<script>
  let { toasts = [], ondismiss } = $props();
</script>

<div class="toast-container" aria-live="polite">
  {#each toasts as toast (toast.id)}
    <div class="toast-item {toast.type || 'info'}">
      <div class="toast-icon-wrap">
        {#if toast.type === 'success'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16" class="icon-success">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        {:else if toast.type === 'warning'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="icon-warning">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        {:else if toast.type === 'error'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="icon-danger">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="icon-info">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        {/if}
      </div>

      <div class="toast-body">
        {#if toast.title}
          <div class="toast-title">{toast.title}</div>
        {/if}
        <div class="toast-message">{toast.message}</div>
      </div>

      <button
        class="toast-dismiss"
        onclick={() => ondismiss?.(toast.id)}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 360px;
    width: calc(100% - 3rem);
    pointer-events: none;
  }

  .toast-item {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-lg);
    animation: toastSlide 180ms ease-out forwards;
    color: var(--text-primary);
  }

  @keyframes toastSlide {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .toast-item.info { border-left: 3px solid var(--color-info); }
  .toast-item.success { border-left: 3px solid var(--color-success); }
  .toast-item.warning { border-left: 3px solid var(--color-warning); }
  .toast-item.error { border-left: 3px solid var(--color-danger); }

  .icon-info { color: var(--color-info); }
  .icon-success { color: var(--color-success); }
  .icon-warning { color: var(--color-warning); }
  .icon-danger { color: var(--color-danger); }

  .toast-icon-wrap {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .toast-body {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-weight: 600;
    font-size: 0.82rem;
    color: var(--text-primary);
    margin-bottom: 0.1rem;
  }

  .toast-message {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.35;
  }

  .toast-dismiss {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 3px;
    margin-top: 1px;
    transition: color var(--transition-fast);
  }

  .toast-dismiss:hover {
    color: var(--text-primary);
  }

  @media (max-width: 480px) {
    .toast-container {
      bottom: 1rem;
      right: 1rem;
      left: 1rem;
      width: auto;
    }
  }
</style>
