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
| Responsive/ปุ่ม/แกลเลอรี | public controls, native dialog+focus handling | Playwright 3 engines × 7 widths × 2 languages; interaction flow | ผลชุดล่าสุดดู Actions, อุปกรณ์จริงยังรอ |
| Accessibility | semantic controls, contrast, focus, reduced motion | axe WCAG A/AA public/admin; keyboard browser flow | ไม่ใช่การรับรอง WCAG ทั้งระบบ; iframe ภายนอกไม่สแกน |
| คู่มือ/ติดตั้ง/ส่งมอบ | README + USER-MANUAL + INSTALL + HANDOVER | ทบทวนให้ตรงโค้ดและข้อจำกัด | customer sign-off |
| Cloudflare ของลูกค้า Free | config example + validation-only workflow | dry-run บน GitHub runner ไม่มี cloud token | ยังไม่เชื่อม/สร้างทรัพยากร/deploy ตามคำสั่ง |

## หลักฐานตามจุดที่ทำ

- จุด 1 auth: [run 34326246219](https://github.com/SPNpeet/natee/actions/runs/34326246219) ผ่าน
- จุด 2 content/persistence: [run 34326759074](https://github.com/SPNpeet/natee/actions/runs/34326759074) ผ่าน
- จุด 3 media/inquiries/accounts: [run 34327077125](https://github.com/SPNpeet/natee/actions/runs/34327077125) ผ่าน
- จุด 4 รอบแรก [run 34328286269](https://github.com/SPNpeet/natee/actions/runs/34328286269): lint/build/check/unit/API/restart ผ่าน; browser 10 ผ่าน, 41 ไม่ผ่าน, 2 ข้ามตาม config ไม่ใช่ผลตรวจรับสุดท้าย
- วิเคราะห์รอบแรกพบ Tab ออกจาก dialog ใน Chromium/WebKit และ contrast ป้าย LINE ต่ำไป แก้ในโค้ด ส่วน image checks สะดุดเพราะชุดทดสอบ scrollTo ไปชน smooth scrolling จึงแก้การเลื่อนใน test เป็น instant และรายงาน URL ภาพที่ยังไม่โหลด
- รอบตรวจหลังแก้และคู่มือ: อยู่ระหว่างตรวจ ดู [Actions ของ branch](https://github.com/SPNpeet/natee/actions?query=branch%3Acodex%2Fhandover-readiness)

ทุกการ build/run ใช้ GitHub Actions และ Cloudflare emulator ใน runner ไม่รันแอปบนเครื่องลูกค้า ภาพ/trace ที่ดาวน์โหลดใช้วิเคราะห์หลักฐานเท่านั้น Browser fixtures ไม่มีข้อมูลลูกค้าจริง และไม่ได้กดส่งข้อความ/โทรออกไปยังบุคคลภายนอก

หลักฐานเป็นการตรวจตาม test cases ไม่ใช่การรับรองว่าปลอดบั๊ก 100% หรือผ่าน Free CPU quota จริง ลูกค้าต้องอนุมัติ review ก่อนเชื่อม Cloudflare และทำ UAT production ตาม HANDOVER-TH.md

รอบ b9b108b / [run 34329419855](https://github.com/SPNpeet/natee/actions/runs/34329419855): browser 49 ผ่าน, 2 ไม่ผ่าน, 2 ข้าม โดย layout ทั้ง 42 ชุดและ axe ผ่านแล้ว เหลือ race ของ Escape/resize เมนูมือถือ จึงติด listener ตลอดอายุ component และทดสอบ desktop state ก่อนย่อกลับมือถือ นอกจากนี้ตรวจ audit เครื่องมือ CI เต็มชุดและขยับ Playwright เป็นรุ่นทางการ 1.63.0

รอบ fd079d2 / [run 34329949504](https://github.com/SPNpeet/natee/actions/runs/34329949504) ผ่าน lint/build/check, unit6, API25, restart และ browser51 เคส; ข้าม axe ซ้ำ2เคสตาม config พบ audit high3 รายการจากสาย sharp → miniflare → wrangler จึงล็อก sharp0.35.4 ที่แก้ [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) และตรวจ toolchain ใหม่ ห้ามตีความ run นี้ว่า audit เป็นศูนย์
