import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mode Pengembangan
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Gunakan middleware vite. Ini akan menangani static assets DAN index.html (karena appType: 'spa')
    app.use(vite.middlewares);
    
    console.log('Dev server running with standard Vite SPA middleware');
  } else {
    // Mode Produksi
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production server running');
  }

  // Health Check API (Taruh di bawah jika ingin didelegasikan, tapi biasanya rute API di atas)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Startup error:', err);
});
