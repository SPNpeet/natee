import {createServer} from 'node:http'
import {Readable} from 'node:stream'
import {pipeline} from 'node:stream/promises'
import worker from '../node-build/worker.mjs'
import {createEnvironment} from './environment.mjs'
process.umask(0o077)
const env=await createEnvironment(),site=new URL(env.SITE_URL)
const alias=(site.hostname.startsWith('www.')?site.hostname.slice(4):'www.'+site.hostname)+(site.port?':'+site.port:'')
const trusted=new Set((process.env.TRUSTED_PROXY_IPS||'').split(',').filter(Boolean))
const server=createServer({maxHeaderSize:16384},async(req,res)=>{
  try{
    const host=req.headers.host
    if(host!==site.host&&host!==alias){res.writeHead(421);res.end('Unknown host');return}
    if(!req.url.startsWith('/')||req.url.startsWith('//')){res.writeHead(400);res.end();return}
    const headers=new Headers()
    for(const [key,value] of Object.entries(req.headers))if(value!==undefined&&!['connection','transfer-encoding','cf-connecting-ip'].includes(key))headers.set(key,Array.isArray(value)?value.join(','):value)
    let ip=req.socket.remoteAddress||'local-proxy'
    // Opt-in only for a verified proxy that appends its client address.
    if(trusted.has(ip)){
      const chain=String(req.headers['x-forwarded-for']||'').split(',').map(x=>x.trim()).filter(Boolean)
      while(chain.length&&trusted.has(ip))ip=chain.pop()
    }
    headers.set('CF-Connecting-IP',ip)
    let body
    if(!['GET','HEAD'].includes(req.method)){
      const chunks=[];let size=0,tooLarge=false
      await new Promise((resolve,reject)=>{
        req.on('data',chunk=>{size+=chunk.length;if(size>8*1024*1024){tooLarge=true;chunks.length=0}else if(!tooLarge)chunks.push(chunk)})
        req.on('end',resolve);req.on('error',reject)
      })
      if(tooLarge){res.writeHead(413,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'File or request too large'}));return}
      body=Buffer.concat(chunks)
    }
    const request=new Request(site.protocol+'//'+host+req.url,{method:req.method,headers,...(body?{body,duplex:'half'}:{})})
    const response=await worker.fetch(request,env)
    res.writeHead(response.status,Object.fromEntries(response.headers))
    if(req.method==='HEAD'||!response.body)res.end()
    else await pipeline(Readable.fromWeb(response.body),res)
  }catch{
    if(!res.headersSent)res.writeHead(503,{'Content-Type':'text/plain','Cache-Control':'no-store'})
    res.end('Service temporarily unavailable')
    console.error('Node request failed')
  }
})
server.requestTimeout=30000;server.headersTimeout=15000
server.listen(process.env.PORT||3000,process.env.HOST||'127.0.0.1',()=>console.log('Natee Node server ready'))
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{env.DB.close();process.exit(0)}))
