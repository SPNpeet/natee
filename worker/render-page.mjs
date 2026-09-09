export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
export const safeJSON = value => JSON.stringify(value).replaceAll('<', '\\u003c')
export function metadata(content, lang, site) {
  const { I18N, CONTACT, REVIEWS, ASSETS } = content
  const L = I18N[lang]
  const url = site + (lang === 'th' ? '/' : '/en.html')
  const img = value => site + '/' + (value.startsWith('uploads/') ? value : 'images/' + value + '.webp')
  const business = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness',
    name: L.siteName, description: L.heroSubtitle, url, image: img(ASSETS.hero), logo: img(ASSETS.logo),
    telephone: CONTACT.phone, email: CONTACT.email,
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
  const title = L.heroTitle + ' | ' + L.siteName
  const description = L.heroSubtitle + ' ' + CONTACT.phone
  return { title, description, url, image: img(ASSETS.hero), schemas: [business, faq, ...videos] }
}
export function renderPage(template, render, content, lang, site) {
  const m = metadata(content, lang, site)
  let html = template.replace(/<html lang="[^"]*"/, '<html lang="' + lang + '"')
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHtml(m.title) + '</title>')
  html = html.replace(/<meta\s+name="description"[\s\S]*?\/>/, '<meta name="description" content="' + escapeHtml(m.description) + '" />')
  html = html.replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="' + escapeHtml(m.url) + '" />')
  for (const [key, value] of Object.entries({ title: m.title, description: m.description, url: m.url, image: m.image, site_name: content.I18N[lang].siteName, locale: lang === 'th' ? 'th_TH' : 'en_US', 'locale:alternate': lang === 'th' ? 'en_US' : 'th_TH' })) {
    html = html.replace(new RegExp('<meta property="og:' + key + '"[^>]*>'), '<meta property="og:' + key + '" content="' + escapeHtml(value) + '" />')
  }
  html = html.replace(/<meta name="twitter:image"[^>]*>/, '<meta name="twitter:image" content="' + escapeHtml(m.image) + '" />')
  // A custom image may have a different aspect ratio than the bundled share banner.
  html = html.replace(/<meta property="og:image:(?:width|height)"[^>]*>/g, '')
  html = html.replace(/<link rel="preload" as="image"[^>]*>/, '')
  const alternates = [['th', '/'], ['en', '/en.html'], ['x-default', '/']].map(([code, path]) => '<link rel="alternate" hreflang="' + code + '" href="' + escapeHtml(site + path) + '" />').join('\n')
  const schemas = m.schemas.map(s => '<script type="application/ld+json">' + safeJSON(s) + '</script>').join('\n')
  html = html.replace('</head>', alternates + '\n' + schemas + '\n</head>')
  html = html.replace('<div id="root"></div>', '<div id="root">' + render(lang, content) + '</div><script id="natee-content" type="application/json">' + safeJSON(content) + '</script>')
  return html
}
export function sitemap(site) {
  const links = [['th', '/'], ['en', '/en.html'], ['x-default', '/']]
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    ['/', '/en.html'].map(path => '<url><loc>' + escapeHtml(site + path) + '</loc>' + links.map(([lang, target]) => '<xhtml:link rel="alternate" hreflang="' + lang + '" href="' + escapeHtml(site + target) + '" />').join('') + '</url>').join('') + '</urlset>'
}
