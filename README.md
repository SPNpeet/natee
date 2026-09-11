# ธารนที — เว็บไซต์และแอดมิน

React web app สองภาษา (ไทย/อังกฤษ) พร้อม /admin/ ใน repository เดียว ใช้ Preact compatibility layer ตอน build เพื่อจำกัดขนาด JavaScript ผู้เข้าชมไม่ต้องสมัครสมาชิก แอดมินทุกบัญชีมีสิทธิ์จัดการเว็บไซต์เท่ากัน

เนื้อหาที่เผยแพร่ ประวัติ บัญชี เซสชัน และข้อความติดต่ออยู่ใน Cloudflare D1 รูป/คลิปที่อัปโหลดอยู่ใน KV หน้าเว็บสร้าง HTML จากข้อมูลที่บันทึกจริง รวม metadata และข้อมูลโครงสร้างสำหรับค้นหา ไม่ใช้ localStorage เป็นฐานข้อมูล

**สถานะ:** เตรียมสำหรับตรวจรับบน branch codex/handover-readiness ยังไม่ deploy และยังไม่เชื่อมบัญชี Cloudflare ลูกค้า Workflow ตรวจสอบอย่างเดียว ไม่มี auto-deploy

## ความสามารถ

- แก้ข้อความไทย/อังกฤษ ข้อมูลติดต่อ บริการ รถ ราคา ขั้นตอน พื้นที่ FAQ รูป/คลิป สี และ SEO ผ่านแอดมิน
- บันทึกพร้อมเลขรุ่น ป้องกันคนสองคนเขียนทับกัน กู้คืนข้อมูลก่อนหน้าได้ 20 รุ่น
- อัปโหลด PNG/JPEG/WebP ≤5 MiB และ MP4 ≤8 MiB ตรวจชนิดไฟล์ที่เซิร์ฟเวอร์ จำกัดคลังประมาณ 763 MiB
- แบบฟอร์มส่งเข้ากล่องข้อความส่วนตัวของแอดมิน เก็บ 90 วัน ไม่มีอีเมลแจ้งอัตโนมัติ
- สถิติรวมการกดโทร/LINE/คลิป/สลับภาษาและส่งฟอร์ม ไม่ใช่จำนวนลูกค้าหรือยอดขาย
- บัญชีและเซสชันฝั่งเซิร์ฟเวอร์ พร้อม Origin/CSRF protection และ rate limit
- มือถือ เมนู คัดลอกเบอร์ แกลเลอรีและคลิปใน dialog รองรับคีย์บอร์ดและ reduced motion

- หน้าความรู้เรื่องน้ำสองภาษา `knowledge.html` และ `knowledge-en.html` สร้างจากเนื้อหาชุดเดียวกับหน้าแรก แก้ได้ในหลังบ้านหมวดบทความความรู้
- พื้นที่ให้บริการรวมจังหวัดลำพูน

## โครงสร้าง

| ไฟล์ | หน้าที่ |
|---|---|
| src/App.jsx, src/index.css | หน้าเว็บสาธารณะ |
| src/admin/ | หน้าแอดมิน |
| src/data.js | ข้อมูลตั้งต้นเมื่อฐานข้อมูลยังไม่มีเนื้อหา |
| worker/ | API, auth, validation, public rendering และ migrations |
| server-build/ | ผล build ฝั่งเซิร์ฟเวอร์ ห้ามเสิร์ฟเป็นไฟล์สาธารณะ |
| dist/ | ผล build assets ใช้ร่วมกับ Worker |
| scripts/ | build และตรวจผล |
| tests/ | unit, API, persistence และ browser acceptance |
| .github/workflows/deploy.yml | GitHub Actions สำหรับ validation เท่านั้น |
| .github/workflows/pages-redirect.yml | เปลี่ยนสำเนาเก่าบน GitHub Pages ให้พาไปโดเมนจริง |
| src/Knowledge.jsx | เนื้อหาหน้าความรู้ ใช้ส่วนหัวและส่วนท้ายร่วมกับหน้าแรก |
| src/ContactButtons.jsx | ปุ่มโทรและไลน์ที่ใช้ร่วมกันทุกหน้า |
| worker/content-upgrades.mjs | ค่าตั้งต้นรุ่นเก่าของช่องที่เปลี่ยน ใช้กับเนื้อหาที่เคยบันทึกไว้ |
| theme/, tools/ | ประวัติ WordPress รุ่นเก่า ไม่ใช่ระบบปัจจุบันและไม่ใช้ติดตั้ง |

การอัปโหลดเฉพาะ dist ไป static hosting จะไม่ให้ระบบแอดมิน/ฐานข้อมูล ต้องติดตั้ง Worker + D1 + KV ตามคู่มือ รองรับที่รากโดเมนเท่านั้น

## ตรวจและ build

ใช้ Node.js 24 และ npm ci เพื่อใช้ dependency lockfile คำสั่งด้านล่างสำหรับ GitHub runner หรือสภาพแวดล้อมพัฒนาที่ผู้ดูแลอนุญาต ไม่จำเป็นต้องรันบนเครื่องลูกค้า

```sh
npm ci
npm run lint
npm run build
npm run check
npm test
```

npm run dev / npm run preview เป็น frontend preview ไม่เปิดฐานข้อมูลหรือ API ชุดทดสอบครบและ local Cloudflare emulator อยู่ใน workflow โดยไม่มี cloud credentials

## เมื่อแก้ค่าตั้งต้นใน src/data.js

เนื้อหาที่เจ้าของเคยกดบันทึกในหลังบ้านถูกเก็บทั้งชุด ค่าตั้งต้นที่แก้ในโค้ดภายหลังจึงไปไม่ถึงหน้าเว็บเอง
ถ้าแก้ข้อความของช่องที่มีอยู่แล้ว ให้เพิ่มค่าเดิมของช่องนั้นต่อท้าย `worker/content-upgrades.mjs`
ระบบจะเปลี่ยนเป็นค่าใหม่เฉพาะช่องที่ยังเหมือนค่าเดิมทุกตัวอักษร ช่องที่เจ้าของแก้เองจะไม่ถูกแตะ

## เอกสารส่งมอบ

- [คู่มือผู้ดูแล](docs/USER-MANUAL-TH.md)
- [ติดตั้งในบัญชี Cloudflare ลูกค้า](docs/INSTALL-TH.md)
- [รายการส่งมอบและ UAT](docs/HANDOVER-TH.md)
- [ข้อกำหนดและหลักฐานทดสอบ](docs/IMPLEMENTATION-STATUS-TH.md)
