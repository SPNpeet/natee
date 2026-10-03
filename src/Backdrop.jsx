import { imageAsset } from './brand.js'

/**
 * รูปเดียวกันขยายเต็มกรอบแล้วเบลอ วางไว้หลังรูปที่เจ้าของร้านอัปโหลด
 *
 * กรอบรูปทั้งเว็บใช้สัดส่วนคงที่ รูปที่อัปโหลดแสดงครบทุกขอบไม่ถูกตัดเบอร์โทร
 * ช่องว่างที่เหลือในกรอบเติมด้วยสีจากรูปเอง ไม่ว่าจะอัปโหลดรูปแนวนอน แนวตั้ง หรือโปสเตอร์ หน้าเว็บจึงเรียบร้อยเท่ากันทุกกรอบ
 * รูปตั้งต้นของเว็บตัดให้พอดีกรอบอยู่แล้ว ไม่ต้องมีพื้นหลังนี้
 */
export default function Backdrop({ name, src }) {
  if (!src && !name?.startsWith('uploads/')) return null
  return (
    <img
      className="natee-backdrop"
      src={src || imageAsset(name, '-sm.webp')}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      fetchPriority="low"
    />
  )
}
