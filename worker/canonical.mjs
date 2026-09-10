// Redirect only the configured production host's www counterpart.
// Other hosts (including workers.dev previews) retain normal origin checks.
export function canonicalRedirect(request, siteURL) {
  const canonical = new URL(siteURL)
  if (canonical.protocol !== 'https:' || canonical.hostname.endsWith('.workers.dev')) return null
  const incoming = new URL(request.url)
  const alias = canonical.hostname.startsWith('www.')
    ? canonical.hostname.slice(4) : 'www.' + canonical.hostname
  const aliasHost = alias + (canonical.port ? ':' + canonical.port : '')
  if (incoming.host !== aliasHost) return null
  incoming.protocol = canonical.protocol
  incoming.host = canonical.host
  return Response.redirect(incoming.href, 308)
}
