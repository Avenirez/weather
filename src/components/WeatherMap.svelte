<script>
  import { onMount, onDestroy } from 'svelte';

  let { lat, lon, name } = $props();
  
  let mapElement;
  let map = $state.raw(null);
  let marker = $state.raw(null);

  function createPopupElement(text) {
    const bold = document.createElement('b');
    bold.textContent = String(text || '');
    return bold;
  }

  $effect(() => {
    if (map && lat !== undefined && lon !== undefined) {
      map.setView([lat, lon], 10);
      map.invalidateSize();
      if (marker) {
        marker.setLatLng([lat, lon]);
        marker.setPopupContent(createPopupElement(name)).openPopup();
      } else {
        const m = L.marker([lat, lon]).addTo(map);
        m.bindPopup(createPopupElement(name)).openPopup();
        marker = m;
      }
    }
  });

  onMount(() => {
    const leafletMap = L.map(mapElement, {
      zoomControl: false,
      attributionControl: false
    }).setView([lat || 0, lon || 0], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(leafletMap);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

    if (lat !== undefined && lon !== undefined) {
      const m = L.marker([lat, lon]).addTo(leafletMap);
      m.bindPopup(createPopupElement(name)).openPopup();
      marker = m;
    }
    
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 200);

    map = leafletMap;
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="panel weather-map-wrapper" aria-label="Geographic map">
  <div class="map-head">
    <div class="map-title-row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" class="map-icon">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
      <h3 class="section-title">Geographic Coordinates</h3>
    </div>
    <span class="coord-label mono-metric">
      {lat !== undefined ? `${Math.abs(lat).toFixed(2)}${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}${lon >= 0 ? 'E' : 'W'}` : ''}
    </span>
  </div>

  <div class="map-container" bind:this={mapElement}></div>
</div>

<style>
  .weather-map-wrapper {
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .map-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .map-title-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .map-icon {
    color: var(--accent-primary);
  }

  .section-title {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .coord-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .map-container {
    width: 100%;
    height: 220px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface-elevated);
    z-index: 1;
  }

  :global(.leaflet-popup-content-wrapper) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
  }
  :global(.leaflet-popup-tip) {
    background: var(--bg-surface);
  }
</style>
