# -*- coding: utf-8 -*-
"""การ์ด QR ชวนลูกค้ารีวิวร้านบน Google สำหรับส่งทาง LINE หรือพิมพ์ติดรถ

ใช้งาน จากรากโปรเจกต์
  1. python docs/seo/build-review-card.py            ได้ docs/seo/review-card.html
  2. chrome --headless=new --window-size=1080,1350 --screenshot=docs/seo/review-qr-card.png docs/seo/review-card.html

ลิงก์ใช้รหัสสถานที่ของร้านบน Google ลูกค้าสแกนแล้วเข้าหน้าเขียนรีวิวของร้านโดยตรง
"""
import base64
import io
import os

import qrcode

root = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PLACE_ID = 'ChIJr0B_fAA72jARczGvRfNdzx4'
REVIEW_URL = 'https://search.google.com/local/writereview?placeid=' + PLACE_ID


def b64(path):
    with open(os.path.join(root, path), 'rb') as f:
        return base64.b64encode(f.read()).decode()


THAI_RANGE = 'U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC'
LATIN_RANGE = 'U+0000-00FF, U+2000-206F, U+2122'
fonts = ''.join(
    "@font-face{font-family:'Plex';font-weight:%d;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}"
    % (w, b64('public/fonts/ibm-plex-sans-thai-%d-%s.woff2' % (w, s)), r)
    for w in (400, 700) for s, r in (('thai', THAI_RANGE), ('latin', LATIN_RANGE)))

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=16, border=2)
qr.add_data(REVIEW_URL)
qr.make(fit=True)
buf = io.BytesIO()
qr.make_image(fill_color='#0f1c2e', back_color='white').save(buf, format='PNG')
qr_png = base64.b64encode(buf.getvalue()).decode()

html = """<!doctype html><html lang="th"><head><meta charset="utf-8"><title>รีวิวธารนที</title><style>%s
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;font-family:'Plex',sans-serif;color:#0f1c2e;background:#f4f8fc;display:flex;align-items:center;justify-content:center}
.card{width:960px;height:1230px;background:#fff;border-radius:40px;box-shadow:0 20px 60px rgba(15,28,46,.12);padding:64px 70px 80px;text-align:center;display:flex;flex-direction:column;align-items:center}
.logo{width:120px}
h1{font-size:62px;line-height:1.25;margin-top:26px}
.sub{font-size:34px;color:#55657c;margin-top:16px;line-height:1.5}
.qr{margin-top:40px;padding:20px;border:4px solid #0f6fbf;border-radius:28px}
.qr img{width:430px;height:430px;display:block}
.stars{font-size:54px;color:#f5a623;letter-spacing:8px;margin-top:30px}
.foot{margin-top:auto;font-size:30px;color:#0b5290;font-weight:700}
.foot span{display:block;font-weight:400;color:#55657c;font-size:27px;margin-top:6px}
</style></head><body><div class="card">
<img class="logo" src="data:image/png;base64,%s" alt="">
<h1>ขอบคุณที่ใช้บริการ ธารนที</h1>
<p class="sub">สแกนเพื่อรีวิวร้านบน Google<br>ใช้เวลาไม่ถึง 1 นาที ช่วยให้คนในเชียงใหม่หาเราเจอ</p>
<div class="qr"><img src="data:image/png;base64,%s" alt="QR รีวิวธารนทีบน Google"></div>
<div class="stars">★★★★★</div>
<p class="foot">รถส่งน้ำประปาเชียงใหม่ 24 ชั่วโมง<span>รถขายน้ำประปาเชียงใหม่.com · 064-825-3515</span></p>
</div></body></html>""" % (fonts, b64('public/images/logo.png'), qr_png)

out = os.path.join(root, 'docs', 'seo', 'review-card.html')
io.open(out, 'w', encoding='utf-8', newline='\n').write(html)
print('review-card.html', len(html), 'bytes ->', REVIEW_URL)
