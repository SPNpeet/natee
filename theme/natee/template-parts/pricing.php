<?php
/**
 * อัตราค่าบริการ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pricing = (array) natee_opt( 'pricing', array() );

if ( empty( $pricing ) ) {
	return;
}
?>
<section class="natee-section natee-pricing" id="natee-pricing">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_opt( 'pricing_title', 'อัตราค่าบริการ' ) ); ?></h2>
			<?php if ( natee_opt( 'pricing_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_opt( 'pricing_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<ul class="natee-price-list">
			<?php foreach ( $pricing as $row ) : ?>
				<li class="natee-price-row">
					<div class="natee-price-info">
						<span class="natee-price-name"><?php echo esc_html( $row['name'] ); ?></span>
						<?php if ( ! empty( $row['detail'] ) ) : ?>
							<span class="natee-price-detail"><?php echo esc_html( $row['detail'] ); ?></span>
						<?php endif; ?>
					</div>
					<div class="natee-price-value natee-nowrap"><?php echo esc_html( $row['price'] ); ?></div>
				</li>
			<?php endforeach; ?>
		</ul>

		<?php if ( natee_opt( 'pricing_note', '' ) ) : ?>
			<p class="natee-price-note"><?php echo esc_html( natee_opt( 'pricing_note', '' ) ); ?></p>
		<?php endif; ?>

		<?php natee_contact_buttons( 'pricing' ); ?>
	</div>
</section>
