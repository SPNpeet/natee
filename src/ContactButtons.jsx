import Icon from './icons.jsx'
import { CONTACT } from './data.js'
import { track } from './track.js'

/** ปุ่มโทรและปุ่มไลน์ ใช้ซ้ำทุกหน้า โดยบอกจุดที่กดไว้ในค่า place เพื่อดูสถิติภายหลัง */
export default function ContactButtons({ L, place = 'hero' }) {
  return (
    <div className="natee-actions">
      <a
        className="natee-btn natee-btn-call"
        href={CONTACT.phoneHref}
        onClick={() => track('call_click', { place, language: L.lang })}
      >
        <Icon name="phone" />
        <span className="natee-btn-label">
          <span className="natee-btn-small">{L.callLabel}</span>
          <span className="natee-nowrap">{CONTACT.phone}</span>
        </span>
      </a>
      <a
        className="natee-btn natee-btn-line"
        href={CONTACT.lineUrl}
        target="_blank"
        rel="noopener"
        onClick={() => track('line_click', { place, language: L.lang })}
      >
        <Icon name="line" />
        <span className="natee-btn-label">
          <span className="natee-btn-small">{L.lineLabel}</span>
          <span className="natee-nowrap">{CONTACT.lineId}</span>
        </span>
      </a>
    </div>
  )
}
