import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { comlink } from 'vite-plugin-comlink'
import glslify from 'rollup-plugin-glslify'

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  root: resolve('src/renderer'),
  resolve: {
    alias: {
      '@src': resolve('src/renderer/src'),
      '@lib': resolve('src/renderer/lib'),
    }
  },
  build: {
    outDir: resolve('out/web')
  },
  plugins: [
    react(),
    comlink(),
    glslify({
      compress: false,
      // @ts-ignore - glslify options are not typed
      transform: ['glslify-import']
    }),
  ],
  worker: {
    format: 'es',
    plugins: () => [
      comlink(),
      glslify({
        compress: false,
        // @ts-ignore - glslify options are not typed
        transform: ['glslify-import']
      }),
    ]
  }
})
