<?php
/**
 * ผลงานหน้างาน ประกอบด้วยคลิปสั้นและรูปถ่าย
 * กดที่คลิปหรือรูปเพื่อเปิดดูขนาดเต็มและเลื่อนดูรายการอื่นได้
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$gallery = natee_gallery_items();
$videos  = natee_video_items();

if ( empty( $gallery ) && empty( $videos ) ) {
	return;
}

$total = count( $videos ) + count( $gallery );
$index = 0;
?>
<section class="natee-section natee-gallery-section" id="natee-gallery">
	<div class="natee-container">
		<header class="natee-section-head">
			<?php if ( natee_text( 'gallery_title', '' ) ) : ?>
				<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'gallery_title', '' ) ); ?></h2>
			<?php endif; ?>
			<?php if ( natee_text( 'gallery_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_text( 'gallery_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<div class="natee-media"
			data-natee-gallery
			data-label-close="<?php echo esc_attr( natee_ui( 'lightbox_close' ) ); ?>"
			data-label-prev="<?php echo esc_attr( natee_ui( 'lightbox_prev' ) ); ?>"
			data-label-next="<?php echo esc_attr( natee_ui( 'lightbox_next' ) ); ?>"
			data-label-viewer="<?php echo esc_attr( natee_ui( 'lightbox_label' ) ); ?>"
			data-label-of="<?php echo esc_attr( natee_ui( 'lightbox_of' ) ); ?>"
			data-label-hint="<?php echo esc_attr( natee_ui( 'lightbox_hint' ) ); ?>">

			<?php if ( ! empty( $videos ) ) : ?>
				<ul class="natee-video-row" role="list">
					<?php foreach ( $videos as $video ) : ?>
						<?php
						$caption = $video['caption'] ? $video['caption'] : natee_ui( 'video_default_caption' );
						?>
						<li class="natee-video-cell">
							<a class="natee-media-link natee-video-link"
								href="<?php echo esc_url( $video['src'] ); ?>"
								data-index="<?php echo absint( $index ); ?>"
								data-type="video"
								data-poster="<?php echo esc_url( $video['poster'] ); ?>"
								data-alt="<?php echo esc_attr( $caption ); ?>"
								aria-label="<?php echo esc_attr( sprintf( '%s %s', natee_ui( 'video_play' ), $caption ) ); ?>">
								<?php if ( $video['poster'] ) : ?>
									<img class="natee-video-poster"
										src="<?php echo esc_url( $video['poster'] ); ?>"
										alt="<?php echo esc_attr( $caption ); ?>"
										width="432"
										height="768"
										loading="lazy"
										decoding="async" />
								<?php endif; ?>
								<span class="natee-video-play" aria-hidden="true">
									<?php echo natee_icon( 'play', 'natee-icon' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								</span>
								<span class="natee-video-caption"><?php echo esc_html( $caption ); ?></span>
							</a>
						</li>
						<?php $index++; ?>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>

			<?php if ( ! empty( $gallery ) ) : ?>
				<ul class="natee-gallery-grid" role="list">
					<?php foreach ( $gallery as $item ) : ?>
						<?php
						$alt = $item['alt'] ? $item['alt'] : sprintf( '%s %s %d', natee_ui( 'gallery_alt' ), natee_site_name(), $index + 1 );
						?>
						<li class="natee-gallery-cell">
							<a class="natee-media-link natee-gallery-link"
								href="<?php echo esc_url( $item['full'] ); ?>"
								data-index="<?php echo absint( $index ); ?>"
								data-type="image"
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
						<?php $index++; ?>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		</div>
	</div>
</section>
