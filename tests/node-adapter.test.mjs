import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,symlinkSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {LocalD1,FileKV} from '../node-host/storage.mjs'
import {assetsBinding} from '../node-host/assets.mjs'
test('SQLite batch rollback is atomic and foreign keys remain enforced',()=>{
  const dir=mkdtempSync(join(tmpdir(),'natee-sqlite-test-'))
  const db=new LocalD1(join(dir,'db.sqlite'),resolve('worker/migrations'))
  try{
    const insert=db.prepare("INSERT INTO users(email,password,role) VALUES (?,?,'admin')")
    assert.throws(()=>db.batch([insert.bind('one@test.example','hash'),insert.bind('one@test.example','hash')]))
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM users').first('n'),0)
    assert.throws(()=>db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').bind('session',999,'csrf',123).run())
    const result=db.batch([insert.bind('one@test.example','hash'),insert.bind('two@test.example','hash')])
    assert.equal(result[0].meta.changes,1)
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM users').first('n'),2)
  }finally{db.close();rmSync(dir,{recursive:true,force:true})}
})
test('file KV preserves bytes/metadata across instances and rejects traversal',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'natee-kv-test-')),key='uploads/'+'a'.repeat(32)+'.png'
  try{
    const kv=new FileKV(dir),bytes=Uint8Array.from([0,255,128,4])
    await kv.put(key,bytes,{metadata:{mime:'image/png'}})
    const restored=await new FileKV(dir).getWithMetadata(key)
    assert.deepEqual(new Uint8Array(restored.value),bytes)
    assert.equal(restored.metadata.mime,'image/png')
    await assert.rejects(()=>kv.put('../outside',bytes,{metadata:{mime:'image/png'}}))
    await assert.rejects(()=>kv.put(key,bytes,{metadata:{mime:'text/html'}}))
    await kv.delete(key);assert.equal((await kv.getWithMetadata(key)).value,null)
  }finally{rmSync(dir,{recursive:true,force:true})}
})
test('static files restrict paths, hide configuration, support ranges and exact redirects',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'natee-assets-test-')),web=join(dir,'web')
  mkdirSync(web)
  writeFileSync(join(web,'404.html'),'missing')
  writeFileSync(join(web,'clip.mp4'),'0123456789')
  writeFileSync(join(web,'_redirects'),'/old /#contact 301\n')
  writeFileSync(join(dir,'private.txt'),'secret')
  symlinkSync(join(dir,'private.txt'),join(web,'leak.txt'))
  try{
    const assets=await assetsBinding(web)
    assert.equal((await assets.fetch('https://example.test/leak.txt')).status,404)
    assert.equal((await assets.fetch('https://example.test/_redirects')).status,404)
    assert.equal((await assets.fetch('https://example.test/%2e%2e%2fprivate.txt')).status,404)
    const redirect=await assets.fetch('https://example.test/old')
    assert.equal(redirect.status,301);assert.equal(redirect.headers.get('Location'),'https://example.test/#contact')
    assert.equal((await assets.fetch('https://example.test/unknown')).status,404)
    const range=await assets.fetch(new Request('https://example.test/clip.mp4',{headers:{Range:'bytes=2-4'}}))
    assert.equal(range.status,206);assert.equal(await range.text(),'234')
  }finally{rmSync(dir,{recursive:true,force:true})}
})
