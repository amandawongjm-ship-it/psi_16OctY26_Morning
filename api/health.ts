import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  service: string;
  upstreamTarget: string;
  memoryUsageMb?: number;
}

const startTime = Date.now();

/**
 * Serverless / Express handler for health checks
 * Route: GET /api/health
 */
export default async function handler(req: Request | any, res: Response | any) {
  // Enable CORS
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const memory = process.memoryUsage ? Math.round(process.memoryUsage().heapUsed / 1024 / 1024) : undefined;

  const payload: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    service: 'SG AirWatch - PSI Serverless Gateway',
    upstreamTarget: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
    memoryUsageMb: memory,
  };

  return res.status(200).json(payload);
}
