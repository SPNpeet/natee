<?php
/**
 * สร้างไฟล์ dist/natee.zip สำหรับอัปโหลดผ่านหน้าจัดการ WordPress
 *
 * ใช้งาน: php tools/build-zip.php
 */

$root  = dirname( __DIR__ );
$theme = $root . '/theme/natee';
$dist  = $root . '/dist';
$zip_path = $dist . '/natee.zip';

if ( ! is_dir( $theme ) ) {
	fwrite( STDERR, "ไม่พบโฟลเดอร์ธีมที่ $theme\n" );
	exit( 1 );
}

if ( ! class_exists( 'ZipArchive' ) ) {
	fwrite( STDERR, "PHP ตัวนี้ไม่มีส่วนขยาย zip ให้บีบอัดโฟลเดอร์ theme/natee เป็นไฟล์ zip ด้วยตัวเองแทน\n" );
	exit( 1 );
}

if ( ! is_dir( $dist ) ) {
	mkdir( $dist, 0777, true );
}

if ( is_file( $zip_path ) ) {
	unlink( $zip_path );
}

$zip = new ZipArchive();

if ( true !== $zip->open( $zip_path, ZipArchive::CREATE ) ) {
	fwrite( STDERR, "สร้างไฟล์ zip ไม่สำเร็จ\n" );
	exit( 1 );
}

$skip = array( '.DS_Store', 'Thumbs.db' );

$files = new RecursiveIteratorIterator(
	new RecursiveDirectoryIterator( $theme, FilesystemIterator::SKIP_DOTS ),
	RecursiveIteratorIterator::SELF_FIRST
);

$count = 0;
$bytes = 0;

foreach ( $files as $file ) {
	$path     = str_replace( '\\', '/', $file->getPathname() );
	$relative = 'natee/' . ltrim( substr( $path, strlen( str_replace( '\\', '/', $theme ) ) ), '/' );

	if ( in_array( basename( $path ), $skip, true ) ) {
		continue;
	}

	if ( $file->isDir() ) {
		$zip->addEmptyDir( $relative );
		continue;
	}

	$zip->addFile( $path, $relative );
	$count++;
	$bytes += $file->getSize();
}

$zip->close();

printf(
	"สร้างไฟล์เรียบร้อย: %s\nจำนวนไฟล์ %d รายการ ขนาดก่อนบีบอัด %d KB ขนาดไฟล์ zip %d KB\n",
	$zip_path,
	$count,
	(int) ( $bytes / 1024 ),
	(int) ( filesize( $zip_path ) / 1024 )
);
