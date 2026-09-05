<?php
/**
 * จุดเด่นของร้าน
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$highlights = (array) natee_opt( 'highlights', array() );

if ( empty( $highlights ) ) {
	return;
}
?>
<section class="natee-section natee-highlights" id="natee-highlights">
	<div class="natee-container">
		<ul class="natee-highlight-grid">
			<?php foreach ( $highlights as $item ) : ?>
				<li class="natee-highlight">
					<span class="natee-highlight-icon">
						<?php echo natee_icon( ! empty( $item['icon'] ) ? $item['icon'] : 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</span>
					<h3 class="natee-highlight-title"><?php echo esc_html( $item['title'] ); ?></h3>
					<p class="natee-highlight-text"><?php echo esc_html( $item['text'] ); ?></p>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
