/**
 * หัวข้อให้ขึ้นบรรทัดใหม่ได้เฉพาะตรงช่องว่างที่ผู้เขียนเว้นไว้
 *
 * เบราว์เซอร์ตัดคำไทยกลางวลีได้ เช่น ราคา/ถูก หรือ ความ/สะอาด แต่ละวลีจึงห่อเป็นก้อนเดียว
 * วลีที่ยาวเกินหนึ่งบรรทัดยังตัดภายในก้อนได้เอง ไม่ล้นจอ
 * ตัวเลขติดกับคำที่ตามมาเสมอ เช่น 24 ชั่วโมง
 */
export default function Phrases({ text }) {
  if (typeof text !== 'string') return text
  const out = []
  text.replace(/(\d)\s+(?=\S)/g, '$1\u00a0').split(' ').forEach((part, i) => {
    if (i) out.push(' ')
    out.push(<span className="natee-phrase" key={i}>{part}</span>)
  })
  return out
}
