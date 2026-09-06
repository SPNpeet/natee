<?php
/**
 * ทดสอบว่าหน้าตั้งค่าบันทึกข้อมูลสองภาษาและรายการที่ทำซ้ำได้ครบถ้วน
 * รับภาษาที่ต้องการทดสอบเป็นอาร์กิวเมนต์ เพราะภาษาถูกอ่านครั้งเดียวตอนเริ่มทำงาน
 *
 * ใช้งาน php tools/test-settings.php th  แล้วตามด้วย  php tools/test-settings.php en
 */

if ( 'cli' !== PHP_SAPI ) {
	exit( 'สคริปต์นี้รันจากบรรทัดคำสั่งเท่านั้น' );
}

$lang = isset( $argv[1] ) ? $argv[1] : 'th';

$_GET = 'en' === $lang ? array( 'lang' => 'en' ) : array();

require __DIR__ . '/preview/wp-stub.php';

$theme = get_template_directory();

require $theme . '/functions.php';

$pass = 0;
$fail = 0;

function check( $label, $got, $want ) {
	global $pass, $fail;

	if ( $got === $want ) {
		$pass++;
		printf( "  ok   %s\n", $label );

		return;
	}

	$fail++;
	printf( "  FAIL %s\n       ได้ %s\n       ควรได้ %s\n", $label, var_export( $got, true ), var_export( $want, true ) );
}

if ( 'th' === $lang ) {
	echo "1. บันทึกข้อความสองภาษา\n";

	$out = natee_sanitize_options(
		array(
			'business_name'    => '  ธารนที  ',
			'hero_title'       => 'หัวข้อไทย',
			'hero_title_en'    => 'English headline',
			'hero_subtitle'    => "บรรทัดหนึ่ง\nบรรทัดสอง",
			'hero_subtitle_en' => "Line one\nLine two",
			'seo_title_en'     => 'Title on Google',
			'areas'            => "อำเภอเมืองเชียงใหม่\n\n  อำเภอสันทราย  \n",
			'areas_en'         => "Mueang Chiang Mai\n\nSan Sai\n",
		)
	);

	check( 'ตัดช่องว่างหัวท้ายชื่อร้าน', $out['business_name'], 'ธารนที' );
	check( 'เก็บหัวข้อภาษาไทย', $out['hero_title'], 'หัวข้อไทย' );
	check( 'เก็บหัวข้อภาษาอังกฤษ', $out['hero_title_en'], 'English headline' );
	check( 'เก็บข้อความหลายบรรทัดภาษาไทย', $out['hero_subtitle'], "บรรทัดหนึ่ง\nบรรทัดสอง" );
	check( 'เก็บข้อความหลายบรรทัดภาษาอังกฤษ', $out['hero_subtitle_en'], "Line one\nLine two" );
	check( 'เก็บชื่อบน Google ภาษาอังกฤษ', $out['seo_title_en'], 'Title on Google' );
	check( 'พื้นที่ให้บริการภาษาไทย ตัดบรรทัดว่างทิ้ง', $out['areas'], array( 'อำเภอเมืองเชียงใหม่', 'อำเภอสันทราย' ) );
	check( 'พื้นที่ให้บริการภาษาอังกฤษ', $out['areas_en'], array( 'Mueang Chiang Mai', 'San Sai' ) );

	echo "\n2. รายการราคา พร้อมสิ่งที่ได้รับและภาษาอังกฤษ\n";

	$out = natee_sanitize_options(
		array(
			'pricing' => array(
				array(
					'name'        => 'รถส่งน้ำ 4 ล้อ',
					'detail'      => 'สำหรับบ้าน',
					'price'       => 'สอบถามราคา',
					'includes'    => "ข้อหนึ่ง\nข้อสอง",
					'name_en'     => 'Four wheel truck',
					'detail_en'   => 'For homes',
					'price_en'    => 'Ask for a quote',
					'includes_en' => "Item one\nItem two",
				),
				array(
					'name'  => '',
					'price' => '',
				),
			),
		)
	);

	check( 'บันทึกเฉพาะแถวที่มีข้อมูล', count( $out['pricing'] ), 1 );
	check( 'ชื่อรายการภาษาอังกฤษ', $out['pricing'][0]['name_en'], 'Four wheel truck' );
	check( 'สิ่งที่ได้รับภาษาไทย', $out['pricing'][0]['includes'], "ข้อหนึ่ง\nข้อสอง" );
	check( 'สิ่งที่ได้รับภาษาอังกฤษ', $out['pricing'][0]['includes_en'], "Item one\nItem two" );

	echo "\n3. คำถามที่พบบ่อยและบริการ\n";

	$out = natee_sanitize_options(
		array(
			'faq'      => array(
				array(
					'q'    => 'ถามไทย',
					'a'    => 'ตอบไทย',
					'q_en' => 'Ask in English',
					'a_en' => 'Answer in English',
				),
			),
			'services' => array(
				array(
					'icon'     => 'tank',
					'title'    => 'บริการไทย',
					'text'     => 'อธิบายไทย',
					'image'    => '12',
					'title_en' => 'Service in English',
					'text_en'  => 'Description in English',
				),
			),
		)
	);

	check( 'คำถามภาษาอังกฤษ', $out['faq'][0]['q_en'], 'Ask in English' );
	check( 'คำตอบภาษาอังกฤษ', $out['faq'][0]['a_en'], 'Answer in English' );
	check( 'ชื่อบริการภาษาอังกฤษ', $out['services'][0]['title_en'], 'Service in English' );
	check( 'รหัสรูปถูกแปลงเป็นตัวเลข', $out['services'][0]['image'], 12 );

	echo "\n4. กันข้อมูลอันตรายและค่าที่กรอกผิด\n";

	$out = natee_sanitize_options(
		array(
			'business_name' => '<script>alert(1)</script>ธารนที',
			'hero_title_en' => '<b>Bold</b> heading',
			'brand_color'   => 'ไม่ใช่สี',
			'email'         => 'not-an-email',
			'facebook_url'  => 'javascript:alert(1)',
			'map_embed'     => '<iframe src="https://www.google.com/maps/embed?pb=abc" width="600"></iframe>',
		)
	);

	check( 'ตัดแท็กสคริปต์ออกจากชื่อร้าน', $out['business_name'], 'alert(1)ธารนที' );
	check( 'ตัดแท็กออกจากข้อความภาษาอังกฤษ', $out['hero_title_en'], 'Bold heading' );
	check( 'สีที่กรอกผิดกลับไปใช้สีเริ่มต้น', $out['brand_color'], '#0f6fbf' );
	check( 'อีเมลที่ไม่ถูกต้องถูกล้างทิ้ง', $out['email'], '' );
	check( 'ลิงก์อันตรายถูกล้างทิ้ง', $out['facebook_url'], '' );
	check( 'ดึงเฉพาะลิงก์แผนที่จากโค้ดฝัง', $out['map_embed'], 'https://www.google.com/maps/embed?pb=abc' );

	// แผนที่ต้องมาจากโดเมนของ Google เท่านั้น
	$out = natee_sanitize_options( array( 'map_embed' => 'https://evil.example.com/maps/embed?pb=1' ) );
	check( 'ปฏิเสธลิงก์แผนที่จากโดเมนอื่น', $out['map_embed'], '' );

	$default_map = natee_default_options();
	$out         = natee_sanitize_options( array( 'map_embed' => $default_map['map_embed'] ) );
	check( 'ลิงก์แผนที่เริ่มต้นผ่านการตรวจ', $out['map_embed'], $default_map['map_embed'] );

	echo "
5. คลิปหน้างาน
";

	$out = natee_sanitize_options( array( 'videos' => '12,0,abc,34,12' ) );
	check( 'รับเฉพาะรหัสคลิปที่เป็นตัวเลขและไม่ซ้ำ', $out['videos'], array( 12, 34 ) );

	$items = natee_video_items();
	check( 'คลิปที่ติดมากับธีมถูกส่งให้หน้าเว็บครบ', count( $items ), count( natee_bundled_videos() ) );
	check( 'คลิปแรกมีลิงก์ไฟล์และภาพหน้าปก', ( '' !== $items[0]['src'] && '' !== $items[0]['poster'] ), true );
}

