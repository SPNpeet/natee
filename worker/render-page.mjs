import { imageAsset } from '../src/brand.js'
export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
export const safeJSON = value => JSON.stringify(value).replaceAll('<', '\\u003c')
// ที่อยู่ของแต่ละหน้าในแต่ละภาษา ใช้ร่วมกันทั้ง canonical hreflang และแผนผังเว็บ
export const PAGES = { home: { th: '/', en: '/en.html' }, knowledge: { th: '/knowledge.html', en: '/knowledge-en.html' } }
// วันที่เผยแพร่บทความตายตัว ถ้าใช้วันที่ build Google จะเห็นว่าบทความถูกแก้ทุกครั้งที่ขึ้นเว็บ
const ARTICLE_DATE = '2026-09-10'
export function metadata(content, lang, site, page = 'home') {
  const { I18N, CONTACT, REVIEWS, ASSETS, SEO } = content
  const L = I18N[lang]
  const url = site + PAGES[page][lang]
  const img = value => site + '/' + imageAsset(value)
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
    areaServed: L.areas, sameAs: [CONTACT.facebookUrl, CONTACT.lineUrl],
  }
  if (REVIEWS.count > 0 && REVIEWS.rating > 0) business.aggregateRating = { '@type': 'AggregateRating', ratingValue: REVIEWS.rating, reviewCount: REVIEWS.count }
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: L.faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }
  const videos = L.videos.map(v => ({
    '@context': 'https://schema.org', '@type': 'VideoObject', name: v.caption, description: v.caption + ' ' + L.siteName,
    contentUrl: site + '/' + (v.file.startsWith('uploads/') ? v.file : 'videos/' + v.file + '.mp4'),
    thumbnailUrl: v.poster ? img(v.poster) : (v.file.startsWith('uploads/') ? img(ASSETS.hero) : site + '/images/' + v.file + '-poster.webp'),
  }))
  const title = SEO[lang].title.trim() || L.heroTitle + ' | ' + L.siteName
  const description = SEO[lang].description.trim() || L.heroSubtitle + ' ' + CONTACT.phone
  return { title, description, url, image: img(ASSETS.share), type: 'website', schemas: [business, faq, ...videos] }
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
  html = html.replace('<div id="root"></div>', '<div id="root">' + render(lang, content, page) + '</div><script id="natee-content" type="application/json">' + safeJSON(content) + '</script>')
  return html
}
export function sitemap(site) {
  const urls = Object.values(PAGES).flatMap(paths => ['th', 'en'].map(lang => {
    const links = [['th', paths.th], ['en', paths.en], ['x-default', paths.th]]
    return '<url><loc>' + escapeHtml(site + paths[lang]) + '</loc>' + links.map(([code, target]) => '<xhtml:link rel="alternate" hreflang="' + code + '" href="' + escapeHtml(site + target) + '" />').join('') + '</url>'
  }))
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + urls.join('') + '</urlset>'
}
