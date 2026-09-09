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
