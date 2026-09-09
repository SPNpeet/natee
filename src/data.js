/**
 * เนื้อหาทั้งเว็บไซต์ แก้ที่ไฟล์นี้ไฟล์เดียว
 * ทุกข้อความต้องมีคู่ภาษาไทยและอังกฤษ ตรวจความครบก่อนส่งมอบ
 */

export const CONTACT = {
  phone: '064-825-3515',
  phoneHref: 'tel:0648253515',
  phone2: '082-642-7079',
  phone2Href: 'tel:0826427079',
  lineId: 'tnwater',
  lineUrl: 'https://line.me/ti/p/vTy9Ug5mTd',
  facebookUrl: 'https://www.facebook.com/TNWATER99',
  email: 'TNWater99@gmail.com',
  mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('100/29 หมู่ 3 ตำบลสันผีเสื้อ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50300'),
  mapEmbed: 'https://www.google.com/maps?q=' +
    encodeURIComponent('100/29 หมู่ 3 ตำบลสันผีเสื้อ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50300') +
    '&hl=th&z=15&output=embed',
}

/**
 * ฟอร์มฝากข้อความ ส่งผ่าน Web3Forms ซึ่งใช้ได้ฟรีและไม่ต้องมีเซิร์ฟเวอร์
 *
 * วิธีเปิดใช้งาน
 *   1. สมัครที่ web3forms.com ด้วยอีเมลที่ต้องการรับข้อความ
 *   2. นำกุญแจที่ได้มาใส่ใน accessKey ด้านล่าง
 *   3. สั่ง npm run build แล้วขึ้นเว็บใหม่
 *
 * ถ้า accessKey ยังว่าง ฟอร์มจะไม่ถูกแสดงบนหน้าเว็บเลย
 * หน้าเว็บจึงไม่มีทางมีฟอร์มที่กดส่งแล้วไม่ไปไหน
 */
export const FORM = {
  enabled: true,
  accessKey: '',
  endpoint: 'api/inquiries',
}
export const ASSETS = {
  logo: 'logo', hero: 'truck-6wheel', about: 'work-11', qr: 'line-qr',
}


/**
 * คะแนนรีวิวจาก Google Business Profile
 *
 * ใส่ค่าจริงเท่านั้น ห้ามใส่ตัวเลขที่ไม่มีอยู่จริง
 * เพราะ Google ตรวจสอบได้และมีบทลงโทษถึงขั้นถอดเว็บออกจากผลค้นหา
 * ถ้า count เป็นศูนย์ ส่วนนี้จะไม่ถูกแสดงและไม่ถูกส่งให้ Google
 */
export const REVIEWS = {
  rating: 0,
  count: 0,
  url: '',
}

export const GALLERY = [
  'work-01', 'work-02', 'work-03', 'work-04', 'work-05', 'work-06',
  'work-07', 'work-08', 'work-09', 'work-10', 'work-11', 'work-12',
]

