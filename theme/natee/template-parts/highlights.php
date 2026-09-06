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
<section class="natee-section natee-highlights" id="natee-highlights" aria-labelledby="natee-highlights-title">
	<div class="natee-container">
		<h2 class="natee-screen-reader" id="natee-highlights-title"><?php echo esc_html( natee_ui( 'highlights_title' ) ); ?></h2>
		<ul class="natee-highlight-grid" role="list">
			<?php foreach ( $highlights as $item ) : ?>
				<li class="natee-highlight">
					<span class="natee-highlight-icon">
						<?php echo natee_icon( ! empty( $item['icon'] ) ? $item['icon'] : 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</span>
					<h3 class="natee-highlight-title"><?php echo esc_html( natee_row_text( $item, 'title' ) ); ?></h3>
					<p class="natee-highlight-text"><?php echo esc_html( natee_row_text( $item, 'text' ) ); ?></p>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
