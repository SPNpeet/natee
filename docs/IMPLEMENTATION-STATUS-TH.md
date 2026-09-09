# ข้อกำหนดและหลักฐานตรวจรับ

เป้าหมาย: React web app พร้อมแอดมินใน repo เดียว ผู้เข้าชมไม่ต้องมีบัญชี แอดมินมีสิทธิ์เดียว ใช้ Workers + D1 + KV ในบัญชี Cloudflare ลูกค้าแผน Free ไม่มี WordPress ใน deployment

## ตารางข้อกำหนด

| ข้อกำหนด | Implementation | การตรวจ/หลักฐาน | คงเหลือ |
|---|---|---|---|
| หน้าไทย/อังกฤษ เนื้อหาครบใน HTML | src/App.jsx, worker/render-page.mjs | build/check, API อ่าน HTML หลังบันทึก | ลูกค้ายืนยันข้อความ/ราคา |
| เข้าระบบเฉพาะแอดมิน | worker/security.mjs, sessions ใน D1 | unit+API: setup, Origin, CSRF, anonymous, login/logout, revoke | HTTPS/cookie จริงหลังติดตั้ง |
| แก้ข้อความ ราคา คำแปลและรายการ | src/admin/main.jsx | content.spec.js, admin.spec.js | UAT เจ้าของร้าน |
| บันทึกจริงและป้องกันเขียนทับ | versioned D1 + CAS | API stale save409, persistence.mjs รีสตาร์ต process จริง | ตรวจหลัง redeploy บน cloud |
| ประวัติ 20 รุ่นและกู้คืน | revisions + restore as draft | API history, admin UI restore/export | สำรอง/restore ระบบเต็มในบัญชีลูกค้า |
| รูป/คลิปอัปโหลดและลบ | media API + KV + count/size/type validation | API PNG/MP4, bytes, Range, invalid/oversize, in-use deletion; media UI | KV propagation/codec อุปกรณ์จริง |
| ฟอร์มและกล่องข้อความ | D1 inquiries, Origin/honeypot/rate limit, retention90วัน | API+browser submit/read/delete และ cursor | ผู้รับผิดชอบติดต่อกลับ ไม่มี auto-email |
| ผู้ดูแลและรหัสผ่าน | users admin only, PBKDF2, revoke sessions | API disable/change password, UI add/disable | ลูกค้าสร้างบัญชีและรับสิทธิ์ |
| สี/SEO/ภาพแชร์ | BRAND, SEO, ASSETS + validation | unit contrast/URL, UI save+public metadata | ตรวจ Google/แอปแชร์หลังเผยแพร่ |
| สถิติรวม | daily_stats และ event allowlist | API private stats/accepted events | ไม่ใช่จำนวนลูกค้าหรือยอดขาย |
| อัปเดตโค้ดแล้วข้อมูลยังใช้ได้ | merge defaults + build/site render cache key | persistence test จำลอง stale HTML แล้ว restart | production CPU และ deployment |
| Responsive/ปุ่ม/แกลเลอรี | public controls, native dialog+focus handling | Playwright 3 engines × 7 widths × 2 languages; interaction flow | ผ่าน CI ตามรายละเอียดด้านล่าง; อุปกรณ์จริงยังรอ |
| Accessibility | semantic controls, contrast, focus, reduced motion | axe WCAG A/AA public/admin; keyboard browser flow | ไม่ใช่การรับรอง WCAG ทั้งระบบ; iframe ภายนอกไม่สแกน |
| คู่มือ/ติดตั้ง/ส่งมอบ | README + USER-MANUAL + INSTALL + HANDOVER | ทบทวนให้ตรงโค้ดและข้อจำกัด | customer sign-off |
| Cloudflare ของลูกค้า Free | config example + validation-only workflow | dry-run บน GitHub runner ไม่มี cloud token | ยังไม่เชื่อม/สร้างทรัพยากร/deploy ตามคำสั่ง |

## ผลตรวจที่ยืนยันแล้ว

