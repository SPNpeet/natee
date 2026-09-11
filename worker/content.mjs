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
export function mergeContent(model, saved, list = upgrades) {
  return withDefaults(model, upgradeSaved(saved, list))
}
