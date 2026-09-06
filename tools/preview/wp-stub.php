<?php
/**
 * ตัวจำลองฟังก์ชัน WordPress เท่าที่ธีมนี้เรียกใช้
 * ใช้สำหรับดูหน้าเว็บและหน้าตั้งค่าระหว่างพัฒนา โดยไม่ต้องติดตั้ง WordPress
 * ไม่ได้ใช้งานบนเซิร์ฟเวอร์จริง และไม่ถูกรวมไปกับไฟล์ธีมที่ส่งมอบ
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'PHP_PREVIEW', true );

$GLOBALS['natee_preview'] = array(
	'hooks'  => array(),
	'images' => isset( $_GET['images'] ) && '1' === $_GET['images'],
	'front'  => true,
);

/* ระบบ hook อย่างย่อ */
function add_action( $tag, $callback, $priority = 10, $args = 1 ) {
	$GLOBALS['natee_preview']['hooks'][ $tag ][ $priority ][] = $callback;
}

function add_filter( $tag, $callback, $priority = 10, $args = 1 ) {
	add_action( $tag, $callback, $priority, $args );
}

function remove_action( $tag, $callback, $priority = 10 ) {
	unset( $GLOBALS['natee_preview']['hooks'][ $tag ][ $priority ] );
}

function do_action( $tag ) {
	if ( empty( $GLOBALS['natee_preview']['hooks'][ $tag ] ) ) {
		return;
	}

	$by_priority = $GLOBALS['natee_preview']['hooks'][ $tag ];
	ksort( $by_priority );

	foreach ( $by_priority as $callbacks ) {
		foreach ( $callbacks as $callback ) {
			call_user_func( $callback );
		}
	}
}

function apply_filters( $tag, $value ) {
	if ( empty( $GLOBALS['natee_preview']['hooks'][ $tag ] ) ) {
		return $value;
	}

	$by_priority = $GLOBALS['natee_preview']['hooks'][ $tag ];
	ksort( $by_priority );

	foreach ( $by_priority as $callbacks ) {
		foreach ( $callbacks as $callback ) {
			$value = call_user_func( $callback, $value );
		}
	}

	return $value;
}

function __return_false() {
	return false;
}

/* เส้นทางไฟล์ */
function get_template_directory() {
	return dirname( __DIR__, 2 ) . '/theme/natee';
}

function get_template_directory_uri() {
	return '/theme-assets';
}

function home_url( $path = '/' ) {
	return 'http://localhost:8123' . ( '/' === $path ? '/' : $path );
}

function admin_url( $path = '' ) {
	return '/preview-post';
}

function get_permalink() {
	return home_url( '/' );
}

function get_bloginfo( $key = 'name' ) {
	return 'name' === $key ? 'ธารนที' : 'UTF-8';
}

function bloginfo( $key = 'name' ) {
	echo esc_html( get_bloginfo( $key ) );
}

function get_option( $key, $default = false ) {
	if ( 'natee_options' === $key ) {
		return array();
	}

	if ( 'admin_email' === $key ) {
		return 'owner@example.com';
	}

	return $default;
}

function get_transient( $key ) {
	return false;
}

function set_transient( $key, $value, $ttl ) {
	return true;
}

/* ฟังก์ชันทำความสะอาดและ escape */
function esc_html( $text ) {
	return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
}

function esc_attr( $text ) {
	return esc_html( $text );
}

function esc_textarea( $text ) {
	return esc_html( $text );
}

function esc_url( $url ) {
	return htmlspecialchars( (string) $url, ENT_QUOTES, 'UTF-8' );
}

function esc_url_raw( $url ) {
	$url = trim( (string) $url );

	if ( '' === $url ) {
		return '';
	}

	// อนุญาตเฉพาะโพรโทคอลที่ WordPress ยอมรับ เพื่อให้ตัวจำลองกรองเหมือนของจริง
	$allowed = array( 'http://', 'https://', 'mailto:', 'tel:' );

	foreach ( $allowed as $prefix ) {
		if ( 0 === stripos( $url, $prefix ) ) {
			return $url;
		}
	}

	if ( 0 === strpos( $url, '/' ) || 0 === strpos( $url, '#' ) ) {
		return $url;
	}

	return '';
}

function sanitize_text_field( $text ) {
	return trim( strip_tags( (string) $text ) );
}

