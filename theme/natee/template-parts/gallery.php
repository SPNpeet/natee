<?php
/**
 * แกลเลอรีผลงาน
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$gallery = natee_gallery_items();

if ( empty( $gallery ) ) {
	return;
}
?>
<section class="natee-section natee-gallery-section" id="natee-gallery">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'gallery_title', 'ผลงานการจัดส่ง' ) ); ?></h2>
			<?php if ( natee_text( 'gallery_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_text( 'gallery_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<ul class="natee-gallery-grid" role="list">
			<?php foreach ( $gallery as $index => $item ) : ?>
				<?php
				$alt = $item['alt'] ? $item['alt'] : sprintf( '%s %s %d', natee_ui( 'gallery_alt' ), natee_site_name(), $index + 1 );
				?>
				<li class="natee-gallery-cell">
					<a href="<?php echo esc_url( $item['full'] ); ?>"
						target="_blank"
						rel="noopener"
						aria-label="<?php echo esc_attr( sprintf( '%s (%d)', natee_ui( 'gallery_open' ), $index + 1 ) ); ?>">
						<img class="natee-gallery-image"
							src="<?php echo esc_url( $item['thumb'] ); ?>"
							alt="<?php echo esc_attr( $alt ); ?>"
							<?php if ( ! empty( $item['width'] ) ) : ?>
								width="<?php echo absint( $item['width'] ); ?>"
								height="<?php echo absint( $item['height'] ); ?>"
							<?php endif; ?>
							loading="lazy"
							decoding="async" />
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
