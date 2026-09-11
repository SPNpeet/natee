# -*- coding: utf-8 -*-
"""สร้างคู่มือการใช้งานเป็นรูปเล่ม A4

อ่านเนื้อหาจาก content ในไฟล์นี้ ฝังฟอนต์และโลโก้ลงไฟล์ตรง ๆ
แล้วให้สคริปต์ในหน้าจัดเนื้อหาลงหน้ากระดาษทีละหน้า พร้อมสารบัญและเลขหน้า

ใช้งาน จากรากโปรเจกต์
  1. python docs/manual/build-manual.py                          ได้ manual-src.html
  2. chrome --headless=new --dump-dom --virtual-time-budget=15000 manual-src.html
     บันทึกผลเป็น natee-user-manual.html คือเล่มที่จัดหน้าแล้ว
  3. chrome --headless=new --no-pdf-header-footer --print-to-pdf=natee-user-manual.pdf
     natee-user-manual.html

ภาพหน้าจอในเล่มถ่ายด้วย capture-inbox.mjs กับตัวจำลองในเครื่อง ดูวิธีในไฟล์นั้น
"""
import base64
import io
import os

root = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))


def b64(path):
    with open(os.path.join(root, path), 'rb') as f:
        return base64.b64encode(f.read()).decode()


THAI_RANGE = 'U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC'
LATIN_RANGE = ('U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, '
               'U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD')

fonts = []
for weight in (400, 600, 700):
    for subset, urange in (('thai', THAI_RANGE), ('latin', LATIN_RANGE)):
        data = b64('public/fonts/ibm-plex-sans-thai-%d-%s.woff2' % (weight, subset))
        fonts.append(
            "@font-face { font-family: 'IBM Plex Sans Thai'; font-style: normal; font-weight: %d; "
            "src: url(data:font/woff2;base64,%s) format('woff2'); unicode-range: %s; }" % (weight, data, urange))

logo = b64('public/images/logo.png')

DOMAIN = 'รถขายน้ำประปาเชียงใหม่.com'

style = """
:root { --brand: #0f6fbf; --brand-dark: #0b5290; --ink: #0f1c2e; --muted: #55657c;
  --line: #e3e9f0; --soft: #f4f8fc; --warn-bg: #fdf3f2; --warn-line: #b3403a; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'IBM Plex Sans Thai', 'Noto Sans Thai', 'Leelawadee UI', sans-serif;
  color: var(--ink); font-size: 14.5px; line-height: 1.85; background: #9aa7b6; }
.page { width: 210mm; height: 297mm; background: #fff; position: relative; overflow: hidden;
  padding: 18mm 17mm 26mm; }
@media screen { .page { margin: 18px auto; box-shadow: 0 3px 18px rgba(15, 28, 46, 0.35); } }
@media print {
  body { background: #fff; }
  .page { margin: 0; box-shadow: none; break-after: page; }
  .page:last-child { break-after: auto; }
}
@page { size: A4; margin: 0; }

.pagefoot { position: absolute; left: 17mm; right: 17mm; bottom: 11mm; display: flex;
  justify-content: space-between; align-items: baseline; border-top: 2px solid var(--line);
  padding-top: 7px; font-size: 11.5px; color: var(--muted); }
.pagefoot strong { color: var(--brand-dark); font-weight: 600; }

h2 { font-size: 24px; line-height: 1.45; margin: 0 0 4px; font-weight: 700; }
.chap-no { display: block; font-size: 13px; font-weight: 600; letter-spacing: 0.12em;
  color: var(--brand); margin-bottom: 2px; }
.chap-rule { width: 52px; height: 4px; background: var(--brand); border-radius: 2px; margin: 10px 0 20px; }
h3 { font-size: 16px; margin: 20px 0 6px; color: var(--brand-dark); font-weight: 600; }
p { margin: 0 0 10px; }
ul, ol { margin: 0 0 12px; padding-left: 24px; }
li { margin-bottom: 7px; }
li::marker { color: var(--brand); font-weight: 600; }
code { background: var(--soft); border: 1px solid var(--line); border-radius: 6px;
  padding: 0 7px; font-family: inherit; font-size: 13.5px; }
strong { font-weight: 600; }

figure { margin: 12px 0 16px; }
figure img { display: block; max-width: 100%; border: 1px solid var(--line); border-radius: 8px; }
figure.tall img { max-height: 116mm; width: auto; margin: 0 auto; }
figcaption { font-size: 12.5px; color: var(--muted); margin-top: 6px; }

.note, .warn { border-radius: 0 10px 10px 0; padding: 12px 16px; margin: 12px 0; }
.note { background: var(--soft); border-left: 4px solid var(--brand); }
.warn { background: var(--warn-bg); border-left: 4px solid var(--warn-line); }
.note > p:last-child, .warn > p:last-child { margin-bottom: 0; }

table { border-collapse: collapse; width: 100%; margin: 10px 0 16px; font-size: 13.5px; line-height: 1.7; }
th, td { border: 1px solid var(--line); padding: 8px 12px; text-align: left; vertical-align: top; }
th { background: var(--soft); color: var(--brand-dark); font-weight: 600; }

.cover { padding: 0; background: linear-gradient(160deg, var(--brand-dark) 0%, var(--brand) 62%, #1e86d8 100%);
  color: #fff; }
.cover-inner { position: absolute; inset: 22mm 20mm; display: flex; flex-direction: column; }
.cover-logo { width: 108px; height: 118px; background: #fff; border-radius: 20px;
  display: flex; align-items: center; justify-content: center; }
.cover-logo img { width: 76px; height: auto; }
.cover-kicker { margin: auto 0 6px; font-size: 19px; letter-spacing: 0.06em; opacity: 0.9; }
.cover h1 { margin: 0; font-size: 58px; line-height: 1.25; font-weight: 700; }
.cover-sub { margin: 8px 0 0; font-size: 19px; opacity: 0.92; }
.cover-domain { margin-top: 26px; display: inline-block; align-self: flex-start; background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.45); border-radius: 999px; padding: 9px 22px; font-size: 16.5px; font-weight: 600; }
.cover-meta { margin-top: auto; border-top: 1px solid rgba(255, 255, 255, 0.4); padding-top: 14px;
  font-size: 14px; opacity: 0.92; line-height: 1.9; }

.toc-head { font-size: 26px; font-weight: 700; margin: 0; }
.toc-list { margin-top: 18px; }
.toc-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 11px; font-size: 15px; }
.toc-row .no { color: var(--brand); font-weight: 600; min-width: 26px; }
.toc-row .dots { flex: 1; border-bottom: 2px dotted #b9c6d4; transform: translateY(-4px); }
.toc-row .pg { color: var(--muted); font-weight: 600; min-width: 24px; text-align: right; }

.closing-brand { color: var(--brand-dark); font-weight: 600; }
"""

