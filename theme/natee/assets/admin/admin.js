/**
 * หน้าตั้งค่าเว็บไซต์ ธารนที
 * จัดการแท็บ รายการที่เพิ่มลบได้ และการเลือกรูปจากคลังสื่อ
 */
( function () {
	'use strict';

	var root = document.querySelector( '.natee-settings' );

	if ( ! root ) {
		return;
	}

	var text = window.nateeAdminText || {};

	/* แท็บ */
	root.addEventListener( 'click', function ( event ) {
		var tab = event.target.closest( '.natee-tab' );

		if ( ! tab ) {
			return;
		}

		var target = tab.getAttribute( 'data-tab' );

		root.querySelectorAll( '.natee-tab' ).forEach( function ( item ) {
			var active = item === tab;
			item.classList.toggle( 'is-active', active );
			item.setAttribute( 'aria-selected', active ? 'true' : 'false' );
		} );

		root.querySelectorAll( '.natee-panel' ).forEach( function ( panel ) {
			panel.classList.toggle( 'is-active', panel.getAttribute( 'data-panel' ) === target );
		} );

		window.scrollTo( { top: 0, behavior: 'smooth' } );
	} );

	/* เพิ่มรายการ */
	root.addEventListener( 'click', function ( event ) {
		var button = event.target.closest( '.natee-row-add' );

		if ( ! button ) {
			return;
		}

		var repeater = button.closest( '.natee-repeater' );
		var list = repeater.querySelector( '.natee-rows' );
		var template = repeater.querySelector( '.natee-row-template' );
		var nextIndex = Date.now().toString().slice( -9 );
		var markup = template.innerHTML.split( '__index__' ).join( nextIndex );
		var holder = document.createElement( 'div' );

		holder.innerHTML = markup;

		var row = holder.firstElementChild;

		list.appendChild( row );
		row.scrollIntoView( { block: 'center', behavior: 'smooth' } );

		var firstInput = row.querySelector( 'input[type="text"], textarea' );

		if ( firstInput ) {
			firstInput.focus();
		}
	} );

	/* ลบรายการ */
	root.addEventListener( 'click', function ( event ) {
		var button = event.target.closest( '.natee-row-remove' );

		if ( ! button ) {
			return;
		}

		if ( ! window.confirm( text.confirmDel || 'ลบรายการนี้หรือไม่' ) ) {
			return;
		}

		var row = button.closest( '.natee-row' );

		if ( row ) {
			row.parentNode.removeChild( row );
		}
	} );

	/* เลือกรูปเดี่ยว */
	root.addEventListener( 'click', function ( event ) {
		var button = event.target.closest( '.natee-image-pick' );

		if ( ! button ) {
			return;
		}

		event.preventDefault();

		var box = button.closest( '.natee-image-box' );
		var input = box.querySelector( '.natee-image-id' );
		var preview = box.querySelector( '.natee-image-preview' );

		var frame = window.wp.media( {
			title: text.chooseImage || 'เลือกรูปภาพ',
			button: { text: text.useImage || 'ใช้รูปนี้' },
			library: { type: 'image' },
			multiple: false
		} );

		frame.on( 'select', function () {
			var attachment = frame.state().get( 'selection' ).first().toJSON();
			var url = attachment.url;

			if ( attachment.sizes && attachment.sizes.medium ) {
				url = attachment.sizes.medium.url;
			}

			input.value = attachment.id;
			preview.innerHTML = '';

			var image = document.createElement( 'img' );
			image.src = url;
			image.alt = '';
			preview.appendChild( image );
			box.classList.add( 'has-image' );
		} );

		frame.open();
	} );

	/* ลบรูปเดี่ยว */
	root.addEventListener( 'click', function ( event ) {
		var button = event.target.closest( '.natee-image-clear' );

		if ( ! button ) {
			return;
		}

		event.preventDefault();

		var box = button.closest( '.natee-image-box' );

		box.querySelector( '.natee-image-id' ).value = '';
		box.querySelector( '.natee-image-preview' ).innerHTML =
			'<span class="natee-image-empty">ยังไม่ได้เลือกรูป</span>';
		box.classList.remove( 'has-image' );
	} );

	/* แกลเลอรี */
	function syncGalleryIds( gallery ) {
		var ids = [];

		gallery.querySelectorAll( '.natee-gallery-item' ).forEach( function ( item ) {
			ids.push( item.getAttribute( 'data-id' ) );
		} );

		gallery.querySelector( '.natee-gallery-ids' ).value = ids.join( ',' );
	}

	root.addEventListener( 'click', function ( event ) {
		var addButton = event.target.closest( '.natee-gallery-add' );

		if ( addButton ) {
			event.preventDefault();

			var gallery = addButton.closest( '.natee-gallery' );
			var list = gallery.querySelector( '.natee-gallery-list' );

			var mediaType = gallery.getAttribute( 'data-media-type' ) === 'video' ? 'video' : 'image';
			var isVideo = 'video' === mediaType;

			var frame = window.wp.media( {
				title: isVideo ? 'เลือกคลิปวิดีโอ' : ( text.chooseImage || 'เลือกรูปภาพ' ),
				button: { text: isVideo ? 'ใช้คลิปนี้' : ( text.useImage || 'ใช้รูปนี้' ) },
				library: { type: mediaType },
				multiple: 'add'
			} );

			frame.on( 'select', function () {
				frame.state().get( 'selection' ).toJSON().forEach( function ( attachment ) {
					if ( list.querySelector( '[data-id="' + attachment.id + '"]' ) ) {
						return;
					}

					var item = document.createElement( 'div' );
					item.className = 'natee-gallery-item';
					item.setAttribute( 'data-id', attachment.id );

					if ( isVideo ) {
						item.className += ' natee-gallery-item-video';

						var chip = document.createElement( 'span' );
						chip.className = 'natee-video-chip';
						chip.textContent = attachment.title || attachment.filename || 'คลิปวิดีโอ';
						item.appendChild( chip );
					} else {
						var url = attachment.url;

						if ( attachment.sizes && attachment.sizes.thumbnail ) {
							url = attachment.sizes.thumbnail.url;
						}

						var image = document.createElement( 'img' );
						image.src = url;
						image.alt = '';
						item.appendChild( image );
					}

					var remove = document.createElement( 'button' );
					remove.type = 'button';
					remove.className = 'natee-gallery-remove';
					remove.textContent = 'ลบ';

					item.appendChild( remove );
					list.appendChild( item );
				} );

				syncGalleryIds( gallery );
			} );

			frame.open();
			return;
		}

		var removeButton = event.target.closest( '.natee-gallery-remove' );

		if ( removeButton ) {
			event.preventDefault();

			var galleryBox = removeButton.closest( '.natee-gallery' );
			var itemToRemove = removeButton.closest( '.natee-gallery-item' );

			itemToRemove.parentNode.removeChild( itemToRemove );
			syncGalleryIds( galleryBox );
		}
	} );
} )();