printf( "\n6. การแสดงผลเมื่อผู้เข้าชมเลือกภาษา %s\n", $lang );

check( 'ภาษาที่ใช้แสดงผล', natee_lang(), $lang );

if ( 'th' === $lang ) {
	check( 'หัวข้อหน้าแรกเป็นภาษาไทย', natee_text( 'hero_title', '' ), natee_opt( 'hero_title', '' ) );
	check( 'ข้อความประจำธีมเป็นภาษาไทย', natee_ui( 'call_label' ), 'โทรสั่งน้ำ' );
	check( 'พื้นที่ให้บริการเป็นภาษาไทย', natee_areas_list()[0], 'อำเภอเมืองเชียงใหม่' );
	check( 'ลิงก์สลับไปภาษาอังกฤษ', natee_lang_url( 'en' ), 'http://localhost:8123/?lang=en' );
} else {
	check( 'หัวข้อหน้าแรกเป็นภาษาอังกฤษ', natee_text( 'hero_title', '' ), natee_opt( 'hero_title_en', '' ) );
	check( 'ข้อความประจำธีมเป็นภาษาอังกฤษ', natee_ui( 'call_label' ), 'Call to order' );
	check( 'พื้นที่ให้บริการเป็นภาษาอังกฤษ', natee_areas_list()[0], 'Mueang Chiang Mai' );
	check( 'ลิงก์สลับกลับไปภาษาไทย', natee_lang_url( 'th' ), 'http://localhost:8123/' );

	// ช่องที่ยังไม่ได้แปล ต้องถอยไปใช้ค่าภาษาไทย ไม่ใช่ปล่อยว่าง
	check( 'ช่องที่ยังไม่มีคำแปลถอยไปใช้ค่าภาษาไทย', natee_text( 'ยังไม่มีคีย์นี้', 'ค่าภาษาไทย' ), 'ค่าภาษาไทย' );
}

printf( "\nผ่าน %d ข้อ ไม่ผ่าน %d ข้อ\n", $pass, $fail );

exit( $fail > 0 ? 1 : 0 );
