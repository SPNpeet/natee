# ติดตั้ง Node 24 บน Z.com
แพ็กเกจนี้ใช้ React Admin และ API เดิมบน Node 24 + SQLite + ไฟล์สื่อ ไม่ต้องลง WordPress หรือ npm dependencies ใน production
1. แตก zip ใน Application root ส่วนตัวนอก public_html
2. ตั้ง Node 24, Production, Startup file app.cjs
3. ตั้ง SITE_URL เป็น https://โดเมนหลัก และ DATA_DIR เป็น absolute directory ส่วนตัวนอก application root/public_html ต้องคงอยู่เมื่อเปลี่ยนรุ่น เช่นโฟลเดอร์พี่น้อง natee-data ไม่ใช่โฟลเดอร์ชั่วคราว
4. หากย้ายข้อมูล ให้หยุดการเขียนเว็บเดิมและนำ archive ที่ถอดรหัสแล้วเข้าพื้นที่ส่วนตัว ใช้ node node-host/import.mjs /absolute/extracted-backup โดยกำหนด DATA_DIR เดียวกัน คำสั่งปฏิเสธฐานข้อมูลที่มีอยู่ ต้องตรวจผลนำเข้าก่อนเปิดเว็บจริง ห้ามวาง archive/SQL ใน public_html
5. หากเป็นระบบใหม่เท่านั้น ตั้ง SETUP_TOKEN ผ่าน environment ส่วนตัวให้เจ้าของสร้างบัญชีครั้งแรก แล้วเอาออกหลังสำเร็จ สำหรับข้อมูลย้ายใช้บัญชีเดิม ไม่จำเป็นต้องสร้างบัญชีใหม่
6. ตั้ง cron รายวันด้วย Node24 binary ตัวเดียวกันเรียก node-host/cleanup.mjs พร้อม SITE_URL และ DATA_DIR ที่ถูกต้อง ไม่ใส่ secrets ในบรรทัด cron
7. ตรวจ login/save/media/inbox/logout และ SEO/redirect ผ่านโดเมนจริงก่อน cutover
SQLite batch ใช้ transaction พร้อม foreign keys/WAL/timeout; FileKV เก็บ bytes และ MIME ในไฟล์เดียวแบบ rename atomic
ค่า TRUSTED_PROXY_IPS เว้นว่างเป็นค่าเริ่มต้น ห้ามเชื่อ header IP ที่ส่งจากผู้เข้าชม หาก cPanel proxy ทำให้ทุกคนมี IP เดียว ให้ผู้ดูแลตรวจ proxy chain จริงก่อนตั้งรายชื่อ IP ที่เชื่อถือเพื่อให้ rate limiting แยกผู้ใช้ได้ถูกต้อง
แพ็กเกจไม่มีบัญชี รหัสผ่าน production หรือฐานข้อมูล migration SQL ที่แถมเป็น schema เท่านั้น DATA_DIR ต้องเขียนได้โดย process ผู้ใช้รายนี้และไม่เปิดผ่านเว็บ
การอัปโหลดเวอร์ชันใหม่ต้องไม่ทับ DATA_DIR การสำรองต้องเก็บ SQLite อย่างสอดคล้องพร้อมไฟล์ media ไม่คัดลอกเฉพาะ sqlite ขณะ WAL ยังทำงาน
