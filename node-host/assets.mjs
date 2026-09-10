import {readFile,realpath,stat} from 'node:fs/promises'
import {resolve,sep,extname} from 'node:path'
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.mp4':'video/mp4','.woff2':'font/woff2'}
export async function assetsBinding(directory){
  const root=await realpath(directory),redirects=new Map()
  try{for(const line of (await readFile(resolve(root,'_redirects'),'utf8')).split('\n')){
    const parts=line.trim().split(/\s+/)
    if(parts.length===3&&parts[0].startsWith('/')&&!parts[0].includes('*')&&parts[1].startsWith('/')&&['301','302','307','308'].includes(parts[2]))redirects.set(parts[0],parts)
  }}catch(error){if(error.code!=='ENOENT')throw error}
  return {async fetch(input){
    const request=input instanceof Request?input:new Request(input),url=new URL(request.url)
    const rule=redirects.get(url.pathname)
    if(rule)return Response.redirect(new URL(rule[1],url),Number(rule[2]))
    let path
    try{path=decodeURIComponent(url.pathname)}catch{return new Response('Not found',{status:404})}
    if(path.includes('\\')||path.includes('\0')||path.split('/').some(x=>x.startsWith('.')||x.startsWith('_'))) {
      if(path!=='/__shell.html')return new Response('Not found',{status:404})
    }
    let file=resolve(root,'.'+path)
    try{
      file=await realpath(file)
      if(!file.startsWith(root+sep)||(await stat(file)).isDirectory())throw new Error('Not a public file')
      const type=types[extname(file)]
      if(!type)throw new Error('Not a public file')
      const bytes=await readFile(file),headers={'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':type.startsWith('text/html')?'no-store':'public,max-age=3600','Accept-Ranges':'bytes'}
      let start=0,end=bytes.length-1,status=200
      const range=request.headers.get('Range')
      if(range){
        const match=/^bytes=(\d+)-(\d*)$/.exec(range)
        if(!match)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.length}})
        start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end
        if(start>end||start>=bytes.length)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.length}})
        status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+bytes.length
      }
      headers['Content-Length']=String(end-start+1)
      return new Response(request.method==='HEAD'?null:bytes.subarray(start,end+1),{status,headers})
    }catch{
      const body=await readFile(resolve(root,'404.html'))
      return new Response(request.method==='HEAD'?null:body,{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff'}})
    }
  }}
}
