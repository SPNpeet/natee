<?php
/**
 * ฟังก์ชันช่วยเหลือที่ใช้ร่วมกันทั้งธีม
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * อ่านค่าตั้งค่าทั้งหมด โดยเติมค่าเริ่มต้นให้คีย์ที่ยังไม่เคยบันทึก
 */
function natee_options() {
	static $cache = null;

	if ( null !== $cache ) {
		return $cache;
	}

	$defaults = natee_default_options();
	$saved    = get_option( 'natee_options', array() );

	if ( ! is_array( $saved ) ) {
		$saved = array();
	}

	$cache = array_merge( $defaults, $saved );

	return $cache;
}

/**
 * อ่านค่าตั้งค่ารายตัว
 */
function natee_opt( $key, $fallback = '' ) {
	$options = natee_options();

	if ( ! array_key_exists( $key, $options ) ) {
		return $fallback;
	}

	$value = $options[ $key ];

	if ( '' === $value || null === $value ) {
		return $fallback;
	}

	return $value;
}

/**
 * แปลงเบอร์โทรให้อยู่ในรูปแบบที่ใช้กับลิงก์ tel: ได้
 */
function natee_tel_href( $phone ) {
	$digits = preg_replace( '/[^0-9+]/', '', (string) $phone );

	if ( '' === $digits ) {
		return '';
	}

	if ( '0' === substr( $digits, 0, 1 ) ) {
		$digits = '+66' . substr( $digits, 1 );
	}

	return 'tel:' . $digits;
}

/**
 * สร้างลิงก์ LINE จาก LINE ID หรือใช้ลิงก์เต็มที่กรอกไว้
 */
function natee_line_href() {
	$url = trim( (string) natee_opt( 'line_url', '' ) );

	if ( '' !== $url ) {
		return esc_url( $url );
	}

	$id = trim( (string) natee_opt( 'line_id', '' ) );

	if ( '' === $id ) {
		return '';
	}

	$id = ltrim( $id, '@' );

	return esc_url( 'https://line.me/R/ti/p/@' . rawurlencode( $id ) );
}

/**
 * รายการเบอร์โทรทั้งหมดที่กรอกไว้
 */
function natee_phones() {
	$phones = array(
		trim( (string) natee_opt( 'phone_primary', '' ) ),
		trim( (string) natee_opt( 'phone_secondary', '' ) ),
	);

	return array_values( array_filter( $phones ) );
}

/**
 * ไอคอนแบบ SVG ในตัวธีม ไม่ต้องโหลดไลบรารีภายนอก
 */
