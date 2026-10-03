# -*- coding: utf-8 -*-
"""รายงานงาน SEO สำหรับส่งมอบเจ้าของร้าน รูปเล่ม A4 สามหน้า

ใช้งาน จากรากโปรเจกต์
  1. python docs/seo/build-report.py                       ได้ docs/seo/report.html
  2. chrome --headless=new --no-pdf-header-footer --print-to-pdf=docs/seo/natee-seo-report.pdf docs/seo/report.html

ตัวเลขคะแนนมาจาก Lighthouse บนเว็บจริงหลังขึ้นเว็บรุ่นสุดท้าย แก้ที่ SCORES เมื่อวัดใหม่
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
        fonts.append("@font-face { font-family: 'IBM Plex Sans Thai'; font-weight: %d; "
                     "src: url(data:font/woff2;base64,%s) format('woff2'); unicode-range: %s; }"
                     % (weight, b64('public/fonts/ibm-plex-sans-thai-%d-%s.woff2' % (weight, subset)), urange))
logo = b64('public/images/logo.png')

DOMAIN = 'รถขายน้ำประปาเชียงใหม่.com'
DATE = '3 ตุลาคม 2569'
# คะแนน Lighthouse บนมือถือ หน้าแรกและหน้าบริการ วัดจากเว็บจริง
SCORES = {'seo': '100', 'speed': '90', 'a11y': '100', 'best': '100', 'lcp': '3.0 วินาที (ก่อนแก้ 6.7 วินาที)'}

KEYWORDS = [
    ('รถน้ำเชียงใหม่', 'หน้าแรก (ชื่อหน้าบน Google)'),
    ('รถส่งน้ำเชียงใหม่', 'หน้าแรก ส่วนบริการ'),
    ('รถขายน้ำเชียงใหม่', 'หน้าเติมน้ำแท็งก์ ซื้อน้ำ และชื่อโดเมน'),
    ('ซื้อน้ำเชียงใหม่', 'หน้าเติมน้ำแท็งก์ ซื้อน้ำ (ชื่อหน้า)'),
    ('เติมน้ำ', 'หน้าเติมน้ำแท็งก์ ซื้อน้ำ (ชื่อหน้า)'),
    ('เติมสระว่ายน้ำ', 'หน้าเติมสระว่ายน้ำ (ชื่อหน้า)'),
    ('รถบรรทุกน้ำเชียงใหม่', 'หน้าแรก ส่วนประเภทรถ'),
    ('ล้างถนน', 'หน้ารถฉีดน้ำ ล้างถนน (ชื่อหน้า)'),
    ('รดน้ำต้นไม้', 'หน้ารดน้ำต้นไม้ สนามหญ้า (ชื่อหน้า)'),
    ('รดน้ำสนามหญ้า', 'หน้ารดน้ำต้นไม้ สนามหญ้า (ชื่อหน้า)'),
    ('รถฉีดน้ำ', 'หน้ารถฉีดน้ำ ล้างถนน (ชื่อหน้า)'),
    ('รถน้ำประปา', 'หน้าแรก'),
    ('รถน้ำประปาเชียงใหม่', 'หน้าแรก ส่วนแนะนำร้าน'),
    ('ขายน้ำประปาเชียงใหม่', 'หน้าแรก ส่วนราคา และชื่อโดเมน'),
    ('รถน้ำสงกรานต์', 'หน้ารถน้ำสงกรานต์และงานอีเวนต์ (ชื่อหน้า)'),
    ('water truck', 'หน้าภาษาอังกฤษทุกหน้า (ชื่อหน้า)'),
    ('รถน้ำใกล้ฉัน', 'Google Business Profile เป็นหลัก เว็บช่วยในคำถามที่พบบ่อย'),
    ('รถส่งน้ำใกล้ฉัน', 'Google Business Profile เป็นหลัก เว็บช่วยในคำถามที่พบบ่อย'),
    ('รถขายน้ำใกล้ฉัน', 'Google Business Profile เป็นหลัก'),
    ('รถเติมน้ำใกล้ฉัน', 'Google Business Profile เป็นหลัก'),
]

DONE = [
    ('หน้าบริการแยก 5 หน้า สองภาษา', 'เติมน้ำแท็งก์ ซื้อน้ำ · เติมสระว่ายน้ำ · รถน้ำสงกรานต์และงานอีเวนต์ · รถฉีดน้ำ ล้างถนน · รดน้ำต้นไม้ สนามหญ้า แต่ละหน้าตอบคำค้นของบริการนั้นโดยตรง ใช้รูปงานจริงของร้าน'),
    ('ชื่อหน้าและคำอธิบายบน Google', 'ตั้งใหม่ทุกหน้า 14 หน้า ไม่ซ้ำกัน มีคำค้นหลักขึ้นต้น ความยาวพอดีที่ Google ไม่ตัดท้าย ต่อท้ายเบอร์โทรอัตโนมัติ'),
    ('ข้อมูลสำหรับ Google (Structured data)', 'ข้อมูลร้านค้าท้องถิ่น พิกัดร้าน เวลาเปิด 24 ชั่วโมง พื้นที่บริการ รายการบริการ คำถามที่พบบ่อย และเส้นทางหน้า ตรวจแล้วไม่มีรายการที่ Google แจ้งว่าไม่ครบ'),
    ('แผนผังเว็บและคู่ภาษา', 'sitemap 14 หน้า ทุกหน้ามีลิงก์คู่ภาษาไทยและอังกฤษให้ Google จับคู่ถูก'),
    ('ลิงก์ภายในเว็บ', 'การ์ดบริการหน้าแรกลิงก์ไปหน้าบริการ หน้าบริการลิงก์ถึงกัน ตรวจลิงก์ทั้งเว็บ 196 ลิงก์ ไม่มีลิงก์เสีย'),
    ('ความเร็วบนมือถือ', 'รูปที่อัปโหลดมีรุ่นเล็กสำหรับมือถือ รูปหน้าแรกจาก 492 KB เหลือ 113 KB หลังบ้านย่อรูปให้อัตโนมัติทุกครั้งที่อัปโหลด'),
    ('แผนที่และรูป', 'แผนที่ร้านขึ้นหมุดและการ์ดร้านจาก Google รูปที่อัปโหลดแสดงเต็มภาพ ไม่ตัดเบอร์โทรที่ขอบ'),
    ('ลิงก์เก่าจากเว็บเดิม', 'ลิงก์หน้าเก่าบน Google Sites ที่ยังค้างในผลค้นหา พาไปหน้าใหม่ ไม่ขึ้นหน้าไม่พบ'),
    ('Google Search Console', 'ยืนยันความเป็นเจ้าของ ส่ง sitemap และขอให้ Google เก็บหน้าบริการทั้ง 5 หน้า หน้าความรู้ และหน้าแรกแล้ว'),
    ('รีวิวบนเว็บและการ์ด QR', 'หน้าแรกแสดงคะแนนจริงจาก Google 5.0 จาก 5 รีวิว พร้อมลิงก์ไปหน้ารีวิวของร้าน และทำการ์ด QR ให้ลูกค้าสแกนเขียนรีวิวได้ทันที'),
    ('Google Business Profile', 'ผู้ดูแลเว็บได้สิทธิ์ผู้จัดการโปรไฟล์แล้ว ช่องเว็บไซต์บน Google Maps เปลี่ยนจาก Facebook เป็น รถขายน้ำประปาเชียงใหม่.com และรหัสไปรษณีย์แก้เป็น 50300 ชื่อ ที่อยู่ เบอร์โทร ตรงกับเว็บแล้ว'),
]

TODO = [
    ('สำคัญที่สุด', 'เว็บเก่า www.รถส่งน้ำประปาใกล้ฉัน.com', 'ยังเปิดอยู่บน Google Sites ทำให้มีสองเว็บของร้านเดียวกันแย่งคะแนนกัน เข้า Z.com เมนู Domains แล้วกดตั้งค่าของโดเมนนี้ เลือก Redirects แล้ว +Redirects ชี้ไป https://รถขายน้ำประปาเชียงใหม่.com แบบ Forwarding only (301) ทั้งแบบมีและไม่มี www ตั้งเสร็จลองเปิดเว็บเก่า ต้องเด้งมาเว็บใหม่'),
    ('สำคัญมาก', 'รีวิวจากลูกค้าจริง', 'ตอนนี้ได้ 5.0 จาก 5 รีวิว ร้านคู่แข่งใกล้เคียงมี 9 และ 21 รีวิว หลังส่งน้ำเสร็จ ส่งการ์ด QR รีวิวทาง LINE หรือให้คนขับเปิดให้ลูกค้าสแกนทุกงาน จำนวนรีวิวและการตอบรีวิวมีผลกับอันดับบนแผนที่โดยตรง'),
    ('สำคัญมาก', 'Google Business Profile ส่วนอื่น', 'ใส่บริการทั้ง 5 อย่าง ลงรูปงานจริงอย่างน้อยสัปดาห์ละครั้ง และตอบรีวิวทุกรีวิว คำค้นแบบ “ใกล้ฉัน” Google ตอบจากโปรไฟล์นี้เป็นหลัก'),
    ('ควรทำ', 'ข้อมูลร้านให้ตรงกันทุกที่', 'ชื่อร้าน ที่อยู่ เบอร์โทร และลิงก์เว็บใน Facebook และ LINE OA ต้องตรงกับในเว็บ'),
    ('ควรทำ', 'อัปเดตคะแนนรีวิวบนเว็บ', 'เมื่อมีรีวิวเพิ่ม แก้ตัวเลขในเมนู แบบฟอร์มและรีวิว ของหลังบ้านให้ตรงกับ Google'),
]

style = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'IBM Plex Sans Thai', sans-serif; color: #0f1c2e; font-size: 10.5pt; line-height: 1.6; }
.page { width: 210mm; height: 297mm; padding: 16mm 17mm 14mm; position: relative; break-after: page; overflow: hidden; }
.page:last-child { break-after: auto; }
.head { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #0f6fbf; padding-bottom: 10px; margin-bottom: 14px; }
.head img { width: 44px; }
.head .t { font-size: 18pt; font-weight: 700; line-height: 1.2; }
.head .s { color: #55657c; font-size: 10pt; }
.head .d { margin-left: auto; text-align: right; color: #55657c; font-size: 9.5pt; }
h2 { font-size: 13pt; margin: 14px 0 8px; color: #0b5290; }
.summary { background: #f4f8fc; border: 1px solid #e3e9f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
.summary ul { margin: 4px 0 0 18px; padding: 0; }
.scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0 4px; }
.score { border: 1px solid #e3e9f0; border-radius: 10px; padding: 8px; text-align: center; }
.score b { display: block; font-size: 22pt; color: #0f6fbf; line-height: 1.1; }
.score span { font-size: 9pt; color: #55657c; }
.note { font-size: 8.8pt; color: #55657c; }
table { width: 100%; border-collapse: collapse; font-size: 9.3pt; line-height: 1.5; }
th, td { border-bottom: 1px solid #e3e9f0; padding: 4px 6px; text-align: left; vertical-align: top; }
th { background: #f4f8fc; font-weight: 600; }
td:first-child { font-weight: 600; width: 32%; }
.tag { display: inline-block; font-size: 8.5pt; font-weight: 600; padding: 1px 8px; border-radius: 20px; background: #e7f2fc; color: #0b5290; white-space: nowrap; }
.tag.top { background: #0f6fbf; color: #fff; }
.foot { position: absolute; bottom: 9mm; left: 17mm; right: 17mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #8a97a8; border-top: 1px solid #e3e9f0; padding-top: 5px; }
.box { border-left: 3px solid #0f6fbf; background: #f4f8fc; padding: 8px 12px; border-radius: 0 8px 8px 0; margin-top: 10px; }
"""


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def head():
    return ('<div class="head"><img src="data:image/png;base64,%s" alt=""><div><div class="t">รายงานงาน SEO</div>'
            '<div class="s">เว็บไซต์ ธารนที รถส่งน้ำประปาเชียงใหม่ · %s</div></div><div class="d">ส่งมอบ %s</div></div>'
            % (logo, DOMAIN, DATE))


