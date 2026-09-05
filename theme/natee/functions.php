<?php
/**
 * ธีม Natee สำหรับเว็บไซต์ธุรกิจรถส่งน้ำประปา
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NATEE_VERSION', '1.0.0' );

require_once get_template_directory() . '/inc/defaults.php';
require_once get_template_directory() . '/inc/helpers.php';
require_once get_template_directory() . '/inc/settings.php';
require_once get_template_directory() . '/inc/seo.php';
require_once get_template_directory() . '/inc/contact-form.php';

add_action( 'after_setup_theme', 'natee_setup' );
function natee_setup() {
	load_theme_textdomain( 'natee', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
	);

	register_nav_menus(
		array(
			'primary' => 'เมนูหลัก',
		)
	);
}

add_action( 'wp_enqueue_scripts', 'natee_assets' );
function natee_assets() {
	$dir = get_template_directory_uri();

	wp_enqueue_style( 'natee-fonts', 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap', array(), null );
	wp_enqueue_style( 'natee-main', $dir . '/assets/css/main.css', array(), NATEE_VERSION );
	wp_enqueue_script( 'natee-main', $dir . '/assets/js/main.js', array(), NATEE_VERSION, true );

	wp_add_inline_style( 'natee-main', natee_inline_brand_css() );
}

add_action( 'wp_head', 'natee_preconnect_fonts', 1 );
function natee_preconnect_fonts() {
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}

/**
 * แปลงสีหลักที่ตั้งไว้ให้เป็นตัวแปร CSS
 */
function natee_inline_brand_css() {
	$brand = natee_opt( 'brand_color', '#0f6fbf' );
	$brand = sanitize_hex_color( $brand );

	if ( ! $brand ) {
		$brand = '#0f6fbf';
	}

	list( $r, $g, $b ) = sscanf( $brand, '#%02x%02x%02x' );

	$dark  = sprintf( '#%02x%02x%02x', max( 0, (int) round( $r * 0.72 ) ), max( 0, (int) round( $g * 0.72 ) ), max( 0, (int) round( $b * 0.72 ) ) );
	$light = sprintf( 'rgba(%d, %d, %d, 0.09)', $r, $g, $b );

	return sprintf(
		':root{--natee-brand:%1$s;--natee-brand-dark:%2$s;--natee-brand-soft:%3$s;}',
		$brand,
		$dark,
		$light
	);
}

/**
 * ชื่อเว็บไซต์ที่ใช้แสดงผล
 */
function natee_site_name() {
	$name = trim( (string) natee_opt( 'business_name', '' ) );

	return '' !== $name ? $name : get_bloginfo( 'name' );
}

/**
 * ปุ่มโทรและปุ่มไลน์ที่ใช้ซ้ำหลายจุด
 */
function natee_contact_buttons( $context = 'hero' ) {
	$phones = natee_phones();
	$line   = natee_line_href();
	?>
	<div class="natee-actions natee-actions-<?php echo esc_attr( $context ); ?>">
		<?php if ( ! empty( $phones ) ) : ?>
			<a class="natee-btn natee-btn-call" href="<?php echo esc_attr( natee_tel_href( $phones[0] ) ); ?>" data-natee-call="<?php echo esc_attr( $context ); ?>">
				<?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span class="natee-btn-label">
					<span class="natee-btn-small">โทรสั่งน้ำ</span>
					<span class="natee-nowrap"><?php echo esc_html( $phones[0] ); ?></span>
				</span>
			</a>
		<?php endif; ?>

		<?php if ( $line ) : ?>
			<a class="natee-btn natee-btn-line" href="<?php echo esc_url( $line ); ?>" target="_blank" rel="noopener" data-natee-line="<?php echo esc_attr( $context ); ?>">
				<?php echo natee_icon( 'line' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span class="natee-btn-label">
					<span class="natee-btn-small">ทักไลน์</span>
					<span class="natee-nowrap"><?php echo esc_html( natee_opt( 'line_id', 'สอบถามทางไลน์' ) ); ?></span>
				</span>
			</a>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * แถบปุ่มติดต่อค้างด้านล่างจอมือถือ
 */
add_action( 'wp_footer', 'natee_sticky_bar' );
function natee_sticky_bar() {
	if ( ! natee_opt( 'show_sticky_bar', 0 ) ) {
		return;
	}

	$phones = natee_phones();
	$line   = natee_line_href();

	if ( empty( $phones ) && ! $line ) {
		return;
	}
	?>
	<div class="natee-sticky" role="complementary" aria-label="ช่องทางติดต่อด่วน">
		<?php if ( ! empty( $phones ) ) : ?>
			<a class="natee-sticky-item natee-sticky-call" href="<?php echo esc_attr( natee_tel_href( $phones[0] ) ); ?>">
				<?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span>โทรสั่งน้ำ</span>
			</a>
		<?php endif; ?>

		<?php if ( $line ) : ?>
			<a class="natee-sticky-item natee-sticky-line" href="<?php echo esc_url( $line ); ?>" target="_blank" rel="noopener">
				<?php echo natee_icon( 'line' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span>ทักไลน์</span>
			</a>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * ตัดความสามารถที่ไม่ได้ใช้ออกเพื่อให้หน้าเว็บเบาและโหลดไว
 */
add_action( 'init', 'natee_trim_head' );
function natee_trim_head() {
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'rsd_link' );
	remove_action( 'wp_head', 'wp_shortlink_wp_head' );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
}

add_filter( 'emoji_svg_url', '__return_false' );

/**
 * ตัดสไตล์บล็อกที่ธีมนี้ไม่ได้ใช้ออก
 */
add_action( 'wp_enqueue_scripts', 'natee_dequeue_block_styles', 100 );
function natee_dequeue_block_styles() {
	if ( is_singular() && has_blocks() ) {
		return;
	}

	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'classic-theme-styles' );
}
