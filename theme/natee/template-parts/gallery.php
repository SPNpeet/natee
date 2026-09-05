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
			<h2 class="natee-section-title"><?php echo esc_html( natee_opt( 'gallery_title', 'ผลงานการจัดส่ง' ) ); ?></h2>
			<?php if ( natee_opt( 'gallery_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_opt( 'gallery_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<ul class="natee-gallery-grid">
			<?php foreach ( $gallery as $item ) : ?>
				<?php
				$alt = $item['alt'] ? $item['alt'] : sprintf( 'ผลงานจัดส่งน้ำประปา %s', natee_site_name() );
				?>
				<li class="natee-gallery-cell">
					<a href="<?php echo esc_url( $item['full'] ); ?>" target="_blank" rel="noopener">
						<img class="natee-gallery-image"
							src="<?php echo esc_url( $item['thumb'] ); ?>"
							alt="<?php echo esc_attr( $alt ); ?>"
							loading="lazy"
							decoding="async" />
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
