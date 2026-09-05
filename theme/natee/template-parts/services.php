<?php
/**
 * บริการทั้งหมด
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$services = (array) natee_opt( 'services', array() );

if ( empty( $services ) ) {
	return;
}
?>
<section class="natee-section natee-services" id="natee-services">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'services_title', 'บริการของเรา' ) ); ?></h2>
			<?php if ( natee_text( 'services_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_text( 'services_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<ul class="natee-card-grid" role="list">
			<?php foreach ( $services as $service ) : ?>
				<li class="natee-card">
					<?php if ( natee_has_image( $service['image'] ) ) : ?>
						<div class="natee-card-media">
							<?php echo natee_image( $service['image'], 'medium_large', 'natee-card-image', natee_row_text( $service, 'title' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</div>
					<?php else : ?>
						<div class="natee-card-icon">
							<?php echo natee_icon( ! empty( $service['icon'] ) ? $service['icon'] : 'drop', 'natee-icon natee-icon-lg' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</div>
					<?php endif; ?>
					<div class="natee-card-body">
						<h3 class="natee-card-title"><?php echo esc_html( natee_row_text( $service, 'title' ) ); ?></h3>
						<p class="natee-card-text"><?php echo esc_html( natee_row_text( $service, 'text' ) ); ?></p>
					</div>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
