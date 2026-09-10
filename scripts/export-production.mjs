import { mkdtemp, mkdir, writeFile, rm, stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { randomBytes, createCipheriv, publicEncrypt, constants, createHash } from 'node:crypto'
import { pipeline } from 'node:stream/promises'

// Public encryption recipient only. The private key never leaves the owner's computer.
const PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAwhhWbfLq5BuE2U2Cxrlk\nyCAUBj6AIQyj4P95RCz+43xd33PJe2QrVX5x+Pczx5rpMhDjl6tt6bjZCMHZ7yu/\nU+jKaaJ8lOXcPSdi2QEEzL4AiwieKQglxt0RyqHCp2DYLdFHSavpgDUa7OVVBkoS\nCqTE22SqtDnwBtb2Aroemib7sUA1Y7u6UxqQGACDUB2eiJSYnDkQdx50e4jkDNL0\nfzrQ7Tx7b9K+PrgLoFBaa0/hJYS5fzCZOvAlCGwPElElwUzYTeVi2/0TyYZjhJ97\n8S9C1yGq20wfuVbVo/RQGE5zmeT89V8txdsnoy+nXDS+0SA3q+gvYvxAcYO248Sc\nF6lYjPt+dPOL72ghSdObFRFqwcjfrQz/673nkeQj1Z8exdJMtfJBWd6mMvqSU7P0\n9nANeGlECoPhvgsK0z1sDNaPkbfB/L/Wap41vOAjfJPQhoNvKBr9hWcO0P+N/q9k\nnjpcslurZExGL8M2I0SHsqLQdLW7RlaTzOhHZoIFFp33AgMBAAE=\n-----END PUBLIC KEY-----"
const ACCOUNT = '3c3a30b952642a567008635f095785ca'
const DATABASE = 'db70eea1-2f69-4222-b895-a47288bb155c'
const NAMESPACE = 'b6e29331310d402e90aef580a03c16c7'
const token = process.env.CLOUDFLARE_API_TOKEN
const output = resolve('encrypted-export')
let temporary
let stage = 'initialization'
let complete = false
let secretKey
process.umask(0o077)

function command(program,args) {
  // Never forward CLI stdout/stderr: exports can include sensitive data or signed URLs.
  execFileSync(program,args,{stdio:'pipe',maxBuffer:32*1024*1024,env:{
    ...process.env,CLOUDFLARE_ACCOUNT_ID:ACCOUNT,WRANGLER_SEND_METRICS:'false'
  }})
}
async function api(path,json=false) {
  for(let attempt=0;attempt<4;attempt++){
    const response=await fetch('https://api.cloudflare.com/client/v4/accounts/'+ACCOUNT+
      '/storage/kv/namespaces/'+NAMESPACE+path,{
        method:'GET',headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(60000)
      })
    if(response.status===429||response.status>=500){
      await response.body?.cancel()
      await new Promise(resolve=>setTimeout(resolve,1000*2**attempt))
      continue
    }
    if(!response.ok)throw new Error('Cloudflare read failed')
    if(!json)return Buffer.from(await response.arrayBuffer())
    const body=await response.json()
    if(body.success!==true)throw new Error('Cloudflare read failed')
    return body
  }
  throw new Error('Cloudflare read retry exhausted')
}
async function keys(){
  const records=[]
  const seen=new Set()
  let cursor=''
  do {
    const page=await api('/keys?limit=1000'+(cursor?'&cursor='+encodeURIComponent(cursor):''),true)
    if(!Array.isArray(page.result))throw new Error('Invalid key list')
    for(const key of page.result){
      if(typeof key.name!=='string'||seen.has(key.name))throw new Error('Invalid key list')
      seen.add(key.name);records.push(key)
    }
    const next=page.result_info?.cursor||page.result_info?.cursors?.after||''
    if(next&&next===cursor)throw new Error('Repeated cursor')
    cursor=next
  }while(cursor)
  return records.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)
}
try {
  if(!token)throw new Error('Missing credentials')
  temporary=await mkdtemp(join(process.env.RUNNER_TEMP||tmpdir(),'natee-export-'))
  await rm(output,{recursive:true,force:true})
  await mkdir(output,{recursive:true})
  const payload=join(temporary,'payload')
  await mkdir(join(payload,'media','values'),{recursive:true})
  const configuration=join(temporary,'wrangler.json')
  await writeFile(configuration,JSON.stringify({
    name:'natee-export-read-only',account_id:ACCOUNT,
    d1_databases:[{binding:'DB',database_name:'natee',database_id:DATABASE}]
  }))
  stage='database export'
  command(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),
    'd1','export','natee','--remote','--output',join(payload,'database.sql'),'--config',configuration])
  const databaseBytes=(await stat(join(payload,'database.sql'))).size
  if(databaseBytes===0)throw new Error('Empty export')
  stage='media export'
  const listed=await keys()
  const manifest=[]
  let mediaBytes=0
  for(const [index,key] of listed.entries()){
    const bytes=await api('/values/'+encodeURIComponent(key.name))
    const file='values/'+String(index).padStart(6,'0')+'.bin'
    await writeFile(join(payload,'media',file),bytes)
    manifest.push({name:key.name,metadata:key.metadata??null,
      ...(key.expiration===undefined?{}:{expiration:key.expiration}),
      file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')})
    mediaBytes+=bytes.length
  }
  // Detect changes to the key inventory/metadata during export. D1 and KV have no joint snapshot.
  if(JSON.stringify(listed)!==JSON.stringify(await keys()))throw new Error('Media inventory changed')
  await writeFile(join(payload,'media','manifest.json'),JSON.stringify(manifest))
  await writeFile(join(payload,'format.json'),JSON.stringify({
    version:1,database:'database.sql',mediaManifest:'media/manifest.json',
    mediaFileBase:'media',jointAtomicSnapshot:false
  }))
  stage='encryption'
  const archive=join(temporary,'payload.tar.gz')
  command('tar',['-czf',archive,'-C',payload,'.'])
  secretKey=randomBytes(32)
  const iv=randomBytes(12)
  const cipher=createCipheriv('aes-256-gcm',secretKey,iv)
  await pipeline(createReadStream(archive),cipher,createWriteStream(join(output,'backup.tar.gz.enc'),{mode:0o600}))
  const wrapped=publicEncrypt({key:PUBLIC_KEY,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},secretKey)
  await writeFile(join(output,'key.rsa'),wrapped)
  await writeFile(join(output,'envelope.json'),JSON.stringify({
    version:1,cipher:'aes-256-gcm',keyWrap:'rsa-oaep-sha256',
    iv:iv.toString('base64'),authTag:cipher.getAuthTag().toString('base64')
  }))
  const summary={version:1,encrypted:true,databaseBytes,mediaCount:manifest.length,mediaBytes,jointAtomicSnapshot:false}
  await writeFile(join(output,'summary.json'),JSON.stringify(summary,null,2))
  complete=true
  console.log('Encrypted export ready: database and '+manifest.length+' media objects; no plaintext artifact.')
} catch {
  // Only an allowlisted stage label is logged, never exception details or API bodies.
  console.error('Encrypted export failed during '+stage+'. No plaintext artifact was published.')
  process.exitCode=1
} finally {
  secretKey?.fill(0)
  if(temporary)await rm(temporary,{recursive:true,force:true})
  if(!complete)await rm(output,{recursive:true,force:true})
}
