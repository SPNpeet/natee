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
