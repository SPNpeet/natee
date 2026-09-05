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
		<h1 class="natee-section-title">ไม่พบหน้าที่ต้องการ</h1>
		<p class="natee-section-subtitle">หน้านี้อาจถูกย้ายหรือลบไปแล้ว กลับไปหน้าแรกเพื่อดูบริการทั้งหมด หรือโทรหาเราได้ทันที</p>
		<p>
			<a class="natee-btn natee-btn-line-outline" href="<?php echo esc_url( home_url( '/' ) ); ?>">กลับหน้าแรก</a>
		</p>
		<?php natee_contact_buttons( '404' ); ?>
	</div>
</section>

<?php
get_footer();
