function walk(model, input, path = '') {
    if (Array.isArray(model)) {
      if (!Array.isArray(input) || input.length > 50) throw new HttpError(422, 'รายการไม่ถูกต้อง: ' + path)
      return input.map((item, i) => walk(model[0], item, path + '.' + i))
    }
    if (model && typeof model === 'object') {
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new HttpError(422, 'ข้อมูลไม่ถูกต้อง: ' + path)
      if (Object.keys(input).some(key => !Object.hasOwn(model, key))) throw new HttpError(422, 'มีช่องข้อมูลที่ไม่รองรับ: ' + path)
      return Object.fromEntries(Object.keys(model).map(key => [key, walk(model[key], input[key], path + '.' + key)]))
    }
    if (typeof input !== typeof model || (typeof input === 'string' && input.length > 6000) || (typeof input === 'number' && !Number.isFinite(input))) throw new HttpError(422, 'กรุณาตรวจข้อมูล: ' + path)
    return input
  }

import { HttpError } from './security.mjs'
export function validateContent(seed, value) {
  const out = walk(seed, value)
  if(!/^#[0-9a-f]{6}$/i.test(out.BRAND.color))throw new HttpError(422,'สีเว็บไซต์ไม่ถูกต้อง')
  const channels=[1,3,5].map(i=>parseInt(out.BRAND.color.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4)
  const luminance=channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722
  if(1.05/(luminance+0.05)<4.5)throw new HttpError(422,'สีหลักสว่างเกินไปสำหรับตัวอักษรสีขาว กรุณาเลือกสีเข้มขึ้น')
  for(const lang of ['th','en'])if(out.SEO[lang].title.length>160||out.SEO[lang].description.length>500)throw new HttpError(422,'ชื่อ SEO ต้องไม่เกิน 160 ตัวอักษร และคำอธิบายไม่เกิน 500 ตัวอักษร')
  for (const key of ['phone', 'phone2']) {
    const digits = out.CONTACT[key].replace(/\D/g, '')
    if (!/^\d{9,15}$/.test(digits)) throw new HttpError(422, 'เบอร์โทรต้องมีตัวเลข 9–15 หลัก')
    out.CONTACT[key + 'Href'] = 'tel:' + digits
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.CONTACT.email)) throw new HttpError(422, 'อีเมลไม่ถูกต้อง')
  for (const key of ['lineUrl', 'facebookUrl', 'mapUrl', 'mapEmbed']) {
    let url
    try { url = new URL(out.CONTACT[key]) } catch { throw new HttpError(422, 'ลิงก์ไม่ถูกต้อง: ' + key) }
    if (url.protocol !== 'https:' || url.username || url.password) throw new HttpError(422, 'ลิงก์ต้องใช้ HTTPS')
    if (key === 'mapEmbed' && !['www.google.com', 'maps.google.com'].includes(url.hostname)) throw new HttpError(422, 'แผนที่ต้องมาจาก Google Maps')
  }
  if (out.REVIEWS.rating < 0 || out.REVIEWS.rating > 5 || !Number.isInteger(out.REVIEWS.count) || out.REVIEWS.count < 0 || out.REVIEWS.count > 1000000) throw new HttpError(422, 'คะแนนรีวิวไม่ถูกต้อง')
  if (out.REVIEWS.url) {
    let u
    try { u = new URL(out.REVIEWS.url) } catch { throw new HttpError(422, 'ลิงก์รีวิวไม่ถูกต้อง') }
    if (u.protocol !== 'https:' || u.username || u.password) throw new HttpError(422, 'ลิงก์รีวิวต้องใช้ HTTPS')
  }
  if (out.I18N.th.lang !== 'th' || out.I18N.en.lang !== 'en') throw new HttpError(422, 'รหัสภาษาไม่ถูกต้อง')
  if (out.I18N.th.videos.length !== out.I18N.en.videos.length) throw new HttpError(422, 'จำนวนคลิปสองภาษาต้องเท่ากัน')
  const knownImages=new Set([...Object.values(seed.ASSETS),...seed.GALLERY,...seed.I18N.th.fleet.map(x=>x.image),...seed.I18N.th.videos.map(x=>x.file+'-poster')])
  const image = v => knownImages.has(v) || /^uploads\/[a-f0-9]{32}\.(?:png|jpg|webp)$/.test(v)
  const articleImages = Object.values(out.I18N).flatMap(L => [L.knowledge.heroImage, L.knowledge.benefitsImage, L.knowledge.summaryImage, ...L.knowledge.uses.map(x => x.image)])
  const images = [...Object.values(out.ASSETS), ...out.GALLERY, ...out.I18N.th.fleet.map(x => x.image), ...out.I18N.en.fleet.map(x => x.image), ...articleImages]
  if (images.some(x => !image(x))) throw new HttpError(422, 'กรุณาเลือกรูปจากคลังสื่อ')
  const knownVideos=new Set(seed.I18N.th.videos.map(v=>v.file))
  const video=v=>knownVideos.has(v)||/^uploads\/[a-f0-9]{32}\.mp4$/.test(v)
  for (const L of Object.values(out.I18N)) {
    for (const v of L.videos) if (!video(v.file) || (v.poster && !image(v.poster))) throw new HttpError(422, 'ไฟล์คลิปหรือภาพหน้าปกไม่ถูกต้อง')
  }
  out.FORM.endpoint = 'api/inquiries'
  out.FORM.accessKey = ''
  return out
}
export function mediaType(bytes) {
  const ascii = (a,b) => String.fromCharCode(...bytes.subarray(a,b))
  if (bytes.length > 12 && [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return ['png', 'image/png']
  if (bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ['jpg', 'image/jpeg']
  if (bytes.length > 12 && ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP') return ['webp', 'image/webp']
  if (bytes.length > 12 && ascii(4,8) === 'ftyp' && /^(isom|iso2|mp41|mp42|avc1|M4V )$/.test(ascii(8,12))) return ['mp4','video/mp4']
  throw new HttpError(422, 'รองรับเฉพาะ PNG, JPEG, WebP และ MP4')
}
