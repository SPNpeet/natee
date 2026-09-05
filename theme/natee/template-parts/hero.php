<?php
/**
 * ส่วนหัวหน้าแรก
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hero_image = absint( natee_opt( 'hero_image', 0 ) );
$phones     = natee_phones();
?>
<section class="natee-hero" id="natee-hero">
	<div class="natee-container natee-hero-inner">
		<div class="natee-hero-text">
			<?php if ( natee_text( 'hero_eyebrow', '' ) ) : ?>
				<p class="natee-eyebrow"><?php echo esc_html( natee_text( 'hero_eyebrow', '' ) ); ?></p>
			<?php endif; ?>

			<h1 class="natee-hero-title"><?php echo esc_html( natee_text( 'hero_title', '' ) ); ?></h1>

			<?php if ( natee_text( 'hero_subtitle', '' ) ) : ?>
				<p class="natee-hero-subtitle"><?php echo esc_html( natee_text( 'hero_subtitle', '' ) ); ?></p>
			<?php endif; ?>

			<?php natee_contact_buttons( 'hero' ); ?>

			<?php if ( count( $phones ) > 1 ) : ?>
				<p class="natee-hero-second-phone">
					<?php echo esc_html( natee_ui( 'or_call' ) ); ?>
					<a class="natee-nowrap" href="<?php echo esc_attr( natee_tel_href( $phones[1] ) ); ?>"><?php echo esc_html( $phones[1] ); ?></a>
				</p>
			<?php endif; ?>

			<?php if ( natee_text( 'hero_note', '' ) ) : ?>
				<p class="natee-hero-note">
					<?php echo natee_icon( 'check', 'natee-icon natee-icon-inline' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span><?php echo esc_html( natee_text( 'hero_note', '' ) ); ?></span>
				</p>
			<?php endif; ?>
		</div>

		<?php
		$hero_bundled = natee_bundled_images();
		$hero_tag     = natee_media_tag( $hero_image, $hero_bundled['hero'], 'large', 'natee-hero-image', natee_text( 'hero_title', '' ), true );
		?>
		<div class="natee-hero-media <?php echo $hero_tag ? '' : 'is-empty'; ?>">
			<?php if ( $hero_tag ) : ?>
				<?php echo $hero_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php else : ?>
				<div class="natee-hero-placeholder" aria-hidden="true">
					<?php echo natee_icon( 'truck', 'natee-icon natee-icon-xl' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>
