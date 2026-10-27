import sql from '@/lib/db';
import { DEFAULT_SETTINGS } from '@/lib/defaultSettings.mjs';

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : override;
  }

  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in merged ? mergeDeep(merged[key], value) : value;
  }
  return merged;
}

export async function getAllSettings() {
  let rows = [];
  try {
    rows = await sql`SELECT key, value FROM site_settings ORDER BY key ASC`;
  } catch (error) {
    console.error('Failed to load site settings, using defaults:', error.message);
  }

  const settings = mergeDeep(DEFAULT_SETTINGS, {});

  for (const row of rows) {
    if (row.key in settings) {
      settings[row.key] = mergeDeep(settings[row.key], row.value);
    } else {
      settings[row.key] = row.value;
    }
  }

  // Ensure policy texts fallback to rich defaults if empty in DB
  if (settings.policies) {
    for (const [pKey, pVal] of Object.entries(DEFAULT_SETTINGS.policies || {})) {
      if (!settings.policies[pKey] || !String(settings.policies[pKey]).trim()) {
        settings.policies[pKey] = pVal;
      }
    }
  }

  return settings;
}

export async function getSetting(key) {
  const settings = await getAllSettings();
  return settings[key] ?? DEFAULT_SETTINGS[key];
}

export async function saveSetting(key, value) {
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}