export const I18N = {
  th: {
    lang: 'th',
    siteName: 'ธารนที',
    tagline: 'รถส่งน้ำประปาเชียงใหม่ บริการ 24 ชั่วโมง',
    address: '100/29 หมู่ 3 ตำบลสันผีเสื้อ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50300',
    hours: 'ให้บริการทุกวัน ตลอด 24 ชั่วโมง',

    nav: {
      services: 'บริการ',
      fleet: 'ประเภทรถ',
      pricing: 'ราคา',
      areas: 'พื้นที่ให้บริการ',
      gallery: 'ผลงาน',
      faq: 'คำถามที่พบบ่อย',
      contact: 'ติดต่อเรา',
    },

    skipToContent: 'ข้ามไปยังเนื้อหาหลัก',
    openMenu: 'เปิดเมนู',
    closeMenu: 'ปิดเมนู',
    mainMenu: 'เมนูหลัก',
    changeLanguage: 'เปลี่ยนภาษา',
    callLabel: 'โทรสั่งน้ำ',
    callHeader: 'โทรสั่งน้ำ 24 ชม.',
    lineLabel: 'ทักไลน์',
    orCall: 'หรือโทร',

    heroEyebrow: 'ส่งด่วน ส่งไว ใส่ใจบริการ',
    heroTitle: 'รถส่งน้ำประปา เชียงใหม่ ราคาถูก บริการ 24 ชั่วโมง',
    heroSubtitle: 'บริการส่งน้ำประปาสะอาด เติมแท็งก์น้ำ เติมสระว่ายน้ำ ล้างถนน งานก่อสร้าง รดน้ำต้นไม้และสนามหญ้า รวมถึงงานอีเวนต์และงานเทศกาล ส่งตรงถึงหน้างานทุกพื้นที่ในเชียงใหม่',
    heroNote: 'แจ้งปริมาณน้ำ สถานที่ และเวลาที่ต้องการ ทีมงานประเมินราคาให้ทันที',

    highlightsTitle: 'จุดเด่นของบริการ',
    highlights: [
      { icon: 'clock', title: 'เน้นความรวดเร็ว', text: 'เราเข้าใจดีว่าน้ำคือสิ่งจำเป็น เมื่อลูกค้าโทรสั่ง เราพร้อมประสานงานและออกรถทันที' },
      { icon: 'check', title: 'ตรงต่อเวลา', text: 'หมดกังวลเรื่องเวลานัดหมาย เราไปถึงหน้างานตรงตามเวลาที่ตกลงไว้' },
      { icon: 'drop', title: 'น้ำสะอาด ปลอดภัย', text: 'น้ำประปาของเราผ่านมาตรฐาน สะอาด ไร้สิ่งเจือปน ใส่ใจเรื่องถังบรรจุที่ได้มาตรฐาน' },
      { icon: 'truck', title: 'เข้าได้ทุกพื้นที่', text: 'มีทั้งรถ 4 ล้อ และ 6 ล้อ จึงส่งน้ำได้ทุกพื้นที่ในเชียงใหม่และจังหวัดใกล้เคียง' },
    ],

    aboutTitle: 'เรื่องน้ำประปาและความสะอาด ไว้ใจให้ ธารนที ดูแล',
    aboutText: 'รถส่งน้ำธารนทีเกิดขึ้นจากความตั้งใจที่จะให้บริการน้ำประปาสะอาดและมีคุณภาพแก่ประชาชนในจังหวัดเชียงใหม่ ทั้งบ้านพักอาศัย ร้านค้า สถานประกอบการ งานก่อสร้าง พื้นที่ที่ต้องการน้ำสำรองในช่วงน้ำประปาไม่เพียงพอ รวมถึงการเติมสระว่ายน้ำ งานกิจกรรมพิเศษ และพื้นที่ห่างไกลที่ระบบท่อส่งน้ำยังเข้าไม่ถึง เราให้บริการด้วยความใส่ใจ รับผิดชอบ และมีมาตรฐาน',
    aboutQuote: 'น้ำคือชีวิต หากไม่มีน้ำ คนอยู่ไม่ได้',

    servicesTitle: 'บริการของเรา',
    servicesSubtitle: 'รับส่งน้ำประปาทุกประเภทงาน ทั้งงานเร่งด่วนและงานประจำ ตลอด 24 ชั่วโมง',
    services: [
      { icon: 'tank', title: 'เติมน้ำลงแท็งก์เก็บน้ำ', text: 'น้ำไม่ไหล ท่อประปาแตก หรือน้ำประปาเข้าไม่ถึง เติมน้ำใส่แท็งก์ให้ใช้ได้ทันที ทั้งบ้านพัก หอพัก คอนโด และอาคารสำนักงาน' },
      { icon: 'pool', title: 'เติมสระว่ายน้ำ', text: 'เติมสระว่ายน้ำบ้าน โรงแรม รีสอร์ท คอนโด บ่อน้ำพุ และบ่อเลี้ยงปลา ด้วยน้ำประปาสะอาดมีมาตรฐาน' },
      { icon: 'build', title: 'ไซต์งานก่อสร้าง', text: 'ส่งน้ำเป็นเที่ยวหรือรายวันสำหรับงานก่อสร้าง ผสมปูน บดอัดดิน และน้ำใช้ในแคมป์คนงาน' },
      { icon: 'leaf', title: 'รดน้ำต้นไม้และสนามหญ้า', text: 'รดน้ำสวน สนามหญ้า ต้นไม้ในโครงการและพื้นที่เกษตร โดยเฉพาะช่วงหน้าแล้งที่น้ำไม่เพียงพอ' },
      { icon: 'road', title: 'ล้างถนนและอาคารสถานที่', text: 'ฉีดล้างถนน ลานจอดรถ อาคาร และพื้นที่หน้างานที่มีฝุ่นดินโคลน ให้กลับมาสะอาดพร้อมใช้' },
      { icon: 'event', title: 'งานคอนเสิร์ตและงานอีเวนต์', text: 'จัดน้ำสำรองสำหรับงานคอนเสิร์ต งานอีเวนต์ งานเทศกาล และงานสงกรานต์ วางแผนรอบส่งล่วงหน้าได้' },
      { icon: 'factory', title: 'โรงงานอุตสาหกรรม', text: 'รองรับการใช้น้ำปริมาณมากในโรงงานและสถานประกอบการ ส่งได้ต่อเนื่องตามรอบที่ตกลงกัน' },
      { icon: 'hotel', title: 'โรงแรม ร้านอาหาร และคาเฟ่', text: 'ส่งน้ำประจำวันให้ธุรกิจบริการ ไม่ให้ขาดน้ำระหว่างเปิดร้าน วางแผนรอบส่งล่วงหน้าได้' },
    ],

    fleetTitle: 'ขนาดรถและบริการของเรา',
    fleetSubtitle: 'เลือกขนาดรถให้เหมาะกับปริมาณน้ำและเส้นทางเข้าออกของหน้างาน',
    fleet: [
      { image: 'truck-6wheel', name: 'รถส่งน้ำ 6 ล้อ', capacity: 'ขนาดใหญ่ จุใจ', text: 'เหมาะสำหรับโรงงานอุตสาหกรรม คอนโดมิเนียม สระว่ายน้ำ โรงแรม หรือโครงการก่อสร้างที่ต้องใช้น้ำปริมาณมาก คุ้มค่า ประหยัดเวลา' },
      { image: 'truck-4wheel', name: 'รถส่งน้ำ 4 ล้อ', capacity: 'ขนาดกะทัดรัด เข้าซอยแคบได้', text: 'เหมาะสำหรับบ้านพักอาศัย ทาวน์โฮม หรือไซต์งานที่อยู่ในซอยแคบที่รถใหญ่เข้าไม่ได้ เข้าถึงง่าย จอดสะดวก ไม่กีดขวางการจราจร' },
    ],

    pricingTitle: 'อัตราค่าบริการ',
    pricingSubtitle: 'ราคาขึ้นอยู่กับปริมาณน้ำ ระยะทาง และช่วงเวลาที่จัดส่ง โทรสอบถามเพื่อรับราคาที่แน่นอน',
    pricing: [
      {
        name: 'รถส่งน้ำ 4 ล้อ',
        detail: 'เหมาะกับบ้านพักอาศัยและซอยแคบ',
        price: 'สอบถามราคา',
        includes: ['เข้าซอยแคบและที่จอดจำกัดได้', 'เหมาะกับการเติมแท็งก์บ้านและหอพัก', 'แจ้งราคาก่อนออกรถทุกครั้ง'],
      },
      {
        name: 'รถส่งน้ำ 6 ล้อ',
        detail: 'เหมาะกับไซต์งาน โรงงาน และสระว่ายน้ำ',
        price: 'สอบถามราคา',
        includes: ['ส่งน้ำปริมาณมากได้ในรอบเดียว', 'เหมาะกับไซต์ก่อสร้าง โรงงาน และการเติมสระว่ายน้ำ', 'วางแผนรอบส่งล่วงหน้าได้'],
      },
      {
        name: 'ส่งประจำรายเดือน',
        detail: 'วางรอบส่งล่วงหน้า มีราคาพิเศษ',
        price: 'สอบถามราคา',
        includes: ['กำหนดวันและเวลาส่งประจำได้', 'มีราคาพิเศษสำหรับลูกค้าประจำ', 'รองรับการวางบิลสำหรับลูกค้าองค์กร'],
      },
    ],
    pricingNote: 'ราคาข้างต้นเป็นราคาเริ่มต้น พื้นที่นอกเขตอำเภอเมืองและงานเร่งด่วนนอกเวลาอาจมีค่าบริการเพิ่ม แจ้งราคาให้ทราบก่อนออกรถทุกครั้ง',
    priceCallNow: 'โทรสอบถามราคา',

    stepsTitle: 'สั่งน้ำง่ายใน 3 ขั้นตอน',
    steps: [
      { title: 'โทรหรือทักไลน์', text: 'แจ้งปริมาณน้ำที่ต้องการ สถานที่จัดส่ง และเวลาที่สะดวกรับน้ำ' },
      { title: 'รับราคาและยืนยัน', text: 'ทีมงานประเมินระยะทางและแจ้งราคาให้ทราบทันที ยืนยันแล้วจัดคิวรถให้' },
      { title: 'รถออกและส่งถึงที่', text: 'พนักงานเติมน้ำให้ถึงจุดที่ต้องการ ตรวจสอบปริมาณร่วมกันก่อนชำระเงิน' },
    ],

    areasTitle: 'พื้นที่ให้บริการ',
    areasSubtitle: 'ให้บริการทั่วจังหวัดเชียงใหม่และจังหวัดใกล้เคียง พื้นที่นอกเหนือจากนี้สอบถามเพิ่มเติมได้',
    areas: [
      'อำเภอเมืองเชียงใหม่', 'อำเภอสันทราย', 'อำเภอสารภี', 'อำเภอหางดง',
      'อำเภอสันกำแพง', 'อำเภอดอยสะเก็ด', 'อำเภอแม่ริม', 'อำเภอสันป่าตอง',
      'อำเภอแม่แตง', 'อำเภอสะเมิง', 'อำเภอจอมทอง', 'อำเภอแม่ออน',
    ],

    videos: [
      { file: 'work-video-01', poster: '', caption: 'เติมน้ำให้ร้านค้าและคาเฟ่' },
      { file: 'work-video-02', poster: '', caption: 'เติมแท็งก์น้ำบ้านพักอาศัย' },
      { file: 'work-video-03', poster: '', caption: 'ส่งถึงหน้าบ้าน เข้าซอยแคบได้' },
      { file: 'work-video-04', poster: '', caption: 'ส่งน้ำให้คลินิกและสำนักงาน' },
    ],

    galleryTitle: 'ผลงานของเรา',
    gallerySubtitle: 'ตัวอย่างงานจัดส่งน้ำประปาที่ผ่านมา ทั้งงานอีเวนต์ ร้านอาหาร โรงแรม ไซต์ก่อสร้าง และงานล้างสถานที่',
    galleryAlt: 'ผลงานจัดส่งน้ำประปา',
    galleryOpen: 'ดูรูปผลงานขนาดเต็ม',
    videoPlay: 'เล่นคลิป',
    viewerLabel: 'ตัวดูผลงาน รูปและคลิป',
    viewerClose: 'ปิด',
    viewerPrev: 'ก่อนหน้า',
    viewerNext: 'ถัดไป',
    viewerOf: 'จาก',
    viewerHint: 'ปัดซ้ายขวาเพื่อดูรายการอื่น',

    faqTitle: 'คำถามที่พบบ่อย',
    faq: [
      { q: 'สั่งน้ำแล้วรอนานไหม', a: 'ขึ้นอยู่กับคิวรถและระยะทาง โดยทั่วไปในเขตอำเภอเมืองจัดส่งได้ภายในวันเดียวกัน กรณีเร่งด่วนแจ้งได้ตอนโทร ทีมงานจะจัดคิวให้ก่อน' },
      { q: 'น้ำที่ส่งเป็นน้ำอะไร ใช้ดื่มได้หรือไม่', a: 'เป็นน้ำประปาที่ผ่านมาตรฐาน สะอาด ไร้สิ่งเจือปน ใช้อุปโภคได้ทุกกรณี หากต้องการดื่มแนะนำให้ต้มหรือผ่านเครื่องกรองก่อน' },
      { q: 'คิดค่าบริการอย่างไร', a: 'คิดตามปริมาณน้ำและระยะทางจากจุดรับน้ำถึงหน้างาน แจ้งราคาทั้งหมดให้ทราบก่อนออกรถ ไม่มีค่าใช้จ่ายเพิ่มหน้างาน' },
      { q: 'รถเข้าซอยแคบได้ไหม', a: 'ได้ กรณีซอยแคบหรือทางเข้าจำกัดจะใช้รถ 4 ล้อแทนรถ 6 ล้อ แจ้งลักษณะทางเข้าตอนสั่งน้ำเพื่อให้จัดรถได้ถูกประเภท' },
      { q: 'รับส่งน้ำนอกเขตเชียงใหม่หรือไม่', a: 'รับพิจารณาเป็นกรณีไป ขึ้นอยู่กับระยะทางและปริมาณน้ำ โทรสอบถามเพื่อประเมินราคาได้' },
      { q: 'ชำระเงินอย่างไร', a: 'ชำระเงินสดหน้างานหรือโอนผ่านธนาคาร กรณีลูกค้าองค์กรที่ต้องการวางบิลแจ้งล่วงหน้าได้' },
    ],

    ctaTitle: 'ต้องการน้ำด่วนวันนี้',
    ctaSubtitle: 'โทรหาเราได้ตลอด 24 ชั่วโมง ทีมงานพร้อมจัดรถให้ทันที',

    formHeading: 'ให้ทีมงานติดต่อกลับ',
    formSubject: 'ลูกค้าสั่งน้ำผ่านเว็บไซต์',
    formName: 'ชื่อผู้ติดต่อ',
    formPhone: 'เบอร์โทรกลับ',
    formPhoneHint: 'กรอกเฉพาะตัวเลข เช่น 0812345678',
    formArea: 'พื้นที่จัดส่ง',
    formAreaPlaceholder: 'เช่น อำเภอสันทราย',
    formMessage: 'รายละเอียด',
    formMessagePlaceholder: 'ปริมาณน้ำที่ต้องการ วันและเวลาที่สะดวกรับน้ำ',
    formRequired: 'จำเป็น',
    formTrap: 'เว้นช่องนี้ว่างไว้',
    formSubmit: 'ส่งข้อมูลให้ทีมงานติดต่อกลับ',
    formSending: 'กำลังส่ง',
    formSent: 'ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด หากเร่งด่วนกรุณาโทรหาเราโดยตรง',
    formError: 'ส่งข้อความไม่สำเร็จ กรุณาโทรหาเราโดยตรงเพื่อความรวดเร็ว',
    formHint: 'ใช้ข้อมูลนี้เพื่อติดต่อกลับเรื่องบริการ เก็บในระบบของร้าน 90 วัน หากต้องการน้ำด่วนวันนี้ กรุณาโทรโดยตรง',
    reviewsLabel: 'จากรีวิวบน Google',

    contactTitle: 'ติดต่อสั่งน้ำ',
    contactSubtitle: 'โทรได้เลยเพื่อความรวดเร็วที่สุด หรือทักไลน์เพื่อส่งรายละเอียดงานให้ทีมงาน',
    labelPhone: 'โทรศัพท์',
    labelLine: 'LINE',
    labelFacebook: 'Facebook',
    labelPage: 'เพจ',
    labelEmail: 'อีเมล',
    labelLocation: 'พื้นที่ตั้ง',
    labelHours: 'เวลาให้บริการ',
    mapLink: 'เปิดเส้นทางใน Google Maps',
    mapTitle: 'แผนที่',
    copyPhone: 'คัดลอก',
    copyError: 'คัดลอกไม่ได้ กรุณาจดเบอร์นี้',
    copied: 'คัดลอกเบอร์แล้ว',

    footerContact: 'ติดต่อเรา',
    footerAreas: 'พื้นที่ให้บริการ',
    footerRights: 'สงวนลิขสิทธิ์',
    footerNote: 'TN Water Truck Services',
  },

  en: {
    lang: 'en',
    siteName: 'Natee',
    tagline: 'Water truck delivery in Chiang Mai, open 24 hours',
    address: '100/29 Moo 3, San Phi Suea, Mueang Chiang Mai, Chiang Mai 50300',
    hours: 'Open every day, 24 hours',

    nav: {
      services: 'Services',
      fleet: 'Our trucks',
      pricing: 'Pricing',
      areas: 'Service areas',
      gallery: 'Our work',
      faq: 'FAQ',
      contact: 'Contact',
    },

    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainMenu: 'Main menu',
    changeLanguage: 'Change language',
    callLabel: 'Call to order',
    callHeader: 'Call us 24 hours',
    lineLabel: 'Chat on LINE',
    orCall: 'or call',

    heroEyebrow: 'Fast, on time, and we care about every job',
    heroTitle: 'Water truck delivery in Chiang Mai, 24 hours a day',
    heroSubtitle: 'Clean tap water delivered to storage tanks, swimming pools, construction sites, gardens and lawns, road washing, festivals and events. We deliver anywhere in Chiang Mai.',
    heroNote: 'Tell us how much water you need, where, and when. We quote you straight away.',

    highlightsTitle: 'Why customers choose us',
    highlights: [
      { icon: 'clock', title: 'We move fast', text: 'Water cannot wait. The moment you call, we arrange a truck and get moving.' },
      { icon: 'check', title: 'On time, every time', text: 'No worrying about the appointment. We arrive at the time we agreed with you.' },
      { icon: 'drop', title: 'Clean and safe water', text: 'Our tap water meets the standard: clean and free of contaminants, carried in properly maintained tanks.' },
      { icon: 'truck', title: 'We reach every site', text: 'With both four wheel and six wheel trucks we can deliver anywhere in Chiang Mai and nearby provinces.' },
    ],

    aboutTitle: 'Clean water you can rely on, delivered by Natee',
    aboutText: 'Natee started with one goal: to bring clean, good quality tap water to people across Chiang Mai. We serve homes, shops, businesses, construction sites, places that need backup water when the mains run short, swimming pools, special events, and areas the pipe network has not reached. We work with care, responsibility and proper standards.',
    aboutQuote: 'Water is life. Without water, people cannot live.',

    servicesTitle: 'What we deliver',
    servicesSubtitle: 'Water delivery for every kind of job, urgent or scheduled, around the clock.',
    services: [
      { icon: 'tank', title: 'Filling water storage tanks', text: 'When the mains stop, a pipe bursts, or the network does not reach you, we fill your tank so you can carry on. Homes, dormitories, condominiums and offices.' },
      { icon: 'pool', title: 'Filling swimming pools', text: 'Pools at homes, hotels, resorts and condominiums, plus fountains and fish ponds, filled with clean tap water.' },
      { icon: 'build', title: 'Construction sites', text: 'Water by the load or by the day for mixing concrete, compacting ground, and daily use in the workers camp.' },
      { icon: 'leaf', title: 'Watering gardens and lawns', text: 'Gardens, lawns, trees in housing projects and farm land, especially through the dry season when water runs short.' },
      { icon: 'road', title: 'Washing roads and buildings', text: 'Roads, car parks, buildings and dusty or muddy work sites washed down and ready to use again.' },
      { icon: 'event', title: 'Concerts and events', text: 'Backup water for concerts, events, festivals and Songkran. We can plan the delivery schedule with you in advance.' },
      { icon: 'factory', title: 'Factories and industry', text: 'Large volumes for factories and industrial premises, delivered on a schedule we agree with you.' },
      { icon: 'hotel', title: 'Hotels, restaurants and cafes', text: 'Daily deliveries for hospitality businesses so you never run dry in the middle of service.' },
    ],

    fleetTitle: 'Our trucks',
    fleetSubtitle: 'Choose the truck that suits the volume of water and the access to your site.',
    fleet: [
      { image: 'truck-6wheel', name: 'Six wheel water truck', capacity: 'Large capacity', text: 'Best for factories, condominiums, swimming pools, hotels and construction projects that need a lot of water in one trip. Good value and saves time.' },
      { image: 'truck-4wheel', name: 'Four wheel water truck', capacity: 'Compact, fits narrow lanes', text: 'Best for houses, townhomes and sites down narrow lanes where a big truck cannot go. Easy access, easy parking, no blocked traffic.' },
    ],

    pricingTitle: 'Service rates',
    pricingSubtitle: 'The price depends on the volume of water, the distance and the time of delivery. Call us for an exact quote.',
    pricing: [
      {
        name: 'Four wheel truck',
        detail: 'For homes and narrow lanes',
        price: 'Ask for a quote',
        includes: ['Fits narrow lanes and tight parking', 'Ideal for topping up home and dormitory tanks', 'We confirm the price before the truck leaves'],
      },
      {
        name: 'Six wheel truck',
        detail: 'For sites, factories and pools',
        price: 'Ask for a quote',
        includes: ['A large volume delivered in a single trip', 'Suits construction sites, factories and pool filling', 'Delivery rounds can be planned in advance'],
      },
      {
        name: 'Monthly contract',
        detail: 'A fixed schedule at a special rate',
        price: 'Ask for a quote',
        includes: ['Set the days and times that suit you', 'Special rates for regular customers', 'Invoicing available for business customers'],
      },
    ],
    pricingNote: 'These are starting rates. Areas outside Mueang Chiang Mai and urgent out of hours jobs may cost more. We always tell you the price before the truck leaves.',
    priceCallNow: 'Call for a quote',

    stepsTitle: 'Ordering takes three steps',
    steps: [
      { title: 'Call or message us on LINE', text: 'Tell us how much water you need, where to deliver it, and when suits you.' },
      { title: 'Get the price and confirm', text: 'We work out the distance and quote you straight away. Once you confirm, we book the truck.' },
      { title: 'We deliver to your door', text: 'Our driver fills exactly where you need it. We check the volume together before you pay.' },
    ],

    areasTitle: 'Where we deliver',
    areasSubtitle: 'We serve the whole of Chiang Mai province and nearby areas. Ask us about anywhere else.',
    areas: [
      'Mueang Chiang Mai', 'San Sai', 'Saraphi', 'Hang Dong',
      'San Kamphaeng', 'Doi Saket', 'Mae Rim', 'San Pa Tong',
      'Mae Taeng', 'Samoeng', 'Chom Thong', 'Mae On',
    ],

    videos: [
      { file: 'work-video-01', poster: '', caption: 'Filling tanks for shops and cafes' },
      { file: 'work-video-02', poster: '', caption: 'Filling a home water tank' },
      { file: 'work-video-03', poster: '', caption: 'Delivered to your door, even down narrow lanes' },
      { file: 'work-video-04', poster: '', caption: 'Delivering to clinics and businesses' },
    ],

    galleryTitle: 'Our work',
    gallerySubtitle: 'Recent deliveries for events, restaurants, hotels, construction sites and site cleaning.',
    galleryAlt: 'Water delivery work by',
    galleryOpen: 'View the full size photo',
    videoPlay: 'Play the clip',
    viewerLabel: 'Work viewer, photos and clips',
    viewerClose: 'Close',
    viewerPrev: 'Previous',
    viewerNext: 'Next',
    viewerOf: 'of',
    viewerHint: 'Swipe left or right to see more',

    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'How long is the wait after I order?', a: 'It depends on the queue and the distance. Inside Mueang Chiang Mai we can usually deliver the same day. Tell us when you call if it is urgent and we will move you up the queue.' },
      { q: 'What kind of water is it? Can I drink it?', a: 'It is standard tap water: clean and free of contaminants, fine for every household use. If you want to drink it, boil it or run it through a filter first.' },
      { q: 'How is the price worked out?', a: 'By the volume of water and the distance from where we load to your site. We tell you the full price before the truck leaves, with nothing added on arrival.' },
      { q: 'Can your truck get down a narrow lane?', a: 'Yes. Where access is tight we send the four wheel truck instead of the six wheel. Describe the entrance when you order so we send the right vehicle.' },
      { q: 'Do you deliver outside Chiang Mai?', a: 'We consider it case by case, depending on the distance and the volume. Call us and we will work out a price.' },
      { q: 'How do I pay?', a: 'Cash on delivery or bank transfer. Business customers who need an invoice can arrange it with us in advance.' },
    ],

    ctaTitle: 'Need water today?',
    ctaSubtitle: 'Call us any time, day or night. We will get a truck to you.',

    formHeading: 'Request a call back',
    formSubject: 'Website enquiry for',
    formName: 'Your name',
    formPhone: 'Phone number',
    formPhoneHint: 'Numbers only, for example 0812345678',
    formArea: 'Delivery area',
    formAreaPlaceholder: 'For example, San Sai district',
    formMessage: 'Details',
    formMessagePlaceholder: 'How much water you need, and when you want it delivered',
    formRequired: 'required',
    formTrap: 'Leave this field empty',
    formSubmit: 'Send my details',
    formSending: 'Sending',
    formSent: 'Thank you. We have received your message and will call you back shortly. For urgent orders please call us directly.',
    formError: 'The message could not be sent. Please call us directly instead.',
    formHint: 'We use these details to respond to your enquiry and keep them for 90 days. Need water today? Please call us directly.',
    reviewsLabel: 'from reviews on Google',

    contactTitle: 'Contact us',
    contactSubtitle: 'Call us for the fastest response, or message us on LINE with the details of your job.',
    labelPhone: 'Phone',
    labelLine: 'LINE',
    labelFacebook: 'Facebook',
    labelPage: 'Page',
    labelEmail: 'Email',
    labelLocation: 'Location',
    labelHours: 'Opening hours',
    mapLink: 'Open directions in Google Maps',
    mapTitle: 'Map of',
    copyPhone: 'Copy',
    copyError: 'Copy unavailable. Please use this number:',
    copied: 'Phone number copied',

    footerContact: 'Contact',
    footerAreas: 'Service areas',
    footerRights: 'All rights reserved',
    footerNote: 'TN Water Truck Services',
  },
}