# ---------------------------------------------------------------- เนื้อหา
content = """
<h2 data-toc="รู้จักเว็บไซต์ของคุณ">รู้จักเว็บไซต์ของคุณ</h2>
<p>เว็บไซต์มีสองภาษา ผู้เข้าชมกดปุ่ม <code>ไทย / EN</code> มุมขวาบนเพื่อสลับภาษาได้ทุกหน้า และมีทั้งหมด 4 หน้า</p>
<table>
  <tr><th style="width:55%">หน้า</th><th>ที่อยู่</th></tr>
  <tr><td>หน้าแรก ภาษาไทย</td><td>/</td></tr>
  <tr><td>หน้าแรก ภาษาอังกฤษ</td><td>/en.html</td></tr>
  <tr><td>บทความความรู้ ภาษาไทย</td><td>/knowledge.html</td></tr>
  <tr><td>บทความความรู้ ภาษาอังกฤษ</td><td>/knowledge-en.html</td></tr>
</table>
<p>ทุกหน้ามีปุ่มโทรและปุ่ม LINE ให้ลูกค้ากดติดต่อได้ทันที บนมือถือจะมีแถบโทรและไลน์ค้างอยู่ล่างจอตลอด
ระบบนับสถิติการกดปุ่มเหล่านี้ให้ดูในหลังบ้านด้วย</p>
<div class="note">ที่อยู่เว็บไซต์คือ <strong>%DOMAIN%</strong>
พิมพ์ในช่องที่อยู่ของเบราว์เซอร์ได้โดยตรงทั้งบนคอมพิวเตอร์และมือถือ</div>

<h2 data-toc="เข้าสู่ระบบหลังบ้าน">เข้าสู่ระบบหลังบ้าน</h2>
<p>ระบบหลังบ้านใช้แก้ข้อความ ราคา รูป คลิป และอ่านข้อความจากลูกค้า เปิดได้ที่</p>
<p><code>https://%DOMAIN%/admin/</code></p>
<p>กรอกอีเมลและรหัสผ่านผู้ดูแลที่ได้รับตอนส่งมอบระบบ แล้วกดเข้าสู่ระบบ ใช้ได้ทั้งบนคอมพิวเตอร์และมือถือ</p>
<figure><img src="images/01-login.jpg" alt="หน้าเข้าสู่ระบบของหลังบ้าน">
<figcaption>หน้าเข้าสู่ระบบ ภาพตัวอย่างทั้งเล่มถ่ายจากระบบทดสอบด้วยบัญชีตัวอย่าง ไม่ใช่ข้อมูลจริงของร้าน</figcaption></figure>
<div class="warn">รหัสผ่านคือกุญแจของเว็บทั้งเว็บ อย่าบอกต่อ อย่าจดไว้ในที่เปิดเผย และอย่าใช้ซ้ำกับบริการอื่น
ถ้าสงสัยว่ารหัสรั่ว ให้เปลี่ยนทันทีในเมนู บัญชีของฉัน</div>

<h2 data-toc="หลักการแก้เนื้อหา แบบร่างและการเผยแพร่">หลักการแก้เนื้อหา แบบร่างและการเผยแพร่</h2>
<p>ทุกเมนูใช้หลักเดียวกัน สามขั้น</p>
<ol>
  <li><strong>แก้</strong> — พิมพ์ลงช่องได้เลย ระบบจะขึ้นแถบ "มีการเปลี่ยนแปลงที่ยังไม่บันทึก" แปลว่ากำลังอยู่ในแบบร่าง หน้าเว็บจริงยังไม่เปลี่ยน</li>
  <li><strong>ตรวจ</strong> — สลับปุ่ม <code>ไทย / English</code> เหนือแบบฟอร์ม เพื่อแก้ข้อความอีกภาษาให้ตรงกัน</li>
  <li><strong>เผยแพร่</strong> — กดปุ่ม <strong>บันทึกและเผยแพร่เนื้อหา</strong> ท้ายหน้า หน้าเว็บจริงจะเปลี่ยนทันที ทั้งสองภาษาถูกบันทึกพร้อมกัน</li>
</ol>
<figure><img src="images/09-draft.jpg" alt="สถานะแบบร่างก่อนบันทึก">
<figcaption>ระหว่างแก้ ระบบขึ้นเตือนว่ามีแบบร่างที่ยังไม่บันทึก</figcaption></figure>
<figure><img src="images/10-saved.jpg" alt="บันทึกและเผยแพร่แล้ว">
<figcaption>บันทึกแล้ว ระบบแจ้งเลขรุ่นของข้อมูล ใช้กู้คืนย้อนหลังได้</figcaption></figure>
<div class="note">
<p><strong>ถ้าแก้ผิดหรือเปลี่ยนใจ</strong> — กดปุ่ม โหลดล่าสุด เพื่อทิ้งแบบร่างแล้วกลับไปใช้ข้อมูลที่เผยแพร่อยู่</p>
<p><strong>ถ้ามีคนแก้พร้อมกันสองคน</strong> — ระบบจะยอมให้บันทึกได้ทีละคน คนหลังจะได้รับแจ้งให้กดโหลดล่าสุดก่อน ข้อมูลจึงไม่ถูกเขียนทับกันเงียบ ๆ</p>
<p><strong>ปิดหน้าจอโดยยังไม่บันทึก</strong> — เบราว์เซอร์จะถามยืนยันก่อน กันแบบร่างหายโดยไม่ตั้งใจ</p>
</div>

<h2 data-toc="ข้อมูลร้านและช่องทางติดต่อ">ข้อมูลร้านและช่องทางติดต่อ</h2>
<p>เมนู <strong>ข้อมูลร้าน</strong> รวมของที่ใช้ซ้ำทั้งเว็บ แก้ที่นี่ที่เดียวแล้วเปลี่ยนทุกหน้า ทุกปุ่ม รวมถึงหน้าบทความด้วย</p>
<ul>
  <li>เบอร์โทรหลักและเบอร์สำรอง — พิมพ์แบบมีขีดได้ ระบบทำลิงก์กดโทรให้เอง</li>
  <li>LINE ID และลิงก์เพิ่มเพื่อน, ลิงก์ Facebook, อีเมล</li>
  <li>ที่อยู่ร้าน เวลาทำการ และแผนที่ Google Maps</li>
  <li>ชื่อร้าน คำโปรย โลโก้ รูปหน้าแรก และสีหลักของเว็บ</li>
</ul>
<figure class="tall"><img src="images/02-contact.jpg" alt="เมนูข้อมูลร้าน"><figcaption>เมนูข้อมูลร้าน</figcaption></figure>
<div class="note">ระบบตรวจก่อนบันทึกให้ เช่น เบอร์โทรต้องเป็นตัวเลข 9–15 หลัก ลิงก์ต้องเป็น https
และสีหลักต้องเข้มพอที่ตัวหนังสือขาวบนปุ่มยังอ่านออก ถ้าบันทึกไม่ผ่านจะบอกว่าช่องไหนติดอะไร</div>

<h2 data-toc="หน้าแรก บริการ ประเภทรถ และขั้นตอน">หน้าแรก บริการ ประเภทรถ และขั้นตอน</h2>
<p>เมนู <strong>หน้าแรก</strong> แก้หัวข้อใหญ่ คำโปรย จุดเด่น 4 ข้อ และย่อหน้าแนะนำร้าน</p>
<figure class="tall"><img src="images/03-home.jpg" alt="เมนูหน้าแรก"><figcaption>เมนูหน้าแรก</figcaption></figure>
<p>เมนู <strong>บริการ</strong>, <strong>ประเภทรถ</strong> และ <strong>ขั้นตอน</strong> เป็นรายการแบบเดียวกัน แต่ละรายการมีปุ่ม</p>
<ul>
  <li><code>↑ ↓</code> สลับลำดับการแสดง</li>
  <li><code>ลบรายการ</code> เอาออกจากแบบร่าง</li>
  <li><code>+ เพิ่มรายการ</code> ต่อท้ายรายการใหม่ แล้วพิมพ์เนื้อหาทับ</li>
</ul>
<p>ส่วนข้อความปลีกย่อยอื่นทั่วเว็บ เช่น ป้ายบนปุ่ม หัวข้อย่อย และหมายเหตุใต้ตาราง
อยู่ในเมนู <strong>ข้อความและปุ่ม</strong> ซึ่งรวมข้อความทุกชิ้นที่เหลือไว้ที่เดียว</p>
<div class="note">เพิ่มหรือลบรายการในภาษาไทยแล้ว อย่าลืมสลับไป English ทำให้ตรงกันด้วย เว็บสองภาษาจะได้บอกเรื่องเดียวกัน</div>

<h2 data-toc="ราคา">ราคา</h2>
<p>เมนู <strong>ราคา</strong> แก้ตารางอัตราค่าบริการ แต่ละแถวมีชื่อบริการ คำอธิบายสั้น ราคา
และรายการสิ่งที่ได้รับซึ่งแสดงเมื่อลูกค้ากดขยาย</p>
<figure class="tall"><img src="images/04-pricing.jpg" alt="เมนูราคา"><figcaption>เมนูราคา</figcaption></figure>
<div class="note">ช่องราคาเป็นข้อความอิสระ เขียนได้ทั้ง "500 บาท" หรือ "สอบถามราคา" ถ้าราคาไม่ตายตัวแนะนำเขียนราคาเริ่มต้นไว้
แล้วให้หมายเหตุใต้ตาราง (แก้ได้ในเมนู ข้อความและปุ่ม) อธิบายเงื่อนไข</div>

<h2 data-toc="พื้นที่ให้บริการ">พื้นที่ให้บริการ</h2>
<p>เมนู <strong>พื้นที่บริการ</strong> เป็นรายชื่ออำเภอและจังหวัดที่ขึ้นบนหน้าเว็บและถูกส่งให้ Google ด้วย
ตอนนี้ครอบคลุมอำเภอหลักของเชียงใหม่และจังหวัดลำพูน เพิ่มพื้นที่ใหม่ได้ด้วยปุ่ม + เพิ่มรายการ ทั้งก้อนไทยและอังกฤษ</p>
<figure class="tall"><img src="images/05-areas.jpg" alt="เมนูพื้นที่บริการ"><figcaption>เมนูพื้นที่บริการ</figcaption></figure>
<div class="note">ส่วนท้ายของหน้าเว็บแสดงพื้นที่ 8 รายการแรกของรายการนี้ ถ้าอยากให้พื้นที่ไหนเห็นง่าย ให้เลื่อนขึ้นไปอยู่ต้น ๆ</div>

<h2 data-toc="บทความความรู้">บทความความรู้</h2>
<p>เมนู <strong>บทความความรู้</strong> แก้หน้า "น้ำคือชีวิต ความสำคัญของน้ำและน้ำประปา" ได้ทั้งหน้า
ตั้งแต่ชื่อเรื่อง ชื่อบนผลค้นหา ย่อหน้า หัวข้อย่อยทุกหัวข้อ ไปจนถึงรูปประกอบทุกรูปซึ่งเลือกจากคลังสื่อได้</p>
<figure class="tall"><img src="images/06-knowledge.jpg" alt="เมนูบทความความรู้"><figcaption>เมนูบทความความรู้</figcaption></figure>
<ul>
  <li>รูปทุกรูปมีช่อง <strong>คำอธิบายรูป</strong> คู่กัน เขียนสั้น ๆ ว่าในรูปคืออะไร
  ใช้กับผู้พิการทางสายตาและช่วยเรื่อง Google ระบบจะไม่ให้บันทึกถ้าเว้นว่าง</li>
  <li>ข้อมูลติดต่อในหน้าบทความดึงจากเมนูข้อมูลร้านอัตโนมัติ ไม่ต้องแก้ซ้ำ</li>
</ul>
<div class="warn">อย่าเขียนในบทความหรือที่ใดในเว็บว่า น้ำดื่มได้ ผ่านมาตรฐาน หรือไร้สิ่งเจือปน ถ้าไม่มีผลตรวจรับรองจริง
ร้านจำหน่ายน้ำประปาสำหรับงานอุปโภค การอ้างคุณภาพเกินจริงเป็นความเสี่ยงทางกฎหมายของร้านเอง</div>

<h2 data-toc="รูปผลงาน คลิป และคลังสื่อ">รูปผลงาน คลิป และคลังสื่อ</h2>
<p>เมนู <strong>ผลงาน</strong> จัดรูปแกลเลอรีและคลิปหน้างาน ส่วนเมนู <strong>คลังสื่อ</strong> เก็บไฟล์ทั้งหมดที่อัปโหลดไว้</p>
<figure class="tall"><img src="images/07-gallery.jpg" alt="เมนูผลงาน"><figcaption>เมนูผลงาน</figcaption></figure>
<figure><img src="images/08-media.jpg" alt="เมนูคลังสื่อ"><figcaption>เมนูคลังสื่อ</figcaption></figure>
<h3>วิธีเปลี่ยนหรือเพิ่มรูป</h3>
<ol>
  <li>ไปที่ช่องรูปที่ต้องการ เลือกรูปเดิมจากรายการ หรือกด Choose File เพื่ออัปโหลดรูปใหม่จากเครื่อง</li>
  <li>รองรับ PNG, JPG, WebP ไม่เกิน 5 MB และคลิป MP4 ไม่เกิน 8 MB</li>
  <li>กดบันทึกและเผยแพร่เนื้อหา</li>
</ol>
<ul>
  <li>รูปถ่ายแนวนอนขนาดกว้างประมาณ 1100 พิกเซลขึ้นไปจะคมชัดพอดี คลิปแนะนำแนวตั้ง ยาวไม่เกิน 20 วินาที</li>
  <li>ไฟล์ที่เพิ่งอัปโหลดอาจใช้เวลาราวหนึ่งนาทีกว่าจะเปิดได้จากทุกพื้นที่</li>
  <li>ไฟล์ที่กำลังถูกใช้บนเว็บ ระบบจะไม่ให้ลบ ต้องเปลี่ยนไปใช้รูปอื่นก่อนแล้วค่อยลบ</li>
</ul>

<h2 data-toc="ข้อความติดต่อจากลูกค้า">ข้อความติดต่อจากลูกค้า</h2>
<p>ลูกค้ากรอกฟอร์ม "ให้ทีมงานติดต่อกลับ" บนหน้าเว็บได้ ข้อความจะเข้าเมนู <strong>ข้อความติดต่อ</strong>
พร้อมชื่อ เบอร์โทร พื้นที่ และรายละเอียด</p>
<figure><img src="images/11-inbox.jpg" alt="กล่องข้อความติดต่อ"><figcaption>ตัวอย่างข้อความในระบบทดสอบ</figcaption></figure>
<div class="warn">ระบบไม่ส่งอีเมลหรือไลน์แจ้งเตือนอัตโนมัติ ควรเปิดดูกล่องข้อความอย่างน้อยวันละครั้ง
โทรกลับแล้วกดทำเครื่องหมายหรือลบรายการที่จัดการเสร็จ ข้อความเก็บไว้ 90 วันแล้วระบบลบให้อัตโนมัติ</div>

<h2 data-toc="สถิติการใช้งาน">สถิติการใช้งาน</h2>
<p>เมนู <strong>สถิติ</strong> สรุป 30 วันล่าสุดว่ามีคนกดปุ่มโทร กดปุ่ม LINE ส่งฟอร์ม เปิดคลิป และสลับภาษากี่ครั้ง
ใช้ดูว่าเว็บทำให้เกิดการติดต่อจริงมากแค่ไหน ระบบไม่เก็บข้อมูลระบุตัวผู้เข้าชม</p>
<table>
  <tr><th style="width:40%">ตัวเลข</th><th>หมายถึง</th></tr>
  <tr><td>กดโทร</td><td>จำนวนครั้งที่ลูกค้ากดปุ่มโทรบนเว็บ นับทุกปุ่มทุกหน้า</td></tr>
  <tr><td>กด LINE</td><td>จำนวนครั้งที่กดปุ่มทักไลน์</td></tr>
  <tr><td>ส่งฟอร์ม</td><td>จำนวนข้อความที่ลูกค้ากรอกฟอร์มสำเร็จ</td></tr>
  <tr><td>เปิดคลิป</td><td>จำนวนครั้งที่ลูกค้ากดดูคลิปหน้างาน</td></tr>
  <tr><td>สลับภาษา</td><td>จำนวนครั้งที่ผู้เข้าชมเปลี่ยนภาษา ไทย/อังกฤษ</td></tr>
</table>

<h2 data-toc="ประวัติ การกู้คืน และการสำรองข้อมูล">ประวัติ การกู้คืน และการสำรองข้อมูล</h2>
<p>ทุกครั้งที่บันทึก ระบบเก็บข้อมูลรุ่นก่อนหน้าไว้ 20 รุ่นล่าสุดในเมนู <strong>ประวัติ</strong></p>
<figure><img src="images/12-history.jpg" alt="เมนูประวัติ"><figcaption>เมนูประวัติ</figcaption></figure>
<ol>
  <li>กด <code>กู้คืนเป็นแบบร่าง</code> ที่รุ่นที่ต้องการ ระบบยังไม่เปลี่ยนหน้าเว็บทันที</li>
  <li>ตรวจข้อมูลในแบบร่างให้เรียบร้อย</li>
  <li>กดบันทึกและเผยแพร่เนื้อหา หน้าเว็บจึงกลับไปเป็นรุ่นนั้น</li>
</ol>
<p>ปุ่ม <code>ดาวน์โหลดข้อมูลเนื้อหา</code> ได้ไฟล์สำรองเก็บไว้นอกระบบ แนะนำดาวน์โหลดเก็บไว้เดือนละครั้ง
หรือทุกครั้งหลังแก้เนื้อหาครั้งใหญ่</p>

<h2 data-toc="ผู้ดูแลและรหัสผ่าน">ผู้ดูแลและรหัสผ่าน</h2>
<p>เมนู <strong>ผู้ดูแล</strong> เพิ่มบัญชีผู้ดูแลคนใหม่ ปิดการใช้งานบัญชี หรือตั้งรหัสผ่านใหม่ให้กัน
ส่วนเมนู <strong>บัญชีของฉัน</strong> ใช้เปลี่ยนรหัสผ่านของตัวเอง</p>
<figure><img src="images/13-users.jpg" alt="เมนูผู้ดูแล"><figcaption>เมนูผู้ดูแล</figcaption></figure>
<figure><img src="images/14-account.jpg" alt="เมนูบัญชีของฉัน"><figcaption>เมนูบัญชีของฉัน ใช้เปลี่ยนรหัสผ่านของตัวเอง</figcaption></figure>
<ul>
  <li>ตั้งรหัสผ่านอย่างน้อย 12 ตัวอักษร ส่งให้ผู้ดูแลใหม่ทางช่องทางส่วนตัวและให้เปลี่ยนทันทีที่เข้าครั้งแรก</li>
  <li>พนักงานลาออกหรือเปลี่ยนคนดูแล ให้ปิดการใช้งานบัญชีนั้นทันที ระบบจะตัดการเข้าสู่ระบบทุกอุปกรณ์ของบัญชีนั้นให้</li>
  <li>เปลี่ยนรหัสผ่านแล้วต้องเข้าสู่ระบบใหม่ทุกอุปกรณ์</li>
</ul>

<h2 data-toc="การค้นหาบน Google และคะแนนรีวิว">การค้นหาบน Google และคะแนนรีวิว</h2>
<p>เมนู <strong>ค้นหาและแชร์</strong> ตั้งชื่อหน้าและคำอธิบายที่ขึ้นบนผลค้นหา Google
และภาพที่ขึ้นเวลาแชร์ลิงก์ลง LINE หรือ Facebook เว้นว่างไว้ระบบจะสร้างจากหัวข้อหน้าแรกให้เอง</p>
<p>เมนู <strong>แบบฟอร์มและรีวิว</strong> ใส่คะแนนรีวิวจาก Google Business ของร้านมาแสดงบนหน้าแรกได้
และเปิดปิดฟอร์มติดต่อได้</p>
<div class="warn">คะแนนรีวิวต้องใส่ตัวเลขจริงจากโปรไฟล์ Google ของร้านเท่านั้น
การใส่คะแนนที่ไม่มีอยู่จริงผิดกติกาของ Google และมีบทลงโทษถึงขั้นถอดเว็บออกจากผลค้นหา
ถ้าจำนวนรีวิวเป็น 0 ระบบจะไม่แสดงส่วนนี้</div>

<h2 data-toc="ข้อควรระวัง">ข้อควรระวัง</h2>
<ul>
  <li>แก้ภาษาไทยแล้วแก้ภาษาอังกฤษให้ตรงกันเสมอ ระบบบันทึกสองภาษาพร้อมกันแต่ไม่แปลให้</li>
  <li>อย่าใส่ข้อมูลส่วนตัวของลูกค้า เลขบัตร หรือรหัสผ่านใด ๆ ลงในเนื้อหาเว็บ ทุกอย่างบนหน้าเว็บเป็นข้อมูลสาธารณะ</li>
  <li>คำอ้างคุณภาพน้ำ ดูบทที่ 8 — เขียนได้เฉพาะที่มีหลักฐานรับรองจริง</li>
  <li>ก่อนแก้ครั้งใหญ่ ดาวน์โหลดข้อมูลเนื้อหาเก็บไว้ก่อน ตามบทที่ 12</li>
</ul>

<h2 data-toc="ปัญหาที่พบบ่อย">ปัญหาที่พบบ่อย</h2>
<table>
  <tr><th style="width:42%">อาการ</th><th>วิธีแก้</th></tr>
  <tr><td>บันทึกแล้วขึ้นว่า มีคนแก้ข้อมูลใหม่แล้ว</td>
      <td>มีผู้ดูแลอีกคนบันทึกไปก่อน กดโหลดล่าสุด แล้วแก้ใหม่บนข้อมูลรุ่นล่าสุด</td></tr>
  <tr><td>บันทึกไม่ผ่าน ขึ้นข้อความสีแดง</td>
      <td>อ่านข้อความ ระบบบอกว่าช่องไหนติดอะไร เช่น เบอร์โทรไม่ครบหลัก ลิงก์ไม่ใช่ https หรือรูปไม่มีคำอธิบาย</td></tr>
  <tr><td>แก้แล้วหน้าเว็บยังไม่เปลี่ยน</td>
      <td>ตรวจว่ากดบันทึกและเผยแพร่แล้วจริง จากนั้นรีเฟรชหน้าเว็บ บนมือถือลองปิดแล้วเปิดเบราว์เซอร์ใหม่</td></tr>
  <tr><td>รูปที่เพิ่งอัปโหลดยังไม่ขึ้น</td>
      <td>รอประมาณหนึ่งนาทีแล้วรีเฟรช ไฟล์ใหม่ใช้เวลากระจายไปทุกพื้นที่</td></tr>
  <tr><td>เข้าระบบไม่ได้ ลืมรหัสผ่าน</td>
      <td>ให้ผู้ดูแลอีกคนตั้งรหัสผ่านใหม่ให้ในเมนูผู้ดูแล ถ้าไม่มีผู้ดูแลคนอื่น ติดต่อผู้จัดทำเว็บไซต์</td></tr>
  <tr><td>ขึ้นว่าเซสชันหมดอายุ</td>
      <td>เข้าสู่ระบบใหม่ได้เลย แบบร่างที่ค้างอยู่ในหน้านั้นยังอยู่</td></tr>
</table>
<p style="margin-top:18px">เอกสารประกอบอื่นเก็บในโฟลเดอร์ docs ของโปรเจกต์ ได้แก่ รายการส่งมอบและตรวจรับ (HANDOVER-TH.md)
คู่มือติดตั้งสำหรับผู้ดูแลระบบ (INSTALL-TH.md) และคู่มือฉบับย่อสำหรับนักพัฒนา (USER-MANUAL-TH.md)</p>
""".replace('%DOMAIN%', DOMAIN)

