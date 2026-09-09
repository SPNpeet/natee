/** Aggregate interactions in the same-origin Worker; no visitor IDs or form contents. */
export function track(name, params = {}) {
  if (typeof window === 'undefined' || name === 'form_submit') return
  // Successful inquiries are counted by the server in the same transaction.
  try {
    void fetch('api/events', { method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name,place:params.place,language:params.language||params.to||document.documentElement.lang}),
      keepalive:true }).catch(()=>{})
  } catch { /* Statistics must not interrupt public controls. */ }
}
