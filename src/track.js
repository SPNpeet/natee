/** Aggregate interactions in the same-origin Worker; no visitor IDs or form contents. */

// ป้ายกำกับ Conversion ของ Google Ads ต่อหนึ่งเหตุการณ์ เหตุการณ์อื่นไม่ถูกส่งออกนอกเครื่อง
const ADS_LABELS = { call_click: 'callLabel', line_click: 'lineLabel' }

let ads = null

function push() {
  window.dataLayer.push(arguments)
}

/**
 * โหลดแท็ก Google ครั้งเดียวตอนหน้าเปิด
 * ไม่มีรหัส = ไม่โหลดสคริปต์ ไม่สร้าง dataLayer และไม่ส่งอะไรเลย
 */
export function setupAds(config) {
  if (typeof window === 'undefined' || ads || !config?.conversionId) return
  ads = config
  window.dataLayer = window.dataLayer || []
  push('js', new Date())
  push('config', config.conversionId)
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.conversionId)
  document.head.appendChild(script)
}

export function track(name, params = {}) {
  if (typeof window === 'undefined' || name === 'form_submit') return
  // Successful inquiries are counted by the server in the same transaction.
  try {
    void fetch('api/events', { method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name,place:params.place,language:params.language||params.to||document.documentElement.lang}),
      keepalive:true }).catch(()=>{})
  } catch { /* Statistics must not interrupt public controls. */ }
  try {
    const label = ads && ads[ADS_LABELS[name]]
    if (label) push('event', 'conversion', { send_to: ads.conversionId + '/' + label })
  } catch { /* Statistics must not interrupt public controls. */ }
}
