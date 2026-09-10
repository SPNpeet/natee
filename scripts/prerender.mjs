/**
 * พรีเรนเดอร์หน้าเว็บเป็นไฟล์ HTML
 *
 * สร้างสี่หน้า คือหน้าแรกและหน้าความรู้ อย่างละสองภาษา
 * ทุกไฟล์วางไว้ระดับเดียวกันจึงอ้างไฟล์รูปและฟอนต์แบบสัมพัทธ์ชุดเดียวกันได้
 *
 * ข้อมูลสำหรับ Google ทั้งหมดสร้างจาก src/data.js แหล่งเดียว
 * จะได้ไม่มีปัญหาแก้เนื้อหาที่หนึ่งแล้วอีกที่หนึ่งค้างเป็นข้อมูลเก่า
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'

const SITE = 'https://xn--22cki0cqma4cdedf2ixczace9c1mmc1fh6g.com'

// วันที่เผยแพร่บทความ ตั้งไว้คงที่ ไม่ใช้วันที่ build
// ถ้าใช้วันปัจจุบัน Google จะเห็นว่าบทความถูกแก้ใหม่ทุกครั้งที่ขึ้นเว็บ ทั้งที่เนื้อหาเท่าเดิม
const ARTICLE_DATE = '2026-09-10'

const dist = resolve('dist')
const serverEntry = pathToFileURL(resolve(dist, 'server/entry-server.js')).href
const { render } = await import(serverEntry)

const dataUrl = pathToFileURL(resolve('src/data.js')).href
const { I18N, CONTACT, REVIEWS } = await import(dataUrl)

const template = readFileSync(resolve(dist, 'index.html'), 'utf-8')
const marker = '<div id="root"></div>'

if (!template.includes(marker)) throw new Error('ไม่พบจุดวางเนื้อหาใน dist/index.html')

const PAGES = [
  { lang: 'th', kind: 'home', file: 'index.html' },
  { lang: 'en', kind: 'home', file: 'en.html' },
  { lang: 'th', kind: 'knowledge', file: 'knowledge.html' },
  { lang: 'en', kind: 'knowledge', file: 'knowledge-en.html' },
]

/** ที่อยู่เต็มของแต่ละหน้า ใช้ทั้งใน canonical hreflang และข้อมูลโครงสร้าง */
function pageUrl(lang, kind) {
  const page = PAGES.find((p) => p.lang === lang && p.kind === kind)
  return page.file === 'index.html' ? `${SITE}/` : `${SITE}/${page.file}`
}

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

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: L.siteName,
    alternateName: lang === 'th' ? I18N.en.siteName : I18N.th.siteName,
    description: L.heroSubtitle,
    url: pageUrl(lang, 'home'),
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
    sameAs: [CONTACT.facebookUrl, CONTACT.lineUrl].concat(REVIEWS.url ? [REVIEWS.url] : []),
  }

  // ใส่คะแนนรีวิวเฉพาะเมื่อมีข้อมูลจริง การใส่ตัวเลขที่ไม่มีอยู่จริงผิดกติกาของ Google
  if (REVIEWS.count > 0 && REVIEWS.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(REVIEWS.rating),
      reviewCount: String(REVIEWS.count),
    }
  }

  return schema
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
    thumbnailUrl: `${SITE}/images/${v.file}-poster.webp`,
    uploadDate: today,
    publisher: { '@type': 'Organization', name: I18N[lang].siteName },
  }))
}

/** บทความความรู้เรื่องน้ำ */
function articleSchema(lang) {
  const L = I18N[lang]
  const K = L.knowledge

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: K.title,
    description: K.metaDescription,
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl(lang, 'knowledge') },
    image: `${SITE}/images/og-banner.jpg`,
    datePublished: ARTICLE_DATE,
    dateModified: ARTICLE_DATE,
    author: { '@type': 'Organization', name: L.siteName, url: pageUrl(lang, 'home') },
    publisher: {
      '@type': 'Organization',
      name: L.siteName,
      logo: { '@type': 'ImageObject', url: `${SITE}/images/logo.png` },
    },
  }
}

/** เส้นทางหน้าเว็บ ช่วยให้ผลค้นหาแสดงว่าบทความอยู่ใต้หน้าแรก */
function breadcrumbSchema(lang) {
  const L = I18N[lang]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: L.siteName, item: pageUrl(lang, 'home') },
      { '@type': 'ListItem', position: 2, name: L.knowledge.title, item: pageUrl(lang, 'knowledge') },
    ],
  }
}

function scriptTag(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`
}

const HOME_TITLE = {
  th: 'รถส่งน้ำประปาเชียงใหม่ ลำพูน ราคาถูก 24 ชั่วโมง | ธารนที',
  en: 'Water Truck Delivery Chiang Mai and Lamphun, 24 Hours | Natee',
}

const HOME_DESCRIPTION = {
  th: 'ธารนที รถส่งน้ำประปาเชียงใหม่และลำพูน บริการ 24 ชั่วโมง เติมแท็งก์น้ำ เติมสระว่ายน้ำ ไซต์งานก่อสร้าง ล้างถนน และงานอีเวนต์ มีทั้งรถ 4 ล้อและ 6 ล้อ โทร 064-825-3515',
  en: 'Natee delivers clean tap water by truck across Chiang Mai and Lamphun, 24 hours a day. Tank filling, swimming pools, construction sites, gardens, road washing and events. Call 064-825-3515.',
}

/** แทนที่ข้อมูลส่วนหัวของหน้าให้ตรงกับภาษาและหน้าที่กำลังสร้าง */
function buildHead(html, lang, kind) {
  const L = I18N[lang]
  const article = kind === 'knowledge'
  const url = pageUrl(lang, kind)
  const title = article ? L.knowledge.metaTitle : HOME_TITLE[lang]
  const description = article ? L.knowledge.metaDescription : HOME_DESCRIPTION[lang]

  let out = html

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  out = out.replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`)
  out = out.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
  out = out.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${article ? 'article' : 'website'}" />`)
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

  // หน้าความรู้ไม่มีรูปรถบนหัวหน้า จึงไม่ต้องสั่งโหลดล่วงหน้าให้เสียแบนด์วิดท์เปล่า
  if (article) out = out.replace(/\n\s*<link rel="preload" as="image"[^>]*>/, '')

  // ผูกสองภาษาเข้าด้วยกัน ให้ Google รู้ว่าเป็นหน้าเดียวกันคนละภาษา
  const alternates = [
    `<link rel="alternate" hreflang="th" href="${pageUrl('th', kind)}" />`,
    `<link rel="alternate" hreflang="en" href="${pageUrl('en', kind)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${pageUrl('th', kind)}" />`,
  ].join('\n    ')

  const schema = (article
    ? [articleSchema(lang), breadcrumbSchema(lang)]
    : [businessSchema(lang), faqSchema(lang), ...videoSchema(lang)]
  ).map(scriptTag).join('\n    ')

  out = out.replace('</head>', `  ${alternates}\n    ${schema}\n  </head>`)
  out = out.replace(/<html lang="[^"]*"/, `<html lang="${lang}" data-page="${kind}"`)

  return out
}

for (const page of PAGES) {
  const body = render(page.lang, page.kind)
  let html = template.replace(marker, `<div id="root">${body}</div>`)

  html = inlineCss(html)
  html = buildHead(html, page.lang, page.kind)

  const file = resolve(dist, page.file)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)

  console.log(`พรีเรนเดอร์ ${page.kind} ${page.lang} -> dist/${page.file} ${Math.round(html.length / 1024)} KB`)
}

rmSync(resolve(dist, 'server'), { recursive: true, force: true })
