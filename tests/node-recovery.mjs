import assert from 'node:assert/strict'
import {DatabaseSync,backup} from 'node:sqlite'
import {mkdtempSync,cpSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawn} from 'node:child_process'
import {createHash} from 'node:crypto'
assert.equal(process.env.GITHUB_ACTIONS,'true')
const source='http://127.0.0.1:8787',target='http://127.0.0.1:8788'
const dir=mkdtempSync(join(tmpdir(),'natee-node-recovery-'))
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
async function login(base){
  const response=await fetch(base+'/api/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.test',password:'Natee-CI-only-passphrase-2026!'})})
  assert.equal(response.status,200)
  return response.headers.get('set-cookie').split(';')[0]
}
async function snapshot(base,cookie){
  const result={}
  for(const path of ['content','users','inquiries','revisions','media']){
    const response=await fetch(base+'/api/'+path,{headers:{Cookie:cookie}})
    assert.equal(response.status,200);result[path]=await response.json()
  }
  return result
}
let server
try{
  const cookie=await login(source),expected=await snapshot(source,cookie)
  const db=new DatabaseSync(join(process.env.DATA_DIR,'natee.sqlite'))
  await backup(db,join(dir,'natee.sqlite'));db.close()
  cpSync(join(process.env.DATA_DIR,'media'),join(dir,'media'),{recursive:true})
  const restored=new DatabaseSync(join(dir,'natee.sqlite'))
  restored.exec('DELETE FROM sessions;');restored.close()
  server=spawn(process.execPath,['app.cjs'],{env:{...process.env,DATA_DIR:dir,SITE_URL:target,PORT:'8788'},stdio:'ignore',detached:true})
  let ready=false
  for(let i=0;i<60;i++){try{if((await fetch(target+'/api/session')).ok){ready=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,250))}
  assert.ok(ready)
  assert.equal((await fetch(target+'/api/content',{headers:{Cookie:cookie}})).status,401)
  const fresh=await login(target)
  assert.deepEqual(await snapshot(target,fresh),expected)
  for(const media of expected.media){
    const a=await fetch(source+'/'+media.path),b=await fetch(target+'/'+media.path)
    assert.equal(b.status,200);assert.equal(b.headers.get('Content-Type'),media.mime)
    assert.equal(hash(Buffer.from(await a.arrayBuffer())),hash(Buffer.from(await b.arrayBuffer())))
  }
  assert.equal((await fetch(target+'/')).status,200)
  console.log('Node fixture backup recovery passed: accounts/content/catalog/KV/session reset')
}finally{
  if(server?.pid)try{process.kill(-server.pid,'SIGTERM')}catch{}
  rmSync(dir,{recursive:true,force:true})
}
