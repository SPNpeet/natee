<?php
/**
 * ระบบผู้ดูแลเว็บไซต์แบบแยกส่วน
 *
 * สร้างบทบาทผู้ใช้ใหม่ชื่อ "ผู้ดูแลเว็บไซต์ธารนที" ที่เห็นเฉพาะหน้าตั้งค่าเว็บไซต์
 * และคลังไฟล์สื่อ ไม่เห็นเมนูอื่นของ WordPress ทำให้ใช้งานง่ายและลดโอกาสกดผิด
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NATEE_ROLE', 'natee_site_manager' );
define( 'NATEE_CAP', 'natee_manage_site' );

/**
 * สร้างบทบาทและมอบสิทธิ์ให้ผู้ดูแลระบบเดิม
 */
function natee_register_role() {
	$role = get_role( NATEE_ROLE );

	if ( ! $role ) {
		add_role(
			NATEE_ROLE,
			'ผู้ดูแลเว็บไซต์ธารนที',
			array(
				'read'         => true,
				'upload_files' => true,
				NATEE_CAP      => true,
			)
		);
	} else {
		$role->add_cap( 'read' );
		$role->add_cap( 'upload_files' );
		$role->add_cap( NATEE_CAP );
	}

	$admin = get_role( 'administrator' );

	if ( $admin && ! $admin->has_cap( NATEE_CAP ) ) {
		$admin->add_cap( NATEE_CAP );
	}
}

add_action( 'after_switch_theme', 'natee_register_role' );

/**
 * ตรวจให้แน่ใจว่าบทบาทและสิทธิ์ยังอยู่ครบ แม้ธีมถูกติดตั้งด้วยวิธีอื่น
 */
add_action( 'admin_init', 'natee_ensure_role' );
function natee_ensure_role() {
	$admin = get_role( 'administrator' );

	if ( ! get_role( NATEE_ROLE ) || ( $admin && ! $admin->has_cap( NATEE_CAP ) ) ) {
		natee_register_role();
	}
}

/**
 * ผู้ใช้ปัจจุบันเป็นผู้ดูแลเว็บไซต์แบบจำกัดสิทธิ์หรือไม่
 */
function natee_is_site_manager() {
	$user = wp_get_current_user();

	if ( ! $user || ! $user->exists() ) {
		return false;
	}

	return in_array( NATEE_ROLE, (array) $user->roles, true ) && ! user_can( $user, 'manage_options' );
}

/**
 * ซ่อนเมนูที่ผู้ดูแลเว็บไซต์ไม่จำเป็นต้องใช้
 */
add_action( 'admin_menu', 'natee_clean_admin_menu', 999 );
function natee_clean_admin_menu() {
	if ( ! natee_is_site_manager() ) {
		return;
	}

	$keep = array( 'natee-settings', 'upload.php', 'profile.php' );

	global $menu;

	if ( ! is_array( $menu ) ) {
		return;
	}

	foreach ( $menu as $item ) {
		$slug = isset( $item[2] ) ? $item[2] : '';

		if ( '' === $slug || in_array( $slug, $keep, true ) ) {
			continue;
		}

		remove_menu_page( $slug );
	}
}

/**
 * ส่งผู้ดูแลเว็บไซต์ไปที่หน้าตั้งค่าโดยตรง แทนหน้าสรุปของ WordPress
 */
add_action( 'admin_init', 'natee_redirect_manager_dashboard' );
function natee_redirect_manager_dashboard() {
	if ( ! natee_is_site_manager() || wp_doing_ajax() ) {
		return;
	}

	global $pagenow;

	if ( 'index.php' !== $pagenow ) {
		return;
	}

	wp_safe_redirect( admin_url( 'admin.php?page=natee-settings' ) );
	exit;
}

/**
 * หน้าปลายทางหลังเข้าสู่ระบบของผู้ดูแลเว็บไซต์
 */
add_filter( 'login_redirect', 'natee_login_redirect', 10, 3 );
function natee_login_redirect( $redirect_to, $requested, $user ) {
	if ( is_wp_error( $user ) || ! $user instanceof WP_User ) {
		return $redirect_to;
	}

	if ( in_array( NATEE_ROLE, (array) $user->roles, true ) && ! user_can( $user, 'manage_options' ) ) {
		return admin_url( 'admin.php?page=natee-settings' );
	}

	return $redirect_to;
}

/**
 * ตัดรายการที่ไม่จำเป็นออกจากแถบด้านบนสำหรับผู้ดูแลเว็บไซต์
 */
add_action( 'wp_before_admin_bar_render', 'natee_clean_admin_bar' );
function natee_clean_admin_bar() {
	if ( ! natee_is_site_manager() ) {
		return;
	}

	global $wp_admin_bar;

	foreach ( array( 'wp-logo', 'comments', 'new-content', 'updates' ) as $node ) {
		$wp_admin_bar->remove_node( $node );
	}
}

/**
 * ซ่อนกล่องช่วยเหลือและหน้าจอสรุปที่ไม่ได้ใช้
 */
add_action( 'admin_head', 'natee_manager_admin_style' );
function natee_manager_admin_style() {
	if ( ! natee_is_site_manager() ) {
		return;
	}

	echo '<style>#screen-meta-links,#wp-admin-bar-wp-logo{display:none !important;}</style>';
}

/**
 * รายชื่อผู้ใช้ที่เป็นผู้ดูแลเว็บไซต์
 */
function natee_site_managers() {
	$users = get_users(
		array(
			'role'   => NATEE_ROLE,
			'number' => 20,
		)
	);

	return $users;
}
