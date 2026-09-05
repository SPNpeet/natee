<?php
/**
 * หน้าตั้งค่าเว็บไซต์ในระบบจัดการ WordPress
 * รวมทุกอย่างที่ลูกค้าต้องแก้ไว้ในหน้าเดียว แบ่งเป็นแท็บ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function natee_settings_tabs() {
	return array(
		'contact' => 'ติดต่อและแบรนด์',
		'home'    => 'หน้าแรก',
		'service' => 'บริการและรถ',
		'price'   => 'อัตราค่าบริการ',
		'area'    => 'พื้นที่ให้บริการ',
		'gallery' => 'แกลเลอรี',
		'faq'     => 'คำถามที่พบบ่อย',
		'seo'     => 'ชื่อเว็บบน Google',
	);
}

add_action( 'admin_menu', 'natee_settings_menu' );
function natee_settings_menu() {
	add_menu_page(
		'ตั้งค่าเว็บไซต์',
		'ตั้งค่าเว็บไซต์',
		'manage_options',
		'natee-settings',
		'natee_settings_page',
		'dashicons-admin-customizer',
		3
	);
}

add_action( 'admin_init', 'natee_settings_register' );
function natee_settings_register() {
	register_setting(
		'natee_settings_group',
		'natee_options',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'natee_sanitize_options',
			'default'           => natee_default_options(),
		)
	);
}

/**
 * ทำความสะอาดข้อมูลก่อนบันทึกลงฐานข้อมูล
 */
