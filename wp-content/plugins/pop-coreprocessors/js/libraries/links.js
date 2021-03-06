(function($){
popLinks = {

	//-------------------------------------------------
	// PUBLIC FUNCTIONS
	//-------------------------------------------------

	documentInitialized : function() {
	
		var t = this;

		t.links();
	},

	//-------------------------------------------------
	// 'PRIVATE' FUNCTIONS
	//-------------------------------------------------

	linkBlankTarget : function(anchor) {

		var t = this;

		// Open in new window
		if (!anchor.attr('target')) {
			anchor.attr('target', '_blank');
		}
	},

	maybeaddspinner : function(anchor, url) {

		var t = this;

		// Add a spinner next to the clicked link? Allow to override on an anchor by anchor basis
		var addspinner = !anchor.hasClass('hidden') && ((M.ADDANCHORSPINNER && (typeof anchor.data('addspinner') == 'undefined') || anchor.data('addspinner')));
		if (addspinner) {

			// Create the spinner object and add an extra class so we can remove it later on
			var spinner = $('<span class="pop-spinner">'+M.SPINNER+'</span>');

			// If the anchor contains an image, assign a class to the spinner so it can be placed on top of the image
			if (anchor.find('img').length) {
				spinner.addClass('spinner-img');
			}

			// Whenever the URL was fetched (or failed fetching), undo the changes. The URL must be escaped, or otherwise the string triggered cannot be handled correctly
			$(document).one('urlfetchcompleted:'+escape(url), function() {
				anchor
					.removeClass('loading')
					// .removeClass('disabled')
					.children('.pop-spinner')
						.remove();
			});

			// Add class 'disabled' to the button, and remove class 'disabled' to the button siblings, since once the request
			// comes back, they'll be visible on their normal state (eg: Follow/Unfollow user)
			// And add the spinner
			// Also blur from the button, so that it doesn't have an annoying "_" underscore like produced between the spinner and the text
			anchor
				.trigger('blur')
				// .addClass('loading disabled')
				.addClass('loading')
				.prepend(spinner);
		}

		return addspinner;
	},

	links : function() {

		var t = this;

		// Capture all internal/external links
		var imgRegex = new RegExp(/\.(gif|jpg|jpeg|tiff|png)$/i);
		var otherRegex = new RegExp(/\.(pdf|css|js|zip|tar|ppt|pptx|doc|docx|xls|xlsx)$/i);

		var allowedAnchors = [];
		$.each(M.ALLOWED_DOMAINS, function(index, domain) {

			allowedAnchors.push('a[href^="'+domain+'"]');
		});

		// All links pointing to the website: capture them and do the request with fetch functions
		// $(document).on('click', 'a[href^="'+M.HOME_DOMAIN+'"]', function(e) {
		$(document).on('click', allowedAnchors.join(','), function(e) {

			var anchor = $(this);
			var url = anchor.attr('href');

			if (imgRegex.test(url)) {

				// Allow for a 3rd party plugin to intercept it (eg: photoSwipe). If no plugin did, then open in new window
				if (popJSLibraryManager.getLibraries('linksImage').length) {

					e.preventDefault();
					var args = {
						anchor: anchor
					}
					popJSLibraryManager.execute('linksImage', args);
				}
				else {

					t.linkBlankTarget(anchor);
				}
			}
			else if (otherRegex.test(url)) {
				
				t.linkBlankTarget(anchor);
			}
			else {

				// Execute functions to reset state of DOM (eg: for bubbling prevention), etc
				popCustomBootstrap.resetBubbling();

				// Caged Target: allow to pageSections to open all links within inside of itself.
				// Eg: Quickview (any link clicked in the Quickview will also open in the Quickview)
				var pageSection = popManager.getPageSection(anchor);
				// var cagedTarget = pageSection.data('caged-target');
				var target = anchor.attr('target') || M.URLPARAM_TARGET_MAIN; // || '_self';

				// Open the whole page? Then do not catch. Needed to switch language
				if (target == M.URLPARAM_TARGET_FULL) {
					e.preventDefault();
					t.maybeaddspinner(anchor, url);
					window.location = url;
					return;
				}
				// Print: special case, handle differently
				if (target == M.URLPARAM_TARGET_PRINT) {
					e.preventDefault();
					t.openPrint(url);
					return;
				}
				if (popManager.targetExists(target)) {
					
					// Internal links: use ajax / output = json to process them
					e.preventDefault();

					// Special case for the homepage: the link can be https://www.mesym.com or https://www.mesym.com/. However, in the popURLInterceptors it's stored as 'https://www.mesym.com/', and if the link doesn't have that final trail, then it will not be intercepted. So make sure to add it
					if (url == M.HOME_DOMAIN) {
						url = M.HOME_DOMAIN+'/';
					}

					// See if we intercept the link, or go fetch it from the server
					var intercept = false, options = {}, interceptOptions = {};

					// If reloading the url, then do not intercept it at all
					if (anchor.data('reloadurl')) {

						options.reloadurl = true;
					}
					else {
					
						// URL can be intercepted: only for the main target, do not intercept otherwise
						// Only do it if this current call to .click is actually not coming from an interceptor
						// relatedTarget: pass the original clicked link to retrieve atts later on thru 'transfer-atts'
						// var interceptTarget = anchor.attr('target') || anchor.closest('[data-intercept-target]').data('intercept-target') || M.URLPARAM_TARGET_MAIN;
						var interceptTarget = anchor.attr('target') || popManager.getClickFrameTarget(pageSection);
						interceptOptions = {
							event: e, 
							relatedTarget: anchor, 
							target: interceptTarget,
						};

						// Allow a different interceptUrl from the actual URL
						// This is so that, for the Locations Map, we don't intercept modals created under different blocks,
						// which will have different styles. Eg: clicking on https://www.mesym.com/locations-map/?lid[]=13514 on the location link in the Project Details (infoWindow about the location),
						// produces a different result than clicking on http://m3l.localhost/locations-map/?lid[]=13514 on the Projects Map (infoWindow about the projects)
						var interceptUrl = url;
						if (anchor.data('append-intercepturl')) {
							interceptUrl += anchor.data('append-intercepturl');
						}

						// intercept if there are interceptors for that URL
						intercept = popURLInterceptors.getInterceptors(interceptUrl, interceptOptions).length;
					}
					if (intercept) {
						// The intercept will take care from now on, so stop Propagation from this side
						// Done in the interceptor
						// 	e.stopPropagation();

						// First push the URL and only then do the intercept. Needed for initBlockParams (which takes window.location.href to initialize the params)
						// Comment Leo: commented since now function newRuntimeMemoryPage takes the URL from the topLevelFeedback, not from the browser URL
						// popBrowserHistory.pushState(url);
						popURLInterceptors.intercept(interceptUrl, interceptOptions);
					}
					else {

						// Fetch url from the server
						options.target = target;

						// Keep a reference to the original link
						options['js-args'] = {
							relatedTarget: anchor
						};

						// When calling popManager.click (eg: done through the quicklinks) the anchor has class hidden
						// In these cases, use the normal 'Loading'
						
						// Add a spinner next to the clicked link? Allow to override on an anchor by anchor basis
						var addspinner = t.maybeaddspinner(anchor, url);

						// Set the 'loading msg' target if it was defined. If empty, it will show no message, that's why here asking for != 'undefined'
						// Initially, set the value to the opposite of "addspinner": when adding a spinner next to the link, no need for the loading mesage
						var loadingmsg_target = addspinner ? '' : null;
						if (typeof anchor.data('loadingmsg-target') != 'undefined') {
							loadingmsg_target = anchor.data('loadingmsg-target');
						}
						if (loadingmsg_target != null) {
							options['loadingmsg-target'] = loadingmsg_target;
						}
						// Possible options: e.shiftKey, e.altKey, e.metaKey
						// e.ctrlkey is not an option, since Mac shows a contextual menu, doesn't do the link
						if (e.metaKey) {
							
							// Open the tab but don't focus on it
							options.silentDocument = true;
							options['js-args'].inactivePane = true;
						}

						popManager.fetch(url, options);
					}
				}
			}
		});

		// Social Media Links
		$(document).on('click', 'a[target="'+M.URLPARAM_TARGET_SOCIALMEDIA+'"]', function(e) {
		
			e.preventDefault();
			var anchor = $(this);
			var url = anchor.attr('href');
			t.openSocialMedia(url);
		});

		// Scroll to an anchor?
		$(document).on('click', 'a[href^="#"]', function(e) {
		
			var anchor = $(this);
			var url = anchor.attr('href');
			if (url.length > 1) {
				
				// url is something of the type '#element-id'. Since it already starts with '#', it can be used directly
				// to see if the object exists
				// data-toggle property: used by bootstrap (eg: to open a collapse). So if it has this property set, ignore
				var elem = $(url);

				// Bootstrap javascript elems:
				// data-toggle: collapse
				// data-slide: carousel
				var bootstrap = typeof anchor.data('toggle') !== 'undefined' || typeof anchor.data('slide') !== 'undefined';
				if (elem.length && !bootstrap) {

					e.preventDefault();
					popManager.scrollToElem(popManager.getPageSection(elem), elem, true);
				}
			}	
		});	

		// External sites: open in new window
		$(document).on('click', 'a[href^="http://"],a[href^="https://"]', function(e) {


			var anchor = $(this);
			var url = anchor.attr('href');
			var openblank = true;
			$.each(M.ALLOWED_DOMAINS, function(index, domain) {

				if(url.startsWith(domain)) {

					openblank = false;
					return -1;
				}
			});
			if (openblank) {

				t.linkBlankTarget(anchor);
			}
		});		
	},

	openPrint : function(url) {

		// Comment Leo 11/04/2015: Using "_blank" instead of "print" because, since we don't add mode=print to the browser url,
		// if the user just refreshes the page he'll browse the website as normal, and if then he clicks on print, it will open
		// on the same window! that's a bug.
		
		window.open(url, '_blank');
	},

	openSocialMedia : function(url) {

		window.open(url, '_blank', 'left=20,top=20,width=500,height=400,toolbar=1,resizable=0');
	},
};
})(jQuery);

//-------------------------------------------------
// Initialize
//-------------------------------------------------
popJSLibraryManager.register(popLinks, ['documentInitialized']);
