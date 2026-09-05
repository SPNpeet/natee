<?php
/**
 * หน้าบทความเดี่ยว
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<section class="natee-section">
	<div class="natee-container natee-narrow">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<article <?php post_class( 'natee-page' ); ?>>
				<header class="natee-section-head">
					<h1 class="natee-section-title"><?php the_title(); ?></h1>
					<p class="natee-post-meta"><?php echo esc_html( get_the_date() ); ?></p>
				</header>

				<?php if ( has_post_thumbnail() ) : ?>
					<div class="natee-page-thumb"><?php the_post_thumbnail( 'large' ); ?></div>
				<?php endif; ?>

				<div class="natee-content">
					<?php the_content(); ?>
				</div>
			</article>
			<?php
		endwhile;
		?>
	</div>
</section>

<?php
get_footer();
