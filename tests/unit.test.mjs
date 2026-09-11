import test from 'node:test'
import assert from 'node:assert/strict'
import * as defaults from '../src/data.js'
const seed=JSON.parse(JSON.stringify(defaults))
import { validateContent,mediaType } from '../worker/validate.mjs'
import { hashPassword,verifyPassword,readJSON } from '../worker/security.mjs'
import { siteConfig } from '../scripts/site-config.mjs'
import { safeJSON, metadata, sitemap } from '../worker/render-page.mjs'
import { mergeContent } from '../worker/content.mjs'
import upgrades from '../worker/content-upgrades.mjs'
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

test('migration freeze blocks API mutations while leaving public and authenticated reads available',async()=>{
  const {migrationResponse,migrationReadOnly}=await import('../worker/migration.mjs')
  const frozen={MIGRATION_READ_ONLY:'true'}
  assert.equal(migrationReadOnly(frozen),true)
  for(const method of ['POST','PUT','PATCH','DELETE']){
    for(const path of ['/api/content','/api/media','/api/login','/api/inquiries','/api/users','/api/events']){
      const response=migrationResponse(new Request('https://example.test'+path,{method}),frozen)
      assert.equal(response.status,503)
      assert.equal(response.headers.get('Retry-After'),'300')
      assert.equal(response.headers.get('Cache-Control'),'no-store')
      assert.match((await response.json()).error,/โทรศัพท์หรือ LINE/)
    }
  }
  for(const path of ['/','/en.html','/admin/','/api/session','/api/content','/uploads/example.png']){
    for(const method of ['GET','HEAD'])
      assert.equal(migrationResponse(new Request('https://example.test'+path,{method}),frozen),null)
  }
  for(const flag of [undefined,'false','',false]){
    const env={MIGRATION_READ_ONLY:flag}
    assert.equal(migrationReadOnly(env),false)
    assert.equal(migrationResponse(new Request('https://example.test/api/login',{method:'POST'}),env),null)
  }
})
test('saved fields that still match an old default follow the new default, owner edits stay',()=>{
  const list=[{path:['I18N','th','areasSubtitle'],from:'old subtitle'},{path:['I18N','th','heroTitle'],from:'old title'}]
  const saved=structuredClone(seed);saved.I18N.th.areasSubtitle='old subtitle';saved.I18N.th.heroTitle='owner title'
  const merged=mergeContent(seed,saved,list)
  assert.equal(merged.I18N.th.areasSubtitle,seed.I18N.th.areasSubtitle)
  assert.equal(merged.I18N.th.heroTitle,'owner title')
})
test('every registered default upgrade points at a field that still exists',()=>{
  assert.ok(upgrades.length>0)
  for(const {path} of upgrades)assert.notEqual(path.reduce((o,k)=>o?.[k],seed),undefined,path.join('.'))
})
test('knowledge images must come from the media library',()=>{
  assert.doesNotThrow(()=>validateContent(seed,structuredClone(seed)))
  const data=structuredClone(seed);data.I18N.th.knowledge.heroImage='../secret'
  assert.throws(()=>validateContent(seed,data))
})
test('knowledge pages get their own address, language pair and article data',()=>{
  const m=metadata(seed,'en','https://example.test','knowledge')
  assert.equal(m.url,'https://example.test/knowledge-en.html');assert.equal(m.type,'article')
  assert.deepEqual(m.schemas.map(s=>s['@type']),['Article','BreadcrumbList'])
  assert.match(sitemap('https://example.test'),/knowledge-en\.html<\/loc>/)
})