def foot(n):
    return '<div class="foot"><span>ธารนที · รายงานงาน SEO</span><span>หน้า %d จาก 3</span></div>' % n


page1 = head() + """
<div class="summary"><strong>สรุปสั้น</strong><ul>
<li>เว็บมี 14 หน้า ภาษาไทย 7 หน้า ภาษาอังกฤษ 7 หน้า เพิ่มหน้าบริการใหม่ 5 หน้า</li>
<li>คำค้นที่ร้านส่งมา 20 คำ มีหน้าที่ตอบครบทุกคำ (ดูหน้า 2)</li>
<li>ส่ง sitemap และขอให้ Google เก็บหน้าแล้วผ่าน Google Search Console</li>
</ul></div>
<div class="scores">
<div class="score"><b>%(seo)s</b><span>คะแนน SEO</span></div>
<div class="score"><b>%(speed)s</b><span>ความเร็วบนมือถือ</span></div>
<div class="score"><b>%(a11y)s</b><span>การเข้าถึง</span></div>
<div class="score"><b>%(best)s</b><span>มาตรฐานเว็บ</span></div>
</div>
<p class="note">วัดหน้าแรกด้วย Google Lighthouse โหมดมือถือ (เครื่องมือเดียวกับ PageSpeed Insights) คะแนนเต็มหมวดละ 100 · เวลาแสดงภาพหลักของหน้า %(lcp)s · ความเร็วก่อนแก้ 75</p>
<h2>1. สิ่งที่ทำบนเว็บไซต์</h2>
<table><tr><th>งาน</th><th>รายละเอียด</th></tr>
""" % SCORES + ''.join('<tr><td>%s</td><td>%s</td></tr>' % (esc(a), esc(b)) for a, b in DONE) + '</table>' + foot(1)

