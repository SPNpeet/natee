import {defineConfig} from 'vite'
import {writeFileSync} from 'node:fs'
export default defineConfig({
  plugins:[{name:'node-deployment-marker',closeBundle(){writeFileSync('node-build/deployment.json',JSON.stringify({commit:process.env.GITHUB_SHA||'unversioned'}))}}],
  build:{ssr:'worker/index.mjs',outDir:'node-build',rollupOptions:{output:{entryFileNames:'worker.mjs'}}},
  ssr:{noExternal:true},
})
