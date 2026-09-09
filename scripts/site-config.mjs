export function siteConfig(value = process.env.SITE_URL || 'https://xn--22cki0cqma4cdedf2ixczace9c1mmc1fh6g.com') {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTP(S) URL without credentials, query or fragment')
  }
  url.pathname = url.pathname.replace(/\/+$/, '') + '/'
  return { site: url.href.replace(/\/$/, ''), basePath: url.pathname }
}
