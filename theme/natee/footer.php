<?php
/**
 * ส่วนท้ายของทุกหน้า
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$natee_phones   = natee_phones();
$natee_line     = natee_line_href();
$natee_facebook = trim( (string) natee_opt( 'facebook_url', '' ) );
$natee_email    = trim( (string) natee_opt( 'email', '' ) );
$natee_areas    = array_slice( natee_areas_list(), 0, 8 );
?>
</main>

<footer class="natee-footer">
	<div class="natee-container natee-footer-grid">
		<div class="natee-footer-col">
			<?php
			$natee_bundled  = natee_bundled_images();
			$natee_logo_tag = natee_media_tag( absint( natee_opt( 'logo', 0 ) ), $natee_bundled['logo'], 'medium', 'natee-footer-logo', natee_site_name() );
			?>
			<?php if ( $natee_logo_tag ) : ?>
				<?php echo $natee_logo_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php endif; ?>
			<p class="natee-footer-name"><?php echo esc_html( natee_site_name() ); ?></p>
			<p class="natee-footer-text"><?php echo esc_html( natee_text( 'business_tagline', '' ) ); ?></p>
			<?php if ( natee_text( 'address', '' ) ) : ?>
				<p class="natee-footer-text"><?php echo esc_html( natee_text( 'address', '' ) ); ?></p>
			<?php endif; ?>
			<?php if ( natee_text( 'open_hours', '' ) ) : ?>
				<p class="natee-footer-text"><?php echo esc_html( natee_text( 'open_hours', '' ) ); ?></p>
			<?php endif; ?>
		</div>

		<div class="natee-footer-col">
			<p class="natee-footer-heading"><?php echo esc_html( natee_ui( 'footer_contact' ) ); ?></p>
			<ul class="natee-footer-list" role="list">
				<?php foreach ( $natee_phones as $natee_phone ) : ?>
					<li>
						<a href="<?php echo esc_attr( natee_tel_href( $natee_phone ) ); ?>">
							<?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<span class="natee-nowrap"><?php echo esc_html( $natee_phone ); ?></span>
						</a>
					</li>
				<?php endforeach; ?>

				<?php if ( $natee_line ) : ?>
					<li>
						<a href="<?php echo esc_url( $natee_line ); ?>" target="_blank" rel="noopener">
							<?php echo natee_icon( 'line' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<span><?php echo esc_html( natee_opt( 'line_id', natee_ui( 'line_label' ) ) ); ?></span>
						</a>
					</li>
				<?php endif; ?>

				<?php if ( $natee_facebook ) : ?>
					<li>
						<a href="<?php echo esc_url( $natee_facebook ); ?>" target="_blank" rel="noopener">
							<?php echo natee_icon( 'facebook' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<span><?php echo esc_html( natee_ui( 'label_facebook' ) ); ?></span>
						</a>
					</li>
				<?php endif; ?>

				<?php if ( $natee_email ) : ?>
					<li>
						<a href="mailto:<?php echo esc_attr( $natee_email ); ?>">
							<?php echo natee_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<span><?php echo esc_html( $natee_email ); ?></span>
						</a>
					</li>
				<?php endif; ?>
			</ul>
		</div>

		<?php if ( ! empty( $natee_areas ) ) : ?>
			<div class="natee-footer-col">
				<p class="natee-footer-heading"><?php echo esc_html( natee_ui( 'footer_areas' ) ); ?></p>
				<ul class="natee-footer-areas" role="list">
					<?php foreach ( $natee_areas as $natee_area ) : ?>
						<li><?php echo esc_html( $natee_area ); ?></li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif; ?>
	</div>

	<div class="natee-container natee-footer-bottom">
		<p>
			<?php
			printf(
				'%s %s %s',
				esc_html( natee_site_name() ),
				esc_html( wp_date( 'Y' ) ),
				esc_html( natee_ui( 'footer_rights' ) )
			);
			?>
		</p>
		<?php if ( natee_text( 'footer_note', '' ) ) : ?>
			<p><?php echo esc_html( natee_text( 'footer_note', '' ) ); ?></p>
		<?php endif; ?>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
