import test from 'node:test'
import assert from 'node:assert/strict'
import * as defaults from '../src/data.js'
const seed=JSON.parse(JSON.stringify(defaults))
import { validateContent,mediaType } from '../worker/validate.mjs'
import { hashPassword,verifyPassword,readJSON } from '../worker/security.mjs'
import { siteConfig } from '../scripts/site-config.mjs'
import { safeJSON } from '../worker/render-page.mjs'
test('public content validates and telephone links follow displayed numbers',()=>{
  const input=structuredClone(seed);input.CONTACT.phone='081-234-5678'
  assert.equal(validateContent(seed,input).CONTACT.phoneHref,'tel:0812345678')
})
test('server rejects malformed content, dangerous links and media paths',()=>{
  for(const change of [
    c=>{c.CONTACT.mapEmbed='https://evil.example/maps'},c=>{c.CONTACT.lineUrl='javascript:alert(1)'},
    c=>{c.GALLERY=['../secret']},c=>{c.I18N.en.videos=[]},c=>{c.REVIEWS.rating=9},
    c=>{c.CONTACT.phone='bad'},c=>{c.extra='unexpected'},c=>{c.I18N.th.videos[0].file='missing-clip'},c=>{c.BRAND.color='#ffffff'},
  ]){const data=structuredClone(seed);change(data);assert.throws(()=>validateContent(seed,data))}
})
test('password hashing is salted and wrong passwords fail',async()=>{
  const password='A test-only passphrase 927!'
  const one=await hashPassword(password),two=await hashPassword(password)
  assert.notEqual(one,two);assert.equal(await verifyPassword(password,one),true)
  assert.equal(await verifyPassword('wrong password',one),false)
  await assert.rejects(()=>hashPassword('short'))
})
test('invalid JSON returns a client error',async()=>{
  await assert.rejects(()=>readJSON(new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})),{status:400})
})
test('media payload is sniffed instead of trusting the extension',()=>{
  assert.throws(()=>mediaType(new TextEncoder().encode('<svg onload="alert(1)">')))
  assert.equal(mediaType(Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,0,0]))[1],'image/png')
})
test('site URLs and JSON script escaping are safe',()=>{
  assert.equal(siteConfig('https://example.test/natee/').basePath,'/natee/')
  assert.throws(()=>siteConfig('https://user:pass@example.test'))
  assert.ok(!safeJSON('</script>').includes('<'))
  assert.equal(JSON.parse(safeJSON('</script>')),'</script>')
})

test('canonical www redirects preserve IDN paths and query without redirecting preview or unrelated hosts',async()=>{
  const {canonicalRedirect}=await import('../worker/canonical.mjs')
  const site='https://xn--22cki0cqma4cdedf2ixczace9c1mmc1fh6g.com'
  const alias=site.replace('https://','https://www.')
  const redirected=canonicalRedirect(new Request(alias+'/en.html?source=shared'),site)
  assert.equal(redirected.status,308)
  assert.equal(redirected.headers.get('Location'),site+'/en.html?source=shared')
  const post=canonicalRedirect(new Request(alias+'/api/inquiries',{method:'POST',body:'{}'}),site)
  assert.equal(post.status,308)
  assert.equal(post.headers.get('Location'),site+'/api/inquiries')
  for(const url of [site+'/', 'https://natee.chaiyootauifujai.workers.dev/', 'https://evil.example/', alias+'.evil.example/'])
    assert.equal(canonicalRedirect(new Request(url),site),null)
  assert.equal(canonicalRedirect(new Request('https://www.natee.chaiyootauifujai.workers.dev/'),'https://natee.chaiyootauifujai.workers.dev'),null)
  assert.equal(canonicalRedirect(new Request('http://www.localhost/'),'http://localhost'),null)
  assert.equal(canonicalRedirect(new Request('https://example.test/path'),'https://www.example.test').headers.get('Location'),'https://www.example.test/path')
})
