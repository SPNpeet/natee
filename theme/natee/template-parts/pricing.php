<?php
/**
 * อัตราค่าบริการ แต่ละรายการกดเปิดดูรายละเอียดและช่องทางสอบถามได้
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pricing = (array) natee_opt( 'pricing', array() );

if ( empty( $pricing ) ) {
	return;
}

$phones = natee_phones();
$line   = natee_line_href();
?>
<section class="natee-section natee-pricing" id="natee-pricing">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'pricing_title', 'อัตราค่าบริการ' ) ); ?></h2>
			<?php if ( natee_text( 'pricing_subtitle', '' ) ) : ?>
				<p class="natee-section-subtitle"><?php echo esc_html( natee_text( 'pricing_subtitle', '' ) ); ?></p>
			<?php endif; ?>
		</header>

		<div class="natee-price-list">
			<?php foreach ( $pricing as $index => $row ) : ?>
				<?php
				$name     = natee_row_text( $row, 'name' );
				$detail   = natee_row_text( $row, 'detail' );
				$price    = natee_row_text( $row, 'price' );
				$includes = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) natee_row_text( $row, 'includes' ) ) ) );
				?>
				<details class="natee-price-card" <?php echo 0 === $index ? 'open' : ''; ?>>
					<summary class="natee-price-summary">
						<span class="natee-price-info">
							<span class="natee-price-name"><?php echo esc_html( $name ); ?></span>
							<?php if ( $detail ) : ?>
								<span class="natee-price-detail"><?php echo esc_html( $detail ); ?></span>
							<?php endif; ?>
						</span>
						<span class="natee-price-side">
							<span class="natee-price-value"><?php echo esc_html( $price ); ?></span>
							<?php echo natee_icon( 'chevron', 'natee-icon natee-price-chevron' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</span>
					</summary>

					<div class="natee-price-body">
						<?php if ( ! empty( $includes ) ) : ?>
							<ul class="natee-price-includes" role="list">
								<?php foreach ( $includes as $item ) : ?>
									<li>
										<?php echo natee_icon( 'check', 'natee-icon natee-icon-inline' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
										<span><?php echo esc_html( $item ); ?></span>
									</li>
								<?php endforeach; ?>
							</ul>
						<?php endif; ?>

						<div class="natee-price-actions">
							<?php if ( ! empty( $phones ) ) : ?>
								<a class="natee-btn natee-btn-call natee-btn-sm" href="<?php echo esc_attr( natee_tel_href( $phones[0] ) ); ?>">
									<?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									<span><?php echo esc_html( natee_ui( 'price_call_now' ) ); ?></span>
								</a>
							<?php endif; ?>

							<?php if ( $line ) : ?>
								<a class="natee-btn natee-btn-line natee-btn-sm" href="<?php echo esc_url( $line ); ?>" target="_blank" rel="noopener">
									<?php echo natee_icon( 'line' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									<span><?php echo esc_html( natee_ui( 'line_label' ) ); ?></span>
								</a>
							<?php endif; ?>
						</div>
					</div>
				</details>
			<?php endforeach; ?>
		</div>

		<?php if ( natee_text( 'pricing_note', '' ) ) : ?>
			<p class="natee-price-note"><?php echo esc_html( natee_text( 'pricing_note', '' ) ); ?></p>
		<?php endif; ?>
	</div>
</section>
