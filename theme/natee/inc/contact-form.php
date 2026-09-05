<?php
/**
 * ฟอร์มติดต่อหน้าเว็บ ส่งเข้าอีเมลของร้าน
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_post_nopriv_natee_contact', 'natee_handle_contact' );
add_action( 'admin_post_natee_contact', 'natee_handle_contact' );

function natee_handle_contact() {
	$redirect = wp_get_referer();

	if ( ! $redirect ) {
		$redirect = home_url( '/' );
	}

	$fail = function ( $code ) use ( $redirect ) {
		wp_safe_redirect( add_query_arg( 'natee_contact', $code, $redirect ) . '#natee-contact' );
		exit;
	};

	if ( ! isset( $_POST['natee_contact_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['natee_contact_nonce'] ), 'natee_contact' ) ) {
		$fail( 'error' );
	}

	// ช่องล่อสำหรับดักบอท ผู้ใช้จริงจะไม่เห็นและไม่กรอก
	if ( ! empty( $_POST['natee_website'] ) ) {
		$fail( 'sent' );
	}

	$name    = isset( $_POST['natee_name'] ) ? sanitize_text_field( wp_unslash( $_POST['natee_name'] ) ) : '';
	$phone   = isset( $_POST['natee_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['natee_phone'] ) ) : '';
	$area    = isset( $_POST['natee_area'] ) ? sanitize_text_field( wp_unslash( $_POST['natee_area'] ) ) : '';
	$message = isset( $_POST['natee_message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['natee_message'] ) ) : '';

	if ( '' === $name || '' === $phone ) {
		$fail( 'missing' );
	}

	if ( ! preg_match( '/[0-9]{8,}/', preg_replace( '/[^0-9]/', '', $phone ) ) ) {
		$fail( 'phone' );
	}

	// กันการกดส่งซ้ำถี่เกินไปจากเครื่องเดียวกัน
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	$key = 'natee_contact_' . md5( $ip );

	if ( get_transient( $key ) ) {
		$fail( 'toofast' );
	}

	set_transient( $key, 1, 60 );

	$to = trim( (string) natee_opt( 'email', '' ) );

	if ( '' === $to || ! is_email( $to ) ) {
		$to = get_option( 'admin_email' );
	}

	$subject = sprintf( 'ลูกค้าสั่งน้ำผ่านเว็บไซต์ %s', natee_site_name() );

	$body = implode(
		"\n",
		array(
			'มีลูกค้าติดต่อเข้ามาผ่านฟอร์มบนเว็บไซต์',
			'',
			'ชื่อผู้ติดต่อ: ' . $name,
			'เบอร์โทร: ' . $phone,
			'พื้นที่จัดส่ง: ' . ( '' !== $area ? $area : 'ไม่ได้ระบุ' ),
			'รายละเอียด: ' . ( '' !== $message ? $message : 'ไม่ได้ระบุ' ),
			'',
			'ส่งเมื่อ: ' . wp_date( 'j F Y เวลา H:i น.' ),
			'จากหน้า: ' . $redirect,
		)
	);

	$headers = array( 'Content-Type: text/plain; charset=UTF-8' );
	$sent    = wp_mail( $to, $subject, $body, $headers );

	$fail( $sent ? 'sent' : 'error' );
}

/**
 * ข้อความแจ้งผลหลังส่งฟอร์ม
 */
function natee_contact_notice() {
	if ( empty( $_GET['natee_contact'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return '';
	}

	$code = sanitize_key( wp_unslash( $_GET['natee_contact'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	$messages = array(
		'sent'    => array( 'ok', natee_ui( 'notice_sent' ) ),
		'missing' => array( 'warn', natee_ui( 'notice_missing' ) ),
		'phone'   => array( 'warn', natee_ui( 'notice_phone' ) ),
		'toofast' => array( 'warn', natee_ui( 'notice_toofast' ) ),
		'error'   => array( 'warn', natee_ui( 'notice_error' ) ),
	);

	if ( ! isset( $messages[ $code ] ) ) {
		return '';
	}

	return sprintf(
		'<p class="natee-form-notice natee-form-notice-%1$s" role="status">%2$s</p>',
		esc_attr( $messages[ $code ][0] ),
		esc_html( $messages[ $code ][1] )
	);
}
