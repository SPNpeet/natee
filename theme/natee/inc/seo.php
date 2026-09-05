<?php
/**
 * ข้อมูลสำหรับเครื่องมือค้นหาและการแชร์ลิงก์
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ลิงก์จริงของหน้าที่กำลังเปิดอยู่ ใช้ทั้ง canonical และ og:url ให้ตรงกันเสมอ
 */
function natee_current_url() {
	if ( is_front_page() ) {
		return home_url( '/' );
	}

	if ( is_singular() ) {
		$permalink = get_permalink();

		if ( $permalink ) {
			return $permalink;
		}
	}

	if ( is_category() || is_tag() || is_tax() ) {
		$link = get_term_link( get_queried_object() );

		if ( ! is_wp_error( $link ) ) {
			return $link;
		}
	}

	return home_url( add_query_arg( array(), $GLOBALS['wp']->request ? '/' . $GLOBALS['wp']->request . '/' : '/' ) );
}

/**
 * ชื่อหน้าและคำอธิบายที่ใช้กับ meta ทั้งหมด
 */
function natee_seo_meta() {
	if ( is_front_page() ) {
		$title = natee_opt( 'seo_title', natee_site_name() );
		$desc  = natee_opt( 'seo_description', natee_opt( 'hero_subtitle', '' ) );
	} elseif ( is_singular() ) {
		$title = wp_get_document_title();
		$desc  = has_excerpt() ? get_the_excerpt() : natee_opt( 'seo_description', '' );
	} else {
		$title = wp_get_document_title();
		$desc  = natee_opt( 'seo_description', '' );
	}

	return array(
		'title'       => wp_strip_all_tags( (string) $title ),
		'description' => wp_trim_words( wp_strip_all_tags( (string) $desc ), 40, '' ),
	);
}

add_filter( 'document_title_parts', 'natee_document_title' );
function natee_document_title( $parts ) {
	if ( is_front_page() ) {
		$title = trim( (string) natee_opt( 'seo_title', '' ) );

		if ( '' !== $title ) {
			$parts['title']   = $title;
			$parts['tagline'] = '';
			unset( $parts['site'] );
		}
	}

	return $parts;
}

add_action( 'wp_head', 'natee_head_meta', 2 );
function natee_head_meta() {
	$meta = natee_seo_meta();
	$url  = natee_current_url();

	$image_id = absint( natee_opt( 'seo_image', 0 ) );

	if ( ! $image_id && is_singular() && has_post_thumbnail() ) {
		$image_id = get_post_thumbnail_id();
	}

	if ( ! $image_id ) {
		$image_id = absint( natee_opt( 'hero_image', 0 ) );
	}

	$bundled = natee_bundled_images();
	$image   = natee_media_url( $image_id, $bundled['seo'], 'full' );

	if ( $meta['description'] ) {
		printf( '<meta name="description" content="%s">' . "\n", esc_attr( $meta['description'] ) );
	}

	printf( '<link rel="canonical" href="%s">' . "\n", esc_url( $url ) );
	printf( '<meta property="og:type" content="%s">' . "\n", is_singular() && ! is_front_page() ? 'article' : 'website' );
	printf( '<meta property="og:site_name" content="%s">' . "\n", esc_attr( natee_site_name() ) );
	printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $meta['title'] ) );
	printf( '<meta property="og:url" content="%s">' . "\n", esc_url( $url ) );
	printf( '<meta property="og:locale" content="%s">' . "\n", 'th_TH' );

	if ( $meta['description'] ) {
		printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $meta['description'] ) );
	}

	if ( $image ) {
		printf( '<meta property="og:image" content="%s">' . "\n", esc_url( $image ) );
		printf( '<meta name="twitter:card" content="%s">' . "\n", 'summary_large_image' );
	}

	printf( '<meta name="theme-color" content="%s">' . "\n", esc_attr( natee_opt( 'brand_color', '#0f6fbf' ) ) );
}

/**
 * ข้อมูลโครงสร้างธุรกิจท้องถิ่นและคำถามที่พบบ่อย
 */
add_action( 'wp_footer', 'natee_schema_json_ld' );
function natee_schema_json_ld() {
	if ( ! is_front_page() ) {
		return;
	}

	$phones  = natee_phones();
	$bundled = natee_bundled_images();
	$image   = absint( natee_opt( 'seo_image', 0 ) );

	if ( ! $image ) {
		$image = absint( natee_opt( 'hero_image', 0 ) );
	}

	$business = array(
		'@context'    => 'https://schema.org',
		'@type'       => 'LocalBusiness',
		'name'        => natee_site_name(),
		'description' => natee_opt( 'seo_description', '' ),
		'url'         => home_url( '/' ),
		'areaServed'  => array_values( (array) natee_opt( 'areas', array() ) ),
	);

	if ( ! empty( $phones ) ) {
		$business['telephone'] = $phones[0];
	}

	$image_url = natee_media_url( $image, $bundled['seo'], 'full' );

	if ( $image_url ) {
		$business['image'] = $image_url;
	}

	$logo_url = natee_media_url( absint( natee_opt( 'logo', 0 ) ), $bundled['logo'], 'full' );

	if ( $logo_url ) {
		$business['logo'] = $logo_url;
	}

	if ( natee_opt( 'email', '' ) ) {
		$business['email'] = natee_opt( 'email', '' );
	}

	$address = trim( (string) natee_opt( 'address', '' ) );

	if ( '' !== $address ) {
		$business['address'] = array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => $address,
			'addressRegion'   => 'เชียงใหม่',
			'addressCountry'  => 'TH',
		);
	}

	$hours = trim( (string) natee_opt( 'open_hours', '' ) );

	if ( '' !== $hours ) {
		$business['openingHours'] = 'Mo-Su 00:00-23:59';
	}

	$profiles = array_filter( array( natee_opt( 'facebook_url', '' ), natee_line_href() ) );

	if ( ! empty( $profiles ) ) {
		$business['sameAs'] = array_values( $profiles );
	}

	$graph = array( $business );

	$faq = (array) natee_opt( 'faq', array() );

	if ( ! empty( $faq ) ) {
		$questions = array();

		foreach ( $faq as $item ) {
			if ( empty( $item['q'] ) || empty( $item['a'] ) ) {
				continue;
			}

			$questions[] = array(
				'@type'          => 'Question',
				'name'           => $item['q'],
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => $item['a'],
				),
			);
		}

		if ( ! empty( $questions ) ) {
			$graph[] = array(
				'@context'   => 'https://schema.org',
				'@type'      => 'FAQPage',
				'mainEntity' => $questions,
			);
		}
	}

	foreach ( $graph as $node ) {
		printf(
			'<script type="application/ld+json">%s</script>' . "\n",
			wp_json_encode( $node, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
		);
	}
}