function sanitize_textarea_field( $text ) {
	return trim( strip_tags( (string) $text ) );
}

function sanitize_email( $text ) {
	$text = filter_var( (string) $text, FILTER_SANITIZE_EMAIL );

	return filter_var( $text, FILTER_VALIDATE_EMAIL ) ? $text : '';
}

function sanitize_key( $text ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $text ) );
}

function sanitize_hex_color( $color ) {
	return preg_match( '/^#[0-9a-fA-F]{6}$/', (string) $color ) ? $color : null;
}

function is_email( $text ) {
	return (bool) filter_var( (string) $text, FILTER_VALIDATE_EMAIL );
}

function wp_unslash( $value ) {
	return $value;
}

function wp_strip_all_tags( $text ) {
	return strip_tags( (string) $text );
}

function wp_trim_words( $text, $words = 55, $more = '' ) {
	$parts = preg_split( '/\s+/u', trim( (string) $text ) );

	if ( count( $parts ) <= $words ) {
		return (string) $text;
	}

	return implode( ' ', array_slice( $parts, 0, $words ) ) . $more;
}

function wp_json_encode( $data, $flags = 0 ) {
	return json_encode( $data, $flags );
}

function wp_date( $format ) {
	return date( $format );
}

function wp_parse_url( $url, $component = -1 ) {
	return parse_url( $url, $component );
}

function absint( $value ) {
	return abs( (int) $value );
}

function checked( $a, $b, $echo = true ) {
	$out = (string) $a === (string) $b ? ' checked' : '';

	if ( $echo ) {
		echo $out;
	}

	return $out;
}

function selected( $a, $b, $echo = true ) {
	$out = (string) $a === (string) $b ? ' selected' : '';

	if ( $echo ) {
		echo $out;
	}

	return $out;
}

/* รูปภาพ */
function natee_preview_image_url( $id, $size = 'large' ) {
	if ( ! absint( $id ) || ! $GLOBALS['natee_preview']['images'] ) {
		return '';
	}

	$sizes = array(
		'thumbnail'    => array( 300, 300 ),
		'medium'       => array( 480, 360 ),
		'medium_large' => array( 768, 480 ),
		'large'        => array( 1024, 768 ),
		'full'         => array( 1200, 800 ),
	);

	$dim = isset( $sizes[ $size ] ) ? $sizes[ $size ] : $sizes['large'];

	return sprintf( '/placeholder.svg?w=%d&h=%d&n=%d', $dim[0], $dim[1], absint( $id ) );
}

function wp_get_attachment_image_url( $id, $size = 'large' ) {
	return natee_preview_image_url( $id, $size );
}

function wp_get_attachment_image( $id, $size = 'large', $icon = false, $attr = array() ) {
	$url = natee_preview_image_url( $id, $size );

	if ( ! $url ) {
		return '';
	}

	return sprintf(
		'<img src="%s" class="%s" alt="%s" loading="lazy" />',
		esc_url( $url ),
		esc_attr( isset( $attr['class'] ) ? $attr['class'] : '' ),
		esc_attr( isset( $attr['alt'] ) ? $attr['alt'] : '' )
	);
}

function get_post_meta( $id, $key, $single = true ) {
	return '';
}

/* วิดีโอ */
function wp_get_attachment_url( $id ) {
	return '';
}

function get_post_thumbnail_id( $id ) {
	return 0;
}

function get_post( $id ) {
	return null;
}

function get_the_title( $id = 0 ) {
	return '';
}

function get_post_mime_type( $id ) {
	return 'video/mp4';
}

/* หน้าเว็บ */
function language_attributes() {
	echo apply_filters( 'language_attributes', 'lang="th"' );
}

function body_class( $class = '' ) {
	echo 'class="home natee-preview ' . esc_attr( $class ) . '"';
}

function wp_body_open() {
	do_action( 'wp_body_open' );
}

