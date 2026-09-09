import test from 'node:test'
import assert from 'node:assert/strict'
const base='http://127.0.0.1:8787'
const email='admin@example.test',password='Natee-CI-only-passphrase-2026!'
const setupToken='ci-only-setup-token-not-for-production-827456192038'
async function call(path,{method='GET',body,cookie,csrf,origin=base}={}){
  const headers={Origin:origin}
  if(body)headers['Content-Type']='application/json'
  if(cookie)headers.Cookie=cookie
  if(csrf)headers['X-CSRF-Token']=csrf
  const options={method,headers}
  if(body && !['GET','HEAD'].includes(method))options.body=JSON.stringify(body)
  const response=await fetch(base+'/api/'+path,options)
  return {response,data:await response.json()}
}
test('admin authentication, authorization and session lifecycle',async t=>{
  let cookie,csrf
  await t.test('anonymous protected reads denied',async()=>{assert.equal((await call('users')).response.status,401);assert.equal((await call('content')).response.status,401)})
  await t.test('cross-origin login denied',async()=>assert.equal((await call('login',{method:'POST',body:{email,password},origin:'https://evil.example'})).response.status,403))
  await t.test('setup secret required',async()=>assert.equal((await call('setup',{method:'POST',body:{email,password,token:'wrong'}})).response.status,403))
  await t.test('first admin setup creates an HttpOnly session',async()=>{
    const r=await call('setup',{method:'POST',body:{email,password,token:setupToken}})
    assert.equal(r.response.status,200,JSON.stringify(r.data));assert.equal(r.data.user.role,'admin')
    const set=r.response.headers.get('set-cookie');assert.match(set,/HttpOnly/);assert.match(set,/SameSite=Strict/)
    cookie=set.split(';')[0];csrf=r.data.csrf
  })
  await t.test('setup cannot create a second initial admin',async()=>assert.equal((await call('setup',{method:'POST',body:{email:'other@example.test',password,token:setupToken}})).response.status,409))
  await t.test('CSRF required for mutations',async()=>assert.equal((await call('logout',{method:'POST',body:{},cookie})).response.status,403))
  await t.test('authenticated session and safe user listing',async()=>{
    assert.equal((await call('session',{cookie})).data.user.email,email)
    const r=await call('users',{cookie});assert.equal(r.response.status,200);assert.equal(r.data[0].password,undefined)
  })
  await t.test('logout invalidates session on server',async()=>{
    assert.equal((await call('logout',{method:'POST',body:{},cookie,csrf})).response.status,200)
    assert.equal((await call('users',{cookie})).response.status,401)
  })
  await t.test('invalid and valid login',async()=>{
    assert.equal((await call('login',{method:'POST',body:{email,password:'wrong'}})).response.status,401)
    assert.equal((await call('login',{method:'POST',body:{email,password}})).response.status,200)
  })
})

test('content persists, renders on the server and rejects stale saves',async t=>{
  const logged=await call('login',{method:'POST',body:{email,password}})
  const cookie=logged.response.headers.get('set-cookie').split(';')[0],csrf=logged.data.csrf
  const original=(await call('content',{cookie})).data
  let version=original.version
  await t.test('save Thai/English content and read it back',async()=>{
    const content=structuredClone(original.content)
    content.I18N.th.heroTitle='ข้อความทดสอบการบันทึกจริง'
    content.I18N.en.heroTitle='Saved content acceptance test'
    const saved=await call('content',{method:'PUT',body:{content,version},cookie,csrf})
    assert.equal(saved.response.status,200,JSON.stringify(saved.data));version=saved.data.version
    assert.equal((await call('content',{cookie})).data.content.I18N.th.heroTitle,content.I18N.th.heroTitle)
    assert.ok((await (await fetch(base+'/')).text()).includes(content.I18N.th.heroTitle))
    assert.ok((await (await fetch(base+'/en.html')).text()).includes(content.I18N.en.heroTitle))
  })
  await t.test('stale writes are rejected',async()=>{
    assert.equal((await call('content',{method:'PUT',body:{content:original.content,version:original.version},cookie,csrf})).response.status,409)
  })
  await t.test('invalid URL and injected markup cannot become active HTML',async()=>{
    const invalid=structuredClone(original.content);invalid.CONTACT.lineUrl='javascript:alert(1)'
    assert.equal((await call('content',{method:'PUT',body:{content:invalid,version},cookie,csrf})).response.status,422)
    const safe=structuredClone(original.content);safe.I18N.th.heroTitle='</script><img src=x onerror=alert(1)>'
    const saved=await call('content',{method:'PUT',body:{content:safe,version},cookie,csrf})
    assert.equal(saved.response.status,200,JSON.stringify(saved.data));version=saved.data.version
    const html=await (await fetch(base+'/')).text()
    assert.ok(!html.includes(safe.I18N.th.heroTitle));assert.ok(html.includes('&lt;/script&gt;'))
  })
  await t.test('history is available and original content can be restored',async()=>{
    const history=await call('revisions',{cookie});assert.ok(history.data.length>=2)
    const saved=await call('content',{method:'PUT',body:{content:original.content,version},cookie,csrf})
    assert.equal(saved.response.status,200,JSON.stringify(saved.data))
  })
})