paginate = """
window.addEventListener('load', function () {
  requestAnimationFrame(function () { requestAnimationFrame(build) })
})
function build() {
  var flow = document.getElementById('flow')
  var blocks = Array.prototype.slice.call(flow.children)
  var body = document.body
  var pages = []
  var chapters = []
  var current = null
  var chapterNo = 0

  function newPage(chapterLabel) {
    var page = document.createElement('section')
    page.className = 'page'
    var foot = document.createElement('div')
    foot.className = 'pagefoot'
    foot.innerHTML = '<span><strong>ธารนที</strong> · คู่มือการใช้งานเว็บไซต์' +
      (chapterLabel ? ' · ' + chapterLabel : '') + '</span><span class="pgnum"></span>'
    page.appendChild(foot)
    body.appendChild(page)
    pages.push(page)
    current = page
    return page
  }
  function room(page) {
    var limit = page.clientHeight - parseFloat(getComputedStyle(page).paddingTop) -
      parseFloat(getComputedStyle(page).paddingBottom)
    var used = 0
    Array.prototype.forEach.call(page.children, function (child) {
      if (child.className === 'pagefoot') return
      var style = getComputedStyle(child)
      used += child.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom)
    })
    return limit - used
  }
  var label = ''
  blocks.forEach(function (block) {
    if (block.tagName === 'H2') {
      chapterNo += 1
      label = 'บทที่ ' + chapterNo + ' ' + block.dataset.toc
      var page = newPage(label)
      var no = document.createElement('span')
      no.className = 'chap-no'
      no.textContent = 'บทที่ ' + (chapterNo < 10 ? '0' : '') + chapterNo
      block.insertBefore(no, block.firstChild)
      page.insertBefore(block, page.firstChild)
      var rule = document.createElement('div')
      rule.className = 'chap-rule'
      block.after(rule)
      chapters.push({ title: block.dataset.toc, page: page })
      return
    }
    if (!current) newPage('')
    current.insertBefore(block, current.querySelector('.pagefoot'))
    if (room(current) < 0) {
      var page = newPage(label)
      page.insertBefore(block, page.querySelector('.pagefoot'))
      if (room(page) < 0) block.dataset.overflow = '1'
    }
  })
  flow.remove()

  var cover = document.getElementById('cover')
  var toc = document.getElementById('tocpage')
  var all = [cover, toc].concat(pages)
  all.forEach(function (page, index) { body.appendChild(page) })
  var total = all.length
  all.forEach(function (page, index) {
    var slot = page.querySelector('.pgnum')
    if (slot) slot.textContent = 'หน้า ' + (index + 1) + ' จาก ' + total
  })
  var list = document.getElementById('toclist')
  chapters.forEach(function (chapter, index) {
    var row = document.createElement('div')
    row.className = 'toc-row'
    row.innerHTML = '<span class="no">' + (index + 1) + '</span><span>' + chapter.title +
      '</span><span class="dots"></span><span class="pg">' + (all.indexOf(chapter.page) + 1) + '</span>'
    list.appendChild(row)
  })
  document.getElementById('paginate').remove()
  document.title = 'คู่มือการใช้งานเว็บไซต์ ธารนที'
}
"""

