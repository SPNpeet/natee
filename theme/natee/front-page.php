<?php
/**
 * หน้าแรกของเว็บไซต์ ประกอบจากส่วนย่อยใน template-parts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

get_template_part( 'template-parts/hero' );
get_template_part( 'template-parts/highlights' );
get_template_part( 'template-parts/about' );
get_template_part( 'template-parts/services' );
get_template_part( 'template-parts/fleet' );
get_template_part( 'template-parts/pricing' );
get_template_part( 'template-parts/steps' );
get_template_part( 'template-parts/areas' );
get_template_part( 'template-parts/gallery' );
get_template_part( 'template-parts/faq' );
get_template_part( 'template-parts/cta' );
get_template_part( 'template-parts/contact' );

get_footer();