test('media authorization, upload validation, delivery and deletion',async t=>{
  const logged=await call('login',{method:'POST',body:{email,password}})
  const cookie=logged.response.headers.get('set-cookie').split(';')[0],csrf=logged.data.csrf
  const headers={Origin:base,Cookie:cookie,'X-CSRF-Token':csrf}
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1kAAAAASUVORK5CYII=','base64')
  let uploaded
  await t.test('anonymous uploads are denied',async()=>{const r=await fetch(base+'/api/media',{method:'POST',headers:{Origin:base},body:png});assert.equal(r.status,401)})
  await t.test('SVG and oversized uploads are rejected',async()=>{
    const svg=await fetch(base+'/api/media',{method:'POST',headers,body:'<svg onload="alert(1)"></svg>'});assert.equal(svg.status,422)
    const huge=await fetch(base+'/api/media',{method:'POST',headers,body:Buffer.alloc(8*1024*1024+1)});assert.equal(huge.status,413)
  })
  await t.test('image stores in KV with a generated name and safe content type',async()=>{
    const r=await fetch(base+'/api/media',{method:'POST',headers:{...headers,'Content-Type':'text/html'},body:png})
    uploaded=await r.json();assert.equal(r.status,201,JSON.stringify(uploaded));assert.match(uploaded.path,/^uploads\/[a-f0-9]{32}\.png$/)
    const got=await fetch(base+'/'+uploaded.path);assert.equal(got.status,200);assert.equal(got.headers.get('Content-Type'),'image/png')
    assert.deepEqual(Buffer.from(await got.arrayBuffer()),png)
    const range=await fetch(base+'/'+uploaded.path,{headers:{Range:'bytes=0-7'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,8)
    const invalid=await fetch(base+'/'+uploaded.path,{headers:{Range:'bytes=99999-'}});assert.equal(invalid.status,416)
  })
  await t.test('in-use media cannot be deleted and references are validated',async()=>{
    const original=(await call('content',{cookie})).data
    const invalid=structuredClone(original.content);invalid.GALLERY.push('uploads/'+'a'.repeat(32)+'.png')
    assert.equal((await call('content',{method:'PUT',cookie,csrf,body:{content:invalid,version:original.version}})).response.status,422)
    const content=structuredClone(original.content);content.GALLERY.push(uploaded.path)
    const saved=await call('content',{method:'PUT',cookie,csrf,body:{content,version:original.version}})
    assert.equal(saved.response.status,200,JSON.stringify(saved.data))
    assert.equal((await call('media',{method:'DELETE',cookie,csrf,body:{path:uploaded.path}})).response.status,409)
    const restored=await call('content',{method:'PUT',cookie,csrf,body:{content:original.content,version:saved.data.version}})
    assert.equal(restored.response.status,200)
  })
  await t.test('unused upload can be deleted',async()=>{
    const r=await fetch(base+'/api/media',{method:'POST',headers,body:png}),extra=await r.json()
    assert.equal((await call('media',{method:'DELETE',cookie,csrf,body:{path:extra.path}})).response.status,200)
    assert.equal((await fetch(base+'/'+extra.path)).status,404)
  })
})
test('public enquiries arrive in the private inbox and can be managed',async()=>{
  assert.equal((await call('inquiries')).response.status,401)
  const invalid=await call('inquiries',{method:'POST',body:{name:'Tester',phone:'bad'}});assert.equal(invalid.response.status,422)
  const sent=await call('inquiries',{method:'POST',body:{name:'CI enquiry',phone:'0812345678',area:'Chiang Mai',message:'Acceptance fixture only',language:'en'}})
  assert.equal(sent.response.status,201,JSON.stringify(sent.data))
  const logged=await call('login',{method:'POST',body:{email,password}})
  const cookie=logged.response.headers.get('set-cookie').split(';')[0],csrf=logged.data.csrf
  const rows=(await call('inquiries',{cookie})).data
  const row=rows.find(r=>r.name==='CI enquiry');assert.ok(row);assert.equal(row.language,'en')
  assert.equal((await call('inquiries/'+row.id,{method:'PATCH',cookie,csrf,body:{}})).response.status,200)
  assert.equal((await call('inquiries',{cookie})).data.find(r=>r.id===row.id).status,'read')
  assert.equal((await call('inquiries/'+row.id,{method:'DELETE',cookie,csrf,body:{}})).response.status,200)
  assert.equal((await call('inquiries',{cookie})).data.some(r=>r.id===row.id),false)
})
test('admin account changes invalidate old sessions',async()=>{
  const logged=await call('login',{method:'POST',body:{email,password}})
  const cookie=logged.response.headers.get('set-cookie').split(';')[0],csrf=logged.data.csrf
  const other='second-admin@example.test'
  assert.equal((await call('users',{method:'POST',cookie,csrf,body:{email:other,password}})).response.status,201)
  const users=(await call('users',{cookie})).data
  const id=users.find(x=>x.email===other).id
  const second=await call('login',{method:'POST',body:{email:other,password}})
  const secondCookie=second.response.headers.get('set-cookie').split(';')[0]
  assert.equal((await call('users/'+id,{method:'PATCH',cookie,csrf,body:{active:false}})).response.status,200)
  assert.equal((await call('content',{cookie:secondCookie})).response.status,401)
  assert.equal((await call('login',{method:'POST',body:{email:other,password}})).response.status,401)
  assert.equal((await call('password',{method:'POST',cookie,csrf,body:{currentPassword:'wrong',password:'Replacement-CI-passphrase!'}})).response.status,422)
  assert.equal((await call('password',{method:'POST',cookie,csrf,body:{currentPassword:password,password:'Replacement-CI-passphrase!'}})).response.status,200)
  assert.equal((await call('content',{cookie})).response.status,401)
  const fresh=await call('login',{method:'POST',body:{email,password:'Replacement-CI-passphrase!'}})
  const freshCookie=fresh.response.headers.get('set-cookie').split(';')[0]
  assert.equal((await call('password',{method:'POST',cookie:freshCookie,csrf:fresh.data.csrf,body:{currentPassword:'Replacement-CI-passphrase!',password}})).response.status,200)
})