function natee_sanitize_options( $input ) {
	$defaults = natee_default_options();
	$out      = natee_options();

	if ( ! is_array( $input ) ) {
		return $out;
	}

	$plain_text = array(
		'business_name',
		'business_tagline',
		'phone_primary',
		'phone_secondary',
		'line_id',
		'address',
		'open_hours',
		'hero_eyebrow',
		'hero_title',
		'hero_note',
		'about_title',
		'about_quote',
		'services_title',
		'services_subtitle',
		'fleet_title',
		'fleet_subtitle',
		'pricing_title',
		'pricing_subtitle',
		'steps_title',
		'areas_title',
		'areas_subtitle',
		'gallery_title',
		'gallery_subtitle',
		'faq_title',
		'cta_title',
		'cta_subtitle',
		'seo_title',
		'footer_note',
	);

	foreach ( $plain_text as $key ) {
		if ( isset( $input[ $key ] ) ) {
			$out[ $key ] = sanitize_text_field( wp_unslash( $input[ $key ] ) );
		}
	}

	$multi_line = array(
		'hero_subtitle',
		'about_text',
		'pricing_note',
		'seo_description',
		'cta_subtitle',
	);

	foreach ( $multi_line as $key ) {
		if ( isset( $input[ $key ] ) ) {
			$out[ $key ] = sanitize_textarea_field( wp_unslash( $input[ $key ] ) );
		}
	}

	if ( isset( $input['email'] ) ) {
		$out['email'] = sanitize_email( wp_unslash( $input['email'] ) );
	}

	foreach ( array( 'line_url', 'facebook_url' ) as $key ) {
		if ( isset( $input[ $key ] ) ) {
			$out[ $key ] = esc_url_raw( trim( wp_unslash( $input[ $key ] ) ) );
		}
	}

	foreach ( array( 'hero_image', 'about_image', 'logo', 'seo_image' ) as $key ) {
		if ( isset( $input[ $key ] ) ) {
			$out[ $key ] = absint( $input[ $key ] );
		}
	}

	if ( isset( $input['brand_color'] ) ) {
		$color = sanitize_hex_color( wp_unslash( $input['brand_color'] ) );
		$out['brand_color'] = $color ? $color : $defaults['brand_color'];
	}

	$out['show_sticky_bar'] = empty( $input['show_sticky_bar'] ) ? 0 : 1;
	$out['show_line_qr']    = empty( $input['show_line_qr'] ) ? 0 : 1;

	if ( isset( $input['map_embed'] ) ) {
		$out['map_embed'] = natee_sanitize_map_embed( wp_unslash( $input['map_embed'] ) );
	}

	// รายการที่ทำซ้ำได้
	$out['highlights'] = natee_sanitize_rows(
		isset( $input['highlights'] ) ? $input['highlights'] : array(),
		array(
			'icon'  => 'key',
			'title' => 'text',
			'text'  => 'textarea',
		)
	);

	$out['services'] = natee_sanitize_rows(
		isset( $input['services'] ) ? $input['services'] : array(),
		array(
			'icon'  => 'key',
			'title' => 'text',
			'text'  => 'textarea',
			'image' => 'image',
		)
	);

	$out['fleet'] = natee_sanitize_rows(
		isset( $input['fleet'] ) ? $input['fleet'] : array(),
		array(
			'name'     => 'text',
			'capacity' => 'text',
			'text'     => 'textarea',
			'image'    => 'image',
		)
	);

	$out['pricing'] = natee_sanitize_rows(
		isset( $input['pricing'] ) ? $input['pricing'] : array(),
		array(
			'name'   => 'text',
			'detail' => 'text',
			'price'  => 'text',
		)
	);

	$out['steps'] = natee_sanitize_rows(
		isset( $input['steps'] ) ? $input['steps'] : array(),
		array(
			'title' => 'text',
			'text'  => 'textarea',
		)
	);

	$out['faq'] = natee_sanitize_rows(
		isset( $input['faq'] ) ? $input['faq'] : array(),
		array(
			'q' => 'text',
			'a' => 'textarea',
		)
	);

	// พื้นที่ให้บริการ กรอกบรรทัดละหนึ่งพื้นที่
	if ( isset( $input['areas'] ) ) {
		$lines = preg_split( '/\r\n|\r|\n/', (string) wp_unslash( $input['areas'] ) );
		$areas = array();

		foreach ( $lines as $line ) {
			$line = sanitize_text_field( trim( $line ) );

			if ( '' !== $line ) {
				$areas[] = $line;
			}
		}

		$out['areas'] = $areas;
	}

	// แกลเลอรี เก็บเป็นรายการรหัสรูปภาพ
	if ( isset( $input['gallery'] ) ) {
		$ids     = is_array( $input['gallery'] ) ? $input['gallery'] : explode( ',', (string) $input['gallery'] );
		$gallery = array();

		foreach ( $ids as $id ) {
			$id = absint( $id );

			if ( $id ) {
				$gallery[] = $id;
			}
		}

		$out['gallery'] = array_values( array_unique( $gallery ) );
	}

	return $out;
}

/**
 * อนุญาตเฉพาะ iframe ของ Google Maps ในช่องแผนที่
 */
function natee_sanitize_map_embed( $value ) {
	$value = trim( (string) $value );

	if ( '' === $value ) {
		return '';
	}

	if ( preg_match( '#src=["\']([^"\']+)["\']#i', $value, $matches ) ) {
		$value = $matches[1];
	}

	$url  = esc_url_raw( $value );
	$host = wp_parse_url( $url, PHP_URL_HOST );

	if ( ! $host || ! preg_match( '/(^|\.)google\.com$/i', $host ) ) {
		return '';
	}

	return $url;
}

/**
 * ทำความสะอาดรายการที่ทำซ้ำได้ตามชนิดของแต่ละช่อง
 */