html = """<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>คู่มือการใช้งานเว็บไซต์ ธารนที</title>
<style>
%FONTS%
%STYLE%
</style>
</head>
<body>

<section class="page cover" id="cover">
  <div class="cover-inner">
    <div class="cover-logo"><img src="data:image/png;base64,%LOGO%" alt="โลโก้ ธารนที"></div>
    <p class="cover-kicker">คู่มือการใช้งานเว็บไซต์</p>
    <h1>ธารนที</h1>
    <p class="cover-sub">รถส่งน้ำประปาเชียงใหม่และลำพูน บริการ 24 ชั่วโมง</p>
    <div class="cover-domain">%DOMAIN%</div>
    <div class="cover-meta">ฉบับเต็มสำหรับเจ้าของร้านและผู้ดูแลเว็บไซต์<br>
    ครอบคลุมหน้าเว็บทั้งสองภาษา ระบบหลังบ้านทุกเมนู การกู้คืน และการแก้ปัญหา<br>
    ปรับปรุงล่าสุด กันยายน 2569</div>
  </div>
</section>

<section class="page" id="tocpage">
  <p class="chap-no">คู่มือการใช้งานเว็บไซต์ ธารนที</p>
  <h2 class="toc-head">สารบัญ</h2>
  <div class="chap-rule"></div>
  <div class="toc-list" id="toclist"></div>
  <div class="pagefoot"><span><strong>ธารนที</strong> · คู่มือการใช้งานเว็บไซต์</span><span class="pgnum"></span></div>
</section>

<div id="flow">
%CONTENT%
</div>

<script id="paginate">
%PAGINATE%
</script>
</body>
</html>
"""

html = (html.replace('%FONTS%', '\n'.join(fonts)).replace('%STYLE%', style)
        .replace('%LOGO%', logo).replace('%DOMAIN%', DOMAIN)
        .replace('%CONTENT%', content).replace('%PAGINATE%', paginate))

out = os.path.join(root, 'docs', 'manual', 'manual-src.html')
io.open(out, 'w', encoding='utf-8', newline='\n').write(html)
print('manual-src.html', len(html), 'bytes')
