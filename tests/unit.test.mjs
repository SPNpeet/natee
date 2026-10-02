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
import { mapEmbedUrl, mapPoint } from '../src/map.js'
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
const placeLink='https://www.google.com/maps/place/%E0%B8%98%E0%B8%B2%E0%B8%A3%E0%B8%99%E0%B8%97%E0%B8%B5/@18.8509303,98.9855811,17z/data=!3m1!4b1!4m6!3m5!1s0x30da3b007c7f40af:0x1ecf5df345af3173!8m2!3d18.8509252!4d98.988156!16s%2Fg%2F11z257w2f9'
test('a Google Maps place link becomes an embeddable map at the place pin',()=>{
  assert.deepEqual(mapPoint(placeLink),{lat:18.8509252,lng:98.988156,name:'ธารนที'})
  const src=mapEmbedUrl(placeLink)
  assert.match(src,/^https:\/\/www\.google\.com\/maps\?/);assert.match(src,/output=embed/)
  assert.equal(new URL(src).searchParams.get('ll'),'18.8509252,98.988156')
  assert.equal(mapEmbedUrl(src),src)
})
test('map input accepts plain coordinates, share search links and embed code',()=>{
  assert.equal(new URL(mapEmbedUrl('18.8509, 98.9881')).searchParams.get('q'),'18.8509,98.9881')
  assert.deepEqual(mapPoint('https://www.google.com/maps/search/18.851037,+98.988660?entry=tts'),{lat:18.851037,lng:98.98866,name:''})
  assert.equal(mapEmbedUrl('<iframe src="https://www.google.com/maps/embed?pb=!1m18&amp;x=1" width="600"></iframe>'),'https://www.google.com/maps/embed?pb=!1m18&x=1')
  assert.equal(mapPoint('99.9, 200'),null)
  assert.match(mapEmbedUrl('https://example.test/not-a-map',{address:'เชียงใหม่'}),/q=%E0%B9%80/)
})
test('saving a place link stores an embeddable map and unreadable links are refused',()=>{
  const data=structuredClone(seed);data.CONTACT.mapEmbed=placeLink
  assert.match(validateContent(seed,data).CONTACT.mapEmbed,/output=embed/)
  const short=structuredClone(seed);short.CONTACT.mapEmbed='https://maps.app.goo.gl/abc'
  assert.throws(()=>validateContent(seed,short),/พิกัด/)
  const other=structuredClone(seed);other.CONTACT.mapEmbed='https://example.test/map'
  assert.throws(()=>validateContent(seed,other))
})
test('business data carries the map pin, 24 hour opening and the service list',()=>{
  const data=structuredClone(seed);data.CONTACT.mapEmbed=placeLink
  const business=metadata(data,'th','https://example.test').schemas[0]
  assert.deepEqual(business.geo,{'@type':'GeoCoordinates',latitude:18.8509252,longitude:98.988156})
  assert.equal(business.openingHoursSpecification.opens,'00:00')
  assert.equal(business.hasOfferCatalog.itemListElement.length,seed.I18N.th.services.length)
})
test('search description always ends with the current phone number',()=>{
  const data=structuredClone(seed);data.CONTACT.phone='081-234-5678'
  const m=metadata(data,'th','https://example.test')
  assert.ok(m.description.endsWith('081-234-5678'));assert.ok(m.description.length<=160)
})
test('an owner who never touched the search title gets the new keyword title, an owner title stays',()=>{
  const untouched=structuredClone(seed);untouched.SEO.th.title=''
  assert.equal(mergeContent(seed,untouched).SEO.th.title,seed.SEO.th.title)
  const owned=structuredClone(seed);owned.SEO.th.title='ชื่อที่เจ้าของตั้งเอง'
  assert.equal(mergeContent(seed,owned).SEO.th.title,'ชื่อที่เจ้าของตั้งเอง')
})
test('photos and clips changed on the Thai side also show on the English page',()=>{
  const saved=structuredClone(seed)
  saved.I18N.th.fleet[0].image='uploads/0435d5b747510c956a113af78cb0134e.jpg'
  saved.I18N.th.videos[0].file='uploads/8064e5de46f87d0dd5cefb1d61948748.mp4'
  saved.I18N.th.knowledge.heroImage='work-03'
  const shown=mergeContent(seed,saved)
  assert.equal(shown.I18N.en.fleet[0].image,saved.I18N.th.fleet[0].image)
  assert.equal(shown.I18N.en.videos[0].file,saved.I18N.th.videos[0].file)
  assert.equal(shown.I18N.en.knowledge.heroImage,'work-03')
  assert.notEqual(shown.I18N.en.fleet[0].name,shown.I18N.th.fleet[0].name)
  const stored=validateContent(seed,structuredClone(saved))
  assert.equal(stored.I18N.en.fleet[0].image,saved.I18N.th.fleet[0].image)
})
test('every service page gets its own address, search text and Service, Breadcrumb and FAQ data',()=>{
  const slugs=seed.I18N.th.servicePages.map(p=>p.slug)
  assert.deepEqual(slugs,['tank-filling','pool-filling','songkran','road-washing','garden-watering'])
  for(const lang of ['th','en'])for(const slug of slugs){
    const m=metadata(seed,lang,'https://example.test','service:'+slug)
    assert.equal(m.url,'https://example.test/service-'+slug+(lang==='en'?'-en':'')+'.html')
    assert.deepEqual(m.schemas.map(s=>s['@type']),['Service','BreadcrumbList','FAQPage'])
    assert.ok(m.description.length<=160,slug+' '+lang+' '+m.description.length)
  }
  const map=sitemap('https://example.test')
  for(const slug of slugs){assert.match(map,new RegExp('service-'+slug+'\\.html<'));assert.match(map,new RegExp('service-'+slug+'-en\\.html<'))}
})
test('the owner can edit service page text but cannot add, remove or rename a page',()=>{
  const edited=structuredClone(seed);edited.I18N.th.servicePages[1].intro='ข้อความที่เจ้าของร้านเขียนเอง'
  assert.equal(validateContent(seed,edited).I18N.th.servicePages[1].intro,'ข้อความที่เจ้าของร้านเขียนเอง')
  const removed=structuredClone(seed);removed.I18N.th.servicePages.pop()
  assert.throws(()=>validateContent(seed,removed),/หน้าบริการ/)
  const renamed=structuredClone(seed);renamed.I18N.en.servicePages[0].slug='other'
  assert.throws(()=>validateContent(seed,renamed),/หน้าบริการ/)
  const image=structuredClone(seed);image.I18N.th.servicePages[0].image='../secret'
  assert.throws(()=>validateContent(seed,image))
})
test('image size lists give phones the small file for bundled and uploaded images',async()=>{
  const { imageSrcSet, imageAsset } = await import('../src/brand.js')
  assert.equal(imageSrcSet('uploads/'+'a'.repeat(32)+'.jpg',1200),'uploads/'+'a'.repeat(32)+'-sm.webp 960w, uploads/'+'a'.repeat(32)+'.jpg 1920w')
  assert.equal(imageSrcSet('work-05',1100),'images/work-05-sm.webp 560w, images/work-05.webp 1100w')
  assert.equal(imageAsset('uploads/'+'b'.repeat(32)+'.png','-sm.webp'),'uploads/'+'b'.repeat(32)+'-sm.webp')
  assert.equal(imageAsset('uploads/'+'c'.repeat(32)+'.mp4'),'uploads/'+'c'.repeat(32)+'.mp4')
})