function natee_sanitize_rows( $rows, $schema ) {
	$clean = array();

	if ( ! is_array( $rows ) ) {
		return $clean;
	}

	foreach ( $rows as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$item  = array();
		$empty = true;

		foreach ( $schema as $key => $type ) {
			$raw = isset( $row[ $key ] ) ? wp_unslash( $row[ $key ] ) : '';

			switch ( $type ) {
				case 'textarea':
					$item[ $key ] = sanitize_textarea_field( $raw );
					break;
				case 'image':
					$item[ $key ] = absint( $raw );
					break;
				case 'key':
					$item[ $key ] = sanitize_key( $raw );
					break;
				default:
					$item[ $key ] = sanitize_text_field( $raw );
			}

			if ( '' !== $item[ $key ] && 0 !== $item[ $key ] ) {
				$empty = false;
			}
		}

		if ( ! $empty ) {
			$clean[] = $item;
		}
	}

	return $clean;
}

add_action( 'admin_enqueue_scripts', 'natee_settings_assets' );
function natee_settings_assets( $hook ) {
	if ( 'toplevel_page_natee-settings' !== $hook ) {
		return;
	}

	wp_enqueue_media();

	$dir = get_template_directory_uri();
	$ver = wp_get_theme()->get( 'Version' );

	wp_enqueue_style( 'natee-admin', $dir . '/assets/admin/admin.css', array(), $ver );
	wp_enqueue_script( 'natee-admin', $dir . '/assets/admin/admin.js', array( 'jquery' ), $ver, true );
	wp_localize_script(
		'natee-admin',
		'nateeAdminText',
		array(
			'chooseImage' => 'เลือกรูปภาพ',
			'useImage'    => 'ใช้รูปนี้',
			'confirmDel'  => 'ต้องการลบรายการนี้ใช่หรือไม่',
		)
	);
}

/**
 * ช่องกรอกข้อความบรรทัดเดียว
 */
