<?php
/**
 * ตัวจัดเส้นทางสำหรับเซิร์ฟเวอร์ทดสอบ php -S
 * เปิดดูหน้าเว็บที่ /  และดูหน้าตั้งค่าที่ /admin
 */

$path      = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
$theme_dir = dirname( __DIR__, 2 ) . '/theme/natee';

// ไฟล์สไตล์และสคริปต์ของธีม
if ( 0 === strpos( $path, '/theme-assets/' ) ) {
	$file = $theme_dir . substr( $path, strlen( '/theme-assets' ) );

	if ( is_file( $file ) ) {
		$types = array(
			'css'  => 'text/css',
			'js'   => 'application/javascript',
			'jpg'  => 'image/jpeg',
			'jpeg' => 'image/jpeg',
			'png'  => 'image/png',
			'webp' => 'image/webp',
			'svg'  => 'image/svg+xml',
		);
		$ext   = strtolower( pathinfo( $file, PATHINFO_EXTENSION ) );

		header( 'Content-Type: ' . ( isset( $types[ $ext ] ) ? $types[ $ext ] : 'text/plain' ) . '; charset=utf-8' );
		readfile( $file );
		return true;
	}

	http_response_code( 404 );
	return true;
}

// รูปจำลองสำหรับทดสอบเลย์เอาต์ตอนมีรูปจริง
if ( '/placeholder.svg' === $path ) {
	$w = isset( $_GET['w'] ) ? (int) $_GET['w'] : 800;
	$h = isset( $_GET['h'] ) ? (int) $_GET['h'] : 600;
	$n = isset( $_GET['n'] ) ? (int) $_GET['n'] : 1;

	$hue = ( $n * 47 ) % 360;

	header( 'Content-Type: image/svg+xml; charset=utf-8' );
	printf(
		'<svg xmlns="http://www.w3.org/2000/svg" width="%1$d" height="%2$d" viewBox="0 0 %1$d %2$d">'
		. '<rect width="%1$d" height="%2$d" fill="hsl(%3$d 45%% 78%%)"/>'
		. '<text x="50%%" y="50%%" text-anchor="middle" font-family="sans-serif" font-size="%4$d" fill="hsl(%3$d 60%% 28%%)">%1$d x %2$d</text>'
		. '</svg>',
		$w,
		$h,
		$hue,
		max( 16, (int) ( $w / 16 ) )
	);
	return true;
}

if ( '/admin' === $path ) {
	require __DIR__ . '/admin.php';
	return true;
}

require __DIR__ . '/index.php';
return true;
