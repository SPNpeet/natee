/**
 * ถ่ายภาพหน้าจอเมนูหลังบ้านสำหรับคู่มือ จากตัวจำลองในเครื่อง
 *
 * ใช้ Chrome ที่ติดตั้งในเครื่องผ่าน DevTools Protocol ไม่ต้องลงไลบรารีเพิ่ม
 * ต้องมี wrangler dev รออยู่ที่ 127.0.0.1:8787 บนฐานข้อมูลทดสอบที่ยังว่าง เนื้อหาในภาพจึงเป็นค่าตั้งต้น
 *
 * ใช้งาน  node capture-admin.mjs <ชื่อเมนู> <ไฟล์ปลายทาง.jpg> [ความสูงภาพ]
 * เช่น     node capture-admin.mjs ข้อมูลร้าน images/02-contact.jpg 1625
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = 'http://127.0.0.1:8787'
const email = 'admin@example.test'
const password = 'Natee-CI-only-passphrase-2026!'
const token = 'ci-only-setup-token-not-for-production-827456192038'
const [section = 'ข้อมูลร้าน', out = 'images/02-contact.jpg', height = '1625'] = process.argv.slice(2)
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const post = (path, body) => fetch(base + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify(body),
})

// บัญชีตัวอย่างของตัวจำลอง ถ้าเคยตั้งแล้วระบบตอบ 409 จึงเข้าสู่ระบบด้วยบัญชีเดิมแทน
let session = await post('/api/setup', { email, password, token })
if (session.status === 409) session = await post('/api/login', { email, password })
if (session.status !== 200) throw new Error('เข้าระบบตัวอย่างไม่ได้ ' + session.status)
const cookie = session.headers.get('set-cookie').split(';')[0].split('=')

const port = 9333
const browser = spawn(chrome, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + mkdtempSync(join(tmpdir(), 'natee-manual-')), '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
try {
  let target
  for (let i = 0; i < 40 && !target; i++) {
    await wait(250)
    target = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).then((list) => list.find((t) => t.type === 'page')).catch(() => null)
  }
  if (!target) throw new Error('เปิด Chrome ไม่ได้')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }))
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id
    pending.set(n, (msg) => (msg.error ? reject(new Error(method + ' ' + msg.error.message)) : resolve(msg.result)))
    ws.send(JSON.stringify({ id: n, method, params }))
  })
  const evaluate = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }).then((r) => r.result.value)

  await send('Network.enable')
  // Google ไม่วาดแผนที่ให้เบราว์เซอร์ที่ระบุตัวว่า HeadlessChrome ตัวอย่างแผนที่ในภาพจะว่าง
  const { userAgent } = await send('Browser.getVersion')
  await send('Network.setUserAgentOverride', { userAgent: userAgent.replace('HeadlessChrome', 'Chrome') })
  await send('Network.setCookie', { name: cookie[0], value: cookie[1], url: base + '/' })
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: Number(height), deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: base + '/admin/' })
  for (let i = 0; i < 40; i++) {
    await wait(250)
    if (await evaluate(`Boolean(document.querySelector('aside nav button'))`)) break
  }
  const clicked = await evaluate(`(()=>{const b=[...document.querySelectorAll('aside nav button')].find(x=>x.textContent===${JSON.stringify(section)});if(b)b.click();return Boolean(b)})()`)
  if (!clicked) throw new Error('ไม่พบเมนู ' + section)
  await wait(Number(process.env.SETTLE_MS || 1500))
  await evaluate('document.fonts.ready.then(()=>true)')
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: Number(height), scale: 1 } })
  writeFileSync(out, Buffer.from(shot.data, 'base64'))
  console.log('บันทึก', out)
  ws.close()
} finally {
  browser.kill()
}
