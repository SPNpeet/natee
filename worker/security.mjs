const enc = new TextEncoder()
export const hex = buffer => Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('')
export const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)))
export const digest = async value => hex(await crypto.subtle.digest('SHA-256', enc.encode(value)))
export function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
async function derive(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, key, 256))
}
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) throw new Error('รหัสผ่านต้องมี 12–128 ตัวอักษร')
  const salt = randomToken()
  return 'pbkdf2-sha256-100000:' + salt + ':' + await derive(password, salt)
}
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 128 || typeof stored !== 'string') return false
  const [scheme, salt, hash] = stored.split(':')
  return scheme === 'pbkdf2-sha256-100000' && equal(await derive(password, salt), hash)
}
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
export async function readBody(request, max = 1024 * 1024) {
  if (Number(request.headers.get('Content-Length')) > max) throw new HttpError(413, 'ไฟล์หรือข้อมูลใหญ่เกินกำหนด')
  const reader = request.body?.getReader()
  if (!reader) return new Uint8Array()
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > max) { await reader.cancel(); throw new HttpError(413, 'ไฟล์หรือข้อมูลใหญ่เกินกำหนด') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return bytes
}
export async function readJSON(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new HttpError(415, 'รูปแบบข้อมูลไม่ถูกต้อง')
  try { return JSON.parse(new TextDecoder().decode(await readBody(request))) }
  catch (error) { if (error.status) throw error; throw new HttpError(400, 'ข้อมูลไม่สมบูรณ์') }
}
