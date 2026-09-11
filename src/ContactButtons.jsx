import Icon from './icons.jsx'
import { track } from './track.js'

/**
 * ปุ่มโทรและปุ่มไลน์ ใช้ร่วมกันทั้งหน้าแรกและหน้าความรู้
 * รับข้อมูลติดต่อจากเนื้อหาที่บันทึกในหลังบ้าน เบอร์ที่แก้แล้วจึงตรงกันทุกหน้า
 */
export default function ContactButtons({ CONTACT, L, place = 'hero' }) {
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
