<?php
/**
 * คำถามที่พบบ่อย
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$faq = (array) natee_opt( 'faq', array() );

if ( empty( $faq ) ) {
	return;
}
?>
<section class="natee-section natee-faq" id="natee-faq">
	<div class="natee-container natee-narrow">
		<header class="natee-section-head">
			<?php if ( natee_text( 'faq_title', '' ) ) : ?>
				<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'faq_title', '' ) ); ?></h2>
			<?php endif; ?>
		</header>

		<div class="natee-faq-list">
			<?php foreach ( $faq as $item ) : ?>
				<?php
				if ( '' === natee_row_text( $item, 'q' ) ) {
					continue;
				}
				?>
				<details class="natee-faq-item">
					<summary class="natee-faq-question">
						<span><?php echo esc_html( natee_row_text( $item, 'q' ) ); ?></span>
						<?php echo natee_icon( 'chevron', 'natee-icon natee-faq-chevron' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</summary>
					<div class="natee-faq-answer">
						<p><?php echo esc_html( natee_row_text( $item, 'a' ) ); ?></p>
					</div>
				</details>
			<?php endforeach; ?>
		</div>
	</div>
</section>
