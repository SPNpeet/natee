# ติดตั้งในบัญชี Cloudflare ของลูกค้า

คู่มือนี้เป็นขั้นตอนสำหรับผู้ติดตั้ง **หลังตรวจรับและได้รับอนุญาตให้เชื่อมบัญชี/เผยแพร่** งานปัจจุบันไม่ได้สร้างทรัพยากรหรือ deploy ไว้ให้แล้ว

## สถาปัตยกรรมและข้อมูลที่ต้องยืนยัน

Worker หนึ่งตัวเสิร์ฟ React public/admin และ API; D1 หนึ่งฐานข้อมูล; KV หนึ่ง namespace เก็บสื่อ ไม่มี WordPress, GitHub Pages หรือ R2 ที่ต้องเปิด billing

ต้องยืนยันบัญชี Cloudflare ของลูกค้า, account ID, โดเมนหลัก, ผู้ถือสิทธิ์ DNS และอีเมลแอดมิน ชื่อผู้จดทะเบียนเช่น Z.com ไม่ยืนยันว่าโฮสต์อยู่ที่ใด ตรวจ DNS/อีเมลเดิมก่อนเปลี่ยน nameserver และเก็บ MX/TXT/SPF/DKIM/DMARC ที่ใช้อยู่ โดเมน Custom Domain ต้องเป็น zone ใน Cloudflare ของบัญชีที่เลือก

ระบบใช้ origin เดียวและรากโดเมน เช่น https://example.com/ ไม่รองรับการติดตั้งใต้ /natee/ เลือก apex หรือ www เป็นหลัก แล้วตั้ง redirect อีกชื่อไปชื่อหลัก

## ขอบเขตแผนฟรี

ข้อมูลตรวจจากเอกสาร Cloudflare วันที่ 9 กันยายน 2026:

| บริการ | Free quota ที่เกี่ยวข้อง |
|---|---|
| Workers | 100,000 requests/วัน; CPU 10 ms ต่อ invocation |
| D1 | อ่าน 5 ล้าน rows/วัน; เขียน 100,000 rows/วัน; พื้นที่รวม 5 GB |
| KV | อ่าน 100,000/วัน; เขียน/ลบ/list อย่างละ 1,000/วัน; พื้นที่ 1 GB |

ระบบจำกัดสื่อ 800,000,000 bytes และ 500 ไฟล์; จำกัดอัปโหลดต่อแอดมินเพื่อเผื่อโควต้า แต่หลายแอดมินและงานอื่นในบัญชียังใช้โควต้าร่วมกัน ข้อจำกัดนี้ไม่ใช่การรับรองรองรับทราฟฟิกไม่จำกัด หากเต็มคำขออาจล้มเหลว

การทดสอบบน emulator ยืนยันพฤติกรรม แต่ไม่บังคับ CPU/โควต้าแบบ production ต้องวัด CPU ของ login (PBKDF2), บันทึก/เรนเดอร์ และอัปโหลดจริงบน Free ก่อนเปิดบริการ หากเกิน หยุดเปิดจริงและแก้ทางเทคนิค/ทบทวนขอบเขตกับลูกค้า ห้ามลดความปลอดภัยของรหัสผ่านหรือเปิดแผนเสียเงินเอง

