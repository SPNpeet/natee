<?php
/**
 * ค่าเริ่มต้นของเนื้อหาทั้งเว็บไซต์
 * ทุกค่าในไฟล์นี้แก้ไขได้จากเมนู "ตั้งค่าเว็บไซต์" ในหน้าจัดการ WordPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function natee_default_options() {
	return array(

		// ข้อมูลติดต่อ
		'business_name'    => 'ธารนที',
		'business_tagline' => 'รถส่งน้ำประปาเชียงใหม่ บริการ 24 ชั่วโมง',
		'phone_primary'    => '064-825-3515',
		'phone_secondary'  => '082-642-7079',
		'line_id'          => 'tnwater',
		'line_url'         => 'https://line.me/ti/p/vTy9Ug5mTd',
		'facebook_url'     => 'https://www.facebook.com/TNWATER99',
		'email'            => 'TNWater99@gmail.com',
		'address'          => '100/29 หมู่ 3 ตำบลสันผีเสื้อ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50300',
		'open_hours'       => 'ให้บริการทุกวัน ตลอด 24 ชั่วโมง',
		'map_embed'        => 'https://www.google.com/maps?q=' . rawurlencode( '100/29 หมู่ 3 ตำบลสันผีเสื้อ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50300' ) . '&hl=th&z=15&output=embed',

		// ส่วนหัวหน้าแรก
		'hero_eyebrow'     => 'ส่งด่วน ส่งไว ใส่ใจบริการ',
		'hero_title'       => 'รถส่งน้ำประปา เชียงใหม่ ราคาถูก บริการ 24 ชั่วโมง',
		'hero_subtitle'    => 'บริการส่งน้ำประปาสะอาด เติมแท็งก์น้ำ เติมสระว่ายน้ำ ล้างถนน งานก่อสร้าง รดน้ำต้นไม้และสนามหญ้า รวมถึงงานอีเวนต์และงานเทศกาล ส่งตรงถึงหน้างานทุกพื้นที่ในเชียงใหม่',
		'hero_image'       => '',
		'hero_note'        => 'แจ้งปริมาณน้ำ สถานที่ และเวลาที่ต้องการ ทีมงานประเมินราคาให้ทันที',

		// แนะนำร้าน
		'about_title'      => 'เรื่องน้ำประปาและความสะอาด ไว้ใจให้ ธารนที ดูแล',
		'about_text'       => 'รถส่งน้ำธารนทีเกิดขึ้นจากความตั้งใจที่จะให้บริการน้ำประปาสะอาดและมีคุณภาพแก่ประชาชนในจังหวัดเชียงใหม่ ทั้งบ้านพักอาศัย ร้านค้า สถานประกอบการ งานก่อสร้าง พื้นที่ที่ต้องการน้ำสำรองในช่วงน้ำประปาไม่เพียงพอ รวมถึงการเติมสระว่ายน้ำ งานกิจกรรมพิเศษ และพื้นที่ห่างไกลที่ระบบท่อส่งน้ำยังเข้าไม่ถึง เราให้บริการด้วยความใส่ใจ รับผิดชอบ และมีมาตรฐาน',
		'about_quote'      => 'น้ำคือชีวิต หากไม่มีน้ำ คนอยู่ไม่ได้',
		'about_image'      => '',

		// จุดเด่น
		'highlights'       => array(
			array(
				'icon'     => 'clock',
				'title'    => 'เน้นความรวดเร็ว',
				'text'     => 'เราเข้าใจดีว่าน้ำคือสิ่งจำเป็น เมื่อลูกค้าโทรสั่ง เราพร้อมประสานงานและออกรถทันที',
				'title_en' => 'We move fast',
				'text_en'  => 'Water cannot wait. The moment you call, we arrange a truck and get moving.',
			),
			array(
				'icon'     => 'check',
				'title'    => 'ตรงต่อเวลา',
				'text'     => 'หมดกังวลเรื่องเวลานัดหมาย เราไปถึงหน้างานตรงตามเวลาที่ตกลงไว้',
				'title_en' => 'On time, every time',
				'text_en'  => 'No worrying about the appointment. We arrive at the time we agreed with you.',
			),
			array(
				'icon'     => 'drop',
				'title'    => 'น้ำสะอาด ปลอดภัย',
				'text'     => 'น้ำประปาของเราผ่านมาตรฐาน สะอาด ไร้สิ่งเจือปน ใส่ใจเรื่องถังบรรจุที่ได้มาตรฐาน',
				'title_en' => 'Clean and safe water',
				'text_en'  => 'Our tap water meets the standard: clean and free of contaminants, carried in properly maintained tanks.',
			),
			array(
				'icon'     => 'truck',
				'title'    => 'เข้าได้ทุกพื้นที่',
				'text'     => 'มีทั้งรถ 4 ล้อ และ 6 ล้อ จึงส่งน้ำได้ทุกพื้นที่ในเชียงใหม่และจังหวัดใกล้เคียง',
				'title_en' => 'We reach every site',
				'text_en'  => 'With both four wheel and six wheel trucks we can deliver anywhere in Chiang Mai and nearby provinces.',
			),
		),

		// บริการ
		'services_title'    => 'บริการของเรา',
		'services_subtitle' => 'รับส่งน้ำประปาทุกประเภทงาน ทั้งงานเร่งด่วนและงานประจำ ตลอด 24 ชั่วโมง',
		'services'          => array(
			array(
				'icon'     => 'tank',
				'title'    => 'เติมน้ำลงแท็งก์เก็บน้ำ',
				'text'     => 'น้ำไม่ไหล ท่อประปาแตก หรือน้ำประปาเข้าไม่ถึง เติมน้ำใส่แท็งก์ให้ใช้ได้ทันที ทั้งบ้านพัก หอพัก คอนโด และอาคารสำนักงาน',
				'image'    => '',
				'title_en' => 'Filling water storage tanks',
				'text_en'  => 'When the mains stop, a pipe bursts, or the network does not reach you, we fill your tank so you can carry on. Homes, dormitories, condominiums and offices.',
			),
			array(
				'icon'     => 'pool',
				'title'    => 'เติมสระว่ายน้ำ',
				'text'     => 'เติมสระว่ายน้ำบ้าน โรงแรม รีสอร์ท คอนโด บ่อน้ำพุ และบ่อเลี้ยงปลา ด้วยน้ำประปาสะอาดมีมาตรฐาน',
				'image'    => '',
				'title_en' => 'Filling swimming pools',
				'text_en'  => 'Pools at homes, hotels, resorts and condominiums, plus fountains and fish ponds, filled with clean tap water.',
			),
			array(
				'icon'     => 'build',
				'title'    => 'ไซต์งานก่อสร้าง',
				'text'     => 'ส่งน้ำเป็นเที่ยวหรือรายวันสำหรับงานก่อสร้าง ผสมปูน บดอัดดิน และน้ำใช้ในแคมป์คนงาน',
				'image'    => '',
				'title_en' => 'Construction sites',
				'text_en'  => 'Water by the load or by the day for mixing concrete, compacting ground, and daily use in the workers camp.',
			),
			array(
				'icon'     => 'leaf',
				'title'    => 'รดน้ำต้นไม้และสนามหญ้า',
				'text'     => 'รดน้ำสวน สนามหญ้า ต้นไม้ในโครงการและพื้นที่เกษตร โดยเฉพาะช่วงหน้าแล้งที่น้ำไม่เพียงพอ',
				'image'    => '',
				'title_en' => 'Watering gardens and lawns',
				'text_en'  => 'Gardens, lawns, trees in housing projects and farm land, especially through the dry season when water runs short.',
			),
			array(
				'icon'     => 'road',
				'title'    => 'ล้างถนนและอาคารสถานที่',
				'text'     => 'ฉีดล้างถนน ลานจอดรถ อาคาร และพื้นที่หน้างานที่มีฝุ่นดินโคลน ให้กลับมาสะอาดพร้อมใช้',
				'image'    => '',
				'title_en' => 'Washing roads and buildings',
				'text_en'  => 'Roads, car parks, buildings and dusty or muddy work sites washed down and ready to use again.',
			),
			array(
				'icon'     => 'event',
				'title'    => 'งานคอนเสิร์ตและงานอีเวนต์',
				'text'     => 'จัดน้ำสำรองสำหรับงานคอนเสิร์ต งานอีเวนต์ งานเทศกาล และงานสงกรานต์ วางแผนรอบส่งล่วงหน้าได้',
				'image'    => '',
				'title_en' => 'Concerts and events',
				'text_en'  => 'Backup water for concerts, events, festivals and Songkran. We can plan the delivery schedule with you in advance.',
			),
			array(
				'icon'     => 'factory',
				'title'    => 'โรงงานอุตสาหกรรม',
				'text'     => 'รองรับการใช้น้ำปริมาณมากในโรงงานและสถานประกอบการ ส่งได้ต่อเนื่องตามรอบที่ตกลงกัน',
				'image'    => '',
				'title_en' => 'Factories and industry',
				'text_en'  => 'Large volumes for factories and industrial premises, delivered on a schedule we agree with you.',
			),
			array(
				'icon'     => 'hotel',
				'title'    => 'โรงแรม ร้านอาหาร และคาเฟ่',
				'text'     => 'ส่งน้ำประจำวันให้ธุรกิจบริการ ไม่ให้ขาดน้ำระหว่างเปิดร้าน วางแผนรอบส่งล่วงหน้าได้',
				'image'    => '',
				'title_en' => 'Hotels, restaurants and cafes',
				'text_en'  => 'Daily deliveries for hospitality businesses so you never run dry in the middle of service.',
			),
		),

		// ประเภทรถ
		'fleet_title'    => 'ขนาดรถและบริการของเรา',
		'fleet_subtitle' => 'เลือกขนาดรถให้เหมาะกับปริมาณน้ำและเส้นทางเข้าออกของหน้างาน',
		'fleet'          => array(
			array(
				'name'        => 'รถส่งน้ำ 6 ล้อ',
				'capacity'    => 'ขนาดใหญ่ จุใจ',
				'text'        => 'เหมาะสำหรับโรงงานอุตสาหกรรม คอนโดมิเนียม สระว่ายน้ำ โรงแรม หรือโครงการก่อสร้างที่ต้องใช้น้ำปริมาณมาก คุ้มค่า ประหยัดเวลา',
				'image'       => '',
				'name_en'     => 'Six wheel water truck',
				'capacity_en' => 'Large capacity',
				'text_en'     => 'Best for factories, condominiums, swimming pools, hotels and construction projects that need a lot of water in one trip. Good value and saves time.',
			),
			array(
				'name'        => 'รถส่งน้ำ 4 ล้อ',
				'capacity'    => 'ขนาดกะทัดรัด เข้าซอยแคบได้',
				'text'        => 'เหมาะสำหรับบ้านพักอาศัย ทาวน์โฮม หรือไซต์งานที่อยู่ในซอยแคบที่รถใหญ่เข้าไม่ได้ เข้าถึงง่าย จอดสะดวก ไม่กีดขวางการจราจร',
				'image'       => '',
				'name_en'     => 'Four wheel water truck',
				'capacity_en' => 'Compact, fits narrow lanes',
				'text_en'     => 'Best for houses, townhomes and sites down narrow lanes where a big truck cannot go. Easy access, easy parking, no blocked traffic.',
			),
		),

		// อัตราค่าบริการ
		'pricing_title'    => 'อัตราค่าบริการ',
		'pricing_subtitle' => 'ราคาขึ้นอยู่กับปริมาณน้ำ ระยะทาง และช่วงเวลาที่จัดส่ง โทรสอบถามเพื่อรับราคาที่แน่นอน',
		'pricing_note'     => 'ราคาข้างต้นเป็นราคาเริ่มต้น พื้นที่นอกเขตอำเภอเมืองและงานเร่งด่วนนอกเวลาอาจมีค่าบริการเพิ่ม แจ้งราคาให้ทราบก่อนออกรถทุกครั้ง',
		'pricing'          => array(
			array(
				'name'        => 'รถส่งน้ำ 4 ล้อ',
				'detail'      => 'เหมาะกับบ้านพักอาศัยและซอยแคบ',
				'price'       => 'สอบถามราคา',
				'includes'    => "เข้าซอยแคบและที่จอดจำกัดได้\nเหมาะกับการเติมแท็งก์บ้านและหอพัก\nแจ้งราคาก่อนออกรถทุกครั้ง",
				'name_en'     => 'Four wheel truck',
				'detail_en'   => 'For homes and narrow lanes',
				'price_en'    => 'Ask for a quote',
				'includes_en' => "Fits narrow lanes and tight parking\nIdeal for topping up home and dormitory tanks\nWe confirm the price before the truck leaves",
			),
			array(
				'name'        => 'รถส่งน้ำ 6 ล้อ',
				'detail'      => 'เหมาะกับไซต์งาน โรงงาน และสระว่ายน้ำ',
				'price'       => 'สอบถามราคา',
				'includes'    => "ส่งน้ำปริมาณมากได้ในรอบเดียว\nเหมาะกับไซต์ก่อสร้าง โรงงาน และการเติมสระว่ายน้ำ\nวางแผนรอบส่งล่วงหน้าได้",
				'name_en'     => 'Six wheel truck',
				'detail_en'   => 'For sites, factories and pools',
				'price_en'    => 'Ask for a quote',
				'includes_en' => "A large volume delivered in a single trip\nSuits construction sites, factories and pool filling\nDelivery rounds can be planned in advance",
			),
			array(
				'name'        => 'ส่งประจำรายเดือน',
				'detail'      => 'วางรอบส่งล่วงหน้า มีราคาพิเศษ',
				'price'       => 'สอบถามราคา',
				'includes'    => "กำหนดวันและเวลาส่งประจำได้\nมีราคาพิเศษสำหรับลูกค้าประจำ\nรองรับการวางบิลสำหรับลูกค้าองค์กร",
				'name_en'     => 'Monthly contract',
				'detail_en'   => 'A fixed schedule at a special rate',
				'price_en'    => 'Ask for a quote',
				'includes_en' => "Set the days and times that suit you\nSpecial rates for regular customers\nInvoicing available for business customers",
			),
		),

		// ขั้นตอนการสั่ง
		'steps_title' => 'สั่งน้ำง่ายใน 3 ขั้นตอน',
		'steps'       => array(
			array(
				'title'    => 'โทรหรือทักไลน์',
				'text'     => 'แจ้งปริมาณน้ำที่ต้องการ สถานที่จัดส่ง และเวลาที่สะดวกรับน้ำ',
				'title_en' => 'Call or message us on LINE',
				'text_en'  => 'Tell us how much water you need, where to deliver it, and when suits you.',
			),
			array(
				'title'    => 'รับราคาและยืนยัน',
				'text'     => 'ทีมงานประเมินระยะทางและแจ้งราคาให้ทราบทันที ยืนยันแล้วจัดคิวรถให้',
				'title_en' => 'Get the price and confirm',
				'text_en'  => 'We work out the distance and quote you straight away. Once you confirm, we book the truck.',
			),
			array(
				'title'    => 'รถออกและส่งถึงที่',
				'text'     => 'พนักงานเติมน้ำให้ถึงจุดที่ต้องการ ตรวจสอบปริมาณร่วมกันก่อนชำระเงิน',
				'title_en' => 'We deliver to your door',
				'text_en'  => 'Our driver fills exactly where you need it. We check the volume together before you pay.',
			),
		),

		// พื้นที่ให้บริการ
		'areas_title'    => 'พื้นที่ให้บริการ',
		'areas_subtitle' => 'ให้บริการทั่วจังหวัดเชียงใหม่และจังหวัดใกล้เคียง พื้นที่นอกเหนือจากนี้สอบถามเพิ่มเติมได้',
		'areas'          => array(
			'อำเภอเมืองเชียงใหม่',
			'อำเภอสันทราย',
			'อำเภอสารภี',
			'อำเภอหางดง',
			'อำเภอสันกำแพง',
			'อำเภอดอยสะเก็ด',
			'อำเภอแม่ริม',
			'อำเภอสันป่าตอง',
			'อำเภอแม่แตง',
			'อำเภอสะเมิง',
			'อำเภอจอมทอง',
			'อำเภอแม่ออน',
		),
		'areas_en'       => array(
			'Mueang Chiang Mai',
			'San Sai',
			'Saraphi',
			'Hang Dong',
			'San Kamphaeng',
			'Doi Saket',
			'Mae Rim',
			'San Pa Tong',
			'Mae Taeng',
			'Samoeng',
			'Chom Thong',
			'Mae On',
		),

		// แกลเลอรี
		'gallery_title'    => 'ผลงานของเรา',
		'gallery_subtitle' => 'ตัวอย่างงานจัดส่งน้ำประปาที่ผ่านมา ทั้งงานอีเวนต์ ร้านอาหาร โรงแรม ไซต์ก่อสร้าง และงานล้างสถานที่',
		'gallery'          => array(),
		'videos'           => array(),

		// คำถามที่พบบ่อย
		'faq_title' => 'คำถามที่พบบ่อย',
		'faq'       => array(
			array(
				'q'    => 'สั่งน้ำแล้วรอนานไหม',
				'a'    => 'ขึ้นอยู่กับคิวรถและระยะทาง โดยทั่วไปในเขตอำเภอเมืองจัดส่งได้ภายในวันเดียวกัน กรณีเร่งด่วนแจ้งได้ตอนโทร ทีมงานจะจัดคิวให้ก่อน',
				'q_en' => 'How long is the wait after I order?',
				'a_en' => 'It depends on the queue and the distance. Inside Mueang Chiang Mai we can usually deliver the same day. Tell us when you call if it is urgent and we will move you up the queue.',
			),
			array(
				'q'    => 'น้ำที่ส่งเป็นน้ำอะไร ใช้ดื่มได้หรือไม่',
				'a'    => 'เป็นน้ำประปาที่ผ่านมาตรฐาน สะอาด ไร้สิ่งเจือปน ใช้อุปโภคได้ทุกกรณี หากต้องการดื่มแนะนำให้ต้มหรือผ่านเครื่องกรองก่อน',
				'q_en' => 'What kind of water is it? Can I drink it?',
				'a_en' => 'It is standard tap water: clean and free of contaminants, fine for every household use. If you want to drink it, boil it or run it through a filter first.',
			),
			array(
				'q'    => 'คิดค่าบริการอย่างไร',
				'a'    => 'คิดตามปริมาณน้ำและระยะทางจากจุดรับน้ำถึงหน้างาน แจ้งราคาทั้งหมดให้ทราบก่อนออกรถ ไม่มีค่าใช้จ่ายเพิ่มหน้างาน',
				'q_en' => 'How is the price worked out?',
				'a_en' => 'By the volume of water and the distance from where we load to your site. We tell you the full price before the truck leaves, with nothing added on arrival.',
			),
			array(
				'q'    => 'รถเข้าซอยแคบได้ไหม',
				'a'    => 'ได้ กรณีซอยแคบหรือทางเข้าจำกัดจะใช้รถ 4 ล้อแทนรถ 6 ล้อ แจ้งลักษณะทางเข้าตอนสั่งน้ำเพื่อให้จัดรถได้ถูกประเภท',
				'q_en' => 'Can your truck get down a narrow lane?',
				'a_en' => 'Yes. Where access is tight we send the four wheel truck instead of the six wheel. Describe the entrance when you order so we send the right vehicle.',
			),
			array(
				'q'    => 'รับส่งน้ำนอกเขตเชียงใหม่หรือไม่',
				'a'    => 'รับพิจารณาเป็นกรณีไป ขึ้นอยู่กับระยะทางและปริมาณน้ำ โทรสอบถามเพื่อประเมินราคาได้',
				'q_en' => 'Do you deliver outside Chiang Mai?',
				'a_en' => 'We consider it case by case, depending on the distance and the volume. Call us and we will work out a price.',
			),
			array(
				'q'    => 'ชำระเงินอย่างไร',
				'a'    => 'ชำระเงินสดหน้างานหรือโอนผ่านธนาคาร กรณีลูกค้าองค์กรที่ต้องการวางบิลแจ้งล่วงหน้าได้',
				'q_en' => 'How do I pay?',
				'a_en' => 'Cash on delivery or bank transfer. Business customers who need an invoice can arrange it with us in advance.',
			),
		),

		// แถบปิดการขาย
		'cta_title'    => 'ต้องการน้ำด่วนวันนี้',
		'cta_subtitle' => 'โทรหาเราได้ตลอด 24 ชั่วโมง ทีมงานพร้อมจัดรถให้ทันที',

		// ตั้งค่าทั่วไป
		'seo_title'       => 'รถส่งน้ำประปาเชียงใหม่ ราคาถูก 24 ชั่วโมง | ธารนที',
		'seo_description' => 'ธารนที บริการรถส่งน้ำประปาเชียงใหม่ ราคาถูก ส่งด่วน 24 ชั่วโมง เติมแท็งก์น้ำ เติมสระว่ายน้ำ ล้างถนน งานก่อสร้าง รดน้ำต้นไม้ และงานอีเวนต์ โทร 064-825-3515',
		'seo_image'       => '',
		'brand_color'     => '#0f6fbf',
		'logo'            => '',
		'show_sticky_bar' => 1,
		'show_line_qr'    => 1,
		'footer_note'     => 'TN Water Truck Services',

		// เนื้อหาภาษาอังกฤษ ใช้เมื่อผู้เข้าชมเลือกภาษาอังกฤษ
		'business_tagline_en' => 'Water truck delivery in Chiang Mai, open 24 hours',
		'address_en'          => '100/29 Moo 3, San Phi Suea, Mueang Chiang Mai, Chiang Mai 50300',
		'open_hours_en'       => 'Open every day, 24 hours',
		'hero_eyebrow_en'     => 'Fast, on time, and we care about every job',
		'hero_title_en'       => 'Water truck delivery in Chiang Mai, 24 hours a day',
		'hero_subtitle_en'    => 'Clean tap water delivered to storage tanks, swimming pools, construction sites, gardens and lawns, road washing, festivals and events. We deliver anywhere in Chiang Mai.',
		'hero_note_en'        => 'Tell us how much water you need, where, and when. We quote you straight away.',
		'about_title_en'      => 'Clean water you can rely on, delivered by Natee',
		'about_text_en'       => 'Natee started with one goal: to bring clean, good quality tap water to people across Chiang Mai. We serve homes, shops, businesses, construction sites, places that need backup water when the mains run short, swimming pools, special events, and areas the pipe network has not reached. We work with care, responsibility and proper standards.',
		'about_quote_en'      => 'Water is life. Without water, people cannot live.',
		'services_title_en'   => 'What we deliver',
		'services_subtitle_en' => 'Water delivery for every kind of job, urgent or scheduled, around the clock.',
		'fleet_title_en'      => 'Our trucks',
		'fleet_subtitle_en'   => 'Choose the truck that suits the volume of water and the access to your site.',
		'pricing_title_en'    => 'Service rates',
		'pricing_subtitle_en' => 'The price depends on the volume of water, the distance and the time of delivery. Call us for an exact quote.',
		'pricing_note_en'     => 'These are starting rates. Areas outside Mueang Chiang Mai and urgent out of hours jobs may cost more. We always tell you the price before the truck leaves.',
		'steps_title_en'      => 'Ordering takes three steps',
		'areas_title_en'      => 'Where we deliver',
		'areas_subtitle_en'   => 'We serve the whole of Chiang Mai province and nearby areas. Ask us about anywhere else.',
		'gallery_title_en'    => 'Our work',
		'gallery_subtitle_en' => 'Recent deliveries for events, restaurants, hotels, construction sites and site cleaning.',
		'faq_title_en'        => 'Frequently asked questions',
		'cta_title_en'        => 'Need water today?',
		'cta_subtitle_en'     => 'Call us any time, day or night. We will get a truck to you.',
		'seo_title_en'        => 'Water Truck Delivery Chiang Mai, 24 Hours | Natee',
		'seo_description_en'  => 'Natee delivers clean tap water by truck across Chiang Mai, 24 hours a day. Tank filling, swimming pools, construction sites, gardens, road washing and events. Call 064-825-3515.',
		'footer_note_en'      => 'TN Water Truck Services',
	);
}

/**
 * ขนาดจริงของรูปที่ติดมากับธีม
 * ใส่ไว้ในแท็กรูปเพื่อไม่ให้หน้าเว็บกระตุกตอนโหลด
 */
