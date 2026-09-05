<?php
/**
 * ส่วนติดต่อและฟอร์มสั่งน้ำ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$phones = natee_phones();
$line   = natee_line_href();
$map    = trim( (string) natee_opt( 'map_embed', '' ) );
?>
<section class="natee-section natee-contact" id="natee-contact">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_ui( 'contact_title' ) ); ?></h2>
			<p class="natee-section-subtitle"><?php echo esc_html( natee_ui( 'contact_subtitle' ) ); ?></p>
		</header>

		<div class="natee-contact-grid">
			<div class="natee-contact-info">
				<ul class="natee-contact-list" role="list">
					<?php foreach ( $phones as $phone ) : ?>
						<li>
							<a class="natee-contact-item" href="<?php echo esc_attr( natee_tel_href( $phone ) ); ?>">
								<span class="natee-contact-icon"><?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label"><?php echo esc_html( natee_ui( 'label_phone' ) ); ?></span>
									<span class="natee-contact-value natee-nowrap"><?php echo esc_html( $phone ); ?></span>
								</span>
							</a>
						</li>
					<?php endforeach; ?>

					<?php if ( $line ) : ?>
						<li>
							<a class="natee-contact-item" href="<?php echo esc_url( $line ); ?>" target="_blank" rel="noopener">
								<span class="natee-contact-icon"><?php echo natee_icon( 'line' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label"><?php echo esc_html( natee_ui( 'label_line' ) ); ?></span>
									<span class="natee-contact-value"><?php echo esc_html( natee_opt( 'line_id', natee_ui( 'line_default' ) ) ); ?></span>
								</span>
							</a>
						</li>
					<?php endif; ?>

					<?php if ( natee_opt( 'facebook_url', '' ) ) : ?>
						<li>
							<a class="natee-contact-item" href="<?php echo esc_url( natee_opt( 'facebook_url', '' ) ); ?>" target="_blank" rel="noopener">
								<span class="natee-contact-icon"><?php echo natee_icon( 'facebook' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label"><?php echo esc_html( natee_ui( 'label_facebook' ) ); ?></span>
									<span class="natee-contact-value"><?php echo esc_html( natee_ui( 'label_page' ) . ' ' . natee_site_name() ); ?></span>
								</span>
							</a>
						</li>
					<?php endif; ?>

					<?php if ( natee_opt( 'email', '' ) ) : ?>
						<li>
							<a class="natee-contact-item" href="mailto:<?php echo esc_attr( natee_opt( 'email', '' ) ); ?>">
								<span class="natee-contact-icon"><?php echo natee_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label"><?php echo esc_html( natee_ui( 'label_email' ) ); ?></span>
									<span class="natee-contact-value"><?php echo esc_html( natee_opt( 'email', '' ) ); ?></span>
								</span>
							</a>
						</li>
					<?php endif; ?>

					<?php if ( natee_text( 'address', '' ) ) : ?>
						<li>
							<span class="natee-contact-item">
								<span class="natee-contact-icon"><?php echo natee_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label"><?php echo esc_html( natee_ui( 'label_location' ) ); ?></span>
									<span class="natee-contact-value"><?php echo esc_html( natee_text( 'address', '' ) ); ?></span>
								</span>
							</span>
						</li>
					<?php endif; ?>

					<?php if ( natee_text( 'open_hours', '' ) ) : ?>
						<li>
							<span class="natee-contact-item">
								<span class="natee-contact-icon"><?php echo natee_icon( 'clock' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label"><?php echo esc_html( natee_ui( 'label_hours' ) ); ?></span>
									<span class="natee-contact-value"><?php echo esc_html( natee_text( 'open_hours', '' ) ); ?></span>
								</span>
							</span>
						</li>
					<?php endif; ?>
				</ul>

				<?php
				$qr_file = natee_bundled_images();
				$qr_url  = natee_opt( 'show_line_qr', 0 ) ? natee_bundled_url( $qr_file['line_qr'] ) : '';
				?>
				<?php if ( $qr_url && $line ) : ?>
					<div class="natee-qr">
						<img src="<?php echo esc_url( $qr_url ); ?>" alt="<?php echo esc_attr( natee_ui( 'qr_title' ) . ' ' . natee_site_name() ); ?>" loading="lazy" decoding="async" width="160" height="160" />
						<div class="natee-qr-text">
							<p class="natee-qr-title"><?php echo esc_html( natee_ui( 'qr_title' ) ); ?></p>
							<p class="natee-qr-note"><?php echo esc_html( natee_ui( 'qr_note' ) ); ?></p>
							<?php if ( natee_opt( 'line_id', '' ) ) : ?>
								<p class="natee-qr-id">LINE ID: <span class="natee-nowrap"><?php echo esc_html( natee_opt( 'line_id', '' ) ); ?></span></p>
							<?php endif; ?>
						</div>
					</div>
				<?php endif; ?>

				<?php if ( $map ) : ?>
					<div class="natee-map">
						<iframe
							src="<?php echo esc_url( $map ); ?>"
							title="<?php echo esc_attr( natee_ui( 'map_title' ) . ' ' . natee_site_name() ); ?>"
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
							allowfullscreen></iframe>
					</div>

					<?php if ( natee_text( 'address', '' ) ) : ?>
						<a class="natee-map-link"
							href="<?php echo esc_url( 'https://www.google.com/maps/dir/?api=1&destination=' . rawurlencode( natee_text( 'address', '' ) ) ); ?>"
							target="_blank" rel="noopener">
							<?php echo natee_icon( 'pin', 'natee-icon natee-icon-inline' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<span><?php echo esc_html( natee_ui( 'map_link' ) ); ?></span>
						</a>
					<?php endif; ?>
				<?php endif; ?>
			</div>

			<div class="natee-contact-form-wrap">
				<?php echo natee_contact_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

				<form class="natee-form" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post" aria-labelledby="natee-form-heading">
					<p class="natee-form-heading" id="natee-form-heading"><?php echo esc_html( natee_ui( 'form_heading' ) ); ?></p>

					<input type="hidden" name="action" value="natee_contact" />
					<?php wp_nonce_field( 'natee_contact', 'natee_contact_nonce' ); ?>

					<p class="natee-form-row">
						<label for="natee-name"><?php echo esc_html( natee_ui( 'form_name' ) ); ?> <span class="natee-required"><?php echo esc_html( natee_ui( 'form_required' ) ); ?></span></label>
						<input type="text" id="natee-name" name="natee_name" autocomplete="name" maxlength="120" required />
					</p>

					<p class="natee-form-row">
						<label for="natee-phone"><?php echo esc_html( natee_ui( 'form_phone' ) ); ?> <span class="natee-required"><?php echo esc_html( natee_ui( 'form_required' ) ); ?></span></label>
						<input type="tel" id="natee-phone" name="natee_phone" inputmode="tel" autocomplete="tel"
							maxlength="20" pattern="[0-9+\-\s()]{9,20}" aria-describedby="natee-phone-hint" required />
						<span class="natee-form-note" id="natee-phone-hint"><?php echo esc_html( natee_ui( 'form_phone_hint' ) ); ?></span>
					</p>

					<p class="natee-form-row">
						<label for="natee-area"><?php echo esc_html( natee_ui( 'form_area' ) ); ?></label>
						<input type="text" id="natee-area" name="natee_area" maxlength="160" placeholder="<?php echo esc_attr( natee_ui( 'form_area_ph' ) ); ?>" />
					</p>

					<p class="natee-form-row">
						<label for="natee-message"><?php echo esc_html( natee_ui( 'form_message' ) ); ?></label>
						<textarea id="natee-message" name="natee_message" rows="4" maxlength="1500"
							placeholder="<?php echo esc_attr( natee_ui( 'form_message_ph' ) ); ?>"></textarea>
					</p>

					<p class="natee-form-trap" aria-hidden="true">
						<label for="natee-website"><?php echo esc_html( natee_ui( 'form_trap' ) ); ?></label>
						<input type="text" id="natee-website" name="natee_website" tabindex="-1" autocomplete="off" />
					</p>

					<button type="submit" class="natee-btn natee-btn-submit"><?php echo esc_html( natee_ui( 'form_submit' ) ); ?></button>
					<p class="natee-form-hint"><?php echo esc_html( natee_ui( 'form_hint' ) ); ?></p>
				</form>
			</div>
		</div>
	</div>
</section>
