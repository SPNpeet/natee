<?php
/**
 * ขั้นตอนการสั่งน้ำ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$steps = (array) natee_opt( 'steps', array() );

if ( empty( $steps ) ) {
	return;
}
?>
<section class="natee-section natee-steps" id="natee-steps">
	<div class="natee-container">
		<header class="natee-section-head">
			<h2 class="natee-section-title"><?php echo esc_html( natee_text( 'steps_title', 'สั่งน้ำง่ายใน 3 ขั้นตอน' ) ); ?></h2>
		</header>

		<ol class="natee-step-list" role="list">
			<?php foreach ( $steps as $index => $step ) : ?>
				<li class="natee-step">
					<span class="natee-step-number" aria-hidden="true"><?php echo esc_html( $index + 1 ); ?></span>
					<h3 class="natee-step-title"><?php echo esc_html( natee_row_text( $step, 'title' ) ); ?></h3>
					<p class="natee-step-text"><?php echo esc_html( natee_row_text( $step, 'text' ) ); ?></p>
				</li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>
