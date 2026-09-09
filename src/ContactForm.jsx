import { useRef, useState } from 'react'
import Icon from './icons.jsx'
import { FORM } from './data.js'
import { track } from './track.js'

/**
 * ฟอร์มฝากข้อความ ส่งผ่านบริการ Web3Forms จึงไม่ต้องมีเซิร์ฟเวอร์ของตัวเอง
 *
 * ถ้ายังไม่ได้ใส่กุญแจใน FORM.accessKey ฟอร์มจะไม่ถูกแสดงเลย
 * หน้าเว็บจึงไม่มีทางมีฟอร์มที่กดส่งแล้วไม่ไปไหน
 */
export default function ContactForm({ L, config = FORM }) {
  const [state, setState] = useState('idle')
  const sending = useRef(false)

  if (!config.enabled && !config.accessKey) return null

  async function onSubmit(event) {
    event.preventDefault()

    if (sending.current) return
    const form = event.currentTarget
    const data = new FormData(form)

    // ช่องล่อสำหรับดักบอท ผู้ใช้จริงจะไม่เห็นและไม่กรอก
    if (data.get('botcheck')) return

    sending.current = true
    setState('sending')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
        signal: controller.signal,
      })

      const result = await res.json()
      if (!res.ok || result.success !== true) throw new Error('ส่งไม่สำเร็จ')

      setState('sent')
      form.reset()
      track('form_submit', { language: L.lang })
    } catch {
      setState('error')
    } finally {
      clearTimeout(timeout)
      sending.current = false
    }
  }

  return (
    <form className="natee-form" onSubmit={onSubmit} aria-labelledby="natee-form-heading">
      <p className="natee-form-heading" id="natee-form-heading">{L.formHeading}</p>

      <input type="hidden" name="access_key" value={config.accessKey} />
      <input type="hidden" name="subject" value={`${L.formSubject} ${L.siteName}`} />
      <input type="hidden" name="from_name" value={L.siteName} />
      <input type="hidden" name="language" value={L.lang} />

      <p className="natee-form-row">
        <label htmlFor="natee-name">
          {L.formName} <span className="natee-required">{L.formRequired}</span>
        </label>
        <input type="text" id="natee-name" name="name" autoComplete="name" maxLength={120} pattern={".*\\S.*"} required />
      </p>

      <p className="natee-form-row">
        <label htmlFor="natee-phone">
          {L.formPhone} <span className="natee-required">{L.formRequired}</span>
        </label>
        <input
          type="tel"
          id="natee-phone"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          maxLength={15}
          pattern="[0-9]{9,15}"
          aria-describedby="natee-phone-hint"
          required
        />
        <span className="natee-form-note" id="natee-phone-hint">{L.formPhoneHint}</span>
      </p>

      <p className="natee-form-row">
        <label htmlFor="natee-area">{L.formArea}</label>
        <input type="text" id="natee-area" name="area" maxLength={160} placeholder={L.formAreaPlaceholder} />
      </p>

      <p className="natee-form-row">
        <label htmlFor="natee-message">{L.formMessage}</label>
        <textarea id="natee-message" name="message" rows={4} maxLength={1500} placeholder={L.formMessagePlaceholder} />
      </p>

      <label className="natee-form-trap" aria-hidden="true">
        {L.formTrap}
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" />
      </label>

      <button type="submit" className="natee-btn natee-btn-call natee-btn-submit" disabled={state === 'sending'}>
        <Icon name="mail" />
        <span>{state === 'sending' ? L.formSending : L.formSubmit}</span>
      </button>

      {state === 'sent' && <p className="natee-form-notice natee-form-notice-ok" role="status">{L.formSent}</p>}
      {state === 'error' && <p className="natee-form-notice natee-form-notice-warn" role="status">{L.formError}</p>}

      <p className="natee-form-hint">{L.formHint}</p>
    </form>
  )
}
