import { imageAsset } from '../src/brand.js'
import { mapPoint } from '../src/map.js'
import { PAGES } from '../src/pages.js'
export { PAGES }
export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
export const safeJSON = value => JSON.stringify(value).replaceAll('<', '\\u003c')
// วันที่เผยแพร่บทความตายตัว ถ้าใช้วันที่ build Google จะเห็นว่าบทความถูกแก้ทุกครั้งที่ขึ้นเว็บ
const ARTICLE_DATE = '2026-09-10'
export function metadata(content, lang, site, page = 'home') {
  const { I18N, CONTACT, REVIEWS, ASSETS, SEO } = content
  const L = I18N[lang]
  const url = site + PAGES[page][lang]
  const img = value => site + '/' + imageAsset(value)
  // เบอร์โทรต่อท้ายคำอธิบายจากข้อมูลติดต่อเสมอ เปลี่ยนเบอร์ที่เดียวแล้วผลค้นหาตามทันที
  // ถ้าต่อแล้วเกิน 160 ตัวอักษร Google จะตัดท้ายทิ้งอยู่ดี จึงไม่ต่อ
  const withPhone = (summary) => {
    const line = summary + ' ' + (lang === 'th' ? 'โทร ' : 'Call ') + CONTACT.phone
    return summary.includes(CONTACT.phone) || line.length > 160 ? summary : line
  }
  if (page.startsWith('service:')) {
    const S = L.servicePages.find((p) => p.slug === page.slice(8))
    const home = site + PAGES.home[lang]
    const service = {
      '@context': 'https://schema.org', '@type': 'Service', name: S.title, serviceType: S.navLabel, description: S.metaDescription,
      url, image: img(S.image), areaServed: L.areas, inLanguage: lang,
      provider: { '@type': 'LocalBusiness', name: L.siteName, url: home, telephone: CONTACT.phone, address: { '@type': 'PostalAddress', streetAddress: L.address, addressCountry: 'TH' } },
    }
    const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: L.siteName, item: home },
      { '@type': 'ListItem', position: 2, name: S.navLabel, item: url },
    ] }
    const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: S.faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }
    return { title: S.metaTitle, description: withPhone(S.metaDescription), url, image: img(S.image), type: 'website', schemas: [service, breadcrumb, faq] }
  }
  if (page === 'knowledge') {
    const K = L.knowledge
    const home = site + PAGES.home[lang]
    const article = {
      '@context': 'https://schema.org', '@type': 'Article', headline: K.title, description: K.metaDescription, inLanguage: lang,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }, image: img(K.heroImage), datePublished: ARTICLE_DATE, dateModified: ARTICLE_DATE,
      author: { '@type': 'Organization', name: L.siteName, url: home },
      publisher: { '@type': 'Organization', name: L.siteName, logo: { '@type': 'ImageObject', url: img(ASSETS.logo) } },
    }
    const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: L.siteName, item: home },
      { '@type': 'ListItem', position: 2, name: K.title, item: url },
    ] }
    return { title: K.metaTitle, description: K.metaDescription, url, image: img(ASSETS.share), type: 'article', schemas: [article, breadcrumb] }
  }
  const business = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness',
    name: L.siteName, description: L.heroSubtitle, url, image: img(ASSETS.hero), logo: img(ASSETS.logo),
    telephone: CONTACT.phone, email: CONTACT.email,
    contactPoint: [CONTACT.phone,CONTACT.phone2].map(telephone=>({'@type':'ContactPoint',telephone,contactType:'customer service',availableLanguage:['th','en']})),
    address: { '@type': 'PostalAddress', streetAddress: L.address, addressCountry: 'TH' },
    areaServed: L.areas, sameAs: [CONTACT.facebookUrl, CONTACT.lineUrl, CONTACT.mapUrl].filter(Boolean),
    hasMap: CONTACT.mapUrl,
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    hasOfferCatalog: { '@type': 'OfferCatalog', name: L.servicesTitle, itemListElement: L.services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, description: s.text } })) },
  }
  const point = mapPoint(CONTACT.mapEmbed)
  if (point) business.geo = { '@type': 'GeoCoordinates', latitude: point.lat, longitude: point.lng }
  if (REVIEWS.count > 0 && REVIEWS.rating > 0) business.aggregateRating = { '@type': 'AggregateRating', ratingValue: REVIEWS.rating, reviewCount: REVIEWS.count }
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: L.faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }
  // ไม่ส่งข้อมูล VideoObject ของคลิปผลงาน Search Console แจ้งว่าไม่ครบเพราะไม่มีวันที่อัปโหลด
  // และหน้านี้ไม่ใช่หน้าดูคลิป Google จึงไม่เก็บคลิปอยู่ดี ส่งไปก็ได้แค่สถานะ has issues
  const title = SEO[lang].title.trim() || L.heroTitle + ' | ' + L.siteName
  const description = withPhone(SEO[lang].description.trim() || L.heroSubtitle)
  return { title, description, url, image: img(ASSETS.share), type: 'website', schemas: [business, faq] }
}
export function renderPage(template, render, content, lang, site, page = 'home') {
  const m = metadata(content, lang, site, page)
  let html = template.replace(/<html lang="[^"]*"/, '<html lang="' + lang + '" data-page="' + page + '"')
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHtml(m.title) + '</title>')
  html = html.replace(/<meta\s+name="description"[\s\S]*?\/>/, '<meta name="description" content="' + escapeHtml(m.description) + '" />')
  html = html.replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="' + escapeHtml(m.url) + '" />')
  for (const [key, value] of Object.entries({ type: m.type, title: m.title, description: m.description, url: m.url, image: m.image, site_name: content.I18N[lang].siteName, locale: lang === 'th' ? 'th_TH' : 'en_US', 'locale:alternate': lang === 'th' ? 'en_US' : 'th_TH' })) {
    html = html.replace(new RegExp('<meta property="og:' + key + '"[^>]*>'), '<meta property="og:' + key + '" content="' + escapeHtml(value) + '" />')
  }
  html = html.replace(/<meta name="twitter:image"[^>]*>/, '<meta name="twitter:image" content="' + escapeHtml(m.image) + '" />')
  // A custom image may have a different aspect ratio than the bundled share banner.
  html = html.replace(/<meta property="og:image:(?:width|height)"[^>]*>/g, '')
  html = html.replace(/<link rel="preload" as="image"[^>]*>/, '')
  const alternates = [['th', PAGES[page].th], ['en', PAGES[page].en], ['x-default', PAGES[page].th]].map(([code, path]) => '<link rel="alternate" hreflang="' + code + '" href="' + escapeHtml(site + path) + '" />').join('\n')
  const schemas = m.schemas.map(s => '<script type="application/ld+json">' + safeJSON(s) + '</script>').join('\n')
  html = html.replace('</head>', alternates + '\n' + schemas + '\n</head>')
  // หน้าเว็บในเบราว์เซอร์อ่านเฉพาะภาษาของหน้านั้น และของหน้าอื่นใช้แค่ชื่อกับลิงก์ จึงฝังเท่าที่ใช้ หน้าโหลดเร็วขึ้น
  const L = content.I18N[lang]
  const pageContent = { ...content, I18N: { [lang]: {
    ...L,
    knowledge: page === 'knowledge' ? L.knowledge : { navLabel: L.knowledge.navLabel },
    servicePages: L.servicePages.map(p => page === 'service:' + p.slug ? p : { slug: p.slug, icon: p.icon, navLabel: p.navLabel }),
  } } }
  html = html.replace('<div id="root"></div>', '<div id="root">' + render(lang, content, page) + '</div><script id="natee-content" type="application/json">' + safeJSON(pageContent) + '</script>')
  return html
}
export function sitemap(site) {
  const urls = Object.values(PAGES).flatMap(paths => ['th', 'en'].map(lang => {
    const links = [['th', paths.th], ['en', paths.en], ['x-default', paths.th]]
    return '<url><loc>' + escapeHtml(site + paths[lang]) + '</loc>' + links.map(([code, target]) => '<xhtml:link rel="alternate" hreflang="' + code + '" href="' + escapeHtml(site + target) + '" />').join('') + '</url>'
  }))
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + urls.join('') + '</urlset>'
}
