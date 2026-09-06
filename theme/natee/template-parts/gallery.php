<?php
/**
 * แกลเลอรีผลงาน กดที่รูปเพื่อเปิดดูขนาดเต็มและเลื่อนดูรูปอื่นได้
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$gallery = natee_gallery_items();

if ( empty( $gallery ) ) {
	return;
}

$total = count( $gallery );
?>
<section class="natee-section natee-gallery-section" id="natee-gallery">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'gallery_title', 'ผลงานการจัดส่ง' ) ); ?></h2>
			<?php if ( natee_text( 'gallery_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_text( 'gallery_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<ul class="natee-gallery-grid"
			role="list"
			data-natee-gallery
			data-label-close="<?php echo esc_attr( natee_ui( 'lightbox_close' ) ); ?>"
			data-label-prev="<?php echo esc_attr( natee_ui( 'lightbox_prev' ) ); ?>"
			data-label-next="<?php echo esc_attr( natee_ui( 'lightbox_next' ) ); ?>"
			data-label-viewer="<?php echo esc_attr( natee_ui( 'lightbox_label' ) ); ?>"
			data-label-of="<?php echo esc_attr( natee_ui( 'lightbox_of' ) ); ?>"
			data-label-hint="<?php echo esc_attr( natee_ui( 'lightbox_hint' ) ); ?>">
			<?php foreach ( $gallery as $index => $item ) : ?>
				<?php
				$alt = $item['alt'] ? $item['alt'] : sprintf( '%s %s %d', natee_ui( 'gallery_alt' ), natee_site_name(), $index + 1 );
				?>
				<li class="natee-gallery-cell">
					<a class="natee-gallery-link"
						href="<?php echo esc_url( $item['full'] ); ?>"
						data-index="<?php echo absint( $index ); ?>"
						data-alt="<?php echo esc_attr( $alt ); ?>"
						aria-label="<?php echo esc_attr( sprintf( '%s %d %s %d', natee_ui( 'gallery_open' ), $index + 1, natee_ui( 'lightbox_of' ), $total ) ); ?>">
						<img class="natee-gallery-image"
							src="<?php echo esc_url( $item['thumb'] ); ?>"
							<?php if ( ! empty( $item['srcset'] ) ) : ?>
								srcset="<?php echo esc_attr( $item['srcset'] ); ?>"
								sizes="<?php echo esc_attr( $item['sizes'] ); ?>"
							<?php endif; ?>
							alt="<?php echo esc_attr( $alt ); ?>"
							<?php if ( ! empty( $item['width'] ) ) : ?>
								width="<?php echo absint( $item['width'] ); ?>"
								height="<?php echo absint( $item['height'] ); ?>"
							<?php endif; ?>
							loading="lazy"
							decoding="async" />
						<span class="natee-gallery-zoom" aria-hidden="true">
							<?php echo natee_icon( 'zoom', 'natee-icon' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</span>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
