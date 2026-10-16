import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import psiHandler from './api/psi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Serverless API Endpoints
  app.get('/api/health', healthHandler);
  app.get('/api/psi', psiHandler);

  if (!isProd) {
    // In development, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built Vite static assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SG AirWatch] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[SG AirWatch] Live PSI Endpoint: http://0.0.0.0:${PORT}/api/psi`);
    console.log(`[SG AirWatch] Health Check: http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer();