function natee_bundled_image_sizes() {
	return array(
		'logo.png'         => array( 240, 338 ),
		'icon-32.png'      => array( 32, 32 ),
		'icon-180.png'     => array( 180, 180 ),
		'og-banner.jpg'    => array( 1200, 480 ),
		'truck-6wheel.jpg' => array( 1200, 801 ),
		'truck-4wheel.jpg' => array( 1195, 794 ),
		'line-qr.jpg'      => array( 480, 480 ),
		'work-01.jpg'      => array( 1100, 825 ),
		'work-02.jpg'      => array( 1100, 825 ),
		'work-03.jpg'      => array( 1100, 825 ),
		'work-04.jpg'      => array( 1100, 825 ),
		'work-05.jpg'      => array( 1100, 826 ),
		'work-06.jpg'      => array( 1100, 825 ),
		'work-07.jpg'      => array( 1100, 825 ),
		'work-08.jpg'      => array( 1100, 825 ),
		'work-09.jpg'      => array( 1100, 825 ),
		'work-10.jpg'      => array( 1100, 825 ),
		'work-11.jpg'      => array( 960, 720 ),
		'work-12.jpg'      => array( 1100, 825 ),

		// ภาพหน้าปกของคลิปหน้างาน แนวตั้ง
		'work-video-01-poster.jpg' => array( 432, 768 ),
		'work-video-02-poster.jpg' => array( 432, 768 ),
		'work-video-03-poster.jpg' => array( 432, 768 ),
		'work-video-04-poster.jpg' => array( 432, 768 ),

		// ไฟล์ย่อสำหรับมือถือ เบราว์เซอร์เลือกใช้เองผ่าน srcset
		'truck-6wheel-sm.jpg' => array( 560, 374 ),
		'truck-4wheel-sm.jpg' => array( 560, 372 ),
		'work-01-sm.jpg'      => array( 560, 420 ),
		'work-02-sm.jpg'      => array( 560, 420 ),
		'work-03-sm.jpg'      => array( 560, 420 ),
		'work-04-sm.jpg'      => array( 560, 420 ),
		'work-05-sm.jpg'      => array( 560, 421 ),
		'work-06-sm.jpg'      => array( 560, 420 ),
		'work-07-sm.jpg'      => array( 560, 420 ),
		'work-08-sm.jpg'      => array( 560, 420 ),
		'work-09-sm.jpg'      => array( 560, 420 ),
		'work-10-sm.jpg'      => array( 560, 420 ),
		'work-11-sm.jpg'      => array( 560, 420 ),
		'work-12-sm.jpg'      => array( 560, 420 ),
	);
}

