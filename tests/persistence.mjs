import {readFileSync,writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const base='http://127.0.0.1:8787'
const login=await fetch(base+'/api/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.test',password:'Natee-CI-only-passphrase-2026!'})})
assert.equal(login.status,200)
const auth=await login.json()
const headers={Origin:base,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':auth.csrf}
const current=await (await fetch(base+'/api/content',{headers})).json()
if(process.argv[2]==='before'){
  writeFileSync('work/persistence.json',JSON.stringify(current.content))
  const content=structuredClone(current.content)
  content.I18N.th.heroTitle='ข้อมูลต้องคงอยู่หลังรีสตาร์ต'
  const response=await fetch(base+'/api/content',{method:'PUT',headers,body:JSON.stringify({content,version:current.version})})
  assert.equal(response.status,200,await response.text())
}else{
  assert.equal(current.content.I18N.th.heroTitle,'ข้อมูลต้องคงอยู่หลังรีสตาร์ต')
  const html=await (await fetch(base+'/')).text()
  assert.ok(html.includes('ข้อมูลต้องคงอยู่หลังรีสตาร์ต'))
  assert.ok(!html.includes('STALE-CACHE-FIXTURE'))
  const response=await fetch(base+'/api/content',{method:'PUT',headers,body:JSON.stringify({content:JSON.parse(readFileSync('work/persistence.json','utf8')),version:current.version})})
  assert.equal(response.status,200,await response.text())
  console.log('D1 persistence and stale rendered-HTML recovery passed after Worker restart')
}
