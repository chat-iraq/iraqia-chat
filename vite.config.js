import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
  },
  server: {
    port: 4173,
    open: false,
  },
})