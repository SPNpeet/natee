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
			<h2 class="natee-section-title">ติดต่อสั่งน้ำ</h2>
			<p class="natee-section-subtitle">โทรได้เลยเพื่อความรวดเร็วที่สุด หรือฝากข้อมูลไว้ให้ทีมงานติดต่อกลับ</p>
		</header>

		<div class="natee-contact-grid">
			<div class="natee-contact-info">
				<ul class="natee-contact-list">
					<?php foreach ( $phones as $phone ) : ?>
						<li>
							<a class="natee-contact-item" href="<?php echo esc_attr( natee_tel_href( $phone ) ); ?>">
								<span class="natee-contact-icon"><?php echo natee_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label">โทรศัพท์</span>
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
									<span class="natee-contact-label">LINE</span>
									<span class="natee-contact-value"><?php echo esc_html( natee_opt( 'line_id', 'ทักไลน์เพื่อสั่งน้ำ' ) ); ?></span>
								</span>
							</a>
						</li>
					<?php endif; ?>

					<?php if ( natee_opt( 'facebook_url', '' ) ) : ?>
						<li>
							<a class="natee-contact-item" href="<?php echo esc_url( natee_opt( 'facebook_url', '' ) ); ?>" target="_blank" rel="noopener">
								<span class="natee-contact-icon"><?php echo natee_icon( 'facebook' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label">Facebook</span>
									<span class="natee-contact-value">เพจ <?php echo esc_html( natee_site_name() ); ?></span>
								</span>
							</a>
						</li>
					<?php endif; ?>

					<?php if ( natee_opt( 'email', '' ) ) : ?>
						<li>
							<a class="natee-contact-item" href="mailto:<?php echo esc_attr( natee_opt( 'email', '' ) ); ?>">
								<span class="natee-contact-icon"><?php echo natee_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label">อีเมล</span>
									<span class="natee-contact-value"><?php echo esc_html( natee_opt( 'email', '' ) ); ?></span>
								</span>
							</a>
						</li>
					<?php endif; ?>

					<?php if ( natee_opt( 'address', '' ) ) : ?>
						<li>
							<span class="natee-contact-item">
								<span class="natee-contact-icon"><?php echo natee_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label">พื้นที่ตั้ง</span>
									<span class="natee-contact-value"><?php echo esc_html( natee_opt( 'address', '' ) ); ?></span>
								</span>
							</span>
						</li>
					<?php endif; ?>

					<?php if ( natee_opt( 'open_hours', '' ) ) : ?>
						<li>
							<span class="natee-contact-item">
								<span class="natee-contact-icon"><?php echo natee_icon( 'clock' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span>
									<span class="natee-contact-label">เวลาให้บริการ</span>
									<span class="natee-contact-value"><?php echo esc_html( natee_opt( 'open_hours', '' ) ); ?></span>
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
						<img src="<?php echo esc_url( $qr_url ); ?>" alt="คิวอาร์โค้ดเพิ่มเพื่อนไลน์ <?php echo esc_attr( natee_site_name() ); ?>" loading="lazy" decoding="async" width="160" height="160" />
						<div class="natee-qr-text">
							<p class="natee-qr-title">สแกนเพิ่มเพื่อนทางไลน์</p>
							<p class="natee-qr-note">สอบถามราคาและสั่งน้ำได้ตลอด 24 ชั่วโมง</p>
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
							title="แผนที่ <?php echo esc_attr( natee_site_name() ); ?>"
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
							allowfullscreen></iframe>
					</div>

					<?php if ( natee_opt( 'address', '' ) ) : ?>
						<a class="natee-map-link"
							href="<?php echo esc_url( 'https://www.google.com/maps/dir/?api=1&destination=' . rawurlencode( natee_opt( 'address', '' ) ) ); ?>"
							target="_blank" rel="noopener">
							<?php echo natee_icon( 'pin', 'natee-icon natee-icon-inline' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<span>เปิดเส้นทางใน Google Maps</span>
						</a>
					<?php endif; ?>
				<?php endif; ?>
			</div>

			<div class="natee-contact-form-wrap">
				<?php echo natee_contact_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

				<form class="natee-form" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post">
					<input type="hidden" name="action" value="natee_contact" />
					<?php wp_nonce_field( 'natee_contact', 'natee_contact_nonce' ); ?>

					<p class="natee-form-row">
						<label for="natee-name">ชื่อผู้ติดต่อ</label>
						<input type="text" id="natee-name" name="natee_name" required />
					</p>

					<p class="natee-form-row">
						<label for="natee-phone">เบอร์โทรกลับ</label>
						<input type="tel" id="natee-phone" name="natee_phone" inputmode="tel" required />
					</p>

					<p class="natee-form-row">
						<label for="natee-area">พื้นที่จัดส่ง</label>
						<input type="text" id="natee-area" name="natee_area" placeholder="เช่น อำเภอสันทราย" />
					</p>

					<p class="natee-form-row">
						<label for="natee-message">รายละเอียด</label>
						<textarea id="natee-message" name="natee_message" rows="4" placeholder="ปริมาณน้ำที่ต้องการ วันและเวลาที่สะดวกรับน้ำ"></textarea>
					</p>

					<p class="natee-form-trap" aria-hidden="true">
						<label for="natee-website">เว้นช่องนี้ว่างไว้</label>
						<input type="text" id="natee-website" name="natee_website" tabindex="-1" autocomplete="off" />
					</p>

					<button type="submit" class="natee-btn natee-btn-submit">ส่งข้อมูลให้ทีมงานติดต่อกลับ</button>
					<p class="natee-form-hint">ต้องการน้ำด่วนวันนี้ แนะนำให้โทรหาเราโดยตรง</p>
				</form>
			</div>
		</div>
	</div>
</section>
