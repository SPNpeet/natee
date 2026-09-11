/**
 * ชุดตรวจเว็บไซต์ ธารนที
 * รันหลัง npm run build เพื่อยืนยันว่าไฟล์ที่จะขึ้นเว็บครบและถูกต้องจริง
 *
 * ใช้งาน  npm run check
 */
import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { siteConfig } from './site-config.mjs'
const { site: SITE, basePath } = siteConfig()

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
  'en.html',
  'knowledge.html',
  'knowledge-en.html',
  'images/logo.webp',
  'images/icon-32.png',
  'images/icon-180.png',
  'images/og-banner.jpg',
  'images/line-qr.webp',
  'images/truck-6wheel.webp',
  'images/truck-4wheel.webp',
  'fonts/ibm-plex-sans-thai-400-thai.woff2',
  'fonts/ibm-plex-sans-thai-700-thai.woff2',
]
const missing = need.filter((f) => !existsSync(resolve(dist, f)))
check(`ไฟล์หลัก ${need.length} รายการอยู่ครบ`, missing.length === 0, missing.join(', '))

const photos = Array.from({ length: 12 }, (_, i) => `work-${String(i + 1).padStart(2, '0')}`)
const photoMissing = photos.flatMap((n) =>
  [`images/${n}.webp`, `images/${n}-sm.webp`].filter((f) => !existsSync(resolve(dist, f)))
)
check('รูปผลงาน 12 รูปพร้อมไฟล์ย่อครบ', photoMissing.length === 0, photoMissing.join(', '))

const clips = ['work-video-01', 'work-video-02', 'work-video-03', 'work-video-04']
const clipMissing = clips.flatMap((n) =>
  [`videos/${n}.mp4`, `images/${n}-poster.webp`].filter((f) => !existsSync(resolve(dist, f)))
)
check('คลิปหน้างาน 4 คลิปพร้อมภาพหน้าปกครบ', clipMissing.length === 0, clipMissing.join(', '))

const heavy = clips
  .filter((n) => existsSync(resolve(dist, `videos/${n}.mp4`)))
  .map((n) => ({ n, mb: statSync(resolve(dist, `videos/${n}.mp4`)).size / 1048576 }))
  .filter((v) => v.mb > 3)
check('ไม่มีคลิปไหนใหญ่เกิน 3 MB', heavy.length === 0, heavy.map((v) => `${v.n} ${v.mb.toFixed(1)} MB`).join(', '))

console.log('\n4. ลิงก์ในทุกหน้าของเว็บ')
const pageFiles = ['index.html', 'en.html', 'knowledge.html', 'knowledge-en.html']
const pages = Object.fromEntries(pageFiles.map((f) => [f, readFileSync(resolve(dist, f), 'utf-8')]))

const absolute = pageFiles.flatMap((f) =>
  [...pages[f].matchAll(/(?:src|href)="(\/[^/][^"]*)"/g)].map((m) => `${f} ${m[1]}`))
check(`ไม่มีลิงก์ที่ขึ้นต้นด้วยขีดทับ ทั้ง ${pageFiles.length} หน้า`, absolute.length === 0,
  `เส้นทางแบบนี้จะพังเมื่อเว็บอยู่ใต้โฟลเดอร์ย่อย เช่น ${absolute.slice(0, 3).join(', ')}`)

const cssFonts = [...html.matchAll(/url\((\/?[^)]*fonts[^)]*)\)/g)].map((m) => m[1])
check('เส้นทางฟอนต์ในสไตล์เป็นแบบสัมพัทธ์', cssFonts.length > 0 && cssFonts.every((u) => !u.startsWith('/')),
  cssFonts.filter((u) => u.startsWith('/')).join(', '))

