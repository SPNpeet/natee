/**
 * สคริปต์หน้าเว็บ ธารนที
 * ทำงานสองอย่างคือ เปิดปิดเมนูบนมือถือ และปิดเมนูเมื่อกดลิงก์ไปยังส่วนต่าง ๆ
 */
( function () {
	'use strict';

	var toggle = document.querySelector( '.natee-nav-toggle' );
	var nav = document.getElementById( 'natee-nav' );

	if ( ! toggle || ! nav ) {
		return;
	}

	function closeNav() {
		nav.classList.remove( 'is-open' );
		toggle.setAttribute( 'aria-expanded', 'false' );
	}

	toggle.addEventListener( 'click', function () {
		var isOpen = nav.classList.toggle( 'is-open' );
		toggle.setAttribute( 'aria-expanded', isOpen ? 'true' : 'false' );
	} );

	nav.addEventListener( 'click', function ( event ) {
		if ( event.target.closest( 'a' ) ) {
			closeNav();
		}
	} );

	document.addEventListener( 'click', function ( event ) {
		if ( ! nav.classList.contains( 'is-open' ) ) {
			return;
		}

		if ( event.target.closest( '.natee-header-inner' ) ) {
			return;
		}

		closeNav();
	} );

	document.addEventListener( 'keydown', function ( event ) {
		if ( 'Escape' === event.key ) {
			closeNav();
		}
	} );

	window.addEventListener( 'resize', function () {
		if ( window.innerWidth >= 1000 ) {
			closeNav();
		}
	} );
} )();
