// เทียบเนื้อหาที่บันทึกไว้ในฐานข้อมูลกับค่าตั้งต้นของโค้ดรุ่นปัจจุบัน
// ใช้ตอบว่าของที่เจ้าของเว็บแก้ไว้ยังอยู่ไหม และสิ่งที่หน้าเว็บแสดงมาจากของที่แก้หรือจากค่าตั้งต้น
// อ่านอย่างเดียว รับข้อมูลทาง stdin แล้วเขียนผลเป็นตัวเลขลงไฟล์ ไม่พิมพ์ค่าของเนื้อหาออกมา
import { readFileSync, writeFileSync } from 'node:fs'
import { mergeContent } from '../worker/content.mjs'

const seed = JSON.parse(readFileSync('server-build/seed.json', 'utf-8'))
const saved = JSON.parse(readFileSync(process.argv[2], 'utf-8'))

function leaves(path, value, out) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of Object.keys(value)) leaves(path ? path + '.' + key : key, value[key], out)
    return out
  }
  out.set(path, JSON.stringify(value))
  return out
}

function changed(a, b) {
  const left = leaves('', a, new Map()), right = leaves('', b, new Map())
  return [...new Set([...left.keys(), ...right.keys()])].filter((k) => left.get(k) !== right.get(k))
}

const savedChanges = changed(seed, saved)
const shownChanges = changed(seed, mergeContent(seed, structuredClone(saved)))
const droppedByUpgrade = savedChanges.filter((k) => !shownChanges.includes(k))
const text = JSON.stringify(saved)

const result = {
  saved_changes: savedChanges.length,
  shown_changes: shownChanges.length,
  dropped_by_upgrade: droppedByUpgrade.length,
  uploads_in_saved: (text.match(/uploads\//g) || []).length,
}
writeFileSync('content-diff.env', Object.entries(result).map(([k, v]) => k + '=' + v).join('\n') + '\n')
console.log(result)
console.log('ชื่อฟิลด์ที่ต่างจากค่าตั้งต้น:', savedChanges.join(', ') || 'ไม่มี')
console.log('ชื่อฟิลด์ที่ถูกตัดออกตอนรวมค่าตั้งต้น:', droppedByUpgrade.join(', ') || 'ไม่มี')
