export function withDefaults(model,saved) {
  if(Array.isArray(model))return Array.isArray(saved)?saved.map(v=>withDefaults(model[0],v)):structuredClone(model)
  if(model && typeof model==='object')return Object.fromEntries(Object.keys(model).map(key=>[key,withDefaults(model[key],saved?.[key])]))
  return typeof saved===typeof model?saved:model
}
