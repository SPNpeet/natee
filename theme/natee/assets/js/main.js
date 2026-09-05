/**
 * สคริปต์หน้าเว็บ ธารนที
 * ทำสองอย่าง คือ เมนูบนมือถือ และตัวดูรูปผลงานแบบเต็มจอ
 */
( function () {
	'use strict';

	/* เมนูบนมือถือ */
	( function () {
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

	/* ตัวดูรูปผลงานแบบเต็มจอ */
	( function () {
		var grid = document.querySelector( '[data-natee-gallery]' );

		if ( ! grid ) {
			return;
		}

		var links = Array.prototype.slice.call( grid.querySelectorAll( '.natee-gallery-link' ) );

		if ( ! links.length ) {
			return;
		}

		var text = {
			close: grid.getAttribute( 'data-label-close' ) || 'ปิด',
			prev: grid.getAttribute( 'data-label-prev' ) || 'รูปก่อนหน้า',
			next: grid.getAttribute( 'data-label-next' ) || 'รูปถัดไป',
			viewer: grid.getAttribute( 'data-label-viewer' ) || 'ตัวดูรูป',
			of: grid.getAttribute( 'data-label-of' ) || 'จาก',
			hint: grid.getAttribute( 'data-label-hint' ) || ''
		};

		var slides = links.map( function ( link ) {
			return {
				src: link.getAttribute( 'href' ),
				alt: link.getAttribute( 'data-alt' ) || ''
			};
		} );

		var current = 0;
		var lastFocus = null;
		var box = null;
		var image = null;
		var counter = null;
		var prevButton = null;
		var nextButton = null;
		var closeButton = null;

		function icon( name ) {
			var paths = {
				arrow: '<path d="M15.4 4.6 13.9 3.2 5.1 12l8.8 8.8 1.5-1.4L8.1 12z"/>',
				close: '<path d="M18.3 7.1 16.9 5.7 12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9z"/>'
			};

			return '<svg class="natee-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' + paths[ name ] + '</svg>';
		}

		function build() {
			box = document.createElement( 'div' );
			box.className = 'natee-lightbox';
			box.setAttribute( 'role', 'dialog' );
			box.setAttribute( 'aria-modal', 'true' );
			box.setAttribute( 'aria-label', text.viewer );
			box.hidden = true;

			box.innerHTML =
				'<div class="natee-lightbox-backdrop" data-close></div>' +
				'<div class="natee-lightbox-inner">' +
					'<div class="natee-lightbox-bar">' +
						'<span class="natee-lightbox-counter" aria-live="polite"></span>' +
						'<button type="button" class="natee-lightbox-btn natee-lightbox-close" data-close>' +
							icon( 'close' ) + '<span class="natee-screen-reader">' + text.close + '</span>' +
						'</button>' +
					'</div>' +
					'<div class="natee-lightbox-stage">' +
						'<button type="button" class="natee-lightbox-btn natee-lightbox-prev" data-prev>' +
							icon( 'arrow' ) + '<span class="natee-screen-reader">' + text.prev + '</span>' +
						'</button>' +
						'<figure class="natee-lightbox-figure">' +
							'<img class="natee-lightbox-image" src="" alt="" decoding="async" />' +
						'</figure>' +
						'<button type="button" class="natee-lightbox-btn natee-lightbox-next" data-next>' +
							icon( 'arrow' ) + '<span class="natee-screen-reader">' + text.next + '</span>' +
						'</button>' +
					'</div>' +
					( text.hint ? '<p class="natee-lightbox-hint">' + text.hint + '</p>' : '' ) +
				'</div>';

			document.body.appendChild( box );

			image = box.querySelector( '.natee-lightbox-image' );
			counter = box.querySelector( '.natee-lightbox-counter' );
			prevButton = box.querySelector( '[data-prev]' );
			nextButton = box.querySelector( '[data-next]' );
			closeButton = box.querySelector( '.natee-lightbox-close' );

			box.addEventListener( 'click', function ( event ) {
				if ( event.target.closest( '[data-close]' ) ) {
					close();
					return;
				}

				if ( event.target.closest( '[data-prev]' ) ) {
					show( current - 1 );
					return;
				}

				if ( event.target.closest( '[data-next]' ) ) {
					show( current + 1 );
				}
			} );

			bindSwipe();
		}

		function preload( index ) {
			var slide = slides[ ( index + slides.length ) % slides.length ];

			if ( ! slide ) {
				return;
			}

			var img = new Image();
			img.src = slide.src;
		}

		function show( index ) {
			var total = slides.length;
			current = ( index + total ) % total;

			var slide = slides[ current ];

			box.classList.add( 'is-loading' );

			image.onload = function () {
				box.classList.remove( 'is-loading' );
			};

			image.onerror = function () {
				box.classList.remove( 'is-loading' );
			};

			image.src = slide.src;
			image.alt = slide.alt;

			if ( image.complete ) {
				box.classList.remove( 'is-loading' );
			}

			counter.textContent = ( current + 1 ) + ' ' + text.of + ' ' + total;

			var single = total < 2;
			prevButton.hidden = single;
			nextButton.hidden = single;

			preload( current + 1 );
			preload( current - 1 );
		}

		function open( index ) {
			if ( ! box ) {
				build();
			}

			lastFocus = document.activeElement;

			// ชดเชยความกว้างของแถบเลื่อนที่หายไป ไม่ให้หน้าเว็บด้านหลังกระตุก
			var scrollbar = window.innerWidth - document.documentElement.clientWidth;

			if ( scrollbar > 0 ) {
				document.body.style.paddingRight = scrollbar + 'px';
			}

			box.hidden = false;
			document.body.classList.add( 'natee-no-scroll' );
			show( index );

			// บังคับให้เบราว์เซอร์คำนวณเลย์เอาต์ก่อน แล้วค่อยเปิด
			// ทำแบบนี้เพื่อไม่ต้องพึ่ง requestAnimationFrame ที่บางกรณีไม่ทำงาน
			void box.offsetHeight;
			box.classList.add( 'is-open' );
			closeButton.focus();
		}

		function close() {
			if ( ! box || box.hidden ) {
				return;
			}

			box.classList.remove( 'is-open' );
			box.hidden = true;
			image.src = '';
			document.body.classList.remove( 'natee-no-scroll' );
			document.body.style.paddingRight = '';

			// คืนโฟกัสไปที่รูปในหน้าเว็บที่กำลังดูอยู่ ไม่ปล่อยให้โฟกัสค้างในกล่องที่ซ่อนแล้ว
			var target = links[ current ];

			if ( ! target || ! target.isConnected ) {
				target = lastFocus;
			}

			if ( target && target.focus ) {
				target.focus( { preventScroll: false } );
			}
		}

		function bindSwipe() {
			var startX = 0;
			var startY = 0;
			var tracking = false;

			var stage = box.querySelector( '.natee-lightbox-stage' );

			stage.addEventListener( 'touchstart', function ( event ) {
				if ( 1 !== event.touches.length ) {
					return;
				}

				startX = event.touches[ 0 ].clientX;
				startY = event.touches[ 0 ].clientY;
				tracking = true;
			}, { passive: true } );

			stage.addEventListener( 'touchend', function ( event ) {
				if ( ! tracking ) {
					return;
				}

				tracking = false;

				var touch = event.changedTouches[ 0 ];
				var dx = touch.clientX - startX;
				var dy = touch.clientY - startY;

				if ( Math.abs( dx ) < 45 || Math.abs( dx ) < Math.abs( dy ) ) {
					return;
				}

				show( dx < 0 ? current + 1 : current - 1 );
			}, { passive: true } );
		}

		grid.addEventListener( 'click', function ( event ) {
			var link = event.target.closest( '.natee-gallery-link' );

			if ( ! link || event.metaKey || event.ctrlKey || event.shiftKey || 1 === event.button ) {
				return;
			}

			event.preventDefault();
			open( parseInt( link.getAttribute( 'data-index' ), 10 ) || 0 );
		} );

		document.addEventListener( 'keydown', function ( event ) {
			if ( ! box || box.hidden ) {
				return;
			}

			if ( 'Escape' === event.key ) {
				event.preventDefault();
				close();
				return;
			}

			if ( 'ArrowLeft' === event.key ) {
				event.preventDefault();
				show( current - 1 );
				return;
			}

			if ( 'ArrowRight' === event.key ) {
				event.preventDefault();
				show( current + 1 );
				return;
			}

			// วนโฟกัสอยู่ภายในตัวดูรูปเท่านั้น
			if ( 'Tab' === event.key ) {
				var focusable = Array.prototype.slice.call(
					box.querySelectorAll( 'button:not([hidden])' )
				);

				if ( ! focusable.length ) {
					return;
				}

				var first = focusable[ 0 ];
				var last = focusable[ focusable.length - 1 ];

				if ( event.shiftKey && document.activeElement === first ) {
					event.preventDefault();
					last.focus();
				} else if ( ! event.shiftKey && document.activeElement === last ) {
					event.preventDefault();
					first.focus();
				}
			}
		} );

	} )();
} )();
