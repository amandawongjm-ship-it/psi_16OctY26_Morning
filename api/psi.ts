import type { Request, Response } from 'express';

const PSI_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

// In-memory cache to respect data.gov.sg rate limits and provide fast responses
let cachedData: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 25 * 1000; // 25 seconds cache

/**
 * Fetches live PSI data from data.gov.sg without requiring an API key.
 */
export async function fetchGovPsiData() {
  const now = Date.now();
  if (cachedData && now - lastCacheTime < CACHE_TTL_MS) {
    return { data: cachedData, cached: true, timestamp: new Date(lastCacheTime).toISOString() };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(PSI_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SGAirWatch/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data.gov.sg responded with HTTP status ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    // Verify response structure
    if (!json || json.code !== 0 || !json.data) {
      throw new Error('Unexpected payload format from data.gov.sg API');
    }

    // Enhance payload with national aggregated calculation if missing
    if (json.data.items && json.data.items.length > 0) {
      json.data.items.forEach((item: any) => {
        if (item.readings?.psi_twenty_four_hourly) {
          const psiObj = item.readings.psi_twenty_four_hourly;
          if (!psiObj.national) {
            const vals = [psiObj.north, psiObj.south, psiObj.east, psiObj.west, psiObj.central].filter(
              (v) => typeof v === 'number'
            );
            if (vals.length > 0) {
              psiObj.national = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            }
          }
        }
      });
    }

    cachedData = json;
    lastCacheTime = now;

    return { data: json, cached: false, timestamp: new Date().toISOString() };
  } catch (err: any) {
    clearTimeout(timeoutId);

    // If cache exists, return stale cache gracefully on network failure
    if (cachedData) {
      console.warn('[PSI API] Upstream fetch failed, returning stale cache:', err.message);
      return { data: cachedData, cached: true, stale: true, timestamp: new Date(lastCacheTime).toISOString() };
    }

    throw err;
  }
}

/**
 * Serverless / Express handler for PSI real-time air quality data
 * Route: GET /api/psi
 * Endpoint: https://api-open.data.gov.sg/v2/real-time/api/psi
 */
export default async function handler(req: Request | any, res: Response | any) {
  // Set CORS headers
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await fetchGovPsiData();
    return res.status(200).json({
      status: 'success',
      source: PSI_ENDPOINT,
      cached: result.cached,
      stale: (result as any).stale || false,
      timestamp: result.timestamp,
      data: result.data.data,
      code: result.data.code,
    });
  } catch (error: any) {
    console.error('[PSI API Error]:', error);
    return res.status(502).json({
      status: 'error',
      message: 'Failed to fetch live PSI data from data.gov.sg upstream',
      details: error.message || String(error),
      source: PSI_ENDPOINT,
      timestamp: new Date().toISOString(),
    });
  }
}