อ้างอิง: [Workers](https://developers.cloudflare.com/workers/platform/pricing/), [D1](https://developers.cloudflare.com/d1/platform/pricing/), [KV](https://developers.cloudflare.com/kv/platform/pricing/), [KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/).

## เตรียม deployment

ใช้ GitHub runner หรือสภาพแวดล้อมที่อนุญาต ไม่ต้องติดตั้ง/รันแอปบนเครื่องลูกค้า ระบุ commit ที่ผ่าน CI และดาวน์โหลดหลักฐานก่อนหมดอายุ 14 วัน

1. ให้ลูกค้าเข้าบัญชี Cloudflare ของตนเอง ยืนยัน account ID และ Free plan
2. สร้าง D1 ชื่อ natee และ KV namespace MEDIA ในบัญชีนั้น บันทึก ID ทั้งสอง
3. คัดลอก wrangler.customer.example.jsonc เป็น wrangler.customer.jsonc ที่ราก repo แทนทุก REPLACE_WITH... ให้ถูกต้อง ไฟล์นี้ถูก gitignore เพื่อไม่ปะปน config ลูกค้ากับ config ทดสอบ
4. ตรวจ account_id, database_id, KV id, SITE_URL และ routes.pattern ตรงกัน ห้ามใช้ wrangler.jsonc สำหรับ production เพราะมี ID ศูนย์และ localhost
5. ใช้ Node 24 และ npm ci เพื่อใช้ Wrangler 4.130.0 และชุดเครื่องมือที่ล็อกไว้ รวม sharp0.35.4 สำหรับช่องโหว่ dependency ของ emulator การพิสูจน์ bundle ใช้ --dry-run เท่านั้น

```sh
npm ci
SITE_URL=https://YOUR-CUSTOMER-DOMAIN npm run build
npm run lint
SITE_URL=https://YOUR-CUSTOMER-DOMAIN npm run check
npm test
npx wrangler deploy --config wrangler.customer.jsonc --dry-run
```

แทน YOUR-CUSTOMER-DOMAIN ด้วยโดเมนจริงก่อนใช้ ควรใช้โดเมน UAT ของลูกค้าก่อนเปลี่ยน DNS หน้าเดิม การย้ายเป็นโดเมนหลักต้องเปลี่ยน SITE_URL/routes และ build ใหม่

## เผยแพร่หลังอนุญาต

ผู้ติดตั้งต้องยืนยันบัญชีที่ล็อกอินด้วย wrangler whoami และเทียบ account_id อีกครั้ง หรือใช้ API token แบบจำกัดเฉพาะบัญชี/ทรัพยากรผ่าน GitHub Environment secret ห้ามใส่ token ใน repo, log หรือแชท ไม่ได้เตรียม workflow deploy อัตโนมัติในชุดนี้

```sh
npx wrangler d1 migrations apply natee --remote --config wrangler.customer.jsonc
npx wrangler deploy --config wrangler.customer.jsonc
npx wrangler secret put SETUP_TOKEN --config wrangler.customer.jsonc
```

SETUP_TOKEN ใช้ค่าที่สุ่มอย่างปลอดภัยอย่างน้อย 32 ตัวอักษรและเก็บเป็น Cloudflare secret เท่านั้น ก่อนตั้ง secret หน้า setup จะสร้างบัญชีไม่ได้ เปิด /admin/ ด้วย HTTPS ให้ลูกค้ากรอก setup token อีเมล และรหัสผ่านใหม่ หลังสร้างแอดมินสำเร็จลบ SETUP_TOKEN จาก Worker secret แล้วตรวจ login/logout อีกครั้ง API จะไม่ยอมสร้างแอดมินแรกซ้ำเมื่อมีบัญชีแล้ว

ตั้ง Custom Domain/HTTPS ตาม [คู่มือ Cloudflare](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) ตรวจว่า workers.dev ถูกปิด และโดเมนรอง redirect ไป origin หลัก ยืนยัน scheduled trigger รายวันทำงาน

## ตรวจ production ก่อนเปิดรับลูกค้า

ตรวจรายการ UAT ใน HANDOVER-TH.md รวม D1 persistence หลัง redeploy, KV จากอุปกรณ์/เครือข่ายอื่น, cookie Secure/HttpOnly, หน้าไทย/อังกฤษและ SEO URL จริง, แบบฟอร์มถึง inbox และข้อมูลติดต่อจริง ตรวจ CPU/errors และโควต้าใน Cloudflare โดยเฉพาะการล็อกอินและบันทึกครั้งแรก

หากจำเป็นต้อง rollback ให้ใช้ commit ที่ผ่านการตรวจและเข้ากันกับ schema ปัจจุบัน สำรอง D1/KV ก่อน migrations ทุกครั้ง ห้ามใช้ WordPress รุ่นเก่าทับ deployment นี้

## สำรองและกู้คืน

- สำรอง D1 เป็น SQL จากบัญชีลูกค้า เก็บเข้ารหัสและจำกัดสิทธิ์ เพราะมีแฮชรหัสผ่านและข้อมูลติดต่อ
- ดาวน์โหลดไฟล์ทุก path จากคลังสื่อ หรือใช้ Wrangler KV export workflow ที่เก็บ bytes และ metadata.mime ให้ครบ จด path เดิมเพื่อให้ข้อมูลเนื้อหาอ้างกลับได้
- เก็บ commit/config (ไม่รวม secrets), รายการ migrations, วันที่สำรอง และไฟล์เนื้อหา JSON ด้วย
- ตัวอย่าง export: npx wrangler d1 export natee --remote --output backups/natee.sql --config wrangler.customer.jsonc
- ทดสอบ restore ใน D1/KV แยกของลูกค้าก่อนเขียนทับของจริง เมื่อกู้คืน session ควรล้างตาราง sessions เพื่อให้ทุกบัญชีล็อกอินใหม่
- JSON จากแอดมินเป็นเพียงเนื้อหา ไม่รวม media, inquiries หรือ accounts ไม่มีปุ่ม restore ทั้งระบบในหน้าแอดมิน

อ้างอิงคำสั่ง: [D1](https://developers.cloudflare.com/d1/wrangler-commands/), [KV](https://developers.cloudflare.com/kv/reference/kv-commands/).

กรณีแอดมินทุกคนเข้าไม่ได้ ให้ผู้ถือสิทธิ์ Cloudflare สำรอง D1 ก่อน แล้วให้ผู้ดูแลเทคนิคสร้าง password hash ด้วย worker/security.mjs ในสภาพแวดล้อมที่อนุญาต อัปเดตเฉพาะบัญชีที่ยืนยันเจ้าของและล้าง sessions ของบัญชีนั้น อย่าลบ users ทั้งตารางเพื่อเปิด setup ใหม่ อย่าส่งรหัสผ่าน plaintext เข้า SQL/log
