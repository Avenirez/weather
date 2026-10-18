/**
 * Client Security & Validation Utility
 * Mitigates DOM XSS, Prototype Pollution, Parameter Injection, and Malformed Storage Payloads.
 */

/**
 * Escapes characters that have HTML markup significance.
 * Prevents DOM-based Cross-Site Scripting (XSS).
 */
export function escapeHtml(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates latitude and longitude ranges.
 * Latitude must be between -90 and 90.
 * Longitude must be between -180 and 180.
 */
export function validateCoordinates(lat, lon) {
  const numLat = Number(lat);
  const numLon = Number(lon);

  if (!Number.isFinite(numLat) || !Number.isFinite(numLon)) {
    return { valid: false, lat: 0, lon: 0 };
  }

  const clampedLat = Math.max(-90, Math.min(90, numLat));
  const clampedLon = Math.max(-180, Math.min(180, numLon));

  return { valid: true, lat: clampedLat, lon: clampedLon };
}

/**
 * Sanitizes search input.
 * Enforces maximum length, removes non-printable control characters.
 */
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';
  return query
    .slice(0, 64)
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validates and sanitizes a city telemetry object.
 * Strips dangerous prototype keys and validates coordinates.
 */
export function sanitizeCityRecord(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }

  // Reject prototype pollution keys
  if ('__proto__' in input || 'constructor' in input || 'prototype' in input) {
    return null;
  }

  const rawName = typeof input.name === 'string' ? input.name : 'Unknown Location';
  const rawCountry = typeof input.country === 'string' ? input.country : 'Unknown Region';

  const cleanName = escapeHtml(rawName.slice(0, 80));
  const cleanCountry = escapeHtml(rawCountry.slice(0, 80));

  const coords = validateCoordinates(input.lat, input.lon);
  if (!coords.valid) {
    return null;
  }

  return {
    name: cleanName,
    country: cleanCountry,
    lat: coords.lat,
    lon: coords.lon,
    tz: typeof input.tz === 'number' ? input.tz : 0
  };
}

/**
 * Safely parses JSON from localStorage.
 * Defends against prototype pollution and malformed arrays.
 */
export function safeStorageParse(rawJson, fallback = []) {
  if (!rawJson || typeof rawJson !== 'string') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawJson, (key, value) => {
      // Prototype pollution mitigation
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });

    if (!Array.isArray(parsed)) {
      return fallback;
    }

    // Filter and sanitize each city record
    return parsed
      .map(item => sanitizeCityRecord(item))
      .filter(item => item !== null)
      .slice(0, 10);
  } catch {
    return fallback;
  }
}
