/**
 * พรีเรนเดอร์หน้าเว็บเป็นไฟล์ HTML
 *
 * สร้างสองหน้า คือ index.html ภาษาไทย และ en.html ภาษาอังกฤษ
 * วางไว้ระดับเดียวกันจึงอ้างไฟล์รูปและฟอนต์แบบสัมพัทธ์ชุดเดียวกันได้
 *
 * ข้อมูลสำหรับ Google ทั้งหมดสร้างจาก src/data.js แหล่งเดียว
 * จะได้ไม่มีปัญหาแก้เนื้อหาที่หนึ่งแล้วอีกที่หนึ่งค้างเป็นข้อมูลเก่า
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'

const SITE = 'https://xn--22cki0cqma4cdedf2ixczace9c1mmc1fh6g.com'

const dist = resolve('dist')
const serverEntry = pathToFileURL(resolve(dist, 'server/entry-server.js')).href
const { render } = await import(serverEntry)

const dataUrl = pathToFileURL(resolve('src/data.js')).href
const { I18N, CONTACT } = await import(dataUrl)

const template = readFileSync(resolve(dist, 'index.html'), 'utf-8')
const marker = '<div id="root"></div>'

if (!template.includes(marker)) throw new Error('ไม่พบจุดวางเนื้อหาใน dist/index.html')

/** ฝังไฟล์สไตล์ลงในหน้าเลย ลดการเรียกไฟล์เพิ่มหนึ่งครั้ง */
function inlineCss(html) {
  const link = html.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/)
  if (!link) return html

  const cssPath = resolve(dist, link[1].replace(/^\.\//, ''))
  const css = readFileSync(cssPath, 'utf-8').replaceAll('url(../fonts/', 'url(fonts/')

  return html.replace(link[0], `<style>${css}</style>`)
}

/** ข้อมูลธุรกิจสำหรับ Google สร้างจากเนื้อหาจริงในเว็บ */
function businessSchema(lang) {
  const L = I18N[lang]
  const url = lang === 'th' ? `${SITE}/` : `${SITE}/en.html`

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: L.siteName,
    alternateName: lang === 'th' ? I18N.en.siteName : I18N.th.siteName,
    description: L.heroSubtitle,
    url,
    image: `${SITE}/images/og-banner.jpg`,
    logo: `${SITE}/images/logo.png`,
    telephone: `+66${CONTACT.phone.replace(/[^0-9]/g, '').slice(1)}`,
    email: CONTACT.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: L.address,
      addressLocality: lang === 'th' ? 'อำเภอเมืองเชียงใหม่' : 'Mueang Chiang Mai',
      addressRegion: lang === 'th' ? 'เชียงใหม่' : 'Chiang Mai',
      postalCode: '50300',
      addressCountry: 'TH',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    areaServed: L.areas,
    contactPoint: [CONTACT.phone, CONTACT.phone2].map((telephone) => ({
      '@type': 'ContactPoint',
      telephone,
      contactType: 'customer service',
      areaServed: 'TH',
      availableLanguage: ['th', 'en'],
    })),
    sameAs: [CONTACT.facebookUrl, CONTACT.lineUrl],
  }
}

/** คำถามที่พบบ่อย ดึงจากเนื้อหาชุดเดียวกับที่แสดงบนหน้าเว็บ */
function faqSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: I18N[lang].faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

/** คลิปหน้างาน ช่วยให้ Google เข้าใจว่าหน้านี้มีวิดีโอจริง */
function videoSchema(lang) {
  const today = new Date().toISOString().slice(0, 10)

  return I18N[lang].videos.map((v) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.caption,
    description: `${v.caption} ${I18N[lang].siteName}`,
    contentUrl: `${SITE}/videos/${v.file}.mp4`,
    thumbnailUrl: `${SITE}/images/${v.file}-poster.jpg`,
    uploadDate: today,
    publisher: { '@type': 'Organization', name: I18N[lang].siteName },
  }))
}

function scriptTag(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`
}

/** แทนที่ข้อมูลส่วนหัวของหน้าให้ตรงกับภาษาที่กำลังสร้าง */
function buildHead(html, lang) {
  const L = I18N[lang]
  const url = lang === 'th' ? `${SITE}/` : `${SITE}/en.html`
  const title = lang === 'th'
    ? 'รถส่งน้ำประปาเชียงใหม่ ราคาถูก 24 ชั่วโมง | ธารนที'
    : 'Water Truck Delivery Chiang Mai, 24 Hours | Natee'
  const description = lang === 'th'
    ? 'ธารนที รถส่งน้ำประปาเชียงใหม่ บริการ 24 ชั่วโมง เติมแท็งก์น้ำ เติมสระว่ายน้ำ ไซต์งานก่อสร้าง ล้างถนน และงานอีเวนต์ มีทั้งรถ 4 ล้อและ 6 ล้อ โทร 064-825-3515'
    : 'Natee delivers clean tap water by truck across Chiang Mai, 24 hours a day. Tank filling, swimming pools, construction sites, gardens, road washing and events. Call 064-825-3515.'

  let out = html

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  out = out.replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`)
  out = out.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
  out = out.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
  out = out.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`)
  out = out.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
  out = out.replace(/<meta property="og:site_name"[^>]*>/, `<meta property="og:site_name" content="${L.siteName}" />`)
  out = out.replace(
    /<meta property="og:locale"[^>]*>/,
    `<meta property="og:locale" content="${lang === 'th' ? 'th_TH' : 'en_US'}" />`
  )
  out = out.replace(
    /<meta property="og:locale:alternate"[^>]*>/,
    `<meta property="og:locale:alternate" content="${lang === 'th' ? 'en_US' : 'th_TH'}" />`
  )

  // ผูกสองภาษาเข้าด้วยกัน ให้ Google รู้ว่าเป็นหน้าเดียวกันคนละภาษา
  const alternates = [
    `<link rel="alternate" hreflang="th" href="${SITE}/" />`,
    `<link rel="alternate" hreflang="en" href="${SITE}/en.html" />`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
  ].join('\n    ')

  const schema = [
    scriptTag(businessSchema(lang)),
    scriptTag(faqSchema(lang)),
    ...videoSchema(lang).map(scriptTag),
  ].join('\n    ')

  out = out.replace('</head>', `  ${alternates}\n    ${schema}\n  </head>`)
  out = out.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)

  return out
}

const pages = [
  { lang: 'th', file: resolve(dist, 'index.html') },
  { lang: 'en', file: resolve(dist, 'en.html') },
]

for (const page of pages) {
  const body = render(page.lang)
  let html = template.replace(marker, `<div id="root">${body}</div>`)

  html = inlineCss(html)
  html = buildHead(html, page.lang)

  mkdirSync(dirname(page.file), { recursive: true })
  writeFileSync(page.file, html)

  console.log(`พรีเรนเดอร์ ${page.lang} -> ${page.file.replace(dist, 'dist')} ${Math.round(html.length / 1024)} KB`)
}

rmSync(resolve(dist, 'server'), { recursive: true, force: true })
