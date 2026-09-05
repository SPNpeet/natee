<?php
/**
 * ส่วนหัวของทุกหน้า
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$natee_nav = array(
	'services' => 'บริการ',
	'fleet'    => 'ประเภทรถ',
	'pricing'  => 'ราคา',
	'areas'    => 'พื้นที่ให้บริการ',
	'gallery'  => 'ผลงาน',
	'faq'      => 'คำถามที่พบบ่อย',
	'contact'  => 'ติดต่อเรา',
);

$natee_base   = is_front_page() ? '' : home_url( '/' );
$natee_phones = natee_phones();
$natee_logo   = absint( natee_opt( 'logo', 0 ) );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="natee-skip" href="#natee-main">ข้ามไปยังเนื้อหาหลัก</a>

<header class="natee-header" id="natee-header">
	<div class="natee-container natee-header-inner">
		<a class="natee-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<?php
			$natee_bundled  = natee_bundled_images();
			$natee_logo_tag = natee_media_tag( $natee_logo, $natee_bundled['logo'], 'medium', 'natee-brand-logo', natee_site_name() );
			?>
			<?php if ( $natee_logo_tag ) : ?>
				<?php echo $natee_logo_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php else : ?>
				<span class="natee-brand-mark" aria-hidden="true">
					<?php echo natee_icon( 'drop', 'natee-icon natee-brand-icon' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</span>
			<?php endif; ?>
			<span class="natee-brand-text">
				<span class="natee-brand-name"><?php echo esc_html( natee_site_name() ); ?></span>
				<span class="natee-brand-tagline"><?php echo esc_html( natee_opt( 'business_tagline', '' ) ); ?></span>
			</span>
		</a>

		<button class="natee-nav-toggle" type="button" aria-expanded="false" aria-controls="natee-nav">
			<span class="natee-nav-toggle-bar" aria-hidden="true"></span>
			<span class="natee-screen-reader">เปิดเมนู</span>
		</button>

		<nav class="natee-nav" id="natee-nav" aria-label="เมนูหลัก">
			<ul class="natee-nav-list">
				<?php foreach ( $natee_nav as $natee_anchor => $natee_label ) : ?>
					<li>
						<a href="<?php echo esc_url( $natee_base . '#natee-' . $natee_anchor ); ?>"><?php echo esc_html( $natee_label ); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
		</nav>

		<?php if ( ! empty( $natee_phones ) ) : ?>
			<a class="natee-header-call" href="<?php echo esc_attr( natee_tel_href( $natee_phones[0] ) ); ?>">
				<?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span class="natee-header-call-text">
					<span class="natee-header-call-label">โทรสั่งน้ำ 24 ชม.</span>
					<span class="natee-nowrap natee-header-call-number"><?php echo esc_html( $natee_phones[0] ); ?></span>
				</span>
			</a>
		<?php endif; ?>
	</div>
</header>

<main id="natee-main" class="natee-main">
