<?php
/**
 * แถบชวนโทรก่อนถึงส่วนติดต่อ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$title = natee_opt( 'cta_title', '' );

if ( ! $title ) {
	return;
}
?>
<section class="natee-cta" id="natee-cta">
	<div class="natee-container natee-cta-inner">
		<div class="natee-cta-text">
			<h2 class="natee-cta-title"><?php echo esc_html( $title ); ?></h2>
			<?php if ( natee_opt( 'cta_subtitle', '' ) ) : ?>
				<p class="natee-cta-subtitle"><?php echo esc_html( natee_opt( 'cta_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</div>
		<?php natee_contact_buttons( 'cta' ); ?>
	</div>
</section>
