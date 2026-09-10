import {resolve,sep,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import {mkdirSync,realpathSync} from 'node:fs'
import {LocalD1,FileKV} from './storage.mjs'
import {assetsBinding} from './assets.mjs'
export const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
export async function createEnvironment(){
  if(Number(process.versions.node.split('.')[0])<24)throw new Error('Node 24 or later is required')
  const site=new URL(process.env.SITE_URL||'')
  if(site.username||site.password||site.search||site.hash||site.pathname!=='/'||!['https:','http:'].includes(site.protocol))throw new Error('SITE_URL must be an origin URL')
  if(site.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(site.hostname))throw new Error('Production SITE_URL must use HTTPS')
  if(!process.env.DATA_DIR||!isAbsolute(process.env.DATA_DIR))throw new Error('DATA_DIR must be a private absolute persistent directory')
  mkdirSync(process.env.DATA_DIR,{recursive:true,mode:0o700})
  const data=realpathSync(process.env.DATA_DIR)
  if(data===root||data.startsWith(root+sep)||data.includes(sep+'public_html'+sep)||data.endsWith(sep+'public_html'))throw new Error('DATA_DIR must be outside the application and public_html')
  return {SITE_URL:site.origin,SETUP_TOKEN:process.env.SETUP_TOKEN,DB:new LocalD1(resolve(data,'natee.sqlite'),resolve(root,'worker/migrations')),MEDIA:new FileKV(resolve(data,'media')),ASSETS:await assetsBinding(resolve(root,'dist'))}
}
