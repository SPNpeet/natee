<?php
/**
 * ระบบสองภาษา ไทยและอังกฤษ
 *
 * เนื้อหาที่ลูกค้ากรอกเองเก็บเป็นคู่ เช่น hero_title กับ hero_title_en
 * ส่วนข้อความประจำของธีมอยู่ในตารางคำแปลด้านล่าง
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ภาษาที่กำลังแสดงอยู่
 */
function natee_lang() {
	static $lang = null;

	if ( null !== $lang ) {
		return $lang;
	}

	$requested = isset( $_GET['lang'] ) ? sanitize_key( wp_unslash( $_GET['lang'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$lang      = ( 'en' === $requested ) ? 'en' : 'th';

	return $lang;
}

/**
 * ตรวจว่ากำลังแสดงภาษาอังกฤษอยู่หรือไม่
 */
function natee_is_en() {
	return 'en' === natee_lang();
}

/**
 * ลิงก์ของหน้าปัจจุบันในอีกภาษาหนึ่ง
 */
function natee_lang_url( $lang ) {
	$base = natee_current_url();

	if ( 'en' === $lang ) {
		return add_query_arg( 'lang', 'en', $base );
	}

	return remove_query_arg( 'lang', $base );
}

/**
 * ค่าเนื้อหาตามภาษาที่กำลังแสดง ถ้ายังไม่ได้กรอกภาษาอังกฤษจะใช้ภาษาไทยแทน
 */
function natee_text( $key, $fallback = '' ) {
	if ( natee_is_en() ) {
		$english = trim( (string) natee_opt( $key . '_en', '' ) );

		if ( '' !== $english ) {
			return $english;
		}
	}

	return natee_opt( $key, $fallback );
}

/**
 * ค่าในรายการที่ทำซ้ำได้ ตามภาษาที่กำลังแสดง
 */
function natee_row_text( $row, $key ) {
	if ( natee_is_en() && ! empty( $row[ $key . '_en' ] ) ) {
		return $row[ $key . '_en' ];
	}

	return isset( $row[ $key ] ) ? $row[ $key ] : '';
}

/**
 * ตารางคำแปลของข้อความประจำธีม
 */
function natee_ui_strings() {
	return array(
		'skip_to_content'  => array( 'ข้ามไปยังเนื้อหาหลัก', 'Skip to main content' ),
		'main_menu'        => array( 'เมนูหลัก', 'Main menu' ),
		'open_menu'        => array( 'เปิดเมนู', 'Open menu' ),
		'nav_services'     => array( 'บริการ', 'Services' ),
		'nav_fleet'        => array( 'ประเภทรถ', 'Our trucks' ),
		'nav_pricing'      => array( 'ราคา', 'Pricing' ),
		'nav_areas'        => array( 'พื้นที่ให้บริการ', 'Service areas' ),
		'nav_gallery'      => array( 'ผลงาน', 'Our work' ),
		'nav_faq'          => array( 'คำถามที่พบบ่อย', 'FAQ' ),
		'nav_contact'      => array( 'ติดต่อเรา', 'Contact' ),
		'call_label'       => array( 'โทรสั่งน้ำ', 'Call to order' ),
		'call_header'      => array( 'โทรสั่งน้ำ 24 ชม.', 'Call us 24 hours' ),
		'line_label'       => array( 'ทักไลน์', 'Chat on LINE' ),
		'line_default'     => array( 'สอบถามทางไลน์', 'Ask us on LINE' ),
		'or_call'          => array( 'หรือโทร', 'or call' ),
		'contact_title'    => array( 'ติดต่อสั่งน้ำ', 'Contact us' ),
		'contact_subtitle' => array(
			'โทรได้เลยเพื่อความรวดเร็วที่สุด หรือฝากข้อมูลไว้ให้ทีมงานติดต่อกลับ',
			'Call us for the fastest response, or leave your details and our team will call you back.',
		),
		'label_phone'      => array( 'โทรศัพท์', 'Phone' ),
		'label_line'       => array( 'LINE', 'LINE' ),
		'label_facebook'   => array( 'Facebook', 'Facebook' ),
		'label_page'       => array( 'เพจ', 'Page' ),
		'label_email'      => array( 'อีเมล', 'Email' ),
		'label_location'   => array( 'พื้นที่ตั้ง', 'Location' ),
		'label_hours'      => array( 'เวลาให้บริการ', 'Opening hours' ),
		'qr_title'         => array( 'สแกนเพิ่มเพื่อนทางไลน์', 'Scan to add us on LINE' ),
		'qr_note'          => array( 'สอบถามราคาและสั่งน้ำได้ตลอด 24 ชั่วโมง', 'Ask for a quote or order water any time, day or night.' ),
		'map_link'         => array( 'เปิดเส้นทางใน Google Maps', 'Open directions in Google Maps' ),
		'map_title'        => array( 'แผนที่', 'Map of' ),
		'form_heading'     => array( 'ให้ทีมงานติดต่อกลับ', 'Request a call back' ),
		'form_name'        => array( 'ชื่อผู้ติดต่อ', 'Your name' ),
		'form_phone'       => array( 'เบอร์โทรกลับ', 'Phone number' ),
		'form_area'        => array( 'พื้นที่จัดส่ง', 'Delivery area' ),
		'form_area_ph'     => array( 'เช่น อำเภอสันทราย', 'For example, San Sai district' ),
		'form_message'     => array( 'รายละเอียด', 'Details' ),
		'form_message_ph'  => array( 'ปริมาณน้ำที่ต้องการ วันและเวลาที่สะดวกรับน้ำ', 'How much water you need, and when you want it delivered' ),
		'form_required'    => array( 'จำเป็น', 'required' ),
		'form_phone_hint'  => array( 'กรอกเฉพาะตัวเลข เช่น 0812345678', 'Numbers only, for example 0812345678' ),
		'form_trap'        => array( 'เว้นช่องนี้ว่างไว้', 'Leave this field empty' ),
		'form_submit'      => array( 'ส่งข้อมูลให้ทีมงานติดต่อกลับ', 'Send my details' ),
		'form_hint'        => array( 'ต้องการน้ำด่วนวันนี้ แนะนำให้โทรหาเราโดยตรง', 'Need water today? Calling us is the fastest way.' ),
		'gallery_alt'      => array( 'ผลงานจัดส่งน้ำประปา', 'Water delivery work by' ),
		'gallery_open'     => array( 'ดูรูปผลงานขนาดเต็ม', 'View the full size photo' ),
		'lightbox_label'   => array( 'ตัวดูผลงาน รูปและคลิป', 'Work viewer, photos and clips' ),
		'lightbox_close'   => array( 'ปิด', 'Close' ),
		'lightbox_prev'    => array( 'ก่อนหน้า', 'Previous' ),
		'lightbox_next'    => array( 'ถัดไป', 'Next' ),
		'lightbox_of'      => array( 'จาก', 'of' ),
		'lightbox_hint'    => array( 'ปัดซ้ายขวาเพื่อดูรายการอื่น', 'Swipe left or right to see more' ),
		'video_play'       => array( 'เล่นคลิป', 'Play the clip' ),
		'video_default_caption' => array( 'คลิปจากหน้างานจริง', 'A clip from a real delivery' ),
		'footer_contact'   => array( 'ติดต่อเรา', 'Contact' ),
		'footer_areas'     => array( 'พื้นที่ให้บริการ', 'Service areas' ),
		'footer_rights'    => array( 'สงวนลิขสิทธิ์', 'All rights reserved' ),
		'price_ask'        => array( 'สอบถามราคา', 'Ask for a quote' ),
		'price_open'       => array( 'ดูรายละเอียดและสอบถามราคา', 'See details and ask for a quote' ),
		'price_call_now'   => array( 'โทรสอบถามราคา', 'Call for a quote' ),
		'not_found_title'  => array( 'ไม่พบหน้าที่ต้องการ', 'Page not found' ),
		'not_found_text'   => array(
			'หน้านี้อาจถูกย้ายหรือลบไปแล้ว กลับไปหน้าแรกเพื่อดูบริการทั้งหมด หรือโทรหาเราได้ทันที',
			'This page may have been moved or removed. Go back to the home page, or call us right away.',
		),
		'back_home'        => array( 'กลับหน้าแรก', 'Back to home' ),
		'read_more'        => array( 'อ่านต่อ', 'Read more' ),
		'posts_title'      => array( 'บทความทั้งหมด', 'All articles' ),
		'search_results'   => array( 'ผลการค้นหา', 'Search results' ),
		'no_content'       => array( 'ยังไม่มีเนื้อหาในส่วนนี้', 'There is nothing here yet.' ),
		'lang_th'          => array( 'ไทย', 'Thai' ),
		'lang_en'          => array( 'English', 'English' ),
		'lang_switch'      => array( 'เปลี่ยนภาษา', 'Change language' ),
		'region'           => array( 'เชียงใหม่', 'Chiang Mai' ),
		'highlights_title' => array( 'จุดเด่นของบริการ', 'Why customers choose us' ),
		'notice_sent'      => array(
			'ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด หากเร่งด่วนกรุณาโทรหาเราโดยตรง',
			'Thank you. We have received your message and will call you back shortly. For urgent orders please call us directly.',
		),
		'notice_missing'   => array(
			'กรุณากรอกชื่อและเบอร์โทรให้ครบก่อนกดส่ง',
			'Please fill in your name and phone number before sending.',
		),
		'notice_phone'     => array(
			'เบอร์โทรไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
			'That phone number does not look right. Please check it again.',
		),
		'notice_toofast'   => array(
			'ระบบได้รับข้อความของท่านแล้ว กรุณารอสักครู่ก่อนส่งใหม่',
			'We already received your message. Please wait a moment before sending another.',
		),
		'notice_error'     => array(
			'ส่งข้อความไม่สำเร็จ กรุณาโทรหาเราโดยตรงเพื่อความรวดเร็ว',
			'The message could not be sent. Please call us directly instead.',
		),
	);
}

/**
 * ข้อความประจำธีมตามภาษาที่กำลังแสดง
 */
function natee_ui( $key ) {
	$strings = natee_ui_strings();

	if ( ! isset( $strings[ $key ] ) ) {
		return '';
	}

	return natee_is_en() ? $strings[ $key ][1] : $strings[ $key ][0];
}

/**
 * รายการคีย์ของเนื้อหาที่มีคู่ภาษาอังกฤษ
 */
function natee_translatable_keys() {
	return array(
		'business_tagline',
		'address',
		'open_hours',
		'hero_eyebrow',
		'hero_title',
		'hero_subtitle',
		'hero_note',
		'about_title',
		'about_text',
		'about_quote',
		'services_title',
		'services_subtitle',
		'fleet_title',
		'fleet_subtitle',
		'pricing_title',
		'pricing_subtitle',
		'pricing_note',
		'steps_title',
		'areas_title',
		'areas_subtitle',
		'gallery_title',
		'gallery_subtitle',
		'faq_title',
		'cta_title',
		'cta_subtitle',
		'seo_title',
		'seo_description',
		'footer_note',
	);
}

/**
 * ตัวเลือกเปลี่ยนภาษาบนหน้าเว็บ
 */
function natee_language_switch( $context = 'header' ) {
	$is_en = natee_is_en();
	?>
	<div class="natee-lang natee-lang-<?php echo esc_attr( $context ); ?>" role="group" aria-label="<?php echo esc_attr( natee_ui( 'lang_switch' ) ); ?>">
		<a class="natee-lang-item <?php echo $is_en ? '' : 'is-active'; ?>"
			href="<?php echo esc_url( natee_lang_url( 'th' ) ); ?>"
			hreflang="th"
			lang="th"
			<?php echo $is_en ? '' : 'aria-current="true"'; ?>>ไทย</a>
		<a class="natee-lang-item <?php echo $is_en ? 'is-active' : ''; ?>"
			href="<?php echo esc_url( natee_lang_url( 'en' ) ); ?>"
			hreflang="en"
			lang="en"
			<?php echo $is_en ? 'aria-current="true"' : ''; ?>>EN</a>
	</div>
	<?php
}
