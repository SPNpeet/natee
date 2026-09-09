/**
 * บันทึกเหตุการณ์สำคัญบนหน้าเว็บ
 *
 * ตัวนี้ไม่ผูกกับผู้ให้บริการเจ้าไหน ถ้ายังไม่ได้ติดตั้งตัวนับสถิติก็ไม่ทำอะไรเลย
 * เมื่อพร้อมใช้ ให้วางสคริปต์ของ Google Analytics หรือ Plausible ไว้ใน index.html
 * เหตุการณ์ทั้งหมดจะถูกส่งไปให้เองโดยไม่ต้องแก้โค้ดส่วนอื่น
 *
 * เหตุการณ์ที่บันทึก
 *   call_click      กดปุ่มโทร พร้อมบอกว่ากดจากจุดไหนของหน้า
 *   line_click      กดปุ่มไลน์
 *   video_open      เปิดดูคลิปหน้างาน
 *   language_switch สลับภาษา
 *   form_submit     ส่งฟอร์มฝากข้อความ
 */

export function track(name, params = {}) {
  if (typeof window === 'undefined') return

  try {
    // Aggregate interaction counts only; no visitor identifiers or form contents.
    if (name !== 'form_submit') void fetch('api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, place: params.place, language: params.language || params.to }), keepalive: true }).catch(() => {})

    // Google Analytics 4 หรือ Google Tag Manager
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params)
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...params })
    }

    // Plausible
    if (typeof window.plausible === 'function') {
      window.plausible(name, { props: params })
    }
  } catch {
    /* ตัวนับสถิติมีปัญหาต้องไม่ทำให้เว็บพัง */
  }
}
