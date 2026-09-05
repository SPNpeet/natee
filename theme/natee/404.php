<?php
/**
 * หน้าไม่พบข้อมูล
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<section class="natee-section">
	<div class="natee-container natee-narrow natee-404">
		<h1 class="natee-section-title"><?php echo esc_html( natee_ui( 'not_found_title' ) ); ?></h1>
		<p class="natee-section-subtitle"><?php echo esc_html( natee_ui( 'not_found_text' ) ); ?></p>
		<p>
			<a class="natee-btn natee-btn-line-outline" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( natee_ui( 'back_home' ) ); ?></a>
		</p>
		<?php natee_contact_buttons( '404' ); ?>
	</div>
</section>

<?php
get_footer();
