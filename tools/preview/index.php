<?php
/**
 * เรนเดอร์หน้าแรกของธีมด้วยตัวจำลอง WordPress
 */

require __DIR__ . '/wp-stub.php';

$theme = get_template_directory();

require $theme . '/functions.php';

do_action( 'after_setup_theme' );
do_action( 'init' );

require $theme . '/front-page.php';
