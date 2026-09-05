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
			<h2 class="natee-section-title"><?php echo esc_html( natee_opt( 'faq_title', 'คำถามที่พบบ่อย' ) ); ?></h2>
		</header>

		<div class="natee-faq-list">
			<?php foreach ( $faq as $item ) : ?>
				<?php
				if ( empty( $item['q'] ) ) {
					continue;
				}
				?>
				<details class="natee-faq-item">
					<summary class="natee-faq-question">
						<span><?php echo esc_html( $item['q'] ); ?></span>
						<?php echo natee_icon( 'chevron', 'natee-icon natee-faq-chevron' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</summary>
					<div class="natee-faq-answer">
						<p><?php echo esc_html( $item['a'] ); ?></p>
					</div>
				</details>
			<?php endforeach; ?>
		</div>
	</div>
</section>