function natee_field_text( $key, $label, $help = '', $type = 'text' ) {
	$options = natee_options();
	$value   = isset( $options[ $key ] ) ? $options[ $key ] : '';
	?>
	<div class="natee-field">
		<label for="natee-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label>
		<input type="<?php echo esc_attr( $type ); ?>"
			id="natee-<?php echo esc_attr( $key ); ?>"
			name="natee_options[<?php echo esc_attr( $key ); ?>]"
			value="<?php echo esc_attr( $value ); ?>" />
		<?php if ( $help ) : ?>
			<p class="natee-help"><?php echo esc_html( $help ); ?></p>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * ช่องกรอกข้อความหลายบรรทัด
 */
function natee_field_textarea( $key, $label, $help = '', $rows = 3, $raw_value = null ) {
	$options = natee_options();
	$value   = null !== $raw_value ? $raw_value : ( isset( $options[ $key ] ) ? $options[ $key ] : '' );
	?>
	<div class="natee-field">
		<label for="natee-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label>
		<textarea id="natee-<?php echo esc_attr( $key ); ?>"
			rows="<?php echo absint( $rows ); ?>"
			name="natee_options[<?php echo esc_attr( $key ); ?>]"><?php echo esc_textarea( $value ); ?></textarea>
		<?php if ( $help ) : ?>
			<p class="natee-help"><?php echo esc_html( $help ); ?></p>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * ช่องเลือกรูปภาพเดี่ยว
 */
function natee_field_image( $name, $value, $label, $help = '' ) {
	$value = absint( $value );
	$url   = $value ? wp_get_attachment_image_url( $value, 'medium' ) : '';
	?>
	<div class="natee-field natee-image-field">
		<label><?php echo esc_html( $label ); ?></label>
		<div class="natee-image-box <?php echo $url ? 'has-image' : ''; ?>">
			<div class="natee-image-preview">
				<?php if ( $url ) : ?>
					<img src="<?php echo esc_url( $url ); ?>" alt="" />
				<?php else : ?>
					<span class="natee-image-empty">ยังไม่ได้เลือกรูป</span>
				<?php endif; ?>
			</div>
			<input type="hidden" class="natee-image-id" name="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>" />
			<div class="natee-image-actions">
				<button type="button" class="button natee-image-pick">เลือกรูป</button>
				<button type="button" class="button-link natee-image-clear">ลบรูป</button>
			</div>
		</div>
		<?php if ( $help ) : ?>
			<p class="natee-help"><?php echo esc_html( $help ); ?></p>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * แถวของรายการที่ทำซ้ำได้
 */
function natee_repeater_row( $group, $index, $row, $schema, $is_template = false ) {
	$index_attr = $is_template ? '__index__' : (string) $index;
	?>
	<div class="natee-row" data-group="<?php echo esc_attr( $group ); ?>">
		<div class="natee-row-head">
			<span class="natee-row-handle" aria-hidden="true"></span>
			<strong class="natee-row-title"><?php echo esc_html( $schema['__label__'] ); ?></strong>
			<button type="button" class="button-link natee-row-remove">ลบรายการนี้</button>
		</div>
		<div class="natee-row-body">
			<?php
			foreach ( $schema as $key => $field ) {
				if ( '__label__' === $key ) {
					continue;
				}

				$name  = sprintf( 'natee_options[%s][%s][%s]', $group, $index_attr, $key );
				$value = isset( $row[ $key ] ) ? $row[ $key ] : '';

				if ( 'image' === $field['type'] ) {
					natee_field_image( $name, $value, $field['label'], isset( $field['help'] ) ? $field['help'] : '' );
					continue;
				}

				if ( 'select' === $field['type'] ) {
					?>
					<div class="natee-field">
						<label><?php echo esc_html( $field['label'] ); ?></label>
						<select name="<?php echo esc_attr( $name ); ?>">
							<?php foreach ( $field['choices'] as $choice_key => $choice_label ) : ?>
								<option value="<?php echo esc_attr( $choice_key ); ?>" <?php selected( $value, $choice_key ); ?>>
									<?php echo esc_html( $choice_label ); ?>
								</option>
							<?php endforeach; ?>
						</select>
					</div>
					<?php
					continue;
				}

				if ( 'textarea' === $field['type'] ) {
					?>
					<div class="natee-field">
						<label><?php echo esc_html( $field['label'] ); ?></label>
						<textarea rows="3" name="<?php echo esc_attr( $name ); ?>"><?php echo esc_textarea( $value ); ?></textarea>
					</div>
					<?php
					continue;
				}
				?>
				<div class="natee-field">
					<label><?php echo esc_html( $field['label'] ); ?></label>
					<input type="text" name="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>" />
				</div>
				<?php
			}
			?>
		</div>
	</div>
	<?php
}

/**
 * กล่องรายการที่ทำซ้ำได้ทั้งชุด
 */
function natee_repeater( $group, $schema, $add_label ) {
	$options = natee_options();
	$rows    = isset( $options[ $group ] ) && is_array( $options[ $group ] ) ? $options[ $group ] : array();
	?>
	<div class="natee-repeater" data-group="<?php echo esc_attr( $group ); ?>">
		<div class="natee-rows">
			<?php foreach ( $rows as $index => $row ) : ?>
				<?php natee_repeater_row( $group, $index, $row, $schema ); ?>
			<?php endforeach; ?>
		</div>
		<script type="text/html" class="natee-row-template">
			<?php natee_repeater_row( $group, 0, array(), $schema, true ); ?>
		</script>
		<button type="button" class="button button-secondary natee-row-add"><?php echo esc_html( $add_label ); ?></button>
	</div>
	<?php
}

/**
 * หน้าตั้งค่าทั้งหมด
 */
function natee_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$options = natee_options();
	$tabs    = natee_settings_tabs();
	?>
	<div class="wrap natee-settings">
		<h1>ตั้งค่าเว็บไซต์ <?php echo esc_html( natee_opt( 'business_name', 'ธารนที' ) ); ?></h1>
		<p class="natee-intro">
			แก้ข้อความและรูปในหน้านี้ได้ทุกจุด กด "บันทึกการตั้งค่า" ด้านล่างเมื่อแก้เสร็จ
			แล้วเปิดหน้าเว็บเพื่อดูผลได้ทันที
		</p>

		<form method="post" action="options.php" class="natee-form">
			<?php settings_fields( 'natee_settings_group' ); ?>

			<nav class="natee-tabs" role="tablist">
				<?php $first = true; ?>
				<?php foreach ( $tabs as $slug => $label ) : ?>
					<button type="button"
						class="natee-tab <?php echo $first ? 'is-active' : ''; ?>"
						data-tab="<?php echo esc_attr( $slug ); ?>"
						role="tab"
						aria-selected="<?php echo $first ? 'true' : 'false'; ?>">
						<?php echo esc_html( $label ); ?>
					</button>
					<?php $first = false; ?>
				<?php endforeach; ?>
			</nav>

			<section class="natee-panel is-active" data-panel="contact">
				<h2>ข้อมูลร้านและช่องทางติดต่อ</h2>
				<p class="natee-help">ข้อมูลส่วนนี้จะไปแสดงที่ปุ่มโทร ปุ่มไลน์ และท้ายเว็บทุกหน้า</p>
				<?php
				natee_field_text( 'business_name', 'ชื่อร้าน', 'ชื่อที่จะแสดงบนหัวเว็บและท้ายเว็บ' );
				natee_field_text( 'business_tagline', 'คำอธิบายสั้นใต้ชื่อร้าน' );
				natee_field_image( 'natee_options[logo]', $options['logo'], 'โลโก้', 'ถ้าไม่เลือก ระบบจะใช้โลโก้ธารนทีที่ติดมากับธีมให้อัตโนมัติ' );
				natee_field_text( 'phone_primary', 'เบอร์โทรหลัก', 'ใส่แบบ 064-825-3515 ระบบจะทำปุ่มกดโทรออกให้อัตโนมัติ' );
				natee_field_text( 'phone_secondary', 'เบอร์โทรสำรอง', 'ถ้าไม่มี เว้นว่างไว้ได้' );
				natee_field_text( 'line_id', 'LINE ID', 'เช่น @nateewater ใส่แล้วปุ่มไลน์จะขึ้นเองทั้งเว็บ' );
				natee_field_text( 'line_url', 'ลิงก์ LINE แบบเต็ม', 'ถ้ามีลิงก์เพิ่มเพื่อนจาก LINE OA ให้วางที่ช่องนี้ ระบบจะใช้ลิงก์นี้ก่อน', 'url' );
				natee_field_text( 'facebook_url', 'ลิงก์เพจ Facebook', 'ถ้าไม่มี เว้นว่างไว้ได้', 'url' );
				natee_field_text( 'email', 'อีเมล', 'ใช้รับข้อความจากฟอร์มติดต่อ ถ้าเว้นว่างจะส่งเข้าอีเมลผู้ดูแลระบบ', 'email' );
				natee_field_text( 'address', 'ที่อยู่หรือพื้นที่ตั้ง' );
				natee_field_text( 'open_hours', 'เวลาให้บริการ' );
				natee_field_textarea( 'map_embed', 'ลิงก์แผนที่ Google Maps', 'เปิด Google Maps กดแชร์ เลือกฝังแผนที่ แล้ววางโค้ดทั้งหมดลงช่องนี้ ระบบจะดึงเฉพาะลิงก์แผนที่ให้เอง', 3 );
				?>
				<div class="natee-field">
					<label for="natee-brand_color">สีหลักของเว็บ</label>
					<input type="color" id="natee-brand_color" name="natee_options[brand_color]" value="<?php echo esc_attr( $options['brand_color'] ); ?>" />
					<p class="natee-help">ใช้กับปุ่มและหัวข้อทั่วทั้งเว็บ</p>
				</div>
				<div class="natee-field natee-field-check">
					<label>
						<input type="checkbox" name="natee_options[show_sticky_bar]" value="1" <?php checked( 1, (int) $options['show_sticky_bar'] ); ?> />
						แสดงแถบปุ่มโทรและไลน์ค้างไว้ด้านล่างจอมือถือ
					</label>
					<p class="natee-help">แนะนำให้เปิดไว้ เพราะลูกค้าส่วนใหญ่เข้าเว็บจากมือถือและต้องการกดโทรทันที</p>
				</div>
				<div class="natee-field natee-field-check">
					<label>
						<input type="checkbox" name="natee_options[show_line_qr]" value="1" <?php checked( 1, (int) $options['show_line_qr'] ); ?> />
						แสดงคิวอาร์โค้ดไลน์ในหน้าติดต่อ
					</label>
				</div>
				<?php natee_field_text( 'footer_note', 'ข้อความเพิ่มเติมท้ายเว็บ' ); ?>
			</section>

			<section class="natee-panel" data-panel="home">
				<h2>ส่วนหัวหน้าแรก</h2>
				<?php
				natee_field_text( 'hero_eyebrow', 'ข้อความบรรทัดบนสุด' );
				natee_field_text( 'hero_title', 'หัวข้อใหญ่' );
				natee_field_textarea( 'hero_subtitle', 'คำอธิบายใต้หัวข้อ', '', 3 );
				natee_field_text( 'hero_note', 'ข้อความแนะนำการสั่งน้ำ' );
				natee_field_image( 'natee_options[hero_image]', $options['hero_image'], 'รูปใหญ่หน้าแรก', 'ถ้าไม่เลือก ระบบจะใช้รูปรถ 6 ล้อที่ติดมากับธีม แนะนำรูปแนวนอน ขนาดประมาณ 1200 x 800 พิกเซล' );
				?>

				<h2>แนะนำร้าน</h2>
				<?php
				natee_field_text( 'about_title', 'หัวข้อ' );
				natee_field_textarea( 'about_text', 'เนื้อหาแนะนำร้าน', '', 4 );
				natee_field_text( 'about_quote', 'ข้อความเน้น', 'ประโยคสั้นที่อยากให้ลูกค้าจำ ถ้าไม่ต้องการให้เว้นว่าง' );
				natee_field_image( 'natee_options[about_image]', $options['about_image'], 'รูปประกอบส่วนแนะนำร้าน', 'ถ้าไม่เลือก ระบบจะใช้รูปผลงานที่ติดมากับธีม' );
				?>

				<h2>จุดเด่นของร้าน</h2>
				<p class="natee-help">แสดงเป็นกล่องสี่ช่องใต้ส่วนหัว</p>
				<?php
				natee_repeater(
					'highlights',
					array(
						'__label__' => 'จุดเด่น',
						'icon'      => array(
							'type'    => 'select',
							'label'   => 'ไอคอน',
							'choices' => array(
								'clock' => 'นาฬิกา บริการ 24 ชั่วโมง',
								'drop'  => 'หยดน้ำ คุณภาพน้ำ',
								'truck' => 'รถบรรทุก การจัดส่ง',
								'tag'   => 'ป้ายราคา',
								'check' => 'เครื่องหมายถูก',
								'pin'   => 'หมุดแผนที่ พื้นที่บริการ',
							),
						),
						'title'     => array(
							'type'  => 'text',
							'label' => 'หัวข้อ',
						),
						'text'      => array(
							'type'  => 'textarea',
							'label' => 'คำอธิบาย',
						),
					),
					'เพิ่มจุดเด่น'
				);
				?>

				<h2>ขั้นตอนการสั่งน้ำ</h2>
				<?php
				natee_field_text( 'steps_title', 'หัวข้อส่วนขั้นตอน' );
				natee_repeater(
					'steps',
					array(
						'__label__' => 'ขั้นตอน',
						'title'     => array(
							'type'  => 'text',
							'label' => 'ชื่อขั้นตอน',
						),
						'text'      => array(
							'type'  => 'textarea',
							'label' => 'คำอธิบาย',
						),
					),
					'เพิ่มขั้นตอน'
				);
				?>

				<h2>แถบชวนโทรก่อนจบหน้า</h2>
				<?php
				natee_field_text( 'cta_title', 'หัวข้อ' );
				natee_field_textarea( 'cta_subtitle', 'คำอธิบาย', '', 2 );
				?>
			</section>

			<section class="natee-panel" data-panel="service">
				<h2>บริการ</h2>
				<?php
				natee_field_text( 'services_title', 'หัวข้อส่วนบริการ' );
				natee_field_text( 'services_subtitle', 'คำอธิบายใต้หัวข้อ' );
				natee_repeater(
					'services',
					array(
						'__label__' => 'บริการ',
						'icon'      => array(
							'type'    => 'select',
							'label'   => 'ไอคอน',
							'choices' => array(
								'tank'    => 'แท็งก์เก็บน้ำ',
								'pool'    => 'สระว่ายน้ำ',
								'build'   => 'งานก่อสร้าง',
								'leaf'    => 'ต้นไม้และสนามหญ้า',
								'road'    => 'ถนนและสถานที่',
								'event'   => 'งานอีเวนต์',
								'factory' => 'โรงงาน',
								'hotel'   => 'โรงแรมและร้านอาหาร',
								'drop'    => 'หยดน้ำ',
								'truck'   => 'รถบรรทุก',
							),
						),
						'title'     => array(
							'type'  => 'text',
							'label' => 'ชื่อบริการ',
						),
						'text'      => array(
							'type'  => 'textarea',
							'label' => 'คำอธิบาย',
						),
						'image'     => array(
							'type'  => 'image',
							'label' => 'รูปประกอบ',
							'help'  => 'ไม่ใส่ก็ได้ ระบบจะแสดงเป็นกล่องสีพื้นแทน',
						),
					),
					'เพิ่มบริการ'
				);
				?>

				<h2>ประเภทรถ</h2>
				<?php
				natee_field_text( 'fleet_title', 'หัวข้อส่วนประเภทรถ' );
				natee_field_text( 'fleet_subtitle', 'คำอธิบายใต้หัวข้อ' );
				natee_repeater(
					'fleet',
					array(
						'__label__' => 'รถ',
						'name'      => array(
							'type'  => 'text',
							'label' => 'ชื่อรถ',
						),
						'capacity'  => array(
							'type'  => 'text',
							'label' => 'ความจุหรือจุดเด่น',
						),
						'text'      => array(
							'type'  => 'textarea',
							'label' => 'คำอธิบาย',
						),
						'image'     => array(
							'type'  => 'image',
							'label' => 'รูปรถ',
						),
					),
					'เพิ่มประเภทรถ'
				);
				?>
			</section>

			<section class="natee-panel" data-panel="price">
				<h2>อัตราค่าบริการ</h2>
				<?php
				natee_field_text( 'pricing_title', 'หัวข้อส่วนราคา' );
				natee_field_text( 'pricing_subtitle', 'คำอธิบายใต้หัวข้อ' );
				natee_repeater(
					'pricing',
					array(
						'__label__' => 'รายการราคา',
						'name'      => array(
							'type'  => 'text',
							'label' => 'ชื่อรายการ',
						),
						'detail'    => array(
							'type'  => 'text',
							'label' => 'รายละเอียด',
						),
						'price'     => array(
							'type'  => 'text',
							'label' => 'ราคา',
						),
					),
					'เพิ่มรายการราคา'
				);
				natee_field_textarea( 'pricing_note', 'หมายเหตุท้ายตารางราคา', '', 3 );
				?>
			</section>

			<section class="natee-panel" data-panel="area">
				<h2>พื้นที่ให้บริการ</h2>
				<?php
				natee_field_text( 'areas_title', 'หัวข้อส่วนพื้นที่' );
				natee_field_text( 'areas_subtitle', 'คำอธิบายใต้หัวข้อ' );
				natee_field_textarea(
					'areas',
					'รายชื่อพื้นที่',
					'กรอกบรรทัดละหนึ่งพื้นที่ เช่น อำเภอเมืองเชียงใหม่',
					12,
					implode( "\n", (array) $options['areas'] )
				);
				?>
			</section>

			<section class="natee-panel" data-panel="gallery">
				<h2>แกลเลอรีผลงาน</h2>
				<?php
				natee_field_text( 'gallery_title', 'หัวข้อส่วนแกลเลอรี' );
				natee_field_text( 'gallery_subtitle', 'คำอธิบายใต้หัวข้อ' );
				?>
				<div class="natee-field">
					<label>รูปผลงาน</label>
					<div class="natee-gallery" data-name="natee_options[gallery]">
						<input type="hidden" class="natee-gallery-ids" name="natee_options[gallery]" value="<?php echo esc_attr( implode( ',', (array) $options['gallery'] ) ); ?>" />
						<div class="natee-gallery-list">
							<?php foreach ( (array) $options['gallery'] as $id ) : ?>
								<?php $thumb = wp_get_attachment_image_url( absint( $id ), 'thumbnail' ); ?>
								<?php if ( $thumb ) : ?>
									<div class="natee-gallery-item" data-id="<?php echo esc_attr( $id ); ?>">
										<img src="<?php echo esc_url( $thumb ); ?>" alt="" />
										<button type="button" class="natee-gallery-remove" aria-label="ลบรูปนี้">ลบ</button>
									</div>
								<?php endif; ?>
							<?php endforeach; ?>
						</div>
						<button type="button" class="button button-secondary natee-gallery-add">เพิ่มรูปเข้าแกลเลอรี</button>
					</div>
					<p class="natee-help">เลือกได้หลายรูปพร้อมกัน หากยังไม่เลือก ระบบจะแสดงรูปผลงาน 12 รูปที่ติดมากับธีมให้อัตโนมัติ ถ้าต้องการสลับลำดับให้ลบแล้วเพิ่มใหม่ตามลำดับที่ต้องการ</p>
				</div>
			</section>

			<section class="natee-panel" data-panel="faq">
				<h2>คำถามที่พบบ่อย</h2>
				<p class="natee-help">ส่วนนี้ช่วยให้ Google เข้าใจบริการของร้านมากขึ้น และช่วยลดคำถามซ้ำทางโทรศัพท์</p>
				<?php
				natee_field_text( 'faq_title', 'หัวข้อส่วนคำถาม' );
				natee_repeater(
					'faq',
					array(
						'__label__' => 'คำถาม',
						'q'         => array(
							'type'  => 'text',
							'label' => 'คำถาม',
						),
						'a'         => array(
							'type'  => 'textarea',
							'label' => 'คำตอบ',
						),
					),
					'เพิ่มคำถาม'
				);
				?>
			</section>

			<section class="natee-panel" data-panel="seo">
				<h2>ชื่อและคำอธิบายที่แสดงบน Google</h2>
				<?php
				natee_field_text( 'seo_title', 'ชื่อเว็บบน Google', 'ความยาวที่เหมาะสมประมาณ 60 ตัวอักษร' );
				natee_field_textarea( 'seo_description', 'คำอธิบายบน Google', 'ความยาวที่เหมาะสมประมาณ 150 ตัวอักษร', 3 );
				natee_field_image( 'natee_options[seo_image]', $options['seo_image'], 'รูปที่แสดงเวลาแชร์ลิงก์', 'ถ้าไม่เลือก ระบบจะใช้ภาพแบนเนอร์ธารนทีที่ติดมากับธีม แนะนำขนาด 1200 x 630 พิกเซล' );
				?>
			</section>

			<?php submit_button( 'บันทึกการตั้งค่า' ); ?>
		</form>
	</div>
	<?php
}
