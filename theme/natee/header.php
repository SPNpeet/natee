<?php
/**
 * ส่วนหัวของทุกหน้า
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$natee_nav = array(
	'services' => natee_ui( 'nav_services' ),
	'fleet'    => natee_ui( 'nav_fleet' ),
	'pricing'  => natee_ui( 'nav_pricing' ),
	'areas'    => natee_ui( 'nav_areas' ),
	'gallery'  => natee_ui( 'nav_gallery' ),
	'faq'      => natee_ui( 'nav_faq' ),
	'contact'  => natee_ui( 'nav_contact' ),
);

$natee_home   = natee_is_en() ? add_query_arg( 'lang', 'en', home_url( '/' ) ) : home_url( '/' );
$natee_base   = is_front_page() ? '' : $natee_home;
$natee_phones = natee_phones();
$natee_logo   = absint( natee_opt( 'logo', 0 ) );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> data-natee-lang="<?php echo esc_attr( natee_lang() ); ?>">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>

<body <?php body_class( 'natee-lang-' . natee_lang() ); ?>>
<?php wp_body_open(); ?>

<a class="natee-skip" href="#natee-main"><?php echo esc_html( natee_ui( 'skip_to_content' ) ); ?></a>

<header class="natee-header" id="natee-header">
	<div class="natee-container natee-header-inner">
		<a class="natee-brand" href="<?php echo esc_url( $natee_home ); ?>">
			<?php
			$natee_bundled  = natee_bundled_images();
			$natee_logo_tag = natee_media_tag( $natee_logo, $natee_bundled['logo'], 'medium', 'natee-brand-logo', natee_site_name(), true );
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
				<span class="natee-brand-tagline"><?php echo esc_html( natee_text( 'business_tagline', '' ) ); ?></span>
			</span>
		</a>

		<button class="natee-nav-toggle" type="button" aria-expanded="false" aria-controls="natee-nav">
			<span class="natee-nav-toggle-bar" aria-hidden="true"></span>
			<span class="natee-screen-reader"><?php echo esc_html( natee_ui( 'open_menu' ) ); ?></span>
		</button>

		<nav class="natee-nav" id="natee-nav" aria-label="<?php echo esc_attr( natee_ui( 'main_menu' ) ); ?>">
			<ul class="natee-nav-list" role="list">
				<?php foreach ( $natee_nav as $natee_anchor => $natee_label ) : ?>
					<li>
						<a href="<?php echo esc_url( $natee_base . '#natee-' . $natee_anchor ); ?>"><?php echo esc_html( $natee_label ); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
			<?php natee_language_switch( 'nav' ); ?>
		</nav>

		<?php natee_language_switch( 'header' ); ?>

		<?php if ( ! empty( $natee_phones ) ) : ?>
			<a class="natee-header-call" href="<?php echo esc_attr( natee_tel_href( $natee_phones[0] ) ); ?>">
				<?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span class="natee-header-call-text">
					<span class="natee-header-call-label"><?php echo esc_html( natee_ui( 'call_header' ) ); ?></span>
					<span class="natee-nowrap natee-header-call-number"><?php echo esc_html( $natee_phones[0] ); ?></span>
				</span>
			</a>
		<?php endif; ?>
	</div>
</header>

<main id="natee-main" class="natee-main">
