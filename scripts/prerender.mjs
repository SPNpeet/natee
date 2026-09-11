import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { render } from '../server-build/entry-server.js'
import * as content from '../src/data.js'
import { renderPage, sitemap } from '../worker/render-page.mjs'
import { siteConfig } from './site-config.mjs'

const { site, basePath } = siteConfig()
const dist = resolve('dist')
let template = readFileSync(resolve(dist, 'index.html'), 'utf8')
const css = template.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/)
if (css) {
  const text = readFileSync(resolve(dist, css[1].replace(/^\.\//, '')), 'utf8').replaceAll('url(../fonts/', 'url(fonts/')
  template = template.replace(css[0], '<style>' + text + '</style>')
}
mkdirSync('server-build', { recursive: true })
writeFileSync('server-build/seed.json', JSON.stringify(content))
writeFileSync('server-build/build.json', JSON.stringify({ id: createHash('sha256').update(template).digest('hex') }))
writeFileSync(resolve(dist, '__shell.html'), template)
const pages = [['th', 'index.html', 'home'], ['en', 'en.html', 'home'], ['th', 'knowledge.html', 'knowledge'], ['en', 'knowledge-en.html', 'knowledge']]
for (const [lang, file, page] of pages) {
  writeFileSync(resolve(dist, file), renderPage(template, render, content, lang, site, page))
  console.log('Prerendered ' + file)
}
writeFileSync(resolve(dist, 'robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ' + site + '/sitemap.xml\n')
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap(site))
writeFileSync(resolve(dist, '404.html'), readFileSync(resolve(dist, '404.html'), 'utf8').replaceAll('__BASE_PATH__', basePath))
