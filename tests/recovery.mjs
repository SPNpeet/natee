import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {execFileSync,spawn} from 'node:child_process'
import {createHash} from 'node:crypto'

// Fixture-only drill. Never connect to production or publish its SQL/media.
assert.equal(process.env.GITHUB_ACTIONS,'true','Run this recovery drill only on a GitHub runner')
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
assert.equal(config.vars.SITE_URL,'http://127.0.0.1:8787')
assert.ok(config.d1_databases.every(x=>/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(x.database_id)))
assert.ok(config.kv_namespaces.every(x=>/^0+$/.test(x.id)))
const source='http://127.0.0.1:8787',restored='http://127.0.0.1:8788'
const directory=mkdtempSync(join(tmpdir(),'natee-fixture-recovery-'))
const state=join(directory,'restored-state')
const wrangler='node_modules/wrangler/bin/wrangler.js'
const environment={...process.env}
for(const key of Object.keys(environment))if(key.startsWith('CLOUDFLARE_')||key==='CF_API_TOKEN'||key==='CF_API_KEY')delete environment[key]
function cli(args){
  try{return execFileSync(process.execPath,[wrangler,...args],{env:environment,encoding:'utf8',stdio:'pipe',timeout:60000})}
  catch(error){
    const output=String(error.stderr||'')+String(error.stdout||'')
    const categories=['FOREIGN KEY constraint failed','no such table','already exists','SQLITE_ERROR','Statement too long','Unknown argument']
    const category=categories.filter(value=>output.includes(value)).join(', ')||'unclassified CLI error'
    const safeMessage=(output.replace(/\x1b\[[0-9;]*m/g,'').match(/(?:ERROR|Error:)[^\r\n]*/g)||[]).map(line=>line.replace(/'[^']*'|"[^"]*"/g,'[redacted]').replace(/[A-Za-z0-9_-]{30,}/g,'[redacted]').slice(0,240)).join(' ')
    throw new Error('Isolated recovery CLI step failed: '+args.slice(0,2).join(' ')+' ('+category+') '+safeMessage,{cause:new Error('CLI exit '+error.status)})
  }
}
async function api(base,path,auth,method='GET',body){
  const headers={Origin:base,'Content-Type':'application/json'}
  if(auth){headers.Cookie=auth.cookie;headers['X-CSRF-Token']=auth.csrf}
  const response=await fetch(base+'/api/'+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})})
  assert.ok(response.ok,'Recovery API failed: '+path+' '+response.status)
  return response.json()
}
async function login(base){
  const response=await fetch(base+'/api/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.test',password:'Natee-CI-only-passphrase-2026!'})})
  assert.equal(response.status,200,'Restored administrator must be able to sign in')
  const body=await response.json()
  return {cookie:response.headers.get('set-cookie').split(';')[0],csrf:body.csrf}
}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
let server,sourceAuth,inquiry
try{
  sourceAuth=await login(source)
  await api(source,'inquiries',null,'POST',{name:'CI recovery fixture',phone:'0000000000',message:'Isolated test only',language:'en'})
  const expected={}
  for(const path of ['content','users','inquiries','revisions','media'])expected[path]=await api(source,path,sourceAuth)
  inquiry=expected.inquiries.find(x=>x.name==='CI recovery fixture')
  assert.ok(inquiry,'Recovery drill requires an inbox fixture')
  assert.ok(expected.media.length>0,'Recovery drill requires media from API acceptance')
  const media=[]
  for(const [index,item] of expected.media.entries()){
    const response=await fetch(source+'/'+item.path)
    assert.equal(response.status,200)
    assert.equal(response.headers.get('Content-Type'),item.mime)
    const bytes=Buffer.from(await response.arrayBuffer()),file=join(directory,'media-'+index)
    writeFileSync(file,bytes,{mode:0o600})
    media.push({path:item.path,mime:item.mime,file,hash:hash(bytes),bytes:bytes.length})
  }
  // Create all tables before importing rows: a referenced table may sort after
  // its child in a full dump, and deferred constraints cannot fix a missing table.
  const schema=join(directory,'schema.sql'),data=join(directory,'data.sql')
  cli(['d1','export','natee','--local','--no-data','--output',schema])
  cli(['d1','export','natee','--local','--no-schema','--output',data])
  writeFileSync(data,'PRAGMA defer_foreign_keys=ON;\n'+readFileSync(data,'utf8'),{mode:0o600})
  cli(['d1','execute','natee','--local','--persist-to',state,'--file',schema])
  cli(['d1','execute','natee','--local','--persist-to',state,'--file',data])
  cli(['d1','execute','natee','--local','--persist-to',state,'--command','DELETE FROM sessions;'])
  for(const item of media)cli(['kv','key','put',item.path,'--binding','MEDIA','--local','--persist-to',state,'--path',item.file,'--metadata',JSON.stringify({mime:item.mime})])
  server=spawn(process.execPath,[wrangler,'dev','--local','--ip','127.0.0.1','--port','8788','--persist-to',state,'--var','SITE_URL:'+restored],{env:environment,stdio:'ignore',detached:true})
  let ready=false
  for(let attempt=0;attempt<60;attempt++){
    try{if((await fetch(restored+'/api/session')).ok){ready=true;break}}catch{}
    await new Promise(resolve=>setTimeout(resolve,500))
  }
  assert.ok(ready,'Restored emulator must start')
  const stale=await fetch(restored+'/api/content',{headers:{Cookie:sourceAuth.cookie}})
  assert.equal(stale.status,401,'Backup sessions must be invalid after recovery')
  const auth=await login(restored)
  for(const path of ['content','users','inquiries','revisions','media'])
    assert.deepEqual(await api(restored,path,auth),expected[path],'Restored '+path+' must match its backup')
  for(const item of media){
    const response=await fetch(restored+'/'+item.path)
    assert.equal(response.status,200)
    assert.equal(response.headers.get('Content-Type'),item.mime)
    const bytes=Buffer.from(await response.arrayBuffer())
    assert.equal(bytes.length,item.bytes)
    assert.equal(hash(bytes),item.hash,'Restored KV bytes must match')
  }
  const page=await fetch(restored+'/')
  assert.equal(page.status,200)
  assert.ok((await page.text()).includes('natee-main'),'Restored site must render')
  const summary={scope:'Isolated CI fixtures only; not a production backup restore',passed:true,checks:['D1 SQL export/import into fresh state','content, users, inbox, revisions and media catalog match','old sessions rejected and fresh login works','KV bytes and MIME metadata match','restored public page renders'],mediaFiles:media.length}
  writeFileSync('work/recovery-summary.json',JSON.stringify(summary,null,2)+'\n')
  console.log('Isolated fixture D1 + KV backup/restore passed; production recovery remains unverified')
}finally{
  if(inquiry&&sourceAuth)await api(source,'inquiries/'+inquiry.id,sourceAuth,'DELETE',{}).catch(()=>{})
  if(server?.pid){try{process.kill(-server.pid,'SIGTERM')}catch{}}
  rmSync(directory,{recursive:true,force:true})
}
