/**
 * สร้างหน้าพาไปโดเมนจริง สำหรับสำเนาเก่าบน GitHub Pages
 *
 * เว็บจริงอยู่บน Cloudflare ที่โดเมนของลูกค้าแล้ว สำเนาบน GitHub Pages จึงไม่ควรมีเนื้อหาของตัวเอง
 * ไม่งั้นจะมีเว็บสองชุดที่ค่อย ๆ ไม่ตรงกัน ทุกที่อยู่เดิมจะพาไปหน้าเดียวกันบนโดเมนจริง
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { siteConfig } from './site-config.mjs'

const { site } = siteConfig()
const out = 'pages-redirect'
mkdirSync(out, { recursive: true })

const page = (target) => `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${target}">
<title>ธารนที ย้ายไปที่เว็บไซต์หลักแล้ว</title>
</head>
<body>
<p>เว็บไซต์ย้ายไปที่ <a href="${target}">${target}</a></p>
</body>
</html>
`

for (const [file, path] of [['index.html', '/'], ['en.html', '/en.html'], ['knowledge.html', '/knowledge.html'], ['knowledge-en.html', '/knowledge-en.html']]) {
  writeFileSync(`${out}/${file}`, page(site + path))
}

// ที่อยู่อื่นที่ไม่มีบน GitHub Pages ตัดชื่อโฟลเดอร์ของ repo ออกแล้วพาไปที่อยู่เดียวกันบนโดเมนจริง
writeFileSync(`${out}/404.html`, page(site + '/').replace('</head>',
  `<script>location.replace(${JSON.stringify(site + '/')} + location.pathname.split('/').slice(2).join('/') + location.search + location.hash)</script>\n</head>`))

console.log('สร้างหน้าพาไป ' + site + ' แล้ว')
