/**
 * ถ่ายภาพหน้าจอเมนูข้อความติดต่อสำหรับคู่มือ จากตัวจำลองในเครื่อง
 *
 * ต้องมี wrangler dev รออยู่ที่ 127.0.0.1:8787 บนฐานข้อมูลทดสอบ
 * สคริปต์จะตั้งบัญชีตัวอย่าง ส่งข้อความตัวอย่างหนึ่งรายการ แล้วถ่ายหน้ากล่องข้อความ
 *
 * ใช้งาน  node capture-inbox.mjs <ไฟล์ปลายทาง.jpg>
 */
import { chromium } from '@playwright/test'

const base = 'http://127.0.0.1:8787'
const email = 'admin@example.test'
const password = 'Natee-CI-only-passphrase-2026!'
const token = 'ci-only-setup-token-not-for-production-827456192038'
const out = process.argv[2] || 'images/11-inbox.jpg'

const post = (path, body) => fetch(base + path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: base },
  body: JSON.stringify(body),
})

// บัญชีตัวอย่างของตัวจำลอง ถ้าเคยตั้งแล้วระบบตอบ 409 ใช้บัญชีเดิมต่อได้เลย
const setup = await post('/api/setup', { email, password, token })
if (![200, 409].includes(setup.status)) throw new Error('setup ' + setup.status + ' ' + await setup.text())

// ข้อความตัวอย่างในภาพ ไม่ใช่ข้อมูลจริงของลูกค้า
const sent = await post('/api/inquiries', {
  name: 'คุณสมศักดิ์ ตัวอย่าง',
  phone: '0812345678',
  area: 'อำเภอสันทราย เชียงใหม่',
  message: 'ต้องการน้ำประปา 2,000 ลิตร เติมแท็งก์ที่บ้าน สะดวกให้เข้าช่วงเย็นวันเสาร์ครับ',
  language: 'th',
})
if (sent.status !== 201) throw new Error('inquiry ' + sent.status + ' ' + await sent.text())

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 806 } })
await page.goto(base + '/admin/')
await page.getByLabel('อีเมล').fill(email)
await page.getByLabel('รหัสผ่าน').fill(password)
await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
await page.getByRole('button', { name: 'ข้อความติดต่อ' }).click()
await page.getByText('คุณสมศักดิ์ ตัวอย่าง').waitFor()
await page.waitForTimeout(500)
await page.screenshot({ path: out, type: 'jpeg', quality: 82 })
await browser.close()
console.log('saved', out)
