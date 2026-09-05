<?php
/**
 * เรนเดอร์หน้าตั้งค่าในระบบจัดการ เพื่อดูหน้าตาและทดสอบการทำงานของแท็บและรายการ
 */

require __DIR__ . '/wp-stub.php';

$theme = get_template_directory();

require $theme . '/functions.php';
?>
<!DOCTYPE html>
<html lang="th">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>ตัวอย่างหน้าตั้งค่า ธารนที</title>
	<link rel="stylesheet" href="/theme-assets/assets/admin/admin.css">
	<style>
		body {
			margin: 0;
			background: #f0f0f1;
			font-family: -apple-system, "Segoe UI", "IBM Plex Sans Thai", sans-serif;
			color: #1d2327;
		}

		.wrap {
			padding: 24px;
		}

		.button {
			background: #f6f7f7;
			border: 1px solid #2271b1;
			color: #2271b1;
			border-radius: 3px;
			padding: 6px 12px;
			cursor: pointer;
			font-size: 13px;
		}

		.button-primary {
			background: #2271b1;
			color: #fff;
		}

		.button-link {
			background: none;
			border: none;
			cursor: pointer;
			padding: 0;
			text-decoration: underline;
		}

		.natee-preview-flag {
			background: #fff3cd;
			border: 1px solid #f0c36d;
			padding: 10px 14px;
			border-radius: 6px;
			margin-bottom: 16px;
			font-size: 13px;
		}
	</style>
</head>
<body>
	<div class="natee-preview-flag" style="margin:24px 24px 0">
		หน้านี้เป็นตัวอย่างระหว่างพัฒนา ปุ่มเลือกรูปจะทำงานเมื่ออยู่ในระบบ WordPress จริงเท่านั้น
	</div>
	<?php natee_settings_page(); ?>
	<script src="/theme-assets/assets/admin/admin.js"></script>
</body>
</html>
