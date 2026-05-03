import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        aiMl: resolve(__dirname, 'ai-ml.html'),
        cloudDevops: resolve(__dirname, 'cloud-devops.html'),
        contact: resolve(__dirname, 'contact.html'),
        mobileApps: resolve(__dirname, 'mobile-apps.html'),
        process: resolve(__dirname, 'process.html'),
        webDevelopment: resolve(__dirname, 'web-development.html'),
        testimonials: resolve(__dirname, 'testimonials.html')
      }
    }
  },
  allowedHosts: 'True',
  server: {
    port: 5173,
    open: true,
  },
});