<script>
  import AnimatedBackground from './components/AnimatedBackground.svelte';
  import WeatherCard from './components/WeatherCard.svelte';
  import WeatherDetails from './components/WeatherDetails.svelte';
  import ForecastSection from './components/ForecastSection.svelte';
  import SearchHistory from './components/SearchHistory.svelte';
  import WeatherMap from './components/WeatherMap.svelte';
  import Toast from './components/Toast.svelte';
  import SkeletonCard from './components/SkeletonCard.svelte';
  import { onMount } from 'svelte';
  import {
    CITIES,
    searchCities,
    generateWeatherData,
    generateForecast,
    generateHourlyForecast,
    formatDateIndonesian,
    fetchCityCoordinates,
    fetchRealWeatherData,
    fetchAirQuality
  } from './lib/weatherData.js';
  import { safeStorageParse, sanitizeCityRecord, sanitizeSearchQuery } from './lib/security.js';

  // Reactive state
  let searchQuery = $state('');
  let searchResults = $state([]);
  let showDropdown = $state(false);
  let isSearching = $state(false);
  let highlightedIndex = $state(-1);
  let useFahrenheit = $state(false);
  let themeMode = $state(loadTheme()); // 'auto' | 'dark' | 'light'
  let selectedCity = $state(CITIES[0]);
  let weather = $state(generateWeatherData(CITIES[0]));
  let forecast = $state(generateForecast(CITIES[0]));
  let hourly = $state(generateHourlyForecast(CITIES[0]));
  let searchHistory = $state(loadHistory());
  let favorites = $state(loadFavorites());
  let isLoading = $state(false);
  let airQuality = $state(null);
  let toasts = $state([]);

  let todayDate = formatDateIndonesian(new Date());
  let isCityFavorite = $derived(favorites.some(c => c.name === selectedCity.name));

  const suggestedCities = [
    { name: 'Jakarta', country: 'Indonesia', lat: -6.21, lon: 106.85 },
    { name: 'Bandung', country: 'Indonesia', lat: -6.91, lon: 107.61 },
    { name: 'Surabaya', country: 'Indonesia', lat: -7.25, lon: 112.75 },
    { name: 'Bali', country: 'Indonesia', lat: -8.34, lon: 115.09 },
    { name: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69 },
    { name: 'London', country: 'United Kingdom', lat: 51.51, lon: -0.13 }
  ];

  // Toast manager
  let toastCounter = 0;
  function addToast({ type = 'info', title = '', message = '' }) {
    const id = ++toastCounter;
    toasts = [...toasts, { id, type, title, message }];
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }

  function removeToast(id) {
    toasts = toasts.filter(t => t.id !== id);
  }

  // Theme manager
  function loadTheme() {
    try {
      return localStorage.getItem('weatherez_theme') || 'auto';
    } catch {
      return 'auto';
    }
  }

  function toggleTheme() {
    if (themeMode === 'auto') themeMode = 'dark';
    else if (themeMode === 'dark') themeMode = 'light';
    else themeMode = 'auto';

    try {
      localStorage.setItem('weatherez_theme', themeMode);
    } catch { /* ignore */ }
    applyThemeClass(themeMode);
  }

  function applyThemeClass(mode) {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('theme-dark', 'theme-light');
    if (mode === 'dark') document.body.classList.add('theme-dark');
    else if (mode === 'light') document.body.classList.add('theme-light');
  }

  $effect(() => {
    applyThemeClass(themeMode);
  });

  onMount(() => {
    applyThemeClass(themeMode);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
            const res = await fetch(revUrl);
            const data = await res.json();
            const cityName = data.city || data.locality || data.principalSubdivision || 'Current Position';
            const countryName = data.countryName || 'Auto-detected';
            const detectedCity = { name: cityName, country: countryName, lat: latitude, lon: longitude };
            selectedCity = detectedCity;
            await loadRealDataForCity(detectedCity);
            addToast({
              type: 'success',
              title: 'Position Locked',
              message: `Telemetry resolved for ${cityName}.`
            });
          } catch {
            const detectedCity = { name: 'Current Position', country: 'Auto-detected', lat: latitude, lon: longitude };
            selectedCity = detectedCity;
            loadRealDataForCity(detectedCity);
          }
        },
        () => {
          loadRealDataForCity(selectedCity);
        },
        { timeout: 8000, maximumAge: 300000 }
      );
    } else {
      loadRealDataForCity(selectedCity);
    }
  });

  async function loadRealDataForCity(city) {
    isLoading = true;
    try {
      const realData = await fetchRealWeatherData(city.lat, city.lon, city.name, city.country);
      weather = realData.weatherData;
      forecast = realData.forecast;
      hourly = realData.hourly;
      airQuality = await fetchAirQuality(city.lat, city.lon);
    } catch (e) {
      console.error(e);
      addToast({
        type: 'warning',
        title: 'Offline Simulation',
        message: 'Upstream meteorological API unresponsive. Displaying deterministic model data.'
      });
    } finally {
      isLoading = false;
    }
  }

  // Search input debouncer
  let debounceTimeout = null;
  function handleSearchInput(e) {
    searchQuery = sanitizeSearchQuery(e.target.value);
    highlightedIndex = -1;

    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (searchQuery.trim().length > 1) {
      isSearching = true;
      debounceTimeout = setTimeout(async () => {
        try {
          searchResults = await fetchCityCoordinates(searchQuery);
          showDropdown = true;
        } catch (err) {
          console.error(err);
          searchResults = searchCities(searchQuery);
          showDropdown = true;
        } finally {
          isSearching = false;
        }
      }, 250);
    } else {
      isSearching = false;
      searchResults = [];
      showDropdown = false;
    }
  }

  function handleSearchFocus() {
    if (searchQuery.trim().length === 0) {
      searchResults = suggestedCities;
      showDropdown = true;
    } else if (searchResults.length > 0) {
      showDropdown = true;
    }
  }

  function clearSearch() {
    searchQuery = '';
    searchResults = [];
    showDropdown = false;
    highlightedIndex = -1;
  }

  function selectCity(city) {
    const clean = sanitizeCityRecord(city);
    if (!clean) return;
    searchQuery = '';
    searchResults = [];
    showDropdown = false;
    highlightedIndex = -1;
    selectedCity = clean;
    addToHistory(clean);
    loadRealDataForCity(clean);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      addToast({
        type: 'warning',
        title: 'Unsupported',
        message: 'Browser does not provide Geolocation interface.'
      });
      return;
    }

    isLoading = true;
    addToast({
      type: 'info',
      title: 'GPS Acquisition',
      message: 'Querying device hardware coordinates...'
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const res = await fetch(revUrl);
          const data = await res.json();
          const cityName = data.city || data.locality || data.principalSubdivision || 'Current Position';
          const countryName = data.countryName || 'Auto-detected';
          const cityObj = { name: cityName, country: countryName, lat: latitude, lon: longitude };
          selectedCity = cityObj;
          await loadRealDataForCity(cityObj);
          addToast({
            type: 'success',
            title: 'Fix Established',
            message: `Telemetry retrieved for ${cityName}.`
          });
        } catch {
          const cityObj = { name: 'Current Position', country: 'Auto-detected', lat: latitude, lon: longitude };
          selectedCity = cityObj;
          await loadRealDataForCity(cityObj);
        }
      },
      (err) => {
        console.error(err);
        isLoading = false;
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: 'Hardware location query rejected. Use search bar to specify location manually.'
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function handleSearchKeydown(e) {
    if (!showDropdown || searchResults.length === 0) {
      if (e.key === 'ArrowDown') {
        showDropdown = true;
        searchResults = suggestedCities;
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % searchResults.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex - 1 + searchResults.length) % searchResults.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        selectCity(searchResults[highlightedIndex]);
      } else if (searchResults.length > 0) {
        selectCity(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      showDropdown = false;
      highlightedIndex = -1;
    }
  }

  function handleBlur() {
    setTimeout(() => { showDropdown = false; }, 200);
  }

  function toggleUnit() {
    useFahrenheit = !useFahrenheit;
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('weatherez_history');
      return safeStorageParse(saved, []);
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('weatherez_history', JSON.stringify(searchHistory));
    } catch { /* ignore */ }
  }

  function addToHistory(city) {
    const clean = sanitizeCityRecord(city);
    if (!clean) return;
    searchHistory = [clean, ...searchHistory.filter((c) => c.name !== clean.name)].slice(0, 8);
    saveHistory();
  }

  function removeFromHistory(index) {
    searchHistory = searchHistory.filter((_, i) => i !== index);
    saveHistory();
  }

  function loadFavorites() {
    try {
      const saved = localStorage.getItem('weatherez_favorites');
      return safeStorageParse(saved, []);
    } catch {
      return [];
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem('weatherez_favorites', JSON.stringify(favorites));
    } catch { /* ignore */ }
  }

  function toggleFavorite() {
    const isFav = favorites.some(c => c.name === selectedCity.name);
    if (isFav) {
      favorites = favorites.filter(c => c.name !== selectedCity.name);
      addToast({
        type: 'info',
        title: 'Removed',
        message: `${selectedCity.name} removed from saved locations.`
      });
    } else {
      favorites = [selectedCity, ...favorites];
      addToast({
        type: 'success',
        title: 'Saved',
        message: `${selectedCity.name} pinned to saved locations.`
      });
    }
    saveFavorites();
  }
</script>

<svelte:head>
  <title>Weatherez: Atmospheric Telemetry & Forecasts</title>
  <meta name="description" content="Precision meteorological telemetry engine delivering 24-hour trajectories, solar arcs, and atmospheric sensor analysis." />
</svelte:head>

<AnimatedBackground {weather} />

<Toast {toasts} ondismiss={removeToast} />

<div class="app-layout">
  {#if isLoading}
    <div class="active-progress-bar" aria-label="Loading data"></div>
  {/if}

  <!-- Header -->
  <header class="app-header">
    <div class="brand-group">
      <div class="brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="20" height="20">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 3v18M3 12h18"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>
      <div class="brand-titles">
        <span class="brand-name">WEATHER<span class="brand-suffix">EZ</span></span>
        <span class="brand-sub mono-metric">METEOROLOGICAL TELEMETRY</span>
      </div>
    </div>

    <div class="header-controls">
      <span class="header-date mono-metric">{todayDate}</span>

      <!-- Theme Switcher Button -->
      <button
        class="ctrl-btn"
        onclick={toggleTheme}
        aria-label="Toggle theme: current is {themeMode}"
        title="Theme: {themeMode}"
      >
        {#if themeMode === 'auto'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span class="btn-text">Auto</span>
        {:else if themeMode === 'dark'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span class="btn-text">Dark</span>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span class="btn-text">Light</span>
        {/if}
      </button>

      <!-- Unit Switcher Button -->
      <button class="ctrl-btn unit-btn mono-metric" onclick={toggleUnit} aria-label="Toggle temperature unit">
        <span class="unit-opt" class:active={!useFahrenheit}>C</span>
        <span class="unit-sep">/</span>
        <span class="unit-opt" class:active={useFahrenheit}>F</span>
      </button>
    </div>
  </header>

  <!-- Command / Search Bar -->
  <div class="search-region">
    <div class="panel search-field">
      <button
        class="btn-gps"
        onclick={detectLocation}
        aria-label="Acquire GPS coordinates"
        title="Acquire device GPS location"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <circle cx="12" cy="12" r="10"/>
          <line x1="22" y1="12" x2="18" y2="12"/>
          <line x1="6" y1="12" x2="2" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="2"/>
          <line x1="12" y1="22" x2="12" y2="18"/>
        </svg>
      </button>

      <div class="field-divider"></div>

      {#if isSearching}
        <div class="spinner-icon" aria-hidden="true"></div>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="search-glyph">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      {/if}

      <input
        type="text"
        id="city-search"
        placeholder="Search city, region, or coordinates..."
        value={searchQuery}
        maxlength="64"
        oninput={handleSearchInput}
        onfocus={handleSearchFocus}
        onkeydown={handleSearchKeydown}
        onblur={handleBlur}
        autocomplete="off"
        spellcheck="false"
      />

      {#if searchQuery.length > 0}
        <button
          class="btn-clear"
          onclick={clearSearch}
          aria-label="Clear query"
          title="Clear search text"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      {/if}
    </div>

    <!-- Dropdown list -->
    {#if showDropdown && searchResults.length > 0}
      <ul class="panel search-menu" role="listbox">
        {#if searchQuery.trim().length === 0}
          <li class="menu-heading">Suggested Metros</li>
        {/if}
        {#each searchResults as city, index}
          <li>
            <button
              class="menu-option"
              class:is-selected={index === highlightedIndex}
              onmousedown={() => selectCity(city)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="option-pin">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div class="option-details">
                <span class="option-name">{city.name}</span>
                <span class="option-sub">{city.country}</span>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <!-- Content Workspace -->
  <main class="main-workspace">
    {#if isLoading && !weather}
      <div class="grid-layout">
        <div class="col-primary">
          <SkeletonCard type="main" />
        </div>
        <div class="col-secondary">
          <SkeletonCard type="details" />
          <SkeletonCard type="forecast" />
        </div>
      </div>
    {:else}
      <div class="grid-layout" class:loading-dim={isLoading}>
        <div class="col-primary">
          <WeatherCard
            {weather}
            {useFahrenheit}
            isFavorite={isCityFavorite}
            onToggleFavorite={toggleFavorite}
          />
          <WeatherMap
            lat={selectedCity.lat}
            lon={selectedCity.lon}
            name={selectedCity.name}
          />
          <SearchHistory
            history={searchHistory}
            favorites={favorites}
            onselect={selectCity}
            onremove={removeFromHistory}
            onremoveFavorite={(idx) => {
              favorites = favorites.filter((_, i) => i !== idx);
              saveFavorites();
            }}
          />
        </div>

        <div class="col-secondary">
          <WeatherDetails
            {weather}
            {useFahrenheit}
            {airQuality}
          />
          <ForecastSection
            {forecast}
            {hourly}
            {useFahrenheit}
          />
        </div>
      </div>
    {/if}
  </main>

  <footer class="app-footer">
    <p class="mono-metric">WEATHEREZ CORE V2.4 | OPEN METEOROLOGICAL NETWORK PROTOCOL</p>
  </footer>
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1.25rem 1.5rem;
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
  }

  .active-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--accent-primary);
    animation: scanLine 1s infinite linear;
    z-index: 10000;
  }

  @keyframes scanLine {
    0% { transform: scaleX(0); transform-origin: left; }
    50% { transform: scaleX(1); transform-origin: left; }
    50.1% { transform: scaleX(1); transform-origin: right; }
    100% { transform: scaleX(0); transform-origin: right; }
  }

  .loading-dim {
    opacity: 0.8;
    transition: opacity var(--transition-fast);
  }

  /* Header */
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 1.25rem;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .brand-mark {
    width: 34px;
    height: 34px;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-primary);
  }

  .brand-titles {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .brand-name {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .brand-suffix {
    color: var(--accent-primary);
  }

  .brand-sub {
    font-size: 0.62rem;
    color: var(--text-muted);
    letter-spacing: 0.08em;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .header-date {
    font-size: 0.75rem;
    color: var(--text-muted);
    padding-right: 0.5rem;
  }

  .ctrl-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .ctrl-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-strong);
    background: var(--bg-surface-hover);
  }

  .btn-text {
    font-size: 0.75rem;
  }

  .unit-btn {
    padding: 0.4rem 0.65rem;
    gap: 0.2rem;
  }

  .unit-opt {
    opacity: 0.4;
  }

  .unit-opt.active {
    opacity: 1;
    color: var(--text-primary);
    font-weight: 700;
  }

  .unit-sep {
    color: var(--text-muted);
    opacity: 0.5;
  }

  /* Search Bar */
  .search-region {
    position: relative;
    margin-bottom: 1.25rem;
    z-index: 100;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-md);
  }

  .search-field:focus-within {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 1px var(--accent-primary);
  }

  .btn-gps {
    background: transparent;
    border: none;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.15rem;
    transition: color var(--transition-fast);
  }

  .btn-gps:hover {
    color: var(--accent-primary);
  }

  .field-divider {
    width: 1px;
    height: 18px;
    background: var(--border-subtle);
  }

  .search-glyph {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .spinner-icon {
    width: 15px;
    height: 15px;
    border: 2px solid var(--border-subtle);
    border-top-color: var(--accent-primary);
    border-radius: 50%;
    animation: rotateSpin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes rotateSpin {
    to { transform: rotate(360deg); }
  }

  .search-field input {
    flex: 1;
    background: transparent;
    font-size: 0.88rem;
    color: var(--text-primary);
  }

  .search-field input::placeholder {
    color: var(--text-muted);
  }

  .btn-clear {
    background: transparent;
    border: none;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem;
    transition: color var(--transition-fast);
  }

  .btn-clear:hover {
    color: var(--text-primary);
  }

  /* Dropdown Menu */
  .search-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    border-radius: var(--radius-md);
    overflow: hidden;
    list-style: none;
    box-shadow: var(--shadow-lg);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
  }

  .menu-heading {
    padding: 0.5rem 1rem 0.25rem;
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .menu-option {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.65rem 1rem;
    text-align: left;
    color: var(--text-primary);
    background: transparent;
    transition: background-color var(--transition-fast);
  }

  .menu-option:hover,
  .menu-option.is-selected {
    background: var(--bg-surface-hover);
  }

  .option-pin {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .option-details {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .option-name {
    font-weight: 600;
    font-size: 0.88rem;
  }

  .option-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  /* Grid Layout */
  .main-workspace {
    flex: 1;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  .col-primary {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
  }

  .col-secondary {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
  }

  .app-footer {
    padding: 2.5rem 0 1rem;
    text-align: center;
    font-size: 0.72rem;
    color: var(--text-muted);
    border-top: 1px solid var(--border-subtle);
    margin-top: 2rem;
  }

  @media (max-width: 980px) {
    .grid-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .app-layout { padding: 0.75rem; }
    .header-date { display: none; }
    .btn-text { display: none; }
  }
</style>
