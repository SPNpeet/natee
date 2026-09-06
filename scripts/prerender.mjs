import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dist = resolve('dist')
const serverEntry = pathToFileURL(resolve(dist, 'server/entry-server.js')).href
const { render } = await import(serverEntry)
const html = render()
const indexPath = resolve(dist, 'index.html')
const template = readFileSync(indexPath, 'utf-8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('root marker not found in dist/index.html')
let out = template.replace(marker, `<div id="root">${html}</div>`)
const cssLink = out.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/)
if (cssLink) {
  const cssPath = resolve(dist, cssLink[1].replace(/^\.\//, ''))
  const css = readFileSync(cssPath, 'utf-8').replaceAll('url(../fonts/', 'url(/fonts/')
  out = out.replace(cssLink[0], `<style>${css}</style>`)
}
writeFileSync(indexPath, out)
rmSync(resolve(dist, 'server'), { recursive: true, force: true })
console.log('prerendered index.html', html.length, 'chars')
