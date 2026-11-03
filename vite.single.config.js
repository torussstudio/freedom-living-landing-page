import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
// Review-only build: everything inlined into one HTML file (dist-single/index.html)
export default defineConfig({ plugins: [react(), viteSingleFile()], build: { outDir: 'dist-single', assetsInlineLimit: 100000000 } })
