import { canonicalRedirect } from './canonical.mjs'
import seed from '../server-build/seed.json'
import buildInfo from '../server-build/build.json'
import { withDefaults } from './content.mjs'
import { render } from '../server-build/entry-server.js'
import { renderPage, sitemap } from './render-page.mjs'
import { randomToken, digest, equal, hashPassword, verifyPassword, HttpError, readBody, readJSON } from './security.mjs'
import { validateContent, mediaType } from './validate.mjs'

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; frame-src https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
}
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...securityHeaders, ...headers } })
const query = (env, sql, ...values) => env.DB.prepare(sql).bind(...values)
async function limit(env, key, max, seconds) {
  const now = Date.now()
  const row = await query(env, 'INSERT INTO limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<? THEN ? ELSE expires END RETURNING count', await digest(key), now + seconds*1000, now, now, now + seconds*1000).first()
  if (row.count > max) throw new HttpError(429, 'ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่')
}
async function currentContent(env) {
  const row = await query(env, 'SELECT version,data,updated FROM content WHERE id=1').first()
  return row ? { version: row.version, content: withDefaults(seed,JSON.parse(row.data)), updated: row.updated } : { version: 0, content: seed, updated: null }
}
function originCheck(request, env) {
  const origin = new URL(env.SITE_URL).origin
  if (request.headers.get('Origin') !== origin) throw new HttpError(403, 'คำขอไม่ได้มาจากเว็บไซต์นี้')
}
function cookie(value, env, age = 28800) {
  return 'natee_session=' + value + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + age + (new URL(env.SITE_URL).protocol === 'https:' ? '; Secure' : '')
}
async function session(request, env) {
  const value = /(?:^|;\s*)natee_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('Cookie') || '')?.[1]
  if (!value) return null
  return query(env, 'SELECT sessions.id,sessions.csrf,users.id AS userId,users.email,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.id=? AND sessions.expires>? AND users.active=1', await digest(value), Date.now()).first()
}
async function loginResponse(user, env) {
  const raw = randomToken()
  const csrf = randomToken()
  await query(env, 'INSERT INTO sessions VALUES (?,?,?,?)', await digest(raw), user.id, csrf, Date.now()+28800000).run()
  return json({ user: { id: user.id, email: user.email, role: user.role }, csrf }, 200, { 'Set-Cookie': cookie(raw, env) })
}
function email(value) {
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new HttpError(422, 'อีเมลไม่ถูกต้อง')
  return value.trim().toLowerCase()
}
async function password(value) {
  try { return await hashPassword(value) } catch { throw new HttpError(422, 'รหัสผ่านต้องมี 12–128 ตัวอักษร') }
}
async function api(request, env, path) {
  const method = request.method
  const ip = request.headers.get('CF-Connecting-IP') || 'local'
  if (!['GET','HEAD'].includes(method)) originCheck(request, env)
  if (path === '/api/session' && method === 'GET') {
    const active = await session(request, env)
    if (active) return json({ user: { id: active.userId, email: active.email, role: active.role }, csrf: active.csrf })
    const count = await query(env, 'SELECT COUNT(*) AS n FROM users').first()
    return json({ user: null, setupRequired: count.n === 0 })
  }
  if (path === '/api/setup' && method === 'POST') {
    await limit(env, 'setup:' + ip, 5, 900)
    const body = await readJSON(request)
    if (!env.SETUP_TOKEN || env.SETUP_TOKEN.length < 32 || !equal(body.token, env.SETUP_TOKEN)) throw new HttpError(403, 'รหัสตั้งค่าระบบไม่ถูกต้อง')
    const result = await query(env, "INSERT INTO users(email,password,role) SELECT ?,?,'admin' WHERE NOT EXISTS (SELECT 1 FROM users)", email(body.email), await password(body.password)).run()
    if (!result.meta.changes) throw new HttpError(409, 'ระบบมีเจ้าของแล้ว กรุณาเข้าสู่ระบบ')
    const user = await query(env, 'SELECT id,email,role FROM users WHERE id=?', result.meta.last_row_id).first()
    return loginResponse(user, env)
  }
  if (path === '/api/login' && method === 'POST') {
    await limit(env, 'login:' + ip, 10, 900)
    const body = await readJSON(request)
    const address = email(body.email)
    await limit(env, 'login-account:' + address, 10, 900)
    const user = await query(env, 'SELECT * FROM users WHERE email=?', address).first()
    // Use a fixed valid dummy salt/hash format so unknown emails also run the KDF.
    const stored = user?.password || 'pbkdf2-sha256-100000:' + '0'.repeat(64) + ':' + '0'.repeat(64)
    if (!await verifyPassword(body.password, stored) || !user?.active) throw new HttpError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    await env.DB.batch([query(env,'DELETE FROM limits WHERE key=?',await digest('login:' + ip)),query(env,'DELETE FROM limits WHERE key=?',await digest('login-account:' + address))])
    return loginResponse(user, env)
  }
  if (path === '/api/inquiries' && method === 'POST') {
    await limit(env, 'inquiry:' + ip, 5, 900)
    const body = await readJSON(request)
    if (body.botcheck) return json({ success: true })
    const { content } = await currentContent(env)
    if (!content.FORM.enabled) throw new HttpError(403, 'กรุณาติดต่อทางโทรศัพท์หรือ LINE')
    const text = (key, max, required = false) => {
      const value = typeof body[key] === 'string' ? body[key].trim() : ''
      if (value.length > max || (required && !value)) throw new HttpError(422, 'กรุณาตรวจข้อมูลที่กรอก')
      return value
    }
    const phone = text('phone',15,true)
    if (!/^\d{9,15}$/.test(phone)) throw new HttpError(422, 'เบอร์โทรต้องมีตัวเลข 9–15 หลัก')
    await env.DB.batch([
      query(env, 'INSERT INTO inquiries(name,phone,area,message,language,created) VALUES (?,?,?,?,?,?)', text('name',120,true),phone,text('area',160),text('message',1500),body.language === 'en' ? 'en' : 'th',new Date().toISOString()),
      query(env,"INSERT INTO daily_stats(day,event,place,language,count) VALUES (?,'form_submit','contact',?,1) ON CONFLICT(day,event,place,language) DO UPDATE SET count=count+1",new Date().toISOString().slice(0,10),body.language==='en'?'en':'th'),
    ])
    return json({ success: true }, 201)
  }
  if (path === '/api/events' && method === 'POST') {
    await limit(env,'event:'+ip,60,60)
    const body=await readJSON(request)
    if (!['call_click','line_click','video_open','language_switch'].includes(body.name)) throw new HttpError(422,'เหตุการณ์ไม่ถูกต้อง')
    const places=['header','hero','hero-secondary','cta','pricing','contact','footer','footer-secondary','sticky']
    const place=places.includes(body.place)?body.place:'other'
    const language=body.language==='en'?'en':'th'
    await query(env,'INSERT INTO daily_stats(day,event,place,language,count) VALUES (?,?,?,?,1) ON CONFLICT(day,event,place,language) DO UPDATE SET count=count+1',new Date().toISOString().slice(0,10),body.name,place,language).run()
    return json({success:true})
  }
  const active = await session(request, env)
  if (!active) throw new HttpError(401, 'กรุณาเข้าสู่ระบบอีกครั้ง')
  if (!['GET','HEAD'].includes(method) && !equal(request.headers.get('X-CSRF-Token'), active.csrf)) throw new HttpError(403, 'คำขอหมดอายุ กรุณาโหลดหน้าใหม่')
  if (path === '/api/logout' && method === 'POST') {
    await query(env, 'DELETE FROM sessions WHERE id=?',active.id).run()
    return json({ success:true },200,{'Set-Cookie':cookie('',env,0)})
  }
  if (path === '/api/password' && method === 'POST') {
    const body = await readJSON(request)
    await limit(env,'password:' + active.userId,5,900)
    const user = await query(env,'SELECT password FROM users WHERE id=?',active.userId).first()
    if (!await verifyPassword(body.currentPassword,user.password)) throw new HttpError(422,'รหัสผ่านเดิมไม่ถูกต้อง')
    const hashed = await password(body.password)
    await env.DB.batch([query(env,'UPDATE users SET password=? WHERE id=?',hashed,active.userId),query(env,'DELETE FROM sessions WHERE user_id=?',active.userId)])
    return json({success:true},200,{'Set-Cookie':cookie('',env,0)})
  }
  if (path === '/api/stats' && method === 'GET') return json((await query(env,"SELECT event,SUM(count) AS count FROM daily_stats WHERE day>=? GROUP BY event",new Date(Date.now()-29*86400000).toISOString().slice(0,10)).all()).results)
  if (path === '/api/content' && method === 'GET') return json(await currentContent(env))
  if (path === '/api/content' && method === 'PUT') {
    const body = await readJSON(request)
    const data = validateContent(seed,body.content)
    const before = await currentContent(env)
    if (!Number.isInteger(body.version) || body.version !== before.version) throw new HttpError(409,'มีคนแก้ข้อมูลใหม่แล้ว กรุณาโหลดล่าสุดก่อนบันทึก')
    // Verify uploaded media references against the authenticated media catalog.
    const refs = [...new Set(JSON.stringify(data).match(/uploads\/[a-f0-9]{32}\.(?:png|jpg|webp|mp4)/g) || [])]
    for (const ref of refs) if (!await query(env,'SELECT path FROM media WHERE path=?',ref).first()) throw new HttpError(422,'ไม่พบไฟล์ในคลังสื่อ')
    const template = await (await env.ASSETS.fetch(new URL('/__shell.html',request.url))).text()
    const site = env.SITE_URL.replace(/\/$/,'')
    const th = renderPage(template,render,data,'th',site)
    const en = renderPage(template,render,data,'en',site)
    const now = new Date().toISOString()
    let write
    if (before.version === 0) {
      write = query(env,'INSERT OR IGNORE INTO content(id,version,data,html_th,html_en,updated,site,render_version) VALUES (1,1,?,?,?,?,?,?)',JSON.stringify(data),th,en,now,site,buildInfo.id)
    } else {
      write = query(env,'UPDATE content SET version=version+1,data=?,html_th=?,html_en=?,updated=?,site=?,render_version=? WHERE id=1 AND version=?',JSON.stringify(data),th,en,now,site,buildInfo.id,before.version)
    }
    const results=await env.DB.batch([
      write,
      query(env,'INSERT OR IGNORE INTO revisions VALUES (?,?,?,?)',before.version,JSON.stringify(before.content),active.userId,now),
      query(env,'DELETE FROM revisions WHERE version < ?',Math.max(0,before.version-19)),
    ])
    if (!results[0].meta.changes) throw new HttpError(409,'มีคนบันทึกข้อมูลพร้อมกัน กรุณาโหลดล่าสุด')
    return json(await currentContent(env))
  }
  if (path === '/api/revisions' && method === 'GET') return json((await query(env,'SELECT version,updated FROM revisions ORDER BY version DESC LIMIT 20').all()).results)
  if (/^\/api\/revisions\/\d+$/.test(path) && method === 'GET') {
    const row=await query(env,'SELECT data FROM revisions WHERE version=?',Number(path.split('/').pop())).first()
    if (!row) throw new HttpError(404,'ไม่พบข้อมูลรุ่นนี้')
    return json({content:withDefaults(seed,JSON.parse(row.data))})
  }
  if (path === '/api/media' && method === 'GET') return json((await query(env,'SELECT * FROM media ORDER BY created DESC LIMIT 500').all()).results)
  if (path === '/api/media' && method === 'POST') {
    await limit(env,'upload:' + active.userId,50,86400)
    const bytes = await readBody(request,8*1024*1024)
    const [ext,mime] = mediaType(bytes)
    if (mime.startsWith('image/') && bytes.length > 5*1024*1024) throw new HttpError(413,'รูปต้องไม่เกิน 5 MB')
    const uploadPath='uploads/' + randomToken().slice(0,32) + '.' + ext
    const result=await query(env,'INSERT INTO media SELECT ?,?,?,? WHERE (SELECT COALESCE(SUM(bytes),0) FROM media)+? <= 800000000 AND (SELECT COUNT(*) FROM media)<500',uploadPath,mime,bytes.length,new Date().toISOString(),bytes.length).run()
    if (!result.meta.changes) throw new HttpError(413,'คลังสื่อเต็ม (พื้นที่หรือ 500 ไฟล์) กรุณาสำรองและลบไฟล์ที่ไม่ได้ใช้')
    try { await env.MEDIA.put(uploadPath,bytes,{metadata:{mime}}) }
    catch { await query(env,'DELETE FROM media WHERE path=?',uploadPath).run(); throw new HttpError(503,'อัปโหลดไม่สำเร็จหรือโควต้าเต็ม กรุณาลองภายหลัง') }
    return json({path:uploadPath,mime,bytes:bytes.length},201)
  }
  if (path === '/api/media' && method === 'DELETE') {
    const body=await readJSON(request)
    const row=await query(env,'SELECT path FROM media WHERE path=?',body.path).first()
    if (!row) throw new HttpError(404,'ไม่พบไฟล์')
    const current=await currentContent(env)
    const history=(await query(env,'SELECT data FROM revisions').all()).results
    if (JSON.stringify(current.content).includes(row.path) || history.some(x=>x.data.includes(row.path))) throw new HttpError(409,'ไฟล์ยังถูกใช้ในหน้าเว็บหรือประวัติการแก้ไข')
    await env.MEDIA.delete(row.path)
    await query(env,'DELETE FROM media WHERE path=?',row.path).run()
    return json({success:true})
  }
  if (path === '/api/inquiries' && method === 'GET') {
    const before=Number(new URL(request.url).searchParams.get('before')||Number.MAX_SAFE_INTEGER)
    if(!Number.isSafeInteger(before)||before<1)throw new HttpError(422,'หน้าข้อความไม่ถูกต้อง')
    return json((await query(env,'SELECT * FROM inquiries WHERE id<? ORDER BY id DESC LIMIT 500',before).all()).results)
  }
  if (/^\/api\/inquiries\/\d+$/.test(path) && ['PATCH','DELETE'].includes(method)) {
    const id=Number(path.split('/').pop())
    if (method === 'DELETE') await query(env,'DELETE FROM inquiries WHERE id=?',id).run()
    else await query(env,"UPDATE inquiries SET status='read' WHERE id=?",id).run()
    return json({success:true})
  }
  if (path.startsWith('/api/users')) {
    if (path === '/api/users' && method === 'GET') return json((await query(env,'SELECT id,email,role,active FROM users ORDER BY id').all()).results)
    if (path === '/api/users' && method === 'POST') {
      const body=await readJSON(request)
      const address=email(body.email)
      if (await query(env,'SELECT id FROM users WHERE email=?',address).first()) throw new HttpError(409,'อีเมลนี้มีบัญชีแล้ว')
      await query(env,'INSERT INTO users(email,password,role) VALUES (?,?,?)',address,await password(body.password),'admin').run()
      return json({success:true},201)
    }
    if (/^\/api\/users\/\d+$/.test(path) && method === 'PATCH') {
      const id=Number(path.split('/').pop())
      const body=await readJSON(request)
      if (id === active.userId) throw new HttpError(422,'ใช้หน้าเปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ')
      const user=await query(env,'SELECT id FROM users WHERE id=?',id).first()
      if (!user) throw new HttpError(404,'ไม่พบบัญชี')
      if (typeof body.active === 'boolean') {
        const changed=await query(env,'UPDATE users SET active=? WHERE id=? AND (?=1 OR (SELECT COUNT(*) FROM users WHERE active=1)>1)',body.active ? 1 : 0,id,body.active ? 1 : 0).run()
        if (!changed.meta.changes) throw new HttpError(409,'ต้องเหลือแอดมินที่ใช้งานได้อย่างน้อยหนึ่งบัญชี')
      }
      if (body.password) await query(env,'UPDATE users SET password=? WHERE id=?',await password(body.password),id).run()
      await query(env,'DELETE FROM sessions WHERE user_id=?',id).run()
      return json({success:true})
    }
  }
  throw new HttpError(404,'ไม่พบรายการที่ต้องการ')
}
async function handle(request,env) {
  if (!env.SITE_URL) throw new HttpError(503,'เว็บไซต์ยังตั้งค่าไม่ครบ')
  const maintenance=env.MIGRATION_READ_ONLY === 'true'
  if (maintenance && new URL(request.url).pathname.startsWith('/api/') && !['GET','HEAD'].includes(request.method)) {
    return json({error:'กำลังย้ายระบบชั่วคราว กรุณารอสักครู่แล้วลองใหม่ หรือติดต่อทางโทรศัพท์หรือ LINE'},503,{'Retry-After':'300'})
  }
  const redirect=canonicalRedirect(request,env.SITE_URL)
  if (redirect) return redirect
  const url=new URL(request.url)
  const path=url.pathname
  if (path.startsWith('/api/')) return api(request,env,path)
  if (!['GET','HEAD'].includes(request.method)) throw new HttpError(405,'ไม่รองรับคำขอนี้')
  if (/^\/uploads\/[a-f0-9]{32}\.(png|jpg|webp|mp4)$/.test(path)) {
    const key=path.slice(1)
    const result=await env.MEDIA.getWithMetadata(key,{type:'arrayBuffer'})
    if (!result.value) return new Response('Media not available yet',{status:404,headers:{'Cache-Control':'no-store',...securityHeaders}})
    let bytes=result.value
    const size=bytes.byteLength
    const headers={...securityHeaders,'Content-Type':result.metadata.mime,'Cache-Control':'public,max-age=86400,immutable','Accept-Ranges':'bytes'}
    const range=request.headers.get('Range')
    let status=200
    if (range) {
      const match=/^bytes=(\d+)-(\d*)$/.exec(range)
      if (!match) return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size,...securityHeaders}})
      const start=Number(match[1]),end=match[2] ? Math.min(Number(match[2]),size-1) : size-1
      if (start>end || start>=size) return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size,...securityHeaders}})
      bytes=bytes.slice(start,end+1); status=206; headers['Content-Range']='bytes '+start+'-'+end+'/'+size
    }
    headers['Content-Length']=String(bytes.byteLength)
    return new Response(request.method === 'HEAD' ? null : bytes,{status,headers})
  }
  if (path === '/admin') return Response.redirect(url.origin+'/admin/',302)
  if (path === '/admin/' || path === '/admin/index.html') {
    const response=await env.ASSETS.fetch(new URL('/admin/index.html',url))
    return new Response(response.body,{status:response.status,headers:{...Object.fromEntries(response.headers),...securityHeaders,'Cache-Control':'no-store','X-Robots-Tag':'noindex'}})
  }
  const site=env.SITE_URL.replace(/\/$/,'')
  if (path === '/sitemap.xml') return new Response(sitemap(site),{headers:{...securityHeaders,'Content-Type':'application/xml'}})
  if (path === '/robots.txt') return new Response('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: '+site+'/sitemap.xml\n',{headers:{...securityHeaders,'Content-Type':'text/plain'}})
  if (['/','/index.html','/en.html'].includes(path)) {
    const row=await query(env,'SELECT * FROM content WHERE id=1').first()
    const lang=path === '/en.html' ? 'en' : 'th'
    let html=row?.['html_'+lang]
    if (!html || row?.site !== site || row?.render_version !== buildInfo.id) {
      const shell=await (await env.ASSETS.fetch(new URL('/__shell.html',url))).text()
      const data=row ? withDefaults(seed,JSON.parse(row.data)) : seed
      const th=renderPage(shell,render,data,'th',site)
      const en=renderPage(shell,render,data,'en',site)
      html=lang==='th'?th:en
      if(row && !maintenance) await query(env,'UPDATE content SET html_th=?,html_en=?,site=?,render_version=? WHERE id=1 AND version=?',th,en,site,buildInfo.id,row.version).run()
    }
    return new Response(request.method === 'HEAD' ? null : html,{headers:{...securityHeaders,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})
  }
  if (path === '/__shell.html') return new Response('Not found',{status:404,headers:securityHeaders})
  const response=await env.ASSETS.fetch(request)
  return new Response(response.body,{status:response.status,headers:{...Object.fromEntries(response.headers),...securityHeaders}})
}
export default {
  async fetch(request,env) {
    try { return await handle(request,env) }
    catch (error) {
      if (!error.status) console.error('Request failed:',error.message)
      return json({error:error.status ? error.message : 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่'},error.status || 503)
    }
  },
  async scheduled(_event,env) {
    if (env.MIGRATION_READ_ONLY === 'true') return
    const cutoff=new Date(Date.now()-90*86400000).toISOString()
    await env.DB.batch([query(env,'DELETE FROM sessions WHERE expires<?',Date.now()),query(env,'DELETE FROM limits WHERE expires<?',Date.now()),query(env,'DELETE FROM inquiries WHERE created<?',cutoff),query(env,'DELETE FROM daily_stats WHERE day<?',cutoff.slice(0,10))])
  },
}
