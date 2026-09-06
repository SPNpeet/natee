<?php
/**
 * ตรวจความสอดคล้องของโค้ดธีม
 *
 * 1. ทุกฟังก์ชันของธีมที่ถูกเรียกใช้ ต้องมีนิยามอยู่จริง
 * 2. ไม่มีฟังก์ชันชื่อซ้ำกันข้ามไฟล์
 * 3. ข้อความประจำธีมต้องมีครบทั้งสองภาษา และถูกเรียกใช้ด้วยคีย์ที่มีอยู่จริง
 *
 * ใช้งาน php tools/test-functions.php
 */

if ( 'cli' !== PHP_SAPI ) {
	exit( 'สคริปต์นี้รันจากบรรทัดคำสั่งเท่านั้น' );
}

require __DIR__ . '/preview/wp-stub.php';

$theme = get_template_directory();

require $theme . '/functions.php';

$pass = 0;
$fail = 0;

function report( $ok, $label, $detail = '' ) {
	global $pass, $fail;

	if ( $ok ) {
		$pass++;
		printf( "  ok   %s\n", $label );

		return;
	}

	$fail++;
	printf( "  FAIL %s\n%s", $label, $detail ? '       ' . $detail . "\n" : '' );
}

/**
 * ไฟล์ php ทั้งหมดของธีม
 */
function natee_theme_files( $dir ) {
	$files    = array();
	$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $dir ) );

	foreach ( $iterator as $file ) {
		if ( 'php' === strtolower( $file->getExtension() ) ) {
			$files[] = $file->getPathname();
		}
	}

	sort( $files );

	return $files;
}

$files = natee_theme_files( $theme );

printf( "1. ฟังก์ชันของธีมที่ถูกเรียกใช้ มีนิยามครบหรือไม่ (%d ไฟล์)\n", count( $files ) );

$defined = array();
$called  = array();

foreach ( $files as $file ) {
	$code = file_get_contents( $file );

	if ( preg_match_all( '/function\s+(natee_[a-z0-9_]+)\s*\(/i', $code, $m ) ) {
		foreach ( $m[1] as $name ) {
			$defined[ $name ][] = str_replace( $theme . DIRECTORY_SEPARATOR, '', $file );
		}
	}

	if ( preg_match_all( '/(?<!function\s)\b(natee_[a-z0-9_]+)\s*\(/i', $code, $m ) ) {
		foreach ( $m[1] as $name ) {
			$called[ $name ][] = str_replace( $theme . DIRECTORY_SEPARATOR, '', $file );
		}
	}
}

$missing = array();

foreach ( $called as $name => $where ) {
	if ( ! function_exists( $name ) ) {
		$missing[] = $name . ' ถูกเรียกที่ ' . implode( ', ', array_unique( $where ) );
	}
}

report(
	empty( $missing ),
	sprintf( 'ฟังก์ชันที่ถูกเรียก %d ชื่อ มีนิยามครบ', count( $called ) ),
	implode( "\n       ", $missing )
);

$duplicates = array();

foreach ( $defined as $name => $where ) {
	if ( count( $where ) > 1 ) {
		$duplicates[] = $name . ' ซ้ำที่ ' . implode( ', ', $where );
	}
}

report( empty( $duplicates ), 'ไม่มีฟังก์ชันชื่อซ้ำข้ามไฟล์', implode( "\n       ", $duplicates ) );

echo "\n2. ข้อความประจำธีมสองภาษา\n";

$strings  = natee_ui_strings();
$บกพร่อง = array();

foreach ( $strings as $key => $pair ) {
	if ( ! is_array( $pair ) || 2 !== count( $pair ) || '' === trim( (string) $pair[0] ) || '' === trim( (string) $pair[1] ) ) {
		$บกพร่อง[] = $key;
	}
}

report( empty( $บกพร่อง ), sprintf( 'ข้อความ %d รายการ มีครบทั้งไทยและอังกฤษ', count( $strings ) ), implode( ', ', $บกพร่อง ) );

$used    = array();
$unknown = array();

foreach ( $files as $file ) {
	$code = file_get_contents( $file );

	if ( preg_match_all( "/natee_ui\(\s*'([a-z0-9_]+)'\s*\)/i", $code, $m ) ) {
		foreach ( $m[1] as $key ) {
			$used[ $key ] = true;

			if ( ! isset( $strings[ $key ] ) ) {
				$unknown[] = $key . ' ที่ ' . str_replace( $theme . DIRECTORY_SEPARATOR, '', $file );
			}
		}
	}
}

report( empty( $unknown ), 'ทุกคีย์ที่เทมเพลตเรียก มีคำแปลอยู่จริง', implode( "\n       ", $unknown ) );

echo "\n3. เนื้อหาที่แปลได้\n";

$keys      = natee_translatable_keys();
$defaults  = natee_default_options();
$ไม่มีค่า = array();

foreach ( $keys as $key ) {
	if ( ! array_key_exists( $key, $defaults ) ) {
		$ไม่มีค่า[] = $key . ' ไม่มีค่าเริ่มต้นภาษาไทย';
	}
}

report( empty( $ไม่มีค่า ), sprintf( 'คีย์ที่แปลได้ %d รายการ มีค่าเริ่มต้นภาษาไทยครบ', count( $keys ) ), implode( "\n       ", $ไม่มีค่า ) );

