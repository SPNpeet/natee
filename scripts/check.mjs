/**
 * ชุดตรวจเว็บไซต์ ธารนที
 * รันหลัง npm run build เพื่อยืนยันว่าไฟล์ที่จะขึ้นเว็บครบและถูกต้องจริง
 *
 * ใช้งาน  npm run check
 */
import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve('dist')
let pass = 0
let fail = 0

function check(label, ok, detail = '') {
  if (ok) {
    pass++
    console.log(`  ok   ${label}`)
    return
  }
  fail++
  console.log(`  FAIL ${label}${detail ? `\n       ${detail}` : ''}`)
}

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('ไม่พบ dist/index.html ให้สั่ง npm run build ก่อน')
  process.exit(1)
}

const html = readFileSync(resolve(dist, 'index.html'), 'utf-8')

console.log('1. หน้าเว็บที่พรีเรนเดอร์แล้ว')
check('เนื้อหาถูกเรนเดอร์ลงไฟล์ ไม่ใช่หน้าเปล่า', html.includes('<div id="root"><') && html.length > 40000)
check('ฝังไฟล์สไตล์ไว้ในหน้าแล้ว', html.includes('<style>') && !/<link rel="stylesheet"/.test(html))
check('มีหัวข้อหลัก h1 หนึ่งอัน', (html.match(/<h1/g) || []).length === 1)
check('ภาษาเริ่มต้นเป็นไทย', /<html[^>]*lang="th"/.test(html))
check('มีเนื้อหาภาษาไทยในไฟล์แรก', html.includes('รถส่งน้ำประปา'))

console.log('\n2. ข้อมูลสำหรับเครื่องมือค้นหา')
check('มีชื่อหน้า', /<title>[^<]{20,}<\/title>/.test(html))
check('มีคำอธิบายหน้า', /<meta\s+name="description"\s+content="[^"]{80,}"/.test(html))
check('มี canonical', html.includes('rel="canonical"'))
check('มีภาพสำหรับแชร์ลิงก์', html.includes('og:image'))
check('มีไอคอนแท็บเบราว์เซอร์', html.includes('icon-32.png'))

const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
check(`ข้อมูลโครงสร้าง ${blocks.length} ชุด`, blocks.length >= 2)

let types = []
let jsonOk = true
for (const b of blocks) {
  try {
    types.push(JSON.parse(b[1])['@type'])
  } catch (e) {
    jsonOk = false
    check('ข้อมูลโครงสร้างอ่านได้', false, e.message)
  }
}
if (jsonOk) check(`ข้อมูลโครงสร้างอ่านได้ทุกชุด (${types.join(', ')})`, true)
check('มี LocalBusiness', types.includes('LocalBusiness'))
check('มี FAQPage', types.includes('FAQPage'))

console.log('\n3. ไฟล์ที่ต้องมีจริง')
const need = [
  'robots.txt',
  'sitemap.xml',
  '404.html',
  'images/logo.png',
  'images/icon-32.png',
  'images/icon-180.png',
  'images/og-banner.jpg',
  'images/line-qr.jpg',
  'images/truck-6wheel.jpg',
  'images/truck-4wheel.jpg',
  'fonts/ibm-plex-sans-thai-400-thai.woff2',
  'fonts/ibm-plex-sans-thai-700-thai.woff2',
]
const missing = need.filter((f) => !existsSync(resolve(dist, f)))
check(`ไฟล์หลัก ${need.length} รายการอยู่ครบ`, missing.length === 0, missing.join(', '))

const photos = Array.from({ length: 12 }, (_, i) => `work-${String(i + 1).padStart(2, '0')}`)
const photoMissing = photos.flatMap((n) =>
  [`images/${n}.jpg`, `images/${n}-sm.jpg`].filter((f) => !existsSync(resolve(dist, f)))
)
check('รูปผลงาน 12 รูปพร้อมไฟล์ย่อครบ', photoMissing.length === 0, photoMissing.join(', '))

const clips = ['work-video-01', 'work-video-02', 'work-video-03', 'work-video-04']
const clipMissing = clips.flatMap((n) =>
  [`videos/${n}.mp4`, `images/${n}-poster.jpg`].filter((f) => !existsSync(resolve(dist, f)))
)
check('คลิปหน้างาน 4 คลิปพร้อมภาพหน้าปกครบ', clipMissing.length === 0, clipMissing.join(', '))

const heavy = clips
  .map((n) => ({ n, mb: statSync(resolve(dist, `videos/${n}.mp4`)).size / 1048576 }))
  .filter((v) => v.mb > 3)
check('ไม่มีคลิปไหนใหญ่เกิน 3 MB', heavy.length === 0, heavy.map((v) => `${v.n} ${v.mb.toFixed(1)} MB`).join(', '))

console.log('\n4. ลิงก์ในหน้าเว็บ')
const srcs = [...html.matchAll(/(?:src|href)="(?!http|#|mailto:|tel:|data:)([^"]+)"/g)].map((m) => m[1])
const broken = [...new Set(srcs)]
  .map((u) => u.replace(/^\.\//, '').replace(/^\//, ''))
  .filter((u) => u && !u.startsWith('assets/') && !existsSync(resolve(dist, u)))
check('ไม่มีลิงก์ไฟล์ที่ชี้ไปยังของที่ไม่มีอยู่', broken.length === 0, broken.join(', '))

console.log('\n5. เนื้อหาสองภาษา')
const data = readFileSync(resolve('src/data.js'), 'utf-8')
const thKeys = [...data.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1])
const half = thKeys.length / 2
check('มีเนื้อหาทั้งก้อนไทยและก้อนอังกฤษ', data.includes('  th: {') && data.includes('  en: {'))
check('จำนวนหัวข้อของสองภาษาเท่ากัน', thKeys.slice(0, half).join() === thKeys.slice(half).join(),
  'ถ้าไม่เท่ากันแปลว่ามีบางหัวข้อที่ยังไม่ได้แปล')

const jsFile = html.match(/src="([^"]+\.js)"/)
if (jsFile) {
  const jsPath = resolve(dist, jsFile[1].replace(/^\.\//, ''))
  if (existsSync(jsPath)) {
    const js = readFileSync(jsPath, 'utf-8')
    check('ข้อความภาษาอังกฤษถูกรวมไว้ในไฟล์แล้ว', js.includes('Water truck delivery in Chiang Mai'))
    check('ข้อความภาษาไทยถูกรวมไว้ในไฟล์แล้ว', js.includes('รถส่งน้ำประปา'))
  }
}

console.log('\n6. ขนาดที่ผู้เข้าชมต้องโหลด')
const htmlKb = Buffer.byteLength(html) / 1024
check(`หน้าแรกรวมสไตล์ ${htmlKb.toFixed(0)} KB ไม่เกิน 150 KB`, htmlKb < 150)

console.log(`\nผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`)
process.exit(fail > 0 ? 1 : 0)
