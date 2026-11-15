import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';

function addCloudIsolationHeaders(req, res, next) {
  const pathname = req.url?.split('?')[0];
  if (pathname === '/cloud' || pathname === '/cloud/') {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  }
  next();
}

const cloudIsolationPlugin = {
  name: 'solaris-cloud-isolation',
  configureServer(server) {
    server.middlewares.use(addCloudIsolationHeaders);
  },
  configurePreviewServer(server) {
    server.middlewares.use(addCloudIsolationHeaders);
  },
};

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [cloudIsolationPlugin, VueDevTools(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