function wp_head() {
	printf( "<title>%s</title>
", esc_html( wp_get_document_title() ) );
	do_action( 'wp_head' );
	echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap">' . "\n";
	printf(
		'<link rel="stylesheet" href="%s?v=%s">' . "\n",
		'/theme-assets/assets/css/main.css',
		filemtime( get_template_directory() . '/assets/css/main.css' )
	);
	echo '<style>' . natee_inline_brand_css() . '</style>' . "\n";
	printf(
		'<script defer src="%s?v=%s"></script>' . "\n",
		'/theme-assets/assets/js/main.js',
		filemtime( get_template_directory() . '/assets/js/main.js' )
	);
}

function wp_footer() {
	do_action( 'wp_footer' );
}

function wp_nonce_field( $action, $name ) {
	printf( '<input type="hidden" name="%s" value="preview" />', esc_attr( $name ) );
}

function is_front_page() {
	return (bool) $GLOBALS['natee_preview']['front'];
}

function is_singular() {
	return false;
}

function is_search() {
	return false;
}

function is_archive() {
	return false;
}

function is_category() {
	return false;
}

function is_tag() {
	return false;
}

function is_tax() {
	return false;
}

function has_blocks() {
	return false;
}

function has_post_thumbnail() {
	return false;
}

function has_excerpt() {
	return false;
}

function get_the_excerpt() {
	return '';
}

function wp_get_document_title() {
	// ให้ผ่านตัวกรองเดียวกับที่ธีมใช้บน WordPress จริง
	$parts = apply_filters(
		'document_title_parts',
		array(
			'title'   => get_bloginfo( 'name' ),
			'tagline' => natee_opt( 'business_tagline', '' ),
			'site'    => get_bloginfo( 'name' ),
		)
	);

	$parts = array_filter( (array) $parts );

	return implode( ' - ', $parts );
}

function add_query_arg( $key, $value = null, $url = '' ) {
	if ( is_array( $key ) ) {
		$args = $key;
		$url  = null === $value ? '' : $value;
	} else {
		$args = array( $key => $value );
	}

	if ( '' === $url ) {
		$url = home_url( '/' );
	}

	$parts = explode( '#', $url, 2 );
	$hash  = isset( $parts[1] ) ? '#' . $parts[1] : '';
	$url   = $parts[0];
	$query = '';

	if ( false !== strpos( $url, '?' ) ) {
		list( $url, $query ) = explode( '?', $url, 2 );
	}

	parse_str( $query, $current );

	foreach ( $args as $k => $v ) {
		$current[ $k ] = $v;
	}

	$query = http_build_query( $current );

	return $url . ( $query ? '?' . $query : '' ) . $hash;
}

function remove_query_arg( $key, $url = '' ) {
	if ( '' === $url ) {
		$url = home_url( '/' );
	}

	$query = '';

	if ( false !== strpos( $url, '?' ) ) {
		list( $url, $query ) = explode( '?', $url, 2 );
	}

	parse_str( $query, $current );
	unset( $current[ $key ] );
	$query = http_build_query( $current );

	return $url . ( $query ? '?' . $query : '' );
}

function has_site_icon() {
	return false;
}

function wp_get_attachment_image_src( $id, $size = 'large' ) {
	$url = natee_preview_image_url( $id, $size );

	return $url ? array( $url, 800, 600 ) : false;
}

function get_role( $name ) {
	return null;
}

function add_role( $name, $label, $caps ) {}

function wp_get_current_user() {
	return null;
}

function user_can() {
	return true;
}

function get_users( $args = array() ) {
	return array();
}

function wp_doing_ajax() {
	return false;
}

function remove_menu_page() {}

function wp_safe_redirect() {}

function is_wp_error( $thing ) {
	return false;
}

function wp_enqueue_style() {}
function wp_enqueue_script() {}
function wp_add_inline_style() {}
function wp_dequeue_style() {}
function wp_localize_script() {}
function wp_enqueue_media() {}
function load_theme_textdomain() {}
function add_theme_support() {}
function register_nav_menus() {}
function add_menu_page() {}
function register_setting() {}
function settings_fields() {}
function current_user_can() {
	return true;
}

function submit_button( $label ) {
	printf( '<p class="submit"><button type="button" class="button button-primary">%s</button></p>', esc_html( $label ) );
}

function get_header() {
	require get_template_directory() . '/header.php';
}

function get_footer() {
	require get_template_directory() . '/footer.php';
}

function get_template_part( $slug ) {
	require get_template_directory() . '/' . $slug . '.php';
}

function wp_get_theme() {
	return new class() {
		public function get( $key ) {
			return '1.0.0';
		}
	};
}
