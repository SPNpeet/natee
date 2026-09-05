<?php
/**
 * แนะนำร้าน
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$title = trim( (string) natee_text( 'about_title', '' ) );
$text  = trim( (string) natee_text( 'about_text', '' ) );

if ( '' === $title && '' === $text ) {
	return;
}

$image   = absint( natee_opt( 'about_image', 0 ) );
$quote   = trim( (string) natee_text( 'about_quote', '' ) );
$bundled = natee_bundled_images();
$tag     = natee_media_tag( $image, $bundled['about'], 'large', 'natee-about-image', $title );
?>
<section class="natee-section natee-about" id="natee-about">
	<div class="natee-container natee-about-inner <?php echo $tag ? '' : 'is-single'; ?>">
		<?php if ( $tag ) : ?>
			<div class="natee-about-media">
				<?php echo $tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		<?php endif; ?>

		<div class="natee-about-text">
			<?php if ( '' !== $title ) : ?>
				<h2 class="natee-section-title"><?php echo esc_html( $title ); ?></h2>
			<?php endif; ?>

			<?php if ( '' !== $text ) : ?>
				<p class="natee-about-body"><?php echo esc_html( $text ); ?></p>
			<?php endif; ?>

			<?php if ( '' !== $quote ) : ?>
				<blockquote class="natee-about-quote">
					<?php echo esc_html( $quote ); ?>
				</blockquote>
			<?php endif; ?>
		</div>
	</div>
</section>
