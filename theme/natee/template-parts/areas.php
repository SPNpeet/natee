<?php
/**
 * พื้นที่ให้บริการ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$areas = natee_areas_list();

if ( empty( $areas ) ) {
	return;
}
?>
<section class="natee-section natee-areas" id="natee-areas">
	<div class="natee-container">
		<header class="natee-section-head">
			<?php if ( natee_text( 'areas_title', '' ) ) : ?>
				<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'areas_title', '' ) ); ?></h2>
			<?php endif; ?>
			<?php if ( natee_text( 'areas_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_text( 'areas_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<ul class="natee-area-list" role="list">
			<?php foreach ( $areas as $area ) : ?>
				<li class="natee-area">
					<?php echo natee_icon( 'pin', 'natee-icon natee-icon-inline' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span><?php echo esc_html( $area ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