function natee_icon( $name, $class = 'natee-icon' ) {
	$paths = array(
		'phone'    => '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.1 21 3 12.9 3 3c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1z"/>',
		'line'     => '<path d="M12 3C6.5 3 2 6.6 2 11c0 4 3.6 7.3 8.4 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.6 1.1-.5 6-3.5 8.2-6C21.7 14.4 22 12.8 22 11c0-4.4-4.5-8-10-8zM8.2 13.4H6.1c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.3h1.6c.3 0 .5.2.5.5s-.2.5-.5.5zm2-.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.8zm4.5 0c0 .2-.1.4-.4.5h-.2c-.2 0-.3-.1-.4-.2l-1.9-2.6v2.3c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.2.1-.4.4-.5.2-.1.5 0 .6.2l1.9 2.6V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.8zm3.1-2.4c.3 0 .5.2.5.5s-.2.5-.5.5h-1.6v1h1.6c.3 0 .5.2.5.5s-.2.5-.5.5h-2.1c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5h2.1c.3 0 .5.2.5.5s-.2.5-.5.5h-1.6v1z"/>',
		'facebook' => '<path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V13h2.7v8z"/>',
		'clock'    => '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.9 10.4-3.3 2a.8.8 0 0 1-.8-1.4l2.4-1.4V6.9a.8.8 0 0 1 1.7 0z"/>',
		'drop'     => '<path d="M12 2.5c3.4 4 6.5 7.4 6.5 11a6.5 6.5 0 0 1-13 0c0-3.6 3.1-7 6.5-11zm0 15.8a4.8 4.8 0 0 0 4.8-4.8.8.8 0 0 0-1.6 0 3.2 3.2 0 0 1-3.2 3.2.8.8 0 0 0 0 1.6z"/>',
		'truck'    => '<path d="M3 5.5h10.2c.6 0 1 .4 1 1v8.3H3.9c-.6 0-1-.4-1-1V6.5c0-.6.4-1 1-1zm12.2 3h2.5c.4 0 .7.2.9.5l2.3 3.6c.1.2.2.4.2.6v2.6c0 .6-.4 1-1 1h-1.2a2.6 2.6 0 0 0-5.1 0h-.6zM7.4 15.8a2.6 2.6 0 1 1 0 5.1 2.6 2.6 0 0 1 0-5.1zm11.1 0a2.6 2.6 0 1 1 0 5.1 2.6 2.6 0 0 1 0-5.1z"/>',
		'tag'      => '<path d="M11.6 2.6H6.4c-2.1 0-3.8 1.7-3.8 3.8v5.2c0 1 .4 2 1.1 2.7l6.1 6.1a3.8 3.8 0 0 0 5.4 0l5.2-5.2a3.8 3.8 0 0 0 0-5.4l-6.1-6.1a3.8 3.8 0 0 0-2.7-1.1zM7.9 9.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"/>',
		'check'    => '<path d="M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6L20.4 8.2 19 6.8z"/>',
		'pin'      => '<path d="M12 2.2a7 7 0 0 0-7 7c0 5 6.3 12 6.6 12.3.2.2.6.2.8 0 .3-.3 6.6-7.3 6.6-12.3a7 7 0 0 0-7-7zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/>',
		'chevron'  => '<path d="m8.1 9.3 3.9 3.9 3.9-3.9 1.4 1.4-5.3 5.3-5.3-5.3z"/>',
		'mail'     => '<path d="M3 5.8h18c.6 0 1 .4 1 1v10.4c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6.8c0-.6.4-1 1-1zm9 7.1 7.4-4.6H4.6z"/>',
		'tank'     => '<path d="M8.5 2h7a1.1 1.1 0 0 1 0 2.2h-7a1.1 1.1 0 0 1 0-2.2z"/><path d="M6.6 5.4h10.8c.9 0 1.6.7 1.6 1.6v11.6c0 1.3-1.1 2.4-2.4 2.4H7.4A2.4 2.4 0 0 1 5 18.6V7c0-.9.7-1.6 1.6-1.6z"/>',
		'pool'     => '<path d="M2 16.2c1.7 0 2.5-1.1 4.2-1.1s2.5 1.1 4.2 1.1 2.5-1.1 4.2-1.1 2.5 1.1 4.2 1.1c.6 0 1.1-.1 1.5-.3v2.2c-.4.2-.9.3-1.5.3-1.7 0-2.5-1.1-4.2-1.1s-2.5 1.1-4.2 1.1-2.5-1.1-4.2-1.1S3.7 18.4 2 18.4zm0-5.6c1.7 0 2.5-1.1 4.2-1.1s2.5 1.1 4.2 1.1 2.5-1.1 4.2-1.1 2.5 1.1 4.2 1.1c.6 0 1.1-.1 1.5-.3v2.2c-.4.2-.9.3-1.5.3-1.7 0-2.5-1.1-4.2-1.1s-2.5 1.1-4.2 1.1-2.5-1.1-4.2-1.1S3.7 12.8 2 12.8zM6.9 3.2a2.9 2.9 0 0 1 2.9 2.9v2.3c-.6-.2-1.2-.4-1.9-.4V6.1a1 1 0 0 0-2 0H4a2.9 2.9 0 0 1 2.9-2.9zm8.2 0A2.9 2.9 0 0 1 18 6.1V8c-.7 0-1.3.2-1.9.4V6.1a1 1 0 0 0-2 0h-1.9a2.9 2.9 0 0 1 2.9-2.9z"/>',
		'build'    => '<path d="M13.78 15.3l6.55 6.55 1.41-1.41-6.55-6.55zM17.5 10c1.93 0 3.5-1.57 3.5-3.5 0-.58-.16-1.12-.41-1.6l-2.7 2.7-1.49-1.49 2.7-2.7c-.48-.25-1.02-.41-1.6-.41C15.57 3 14 4.57 14 6.5c0 .41.08.8.21 1.16l-1.85 1.85-1.78-1.78.71-.71-1.41-1.41L12 3.6c-.78-.78-2.05-.78-2.83 0L6.34 6.43l1.41 1.41H4.92l-.71.71 3.54 3.54.71-.71V9.6l1.41 1.41.71-.71 1.78 1.78-7.41 7.41 1.41 1.41L16.34 9.79c.36.13.75.21 1.16.21z"/>',
		'leaf'     => '<path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>',
		'road'     => '<path d="M18.4 2.6h3v18.8h-3zM2.6 2.6h3v18.8h-3zM10.5 2.6h3v4.2h-3zm0 6.8h3v4.2h-3zm0 6.8h3v4.2h-3z"/>',
		'event'    => '<path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>',
		'factory'  => '<path d="M2.6 20.6V9.2l5.6 3.4V9.2l5.6 3.4V9.2l5.6 3.4V2.6h2.4v18zm3.8-4.8h2.4v2.4H6.4zm5 0h2.4v2.4h-2.4zm5 0h2.4v2.4h-2.4z"/>',
		'hotel'    => '<path d="M4 2.6h16v18.8h-6.6v-4.6h-2.8v4.6H4zm3 3.2v2.4h2.6V5.8zm5.4 0v2.4H15V5.8zM7 10.6V13h2.6v-2.4zm5.4 0V13H15v-2.4z"/>',
	);

	if ( ! isset( $paths[ $name ] ) ) {
		$name = 'drop';
	}

	return sprintf(
		'<svg class="%s" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">%s</svg>',
		esc_attr( $class ),
		$paths[ $name ]
	);
}