[CI run 34330444035](https://github.com/SPNpeet/natee/actions/runs/34330444035), commit f4dfbaa268897f78b703cb515c8d099e44af808e:

- lint: 0 warnings / 0 errors; build และตรวจไฟล์ผลลัพธ์ผ่าน
- unit 6 และ API 25 เคสผ่าน รวม PNG/MP4, Range, permissions, CAS, inbox cursor และ session revocation
- รีสตาร์ต Worker process จริงแล้วข้อมูลใน D1 ยังอยู่ และ HTML cache จาก build เก่าถูกสร้างใหม่
- browser 51 เคสผ่าน; axe ซ้ำใน Firefox/WebKit 2 เคสข้ามตาม config เพราะรันชุดกฎใน Chromium แล้ว
- layout 42 เคส: 7 ความกว้าง (320–1440px) × 2 ภาษา × Chromium/Firefox/WebKit
- interaction flow ทั้ง 3 engines ผ่าน: ปุ่มติดต่อ เมนู ราคา FAQ แกลเลอรี โฟกัส คลิป คัดลอก และสลับภาษา
- admin UI ผ่าน: ทุกหมวด, เพิ่ม/จัดลำดับ/ลบรายการ, SEO/สี, กู้ประวัติ, login ใหม่แล้วรักษาแบบร่าง, ส่งออก JSON และเพิ่ม/ปิดบัญชี
- npm audit ของ dependency ทั้งชุด: 0 low/moderate/high/critical ณ เวลาที่ตรวจ
- artifact รวมรายงาน ภาพหน้าจอ และ audit JSON เก็บ 14 วัน

ล็อกไฟล์ package-lock.json จาก artifact ของ run นี้กลับเข้า repo และเอาขั้นตอน generate lock ชั่วคราวออก เพื่อให้ npm ci ติดตั้งชุดที่ตรวจแล้วโดยตรง ผลของ commit ล่าสุดดูได้ที่ [Actions ของ branch](https://github.com/SPNpeet/natee/actions?query=branch%3Acodex%2Fhandover-readiness)

## การแก้ที่ได้จากการตรวจ

พบและแก้ focus trap ใน dialog, contrast ป้าย LINE, race ของ Escape/resize เมนูมือถือ และอ้างคลิปที่ไม่มีจริง ทดสอบรูปด้วย instant scroll เพื่อไม่ให้ smooth scrolling ทำให้ข้าม lazy loading

audit เคยพบ sharp ผ่าน Miniflare/Wrangler จึง override sharp เป็น 0.35.4 ตาม [advisory ของผู้ดูแล](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) และทดสอบ emulator/bundle ใหม่จนผ่าน ไม่ใช้ npm audit fix --force ที่จะย้อน Wrangler เป็นรุ่นเก่า

ตรวจภาพตัวอย่างจาก CI ทั้ง desktop/mobile, ไทย/อังกฤษ, รูป/คลิปและแอดมินแล้ว ไม่พบการล้นแนวนอนในขนาดที่ทดสอบ Google Maps iframe เป็นบริการภายนอก ยังต้องตรวจโดเมนจริงตาม UAT

## ขอบเขตหลักฐาน

ทุกการ build/run ใช้ GitHub Actions และ Cloudflare emulator ใน runner ไม่รันแอปบนเครื่องลูกค้า ภาพ/trace ที่ดาวน์โหลดใช้วิเคราะห์หลักฐานเท่านั้น Fixtures ไม่มีข้อมูลลูกค้าจริงและไม่มีการโทร/ส่งข้อความไปบุคคลภายนอก

ผลนี้ครอบคลุม test cases ที่ระบุ ไม่ใช่การรับรองปลอดบั๊กหรือผ่าน Free CPU quota จริง ยังไม่ได้เชื่อม Cloudflare ของลูกค้า สร้างทรัพยากร merge หรือ deploy ลูกค้าตรวจ [Draft PR #1](https://github.com/SPNpeet/natee/pull/1) ก่อนดำเนินการตาม INSTALL-TH.md และ HANDOVER-TH.md
