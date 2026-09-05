<?php
/**
 * ประเภทรถที่ให้บริการ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$fleet = (array) natee_opt( 'fleet', array() );

if ( empty( $fleet ) ) {
	return;
}
?>
<section class="natee-section natee-fleet" id="natee-fleet">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_opt( 'fleet_title', 'ประเภทรถให้บริการ' ) ); ?></h2>
			<?php if ( natee_opt( 'fleet_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_opt( 'fleet_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<div class="natee-fleet-grid">
			<?php
			$bundled = natee_bundled_images();

			foreach ( $fleet as $index => $truck ) :
				$fallback = isset( $bundled['fleet'][ $index ] ) ? $bundled['fleet'][ $index ] : '';
				$tag      = natee_media_tag( $truck['image'], $fallback, 'large', 'natee-fleet-image', $truck['name'] );
				?>
				<article class="natee-fleet-item">
					<div class="natee-fleet-media <?php echo $tag ? '' : 'is-empty'; ?>">
						<?php if ( $tag ) : ?>
							<?php echo $tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<?php else : ?>
							<?php echo natee_icon( 'truck', 'natee-icon natee-icon-xl' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<?php endif; ?>
					</div>
					<div class="natee-fleet-body">
						<h3 class="natee-fleet-name"><?php echo esc_html( $truck['name'] ); ?></h3>
						<?php if ( ! empty( $truck['capacity'] ) ) : ?>
							<p class="natee-fleet-capacity"><?php echo esc_html( $truck['capacity'] ); ?></p>
						<?php endif; ?>
						<p class="natee-fleet-text"><?php echo esc_html( $truck['text'] ); ?></p>
					</div>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