page2 = head() + """
<h2>2. คำค้นที่ร้านต้องการ และหน้าที่ตอบคำค้นนั้น</h2>
<table><tr><th>คำค้น</th><th>หน้าที่ตอบหลัก</th></tr>
""" + ''.join('<tr><td>%s</td><td>%s</td></tr>' % (esc(a), esc(b)) for a, b in KEYWORDS) + """</table>
<div class="box">คำค้นทุกคำอยู่ในเนื้อหาแบบอ่านเป็นธรรมชาติ ไม่ยัดคำซ้ำ เพราะ Google ลดอันดับเว็บที่ยัดคำค้น
ระบบตรวจก่อนขึ้นเว็บทุกครั้งจะไม่ยอมให้คำค้นเหล่านี้หายไปจากหน้าเว็บ แม้มีการแก้ข้อความภายหลัง</div>
""" + foot(2)

page3 = head() + """
<h2>3. สิ่งที่ร้านต้องทำต่อ เพื่อให้ติดอันดับ</h2>
<p>หน้าเว็บทำส่วนที่ทำได้ครบแล้ว อีกครึ่งหนึ่งของอันดับมาจากบัญชี Google ของร้านและเสียงของลูกค้า</p>
<table><tr><th style="width:15%">ระดับ</th><th style="width:27%">เรื่อง</th><th>ทำอย่างไร</th></tr>
""" + ''.join('<tr><td><span class="tag%s">%s</span></td><td>%s</td><td style="font-weight:400">%s</td></tr>'
              % (' top' if lv == 'สำคัญที่สุด' else '', esc(lv), esc(a), esc(b)) for lv, a, b in TODO) + """</table>
<h2>4. ระยะเวลาที่คาดหวังและการติดตาม</h2>
<ul>
<li>Google มักใช้เวลา 1–2 สัปดาห์ในการเก็บหน้าใหม่ และหลายสัปดาห์ถึง 2–3 เดือนกว่าอันดับจะนิ่ง</li>
<li>อันดับขึ้นกับคู่แข่งในพื้นที่ จำนวนรีวิว และความสม่ำเสมอของโปรไฟล์ร้านด้วย ไม่มีผู้ใดรับประกันอันดับที่แน่นอนได้
รวมถึง Google เอง</li>
<li>ผู้ดูแลเว็บติดตามผลใน Google Search Console ว่าคำค้นไหนพาคนเข้าเว็บ และแก้ไขต่อตามข้อมูลจริง</li>
</ul>
<div class="box">คู่มือการใช้งานเว็บไซต์ฉบับเต็ม 23 หน้า บทที่ 9 อธิบายการแก้หน้าบริการ และบทที่ 15 อธิบายงาน Google ที่ร้านทำเอง</div>
""" + foot(3)

html = ('<!doctype html><html lang="th"><head><meta charset="utf-8"><title>รายงานงาน SEO ธารนที</title><style>'
        + '\n'.join(fonts) + style + '</style></head><body>'
        + ''.join('<section class="page">%s</section>' % p for p in (page1, page2, page3)) + '</body></html>')
out = os.path.join(root, 'docs', 'seo', 'report.html')
io.open(out, 'w', encoding='utf-8', newline='\n').write(html)
print('report.html', len(html), 'bytes')
