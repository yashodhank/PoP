(function($){
popFunctions = {

	//-------------------------------------------------
	// PUBLIC FUNCTIONS
	//-------------------------------------------------

	expandJSKeys : function(args) {
	
		var t = this;
		var context = args.context;
		
		if (context[M.JS_FONTAWESOME]) {
			context.fontawesome = context[M.JS_FONTAWESOME];
		}
		if (context[M.JS_DESCRIPTION]) {
			context.description = context[M.JS_DESCRIPTION];
		}
	},

	beep : function(args) {

		// It beeps only once in total, and not once per target
		// Function beep in utils.js
		beep();
	},

	showmore : function(args) {

		var t = this;
		var targets = args.targets;

		// span with class "pop-showmore-more-full" can also be inside the <p></p>
		targets.find(".pop-showmore-more").click(function(e) {

			e.preventDefault();
			
			var link = $(this);
			var content = link.closest('.pop-content');
			content.find(".pop-showmore-more").addClass('hidden');
			content.find(".pop-showmore-less").removeClass('hidden');
			content.find(".pop-showmore-more-full").removeClass('hidden');
		});		
						
		targets.find(".pop-showmore-less").click(function(e) {

			e.preventDefault();

			var link = $(this);
			var content = link.closest('.pop-content');
			content.find(".pop-showmore-less").addClass('hidden');
			content.find(".pop-showmore-more").removeClass('hidden');
			content.find(".pop-showmore-more-full").addClass('hidden');
		});	
	},

	hideEmpty : function(args) {

		var t = this;

		var targets = args.targets;
		targets.closest('.pop-hide-empty').addClass('hidden');
	},

	switchTargetClass : function(args) {

		var t = this;
		var targets = args.targets;
		targets.click(function(e) {
	
			var button = $(this);
			// If it is an anchor with href="#" then stop default (eg: toggle top search xs button)
			// Otherwise do not (eg: Notification mark as read/unread)
			if (button.is('a[href="#"]')) {
				e.preventDefault();
			}

			// If no target provided, use the body
			var target = $(button.data('target')) || $(document.body);

			// By default, add class
			var mode = button.data('mode') || 'add';
			
			var classs = button.data('class');

			if (mode == 'add') {
				target.addClass(classs);
			}
			else if (mode == 'remove') {
				target.removeClass(classs);
			}
			else if (mode == 'toggle') {
				target.toggleClass(classs);
			}
		});
	},

	doNothing : function(args) {

		var t = this;
		var targets = args.targets;

		targets.click(function(e) {
	
			// Just do nothing. Needed for <a href="#"> like the popover
			e.preventDefault();
		});
	},

	// Fetch more button
	fetchMore : function(args) {

		var t = this;
		var pageSection = args.pageSection, block = args.block, targets = args.targets;

		block.on('beforeFetch', function(e, options) {

			// If doing a prepend, then the user can still call on fetchMore and append content
			// Prepend is needed by the loadLatest, which loads more at the top
			if (!options['skip-status']) {
				targets.button('loading');
			}
		});
		block.on('fetchCompleted', function(e) {

			// var blockQueryState = popManager.getBlockQueryState(pageSection, block);
			// if (blockQueryState[M.URLPARAM_STOPFETCHING]) {
			if (popManager.stopFetchingBlock(pageSection, block)) {

				targets.addClass('hidden');
			}
			else {
				
				targets.removeClass('hidden');
				targets.button('reset');
			}	
		});

		targets.click(function(e) {
	
			e.preventDefault();
			popManager.fetchBlock(pageSection, block, {operation: M.URLPARAM_OPERATION_APPEND});
		});
	},

	fetchMoreDisable : function(args) {

		var t = this;
		var block = args.block, targets = args.targets;

		block.on('beforeFetch', function(e, options) {

			// Disable buttons
			// If doing a prepend, then the user can still call on fetchMore and append content
			// Prepend is needed by the loadLatest, which loads more at the top
			if (!options['skip-status']) {
				targets.addClass('disabled').attr('disabled', 'disabled');
			}
		});

		block.on('fetchCompleted', function(e) {

			// Re-enable buttons
			targets.removeClass('disabled').attr('disabled', false);
		});
	},

	saveLastClicked : function(args) {

		var t = this;
		var pageSection = args.pageSection, block = args.block, targets = args.targets;

		targets.click(function(e) {

			var clicked = $(this);
	
			// Comment Leo 02/10/2015: Look for all retries under the block and not only the ones under the block's own '.blocksection-status',
			// so that it also works when the filter is not in the block but in un upper level BlockGroup
			// Tell the "status" template that I'm the last clicked button, so in case of error it can retry
			// block.children('.blocksection-status').find('[data-action="retry"]').data('lastclicked', '#'+clicked.attr('id'));
			block.find('[data-action="retry"]').data('lastclicked', '#'+clicked.attr('id')).removeClass('hidden');
		});
	},

	retrySendRequest : function(args) {

		var t = this;

		var pageSection = args.pageSection, block = args.block, targets = args.targets;
		targets.click(function(e) {

			e.preventDefault();
			var retryBtn = $(this);
			if (retryBtn.data('lastclicked')) {
	
				$(retryBtn.data('lastclicked')).trigger('click');
			}
		})
	},

	// mediaplayer : function(args) {

	// 	var t = this;

	// 	var targets = args.targets;
	// 	targets.mediaelementplayer();
	// },

	reset : function(args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, targets = args.targets;

		// When clicking on this button, reset the block (eg: for Create new Project, allows to re-draw the form)
		targets.click(function(e) {
	
			e.preventDefault();
			var button = $(this);
			var block = popManager.getBlock(button);
			
			popManager.reset(domain, pageSection, block);

			// Also close the message feedback
			popManager.closeMessageFeedback(block);
		});
	},

	// smallScreenHideCollapse : function(args) {

	// 	var t = this;
	// 	var targets = args.targets;

	// 	// Collapse for small screen (768px)
	// 	if ($(window).width() < 768) {
	// 		var targets = args.targets;
	// 		targets.collapse('hide');
	// 	}
	// },

	sortable : function(args) {

		var t = this;
		var pageSection = args.pageSection, /*pageSectionPage = args.pageSectionPage, */block = args.block, targets = args.targets;

		$(document).ready(function($) {
			targets.sortable({ cursor: "move" });
		});
	},

	onActionThenClick : function(args) {

		var t = this;
		var targets = args.targets;
		targets.each(function() {

			var clickable = $(this);
			var trigger = $(clickable.data('triggertarget'));
			var action = clickable.data('trigger-action') || 'click';

			// Allow to further define the trigger, selecting internal elements (needed for the Categories DelegatorFilter)
			if (clickable.data('triggertarget-internal')) {

				trigger = trigger.find(clickable.data('triggertarget-internal'));
			}
			trigger.on(action, function(e) {

				clickable.trigger('click');
			});
		});
	},

	//-------------------------------------------------
	// 'PRIVATE' FUNCTIONS
	//-------------------------------------------------

	getUrl : function(domain, link, use_pageurl) {

		var t = this;

		// Make sure the link we got is the original one, and not the intercepted one
		// target-url is stored under the original link, not the interceptor
		link = popManager.getOriginalLink(link);

		// If the link already has the 'data-target-url' then use it. Eg: in the SideInfo Sidebar Embed code
		var url = link.data('target-url');
		if (!url) {
			
			// If not, take the url from the block queryUrl. Eg: Discussions share Embed code
			var blockTarget = $(link.data('blocktarget'));
			var pageSection = popManager.getPageSection(blockTarget);
			url = popManager.getBlockFilteringUrl(domain, pageSection, blockTarget, use_pageurl);
		}

		return url;
	},
};
})(jQuery);

//-------------------------------------------------
// Initialize
//-------------------------------------------------
popJSLibraryManager.register(popFunctions, ['expandJSKeys', 'showmore', 'hideEmpty', 'switchTargetClass', 'doNothing', 'fetchMore', 'fetchMoreDisable', 'saveLastClicked', 'retrySendRequest', /*'mediaplayer', */'reset', /*'smallScreenHideCollapse', */'sortable', 'onActionThenClick', 'beep']);
