import {defineConfig} from 'vite'
export default defineConfig({
  build:{ssr:'worker/index.mjs',outDir:'node-build',rollupOptions:{output:{entryFileNames:'worker.mjs'}}},
  ssr:{noExternal:true},
})
