<?php
/**
 * สร้างเว็บรุ่นไฟล์นิ่ง (static) จากตัวจำลอง
 *
 * ใช้สำหรับส่งลิงก์ให้ลูกค้าดูและอนุมัติงานก่อนติดตั้งจริง
 * เปิดได้จากโฮสต์ธรรมดาหรือ GitHub Pages โดยไม่ต้องมี WordPress
 *
 * วิธีใช้
 *   1. เปิดตัวจำลองไว้ก่อน  php -S localhost:8123 -t tools/preview tools/preview/router.php
 *   2. สั่ง  php tools/build-static.php
 *   ได้ผลลัพธ์ที่โฟลเดอร์ dist/static
 */

if ( 'cli' !== PHP_SAPI ) {
	exit( 'สคริปต์นี้รันจากบรรทัดคำสั่งเท่านั้น' );
}

$base   = 'http://localhost:8123';
$root   = dirname( __DIR__ );
$theme  = $root . '/theme/natee';
$out    = $root . '/dist/static';

/**
 * ลบโฟลเดอร์เดิมทิ้งก่อนสร้างใหม่
 */
function natee_rmdir( $dir ) {
	if ( ! is_dir( $dir ) ) {
		return;
	}

	$items = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ),
		RecursiveIteratorIterator::CHILD_FIRST
	);

	foreach ( $items as $item ) {
		$item->isDir() ? rmdir( $item->getPathname() ) : unlink( $item->getPathname() );
	}

	rmdir( $dir );
}

/**
 * คัดลอกทั้งโฟลเดอร์
 */
function natee_copy_dir( $from, $to ) {
	if ( ! is_dir( $to ) ) {
		mkdir( $to, 0777, true );
	}

	$items = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $from, RecursiveDirectoryIterator::SKIP_DOTS ),
		RecursiveIteratorIterator::SELF_FIRST
	);

	$count = 0;

	foreach ( $items as $item ) {
		$target = $to . DIRECTORY_SEPARATOR . $items->getSubPathName();

		if ( $item->isDir() ) {
			if ( ! is_dir( $target ) ) {
				mkdir( $target, 0777, true );
			}
			continue;
		}

		copy( $item->getPathname(), $target );
		$count++;
	}

	return $count;
}

/**
 * ดึงหน้าเว็บจากตัวจำลอง
 */
function natee_fetch( $url ) {
	$context = stream_context_create( array( 'http' => array( 'timeout' => 30 ) ) );
	$body    = @file_get_contents( $url, false, $context );

	if ( false === $body || '' === $body ) {
		fwrite( STDERR, "เปิด $url ไม่ได้ ตรวจว่าเปิดตัวจำลองไว้แล้วหรือยัง\n" );
		exit( 1 );
	}

	return $body;
}

natee_rmdir( $out );
mkdir( $out, 0777, true );

// คัดลอกไฟล์สไตล์ สคริปต์ รูป และคลิป
$assets = natee_copy_dir( $theme . '/assets', $out . '/assets' );

// ไม่ต้องเอาไฟล์ของหน้าจัดการหลังบ้านไปด้วย
natee_rmdir( $out . '/assets/admin' );

printf( "คัดลอกไฟล์ประกอบ %d ไฟล์\n", $assets );

$pages = array(
	'th' => array(
		'url'  => $base . '/',
		'file' => $out . '/index.html',
	),
	'en' => array(
		'url'  => $base . '/?lang=en',
		'file' => $out . '/en/index.html',
	),
);

