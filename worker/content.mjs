import upgrades from './content-upgrades.mjs'

export function withDefaults(model,saved) {
  if(Array.isArray(model))return Array.isArray(saved)?saved.map(v=>withDefaults(model[0],v)):structuredClone(model)
  if(model && typeof model==='object')return Object.fromEntries(Object.keys(model).map(key=>[key,withDefaults(model[key],saved?.[key])]))
  return typeof saved===typeof model?saved:model
}

// เนื้อหาที่เคยกดบันทึกไว้ถูกเก็บทั้งชุด ค่าตั้งต้นในโค้ดที่เปลี่ยนภายหลังจึงไปไม่ถึงหน้าเว็บ
// ช่องไหนยังเหมือนค่าตั้งต้นรุ่นเก่าทุกตัวอักษร แปลว่าเจ้าของไม่เคยแก้ ให้กลับไปใช้ค่าตั้งต้นรุ่นใหม่
// ช่องที่เจ้าของแก้เองจะไม่ถูกแตะ
export function upgradeSaved(saved, list = upgrades) {
  const out = structuredClone(saved)
  for (const { path, from } of list) {
    const parent = path.slice(0, -1).reduce((o, k) => o?.[k], out)
    const key = path.at(-1)
    if (parent && Object.hasOwn(parent, key) && JSON.stringify(parent[key]) === JSON.stringify(from)) delete parent[key]
  }
  return out
}
// รูปและคลิปเป็นของชุดเดียวกันทั้งสองภาษา หน้าไทยเป็นต้นฉบับ
// เจ้าของร้านเคยเปลี่ยนรูปรถเฉพาะฝั่งไทย หน้าอังกฤษจึงค้างรูปเก่า แก้ที่นี่ที่เดียวทั้งตอนแสดงผลและตอนบันทึก
const SHARED_MEDIA = [['fleet', ['image']], ['videos', ['file', 'poster']], ['servicePages', ['image']]]
const SHARED_ARTICLE_IMAGES = ['heroImage', 'benefitsImage', 'summaryImage']
export function shareMedia(content) {
  const th = content.I18N?.th, en = content.I18N?.en
  if (!th || !en) return content
  for (const [list, keys] of SHARED_MEDIA) {
    if (!Array.isArray(th[list]) || th[list].length !== en[list]?.length) continue
    th[list].forEach((item, i) => { for (const key of keys) if (key in item) en[list][i][key] = item[key] })
  }
  const a = th.knowledge, b = en.knowledge
  if (a && b) {
    for (const key of SHARED_ARTICLE_IMAGES) if (key in a) b[key] = a[key]
    if (a.uses?.length === b.uses?.length) a.uses.forEach((item, i) => { b.uses[i].image = item.image })
  }
  return content
}
export function mergeContent(model, saved, list = upgrades) {
  return shareMedia(withDefaults(model, upgradeSaved(saved, list)))
}