/**
 * แสดงรูปภาพจาก attachment id ถ้าไม่มีรูปจะคืนค่าว่างเพื่อให้เลย์เอาต์ไม่พัง
 */
function natee_image( $attachment_id, $size = 'large', $class = '', $alt = '' ) {
	$attachment_id = absint( $attachment_id );

	if ( ! $attachment_id ) {
		return '';
	}

	return wp_get_attachment_image(
		$attachment_id,
		$size,
		false,
		array(
			'class'   => $class,
			'alt'     => $alt,
			'loading' => 'lazy',
		)
	);
}

/**
 * ตรวจว่ามีรูปจริงหรือไม่
 */
function natee_has_image( $attachment_id ) {
	return (bool) wp_get_attachment_image_url( absint( $attachment_id ), 'thumbnail' );
}

/**
 * ลิงก์รูปที่ติดมากับธีม
 */
function natee_bundled_url( $file ) {
	if ( ! $file ) {
		return '';
	}

	return get_template_directory_uri() . '/assets/images/' . $file;
}

/**
 * ลิงก์รูปของช่องที่ระบุ ถ้ายังไม่ได้เลือกรูปเองจะใช้รูปที่ติดมากับธีม
 */
function natee_media_url( $attachment_id, $fallback_file = '', $size = 'large' ) {
	$url = wp_get_attachment_image_url( absint( $attachment_id ), $size );

	if ( $url ) {
		return $url;
	}

	return natee_bundled_url( $fallback_file );
}

/**
 * แท็กรูปของช่องที่ระบุ รองรับทั้งรูปที่ลูกค้าเลือกเองและรูปที่ติดมากับธีม
 */
function natee_media_tag( $attachment_id, $fallback_file = '', $size = 'large', $class = '', $alt = '' ) {
	$tag = natee_image( $attachment_id, $size, $class, $alt );

	if ( $tag ) {
		return $tag;
	}

	$url = natee_bundled_url( $fallback_file );

	if ( ! $url ) {
		return '';
	}

	return sprintf(
		'<img src="%s" class="%s" alt="%s" loading="lazy" decoding="async" />',
		esc_url( $url ),
		esc_attr( $class ),
		esc_attr( $alt )
	);
}

/**
 * ตรวจว่าช่องนี้มีรูปให้แสดงหรือไม่ นับรวมรูปที่ติดมากับธีมด้วย
 */
function natee_has_media( $attachment_id, $fallback_file = '' ) {
	return (bool) natee_media_url( $attachment_id, $fallback_file, 'thumbnail' );
}

/**
 * รายการรูปในแกลเลอรี ใช้รูปที่ลูกค้าเลือกก่อน ถ้ายังไม่ได้เลือกจะใช้รูปที่ติดมากับธีม
 */
function natee_gallery_items() {
	$ids   = array_filter( array_map( 'absint', (array) natee_opt( 'gallery', array() ) ) );
	$items = array();

	foreach ( $ids as $id ) {
		$full = wp_get_attachment_image_url( $id, 'full' );

		if ( ! $full ) {
			continue;
		}

		$items[] = array(
			'id'    => $id,
			'thumb' => wp_get_attachment_image_url( $id, 'medium_large' ),
			'full'  => $full,
			'alt'   => get_post_meta( $id, '_wp_attachment_image_alt', true ),
		);
	}

	if ( ! empty( $items ) ) {
		return $items;
	}

	$bundled = natee_bundled_images();

	foreach ( $bundled['gallery'] as $file ) {
		$url = natee_bundled_url( $file );

		$items[] = array(
			'id'    => 0,
			'thumb' => $url,
			'full'  => $url,
			'alt'   => '',
		);
	}

	return $items;
}
