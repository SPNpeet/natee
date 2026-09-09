import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
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
writeFileSync(resolve(dist, '__shell.html'), template)
for (const [lang, file] of [['th', 'index.html'], ['en', 'en.html']]) {
  writeFileSync(resolve(dist, file), renderPage(template, render, content, lang, site))
  console.log('Prerendered ' + file)
}
writeFileSync(resolve(dist, 'robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ' + site + '/sitemap.xml\n')
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap(site))
writeFileSync(resolve(dist, '404.html'), readFileSync(resolve(dist, '404.html'), 'utf8').replaceAll('__BASE_PATH__', basePath))