$ไม่มีอังกฤษ = array();

foreach ( $keys as $key ) {
	if ( ! array_key_exists( $key . '_en', $defaults ) || '' === trim( (string) $defaults[ $key . '_en' ] ) ) {
		$ไม่มีอังกฤษ[] = $key;
	}
}

report( empty( $ไม่มีอังกฤษ ), 'คีย์ที่แปลได้ มีค่าเริ่มต้นภาษาอังกฤษครบ', implode( ', ', $ไม่มีอังกฤษ ) );

echo "\n4. รูปที่ติดมากับธีม\n";

$sizes   = natee_bundled_image_sizes();
$หายไป  = array();

foreach ( $sizes as $file => $dim ) {
	$path = $theme . '/assets/images/' . $file;

	if ( ! is_file( $path ) ) {
		$หายไป[] = $file . ' ไม่มีไฟล์';
		continue;
	}

	$real = getimagesize( $path );

	if ( ! $real || (int) $real[0] !== (int) $dim[0] || (int) $real[1] !== (int) $dim[1] ) {
		$หายไป[] = sprintf( '%s ขนาดในโค้ด %dx%d แต่ไฟล์จริง %dx%d', $file, $dim[0], $dim[1], $real ? $real[0] : 0, $real ? $real[1] : 0 );
	}
}

report( empty( $หายไป ), sprintf( 'ขนาดรูป %d ไฟล์ ตรงกับไฟล์จริง', count( $sizes ) ), implode( "\n       ", $หายไป ) );

$bundled  = natee_bundled_images();
$ขาดไฟล์ = array();

foreach ( array( $bundled['logo'], $bundled['hero'], $bundled['about'], $bundled['seo'], $bundled['line_qr'] ) as $file ) {
	if ( ! is_file( $theme . '/assets/images/' . $file ) ) {
		$ขาดไฟล์[] = $file;
	}
}

foreach ( array_merge( $bundled['fleet'], $bundled['gallery'] ) as $file ) {
	if ( ! is_file( $theme . '/assets/images/' . $file ) ) {
		$ขาดไฟล์[] = $file;
	}
}

report( empty( $ขาดไฟล์ ), 'รูปเริ่มต้นทุกจุดมีไฟล์อยู่จริง', implode( ', ', $ขาดไฟล์ ) );

$ไม่มีรูปเล็ก = array();

foreach ( array_merge( $bundled['fleet'], $bundled['gallery'] ) as $file ) {
	list( $srcset ) = natee_bundled_srcset( $file );

	if ( '' === $srcset ) {
		$ไม่มีรูปเล็ก[] = $file;
	}
}

report( empty( $ไม่มีรูปเล็ก ), 'รูปใหญ่ทุกไฟล์มีรูปย่อสำหรับมือถือ', implode( ', ', $ไม่มีรูปเล็ก ) );

echo "\n5. คลิปหน้างานที่ติดมากับธีม\n";

$videos    = natee_bundled_videos();
$ปัญหาคลิป = array();

foreach ( $videos as $video ) {
	$path = $theme . '/assets/videos/' . $video['file'];

	if ( ! is_file( $path ) ) {
		$ปัญหาคลิป[] = $video['file'] . ' ไม่มีไฟล์';
		continue;
	}

	$mb = filesize( $path ) / 1048576;

	if ( $mb > 3 ) {
		$ปัญหาคลิป[] = sprintf( '%s ใหญ่เกินไป %.1f MB', $video['file'], $mb );
	}

	if ( ! is_file( $theme . '/assets/images/' . $video['poster'] ) ) {
		$ปัญหาคลิป[] = $video['poster'] . ' ไม่มีภาพหน้าปก';
	}

	if ( '' === trim( $video['caption'] ) || '' === trim( $video['caption_en'] ) ) {
		$ปัญหาคลิป[] = $video['file'] . ' คำบรรยายไม่ครบสองภาษา';
	}
}

report( empty( $ปัญหาคลิป ), sprintf( 'คลิป %d รายการ มีไฟล์ ภาพหน้าปก และคำบรรยายครบ', count( $videos ) ), implode( "\n       ", $ปัญหาคลิป ) );

$items      = natee_video_items();
$ปัญหารายการ = array();

foreach ( $items as $item ) {
	if ( empty( $item['src'] ) || empty( $item['poster'] ) ) {
		$ปัญหารายการ[] = 'มีรายการที่ขาดลิงก์ไฟล์หรือภาพหน้าปก';
	}
}

report(
	empty( $ปัญหารายการ ) && count( $items ) === count( $videos ),
	sprintf( 'ระบบส่งคลิปให้หน้าเว็บครบ %d รายการ', count( $items ) ),
	implode( "\n       ", array_unique( $ปัญหารายการ ) )
);

$ขนาดรวม = 0;

foreach ( $videos as $video ) {
	$ขนาดรวม += filesize( $theme . '/assets/videos/' . $video['file'] );
}

report( $ขนาดรวม < 6 * 1048576, sprintf( 'ขนาดคลิปรวม %.1f MB อยู่ในเกณฑ์ที่อัปโหลดธีมได้', $ขนาดรวม / 1048576 ) );

printf( "\nผ่าน %d ข้อ ไม่ผ่าน %d ข้อ\n", $pass, $fail );

exit( $fail > 0 ? 1 : 0 );
