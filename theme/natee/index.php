<?php
/**
 * เทมเพลตสำรอง ใช้กับหน้ารายการบทความและผลการค้นหา
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<section class="natee-section">
	<div class="natee-container natee-narrow">
		<header class="natee-section-head">
			<h1 class="natee-section-title">
				<?php
				if ( is_search() ) {
					printf( 'ผลการค้นหา: %s', esc_html( get_search_query() ) );
				} elseif ( is_archive() ) {
					echo esc_html( wp_strip_all_tags( get_the_archive_title() ) );
				} else {
					echo 'บทความทั้งหมด';
				}
				?>
			</h1>
		</header>

		<?php if ( have_posts() ) : ?>
			<div class="natee-post-list">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<article class="natee-post-item">
						<h2 class="natee-post-title">
							<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
						</h2>
						<p class="natee-post-excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 40 ) ); ?></p>
					</article>
					<?php
				endwhile;
				?>
			</div>

			<div class="natee-pagination">
				<?php the_posts_pagination( array( 'mid_size' => 1 ) ); ?>
			</div>
		<?php else : ?>
			<p>ยังไม่มีเนื้อหาในส่วนนี้</p>
		<?php endif; ?>
	</div>
</section>

<?php
get_footer();
