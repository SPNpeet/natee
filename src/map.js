// แปลงสิ่งที่เจ้าของร้านวางลงช่องแผนที่ ให้เป็นลิงก์ที่ฝังในหน้าเว็บได้จริง
// ลิงก์หน้าสถานที่ของ Google Maps (/maps/place/...) ห้ามฝังในเว็บอื่น ถ้าใช้ตรง ๆ จะเห็นแค่ไอคอนหน้าเสีย
// รับได้ทั้งลิงก์หน้าสถานที่ ลิงก์ที่มี @ละติจูด,ลองจิจูด โค้ด iframe จากปุ่มฝังแผนที่ และพิกัดเปล่า เช่น 18.85, 98.98

const COORDS = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/

function valid(lat, lng) {
  const a = Number(lat), b = Number(lng)
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 ? { lat: a, lng: b } : null
}

function iframeSource(value) {
  const match = /<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i.exec(value)
  return match ? match[1].replaceAll('&amp;', '&') : value
}

function parse(value) {
  try { return new URL(iframeSource(String(value || '').trim())) } catch { return null }
}

export function isGoogleMaps(url) {
  return Boolean(url) && url.protocol === 'https:' && /(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname.startsWith('/maps')
}

export function isShortMapLink(value) {
  const url = parse(value)
  return Boolean(url) && (url.hostname === 'maps.app.goo.gl' || (url.hostname === 'goo.gl' && url.pathname.startsWith('/maps')))
}

// พิกัดและชื่อสถานที่ที่อ่านได้จากสิ่งที่วางมา หมุดของสถานที่ (!3d...!4d...) แม่นกว่าจุดกึ่งกลางจอ (@...)
export function mapPoint(value) {
  const raw = String(value || '').trim()
  const plain = COORDS.exec(raw)
  if (plain) return valid(plain[1], plain[2])
  const url = parse(raw)
  if (!url) return null
  const text = decodeURIComponent(url.pathname + url.search)
  const pin = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(text)
  const center = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(text) ||
    /\/maps\/(?:search|place|dir)\/(?:[^/]*\/)*?(-?\d+(?:\.\d+)?),[+\s]*(-?\d+(?:\.\d+)?)/.exec(text)
  const query = [url.searchParams.get('ll'), url.searchParams.get('q'), url.searchParams.get('query'), url.searchParams.get('destination')]
    .map((v) => v && COORDS.exec(v)).find(Boolean)
  const found = pin || query || center
  const point = found ? valid(found[1], found[2]) : null
  const place = /\/maps\/place\/([^/]+)/.exec(url.pathname)
  const name = place ? decodeURIComponent(place[1].replaceAll('+', ' ')).trim() : ''
  return point ? { ...point, name: COORDS.test(name) ? '' : name } : null
}

// ลิงก์ฝังแผนที่ที่ใช้ได้เสมอ ถ้าอ่านพิกัดไม่ได้จะใช้ที่อยู่ร้านแทน ดีกว่าปล่อยกรอบแผนที่ว่าง
export function mapEmbedUrl(value, { address = '', lang = 'th' } = {}) {
  const url = parse(value)
  if (isGoogleMaps(url) && (url.pathname.startsWith('/maps/embed') || url.searchParams.get('output') === 'embed')) return url.toString()
  const point = mapPoint(value)
  const params = new URLSearchParams()
  if (point) {
    params.set('q', point.name || point.lat + ',' + point.lng)
    params.set('ll', point.lat + ',' + point.lng)
  } else if (address) {
    params.set('q', address)
  } else {
    return ''
  }
  params.set('z', '16')
  params.set('hl', lang)
  params.set('output', 'embed')
  return 'https://www.google.com/maps?' + params.toString()
}
