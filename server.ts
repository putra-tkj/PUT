import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('Starting server...');

  let vite: any;
  if (process.env.NODE_ENV !== 'production') {
    try {
      vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware loaded');
    } catch (err) {
      console.error('Vite failed to start:', err);
    }
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  // Health check API
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // Fallback handler untuk SPA
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    // Jangan handle file aset (css, js, gambar) yang mungkin terlewat di middleware
    if (url.includes('.') && !url.includes('.html')) {
      return next();
    }

    try {
      let template;
      if (process.env.NODE_ENV !== 'production' && vite) {
        const indexPath = path.resolve(__dirname, 'index.html');
        if (!fs.existsSync(indexPath)) {
          return res.status(500).send('index.html not found in root');
        }
        template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        const indexPath = path.resolve(__dirname, 'dist', 'index.html');
        if (!fs.existsSync(indexPath)) {
          return res.status(500).send('dist/index.html not found. Run build first.');
        }
        template = fs.readFileSync(indexPath, 'utf-8');
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      console.error('Fallback error:', e);
      if (process.env.NODE_ENV !== 'production' && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