/**
 * คลิปหน้างานที่ติดมากับธีม ใช้เมื่อยังไม่ได้เลือกคลิปเองในหน้าตั้งค่า
 * ทุกคลิปเป็นแนวตั้ง 432x768 ความยาวประมาณ 15 วินาที
 */
function natee_bundled_videos() {
	return array(
		array(
			'file'       => 'work-video-01.mp4',
			'poster'     => 'work-video-01-poster.jpg',
			'caption'    => 'เติมน้ำให้ร้านค้าและคาเฟ่',
			'caption_en' => 'Filling tanks for shops and cafes',
		),
		array(
			'file'       => 'work-video-02.mp4',
			'poster'     => 'work-video-02-poster.jpg',
			'caption'    => 'เติมแท็งก์น้ำบ้านพักอาศัย',
			'caption_en' => 'Filling a home water tank',
		),
		array(
			'file'       => 'work-video-03.mp4',
			'poster'     => 'work-video-03-poster.jpg',
			'caption'    => 'ส่งถึงหน้าบ้าน เข้าซอยแคบได้',
			'caption_en' => 'Delivered to your door, even down narrow lanes',
		),
		array(
			'file'       => 'work-video-04.mp4',
			'poster'     => 'work-video-04-poster.jpg',
			'caption'    => 'ส่งน้ำให้คลินิกและสำนักงาน',
			'caption_en' => 'Delivering to clinics and businesses',
		),
	);
}

/**
 * รูปที่ติดมากับธีม ใช้เมื่อยังไม่ได้เลือกรูปเองในหน้าตั้งค่า
 */
function natee_bundled_images() {
	return array(
		'logo'    => 'logo.png',
		'hero'    => 'truck-6wheel.jpg',
		'about'   => 'work-11.jpg',
		'seo'     => 'og-banner.jpg',
		'line_qr' => 'line-qr.jpg',
		'fleet'   => array( 'truck-6wheel.jpg', 'truck-4wheel.jpg' ),
		'gallery' => array(
			'work-01.jpg',
			'work-02.jpg',
			'work-03.jpg',
			'work-04.jpg',
			'work-05.jpg',
			'work-06.jpg',
			'work-07.jpg',
			'work-08.jpg',
			'work-09.jpg',
			'work-10.jpg',
			'work-11.jpg',
			'work-12.jpg',
		),
	);
}