const broken = pageFiles.flatMap((f) => {
  const srcs = [...pages[f].matchAll(/(?:src|href)="(?!http|#|mailto:|tel:|data:)([^"]+)"/g)].map((m) => m[1])
  return [...new Set(srcs)]
    .map((u) => u.replace(/^\.\//, '').replace(/^\//, ''))
    .filter((u) => u && !existsSync(resolve(dist, u.split(/[?#]/)[0])))
    .map((u) => `${f} -> ${u}`)
})
check(`ไม่มีลิงก์ไฟล์ที่ชี้ไปยังของที่ไม่มีอยู่ ทั้ง ${pageFiles.length} หน้า`, broken.length === 0, broken.join(', '))

console.log('\n5. เนื้อหาสองภาษา')
const en = readFileSync(resolve(dist, 'en.html'), 'utf-8')
check('หน้าอังกฤษถูกพรีเรนเดอร์แยกไฟล์', en.includes('Water truck delivery in Chiang Mai'))
check('หน้าอังกฤษตั้งภาษาเป็น en', /<html[^>]*lang="en"/.test(en))
check('หน้าอังกฤษมี canonical ของตัวเอง', /rel="canonical" href="[^"]*en\.html"/.test(en))
check('ทั้งสองหน้าผูก hreflang ถึงกัน',
  /hreflang="en"/.test(html) && /hreflang="th"/.test(en) && /hreflang="x-default"/.test(html))
check('ปุ่มสลับภาษาเป็นลิงก์ที่เครื่องมือค้นหาตามได้',
  html.includes('href="en.html"') && en.includes('href="index.html"'))

const enBlocks = [...en.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
let enOk = true
for (const b of enBlocks) { try { JSON.parse(b[1]) } catch { enOk = false } }
check(`ข้อมูลโครงสร้างหน้าอังกฤษ ${enBlocks.length} ชุด อ่านได้ทุกชุด`, enOk && enBlocks.length >= 2)
check('ข้อมูลโครงสร้างไม่ซ้ำซ้อน', blocks.length === 6, `พบ ${blocks.length} ชุด ควรมี 6 ชุด`)

const data = readFileSync(resolve('src/data.js'), 'utf-8')
const thKeys = [...data.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1])
const half = thKeys.length / 2
check('มีเนื้อหาทั้งก้อนไทยและก้อนอังกฤษ', data.includes('  th: {') && data.includes('  en: {'))
check('จำนวนหัวข้อของสองภาษาเท่ากัน', thKeys.slice(0, half).join() === thKeys.slice(half).join(),
  'ถ้าไม่เท่ากันแปลว่ามีบางหัวข้อที่ยังไม่ได้แปล')

check('canonical ตรงกับ SITE_URL', html.includes(`rel="canonical" href="${SITE}/"`))
check('sitemap และ robots ตรงกับ SITE_URL',
  readFileSync(resolve(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${SITE}/en.html</loc>`) &&
  readFileSync(resolve(dist, 'robots.txt'), 'utf8').includes(`Sitemap: ${SITE}/sitemap.xml`))
check('หน้า 404 กลับรากของเว็บที่กำหนดไว้',
  readFileSync(resolve(dist, '404.html'), 'utf8').includes(`href="${basePath}"`))
const jsPaths = [...new Set([...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map(m => m[1]))]
check('มีไฟล์ JavaScript สำหรับปุ่มโต้ตอบ', jsPaths.length > 0)
const missingJs = jsPaths.filter(p => !existsSync(resolve(dist,p.replace(/^\.\//,''))))
check('ไฟล์ JavaScript และ shared chunks อยู่ครบ', missingJs.length === 0, missingJs.join(', '))
if (missingJs.length === 0) {
  const js = jsPaths.map(p => readFileSync(resolve(dist,p.replace(/^\.\//,'')),'utf8')).join('\n')
  check('ข้อความภาษาอังกฤษถูกรวมไว้ในไฟล์แล้ว', js.includes('Water truck delivery in Chiang Mai'))
  check('ข้อความภาษาไทยถูกรวมไว้ในไฟล์แล้ว', js.includes('รถส่งน้ำประปา'))
  check('JavaScript ของหน้าสาธารณะไม่เกิน 150 KB', Buffer.byteLength(js)/1024 < 150)
}

const dataSrc = readFileSync(resolve('src/data.js'), 'utf-8')
const ratingInPage = /aggregateRating/.test(html)
const ratingInData = /rating:\s*([0-9.]+)/.exec(dataSrc)
const countInData = /count:\s*([0-9]+)/.exec(dataSrc)
const hasReal = Number(ratingInData?.[1] || 0) > 0 && Number(countInData?.[1] || 0) > 0
check('คะแนนรีวิวขึ้นเว็บก็ต่อเมื่อตั้งค่าคะแนนและจำนวนมากกว่า 0', ratingInPage === hasReal,
  'ค่าที่เรนเดอร์ไม่ตรงกับข้อมูลตั้งต้น ต้องให้ลูกค้ายืนยันความถูกต้องของคะแนนจริง')
check('ฟอร์มแสดงตามค่าเปิดใช้งาน',
  html.includes('<form') === /enabled:\s*true/.test(dataSrc))

console.log('\n6. หน้าความรู้เรื่องน้ำ')
const kth = pages['knowledge.html']
const ken = pages['knowledge-en.html']

check('หน้าความรู้ถูกเรนเดอร์ลงไฟล์จริง',
  kth.includes('ความสำคัญของน้ำประปา') && ken.includes('Why a piped water supply matters'))
check('หน้าความรู้มีหัวข้อหลักอันเดียว',
  (kth.match(/<h1/g) || []).length === 1 && (ken.match(/<h1/g) || []).length === 1)
check('หน้าความรู้ตั้งภาษาถูกทั้งสองหน้า',
  /<html[^>]*lang="th"/.test(kth) && /<html[^>]*lang="en"/.test(ken))
// ถ้าไม่มีป้ายนี้ สคริปต์ฝั่งเบราว์เซอร์จะวาดหน้าแรกทับบทความทันทีที่โหลดเสร็จ
check('หน้าความรู้บอกชนิดหน้าให้สคริปต์ฝั่งเบราว์เซอร์',
  /<html[^>]*data-page="knowledge"/.test(kth) && /<html[^>]*data-page="home"/.test(html))
check('หน้าความรู้มี canonical ของตัวเอง',
  /rel="canonical" href="[^"]*\/knowledge\.html"/.test(kth) && /rel="canonical" href="[^"]*\/knowledge-en\.html"/.test(ken))
check('หน้าความรู้สองภาษาผูก hreflang ถึงกันเอง ไม่ชี้กลับหน้าแรก',
  /hreflang="en" href="[^"]*knowledge-en\.html"/.test(kth) && /hreflang="th" href="[^"]*knowledge\.html"/.test(ken))
check('ปุ่มสลับภาษาในหน้าความรู้อยู่หน้าเดิม ไม่เด้งกลับหน้าแรก',
  kth.includes('href="knowledge-en.html"') && ken.includes('href="knowledge.html"'))

const kBlocks = [...kth.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
let kTypes = []
let kOk = true
for (const b of kBlocks) {
  try { kTypes.push(JSON.parse(b[1])['@type']) } catch { kOk = false }
}
check(`ข้อมูลโครงสร้างหน้าความรู้อ่านได้ (${kTypes.join(', ')})`,
  kOk && kTypes.includes('Article') && kTypes.includes('BreadcrumbList'))
check('หน้าความรู้ไม่มีข้อมูลของหน้าแรกติดมา',
  !kTypes.includes('FAQPage') && !kTypes.includes('VideoObject'))
check('หน้าแรกกับหน้าความรู้ลิงก์ถึงกันสองทาง',
  html.includes('href="knowledge.html"') && kth.includes('href="index.html"'))

const articleImages = (page) => [...page.matchAll(/<img[^>]*class="natee-article-img"[^>]*>/g)].map((m) => m[0])
const imgsOk = (page) => {
  const imgs = articleImages(page)
  return imgs.length >= 6 && imgs.every((tag) => /alt="[^"]{8,}"/.test(tag) && /width="[0-9]+"/.test(tag))
}
check(`หน้าความรู้มีรูปประกอบ ${articleImages(kth).length} รูป พร้อมคำอธิบายรูปครบทั้งสองภาษา`,
  imgsOk(kth) && imgsOk(ken))

const sitemapXml = readFileSync(resolve(dist, 'sitemap.xml'), 'utf-8')
check('แผนผังเว็บมีครบทุกหน้า',
  pageFiles.every((f) => f === 'index.html' || sitemapXml.includes(`/${f}<`)))

console.log('\n7. พื้นที่ให้บริการ')
check('มีลำพูนในพื้นที่ให้บริการทั้งสองภาษา',
  html.includes('จังหวัดลำพูน') && en.includes('Lamphun province'))
check('ลำพูนถูกส่งให้ Google ในข้อมูลพื้นที่บริการด้วย',
  blocks.some((b) => b[1].includes('จังหวัดลำพูน')))

console.log('\n8. จุดที่เคยพลาดมาแล้ว')

// คำบรรยายใต้คลิปเป็นตัวหนังสือสีขาวทับภาพหน้าปก
// เคยใช้เงาจางเกินไป วัดจริงจากพิกเซลได้แค่ 2.27 ต่อ 1 ซึ่งอ่านไม่ออก
const overlay = html.match(/\.natee-video-caption\{[^}]*?linear-gradient\(([^;]*?)\)[;}]/)
const stops = overlay
  ? [...overlay[1].matchAll(/(#[0-9a-f]{6,8}|rgba?\([^)]*\))\s*([0-9.]+)%/gi)].map((m) => ({
      // สไตล์ที่ถูกย่อแล้วเขียนความทึบเป็นเลขฐานสิบหกสองหลักท้ายรหัสสี
      alpha: m[1].startsWith('#')
        ? (m[1].length >= 9 ? parseInt(m[1].slice(7, 9), 16) / 255 : 1)
        : Number((m[1].match(/[0-9.]+/g) || [])[3] ?? 1),
      pos: Number(m[2]),
    }))
  : []

// วัดจากปลายด้านที่โปร่งใสเสมอ เครื่องมือย่อไฟล์สลับทิศทางไล่สีได้
const ordered = stops.length > 1 && stops[0].alpha > stops[stops.length - 1].alpha
  ? stops.map((s) => ({ alpha: s.alpha, pos: 100 - s.pos })).toReversed()
  : stops
const solidEarly = ordered.some((s) => s.pos <= 30 && s.alpha >= 0.85)
check('เงาใต้คลิปเข้มพอตลอดแถวตัวหนังสือ', solidEarly,
  'เงาต้องทึบตั้งแต่หนึ่งในสามแรก ถ้าเข้มเฉพาะขอบล่าง คำบรรยายจะอ่านไม่ออกบนภาพหน้าปกที่สว่าง')

// ร้านส่งน้ำประปาสำหรับงานอุปโภค ไม่ได้ขายน้ำดื่ม คำอ้างเรื่องคุณภาพที่ไม่มีหลักฐานต้องไม่กลับมาบนหน้าเว็บ
const claims = ['ไร้สิ่งเจือปน', 'ผ่านมาตรฐาน', 'ใช้อุปโภคได้ทุกกรณี', 'นำมาบริโภคได้', 'free of contaminants', 'meets the standard', 'can be used for drinking', 'safe to drink']
const claimsFound = pageFiles.flatMap((f) => claims.filter((w) => pages[f].toLowerCase().includes(w.toLowerCase())).map((w) => `${f}: ${w}`))
check('ไม่มีคำอ้างเรื่องคุณภาพน้ำที่ไม่มีหลักฐานรองรับ', claimsFound.length === 0, claimsFound.join(', '))

console.log('\n9. ขนาดที่ผู้เข้าชมต้องโหลด')
const biggest = pageFiles
  .map((f) => ({ f, kb: Buffer.byteLength(pages[f]) / 1024 }))
  .toSorted((a, b) => b.kb - a.kb)[0]
check(`หน้าที่หนักที่สุด ${biggest.f} รวมสไตล์ ${biggest.kb.toFixed(0)} KB ไม่เกิน 250 KB`, biggest.kb < 250)

console.log(`\nผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`)
process.exit(fail > 0 ? 1 : 0)
