import { randomToken, digest, equal, hashPassword, verifyPassword, HttpError, readJSON } from './security.mjs'

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
    return loginResponse(user, env)
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
      if (typeof body.active === 'boolean') await query(env,'UPDATE users SET active=? WHERE id=?',body.active ? 1 : 0,id).run()
      if (body.password) await query(env,'UPDATE users SET password=? WHERE id=?',await password(body.password),id).run()
      await query(env,'DELETE FROM sessions WHERE user_id=?',id).run()
      return json({success:true})
    }
  }
  throw new HttpError(404,'ไม่พบรายการที่ต้องการ')
}
async function handle(request,env) {
  if (!env.SITE_URL) throw new HttpError(503,'เว็บไซต์ยังตั้งค่าไม่ครบ')
  const url=new URL(request.url)
  if (url.pathname.startsWith('/api/')) return api(request,env,url.pathname)
  if (!['GET','HEAD'].includes(request.method)) throw new HttpError(405,'ไม่รองรับคำขอนี้')
  if (url.pathname === '/admin') return Response.redirect(url.origin+'/admin/',302)
  const target=url.pathname === '/admin/' ? new URL('/admin/index.html',url) : request
  const response=await env.ASSETS.fetch(target)
  return new Response(response.body,{status:response.status,headers:{...Object.fromEntries(response.headers),...securityHeaders,'Cache-Control':'no-store'}})
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
    await env.DB.batch([query(env,'DELETE FROM sessions WHERE expires<?',Date.now()),query(env,'DELETE FROM limits WHERE expires<?',Date.now())])
  },
}