foreach ( $pages as $lang => $page ) {
	$html = natee_fetch( $page['url'] );

	$prefix = 'en' === $lang ? '../' : '';

	// ชี้ไฟล์ประกอบมาที่โฟลเดอร์ assets ที่คัดลอกไว้
	$html = str_replace( '/theme-assets/assets/', $prefix . 'assets/', $html );

	// ตัดพารามิเตอร์กันแคชของตัวจำลองออก
	$html = preg_replace( '/(assets\/[a-z\/\-\.]+)\?v=\d+/', '$1', $html );

	// ลิงก์สลับภาษาให้ชี้ไปยังไฟล์จริงของรุ่นไฟล์นิ่ง
	$html = str_replace( 'http://localhost:8123/?lang=en', 'en' === $lang ? 'index.html' : 'en/index.html', $html );
	$html = str_replace( 'http://localhost:8123/', 'en' === $lang ? '../index.html' : 'index.html', $html );

	// รุ่นตัวอย่างไม่ควรประกาศ canonical หรือ hreflang เพราะยังไม่ใช่ที่อยู่จริงของเว็บ
	$html = preg_replace( '#<link rel="canonical"[^>]*>\s*#', '', $html );
	$html = preg_replace( '#<link rel="alternate" hreflang="[^"]*"[^>]*>\s*#', '', $html );
	$html = preg_replace( '#<meta property="og:url"[^>]*>\s*#', '', $html );

	// ฟอร์มติดต่อบนรุ่นไฟล์นิ่งไม่มีเซิร์ฟเวอร์รองรับ จึงพาไปที่ช่องทางที่ใช้ได้จริง
	$html = preg_replace(
		'#<form class="natee-form".*?</form>#s',
		natee_static_form_notice( $lang ),
		$html
	);

	if ( ! is_dir( dirname( $page['file'] ) ) ) {
		mkdir( dirname( $page['file'] ), 0777, true );
	}

	file_put_contents( $page['file'], $html );

	printf( "สร้าง %s %d KB\n", str_replace( $root . DIRECTORY_SEPARATOR, '', $page['file'] ), (int) ( strlen( $html ) / 1024 ) );
}

/**
 * ข้อความแทนฟอร์มบนรุ่นไฟล์นิ่ง
 */
function natee_static_form_notice( $lang ) {
	if ( 'en' === $lang ) {
		return '<div class="natee-form">'
			. '<p class="natee-form-heading">Preview version</p>'
			. '<p class="natee-form-hint">This is a preview for approval. The contact form works once the site is installed on the real host. '
			. 'For now please call or message us on LINE using the buttons above.</p>'
			. '</div>';
	}

	return '<div class="natee-form">'
		. '<p class="natee-form-heading">รุ่นตัวอย่างสำหรับตรวจงาน</p>'
		. '<p class="natee-form-hint">หน้านี้เป็นตัวอย่างไว้ให้ตรวจก่อนติดตั้งจริง ฟอร์มจะส่งอีเมลได้เมื่อขึ้นเว็บจริงแล้ว '
		. 'ระหว่างนี้ใช้ปุ่มโทรหรือปุ่มไลน์ด้านบนได้เลย</p>'
		. '</div>';
}

// หน้าเปลี่ยนเส้นทางสำหรับที่อยู่ที่ไม่มีไฟล์
file_put_contents(
	$out . '/404.html',
	"<!doctype html><html lang=\"th\"><head><meta charset=\"utf-8\">"
	. "<meta http-equiv=\"refresh\" content=\"0; url=./index.html\"></head>"
	. "<body>กำลังพาไปหน้าแรก</body></html>"
);

// ปิดไม่ให้เครื่องมือค้นหาเก็บรุ่นตัวอย่างไปแสดงแทนเว็บจริง
file_put_contents( $out . '/robots.txt', "User-agent: *\nDisallow: /\n" );

$total = 0;
$files = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $out, RecursiveDirectoryIterator::SKIP_DOTS ) );

foreach ( $files as $file ) {
	$total += $file->getSize();
}

printf( "\nรวมทั้งหมด %.1f MB ที่ dist/static\n", $total / 1048576 );
printf( "เปิดดูด้วยคำสั่ง  php -S localhost:8300 -t dist/static\n" );
