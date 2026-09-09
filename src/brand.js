export function brandCSS(color) {
  const value=/^#[0-9a-f]{6}$/i.test(color)?color:'#0f6fbf'
  const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16))
  const dark='#'+rgb.map(v=>Math.round(v*.72).toString(16).padStart(2,'0')).join('')
  return ':root{--natee-brand:'+value+';--natee-brand-dark:'+dark+';--natee-brand-soft:rgba('+rgb.join(',')+',0.09)}'
}
export function imageAsset(name,suffix='.webp') {
  if(name.startsWith('uploads/'))return name
  if(name==='og-banner')return 'images/og-banner.jpg'
  if(suffix==='-sm.webp'&&!/^(truck-(4|6)wheel|work-\d\d)$/.test(name))suffix='.webp'
  return 'images/'+name+suffix
}
