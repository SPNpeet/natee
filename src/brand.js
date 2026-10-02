export function brandCSS(color) {
  const value=/^#[0-9a-f]{6}$/i.test(color)?color:'#0f6fbf'
  const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16))
  const dark='#'+rgb.map(v=>Math.round(v*.72).toString(16).padStart(2,'0')).join('')
  return ':root{--natee-brand:'+value+';--natee-brand-dark:'+dark+';--natee-brand-soft:rgba('+rgb.join(',')+',0.09)}'
}
// รูปที่อัปโหลดมีรุ่นเล็กกว้าง 960 พิกเซลชื่อเดียวกันลงท้าย -sm.webp ถ้ายังไม่มี Worker ส่งรูปเต็มแทน
export const uploadSmall = name => name.replace(/\.(png|jpg|webp)$/,'-sm.webp')
// ขนาดรูปให้เบราว์เซอร์เลือก มือถือได้รุ่นเล็ก จอใหญ่ได้รูปเต็ม
export function imageSrcSet(name,fullWidth) {
  if(name.startsWith('uploads/'))return uploadSmall(name)+' 960w, '+name+' 1920w'
  return imageAsset(name,'-sm.webp')+' 560w, '+imageAsset(name)+' '+fullWidth+'w'
}
export function imageAsset(name,suffix='.webp') {
  if(name.startsWith('uploads/'))return suffix==='-sm.webp' ? uploadSmall(name) : name
  if(name==='og-banner')return 'images/og-banner.jpg'
  if(suffix==='-sm.webp'&&!/^(truck-(4|6)wheel|work-\d\d)$/.test(name))suffix='.webp'
  return 'images/'+name+suffix
}
