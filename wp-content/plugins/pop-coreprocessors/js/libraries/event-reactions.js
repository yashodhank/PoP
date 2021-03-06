(function($){
popEventReactions = {

	//-------------------------------------------------
	// PUBLIC FUNCTIONS
	//-------------------------------------------------

	resetOnSuccess : function(args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, targets = args.targets;
		var pssId = popManager.getSettingsId(pageSection);

		targets.on('fetched', function(e, response) {
	
			// Delete the textarea / fields if the form was successful
			var block = $(this);
			var bsId = popManager.getSettingsId(block);				
			var blockFeedback = response.feedback.block[pssId][bsId];

			// result = true means it was successful
			if (blockFeedback.result === true) {

				// skip-restore: allow the message feedback to still show
				popManager.reset(domain, pageSection, block, {'skip-restore': true});
			}
		});
	},

	resetOnUserLogout : function(args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, targets = args.targets;

		$(document).on('user:loggedout:'+domain, function(e, source) {

			targets.each(function() {
		
				// To double-check that the object still exists in the DOM and was not removed when doing popManager.destroyPageSectionPage
				var block = $('#'+$(this).attr('id'));
				if (block.length) {

					// 'delete-dataset': needed to erase the personal information of the logged in user. Eg: Add OpinionatedVoted, where it was showing the OpinionatedVoted by the user.
					// popManager.reset(pageSection, block, {'delete-dataset': true});
					popManager.reset(domain, pageSection, block);
				}
			});
		});
	},

	destroyPageOnSuccess : function(args) {

		var t = this;
		var pageSection = args.pageSection, targets = args.targets;
		var pssId = popManager.getSettingsId(pageSection);

		targets.on('fetched', function(e, response) {
	
			// Delete the textarea / fields if the form was successful
			var block = $(this);
			var bsId = popManager.getSettingsId(block);				
			var blockFeedback = response.feedback.block[pssId][bsId];
			var target = popManager.getFrameTarget(pageSection);

			// result = true means it was successful
			if (blockFeedback.result === true) {

				// get the destroyTime from the block
				var destroyTime = block.data('destroytime') || 0;
				setTimeout(function () {
					
					// Destroy this pageSectionPage
					popManager.triggerDestroyTarget(popManager.getTargetParamsScopeURL(block)/*block.data('paramsscope-url')*/, target);
				}, destroyTime);
			}
		});
	},

	destroyPageOnUserLoggedOut : function(args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, targets = args.targets;

		// Do it only after the pageSection has been initialized
		// This is so that the pageSectionPage doesn't get destroyed when having loaded that one! That one will give the info the user is not logged in
		// So now, it first destroys all pageSectionPages, and then sets the handler for this one
		// This will execute after t.feedbackLoginOut in user-account.js->pageSectionInitialized
		pageSection.one('completed', function() {

			t.execDestroyPageOnUserLoggedOut(domain, targets);
		});
	},

	destroyPageOnUserNoRole : function(args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, targets = args.targets;

		pageSection.one('completed', function() {
		
			t.execDestroyPageOnUserNoRole(domain, pageSection, targets);
		});
	},

	deleteBlockFeedbackValueOnUserLoggedInOut : function(args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, block = args.block;
		$(document).on('user:loggedinout:'+domain, function(e, source) {

			// Ask for 'initialuserdata' because some blocks will update themselves to load the content,
			// and will not depend on the user loggedin data. eg: Create OpinionatedVoted Block for the TPP Website
			// So if the source was that initial data, dismiss, otherwise it will trigger the URL load once again
			if (source == 'initialfeedback' || source == 'initialuserdata') {
				return;
			}
			
			// Deleting values is needed for the Notifications: when creating a user account, it will create notification "Welcome!",
			// but to fetch it we gotta delete param `hist_time` with value from previous fetching of notifications
			var jsSettings = popManager.getJsSettings(domain, pageSection, block);
			var keys = jsSettings['user:loggedinout-deletefeedbackvalue'] || [];
			if (keys.length) {
				
				var blockFeedback = popManager.getBlockFeedback(domain/*popManager.getBlockTopLevelDomain(block)*/, pageSection, block);
				$.each(keys, function(index, keyLevels) {

					// each param in params is an array of levels, to go down the blockParams to delete it (eg: 1 param will be ['params', 'hist_time'] to delete blockParams['params']['hist_time'])
					// Go down to the last level
					var feedbackLevel = blockFeedback;
					for (i = 0; i < (keyLevels.length)-1; i++) { 
						feedbackLevel = feedbackLevel[keyLevels[i]];
					}

					// Delete that last level
					delete feedbackLevel[keyLevels[(keyLevels.length)-1]];
				});
			}

		});
	},

	scrollTopOnUserLoggedInOut : function (args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, block = args.block, targets = args.targets;
		$(document).on('user:loggedinout:'+domain, function(e, source) {

			if (source == 'initialfeedback' || source == 'initialuserdata') {
				return;
			}

			targets.each(function() {
				var target = $(this);

				// Comment Leo 15/02/2017: Make sure the target still exists, because it may have been destroyed already but the hook still stays on
				if ($('#'+target.attr('id')).length) {
					var jsSettings = popManager.getJsSettings(domain, pageSection, block, target);
					var animate = jsSettings['scrolltop-animate'] || false;
					popManager.scrollToElem(target, target, animate);
				}
			});
		});
	},

	closeMessageFeedbacksOnPageSectionOpen : function(args) {

		var t = this;
		var pageSection = args.pageSection, targets = args.targets;

		popPageSectionManager.getGroup(pageSection).on('on.bs.pagesection-group:pagesection-'+pageSection.attr('id')+':opened', function() {

			// Needed to erase previous feedback messages. Eg: Reset password
			popManager.closeMessageFeedbacks(pageSection);
		});
	},

	closePageSectionOnSuccess : function(args) {

		var t = this;
		var pageSection = args.pageSection, targets = args.targets;
		var pssId = popManager.getSettingsId(pageSection);

		targets.on('fetched', function(e, response) {
	
			// Delete the textarea / fields if the form was successful
			var block = $(this);
			var bsId = popManager.getSettingsId(block);				
			var blockFeedback = response.feedback.block[pssId][bsId];

			// result = true means it was successful
			if (blockFeedback.result === true) {

				// get the time from the block
				var closeTime = block.data('closetime') || 0;
				t.timeoutClosePageSection(pageSection, closeTime);
				// setTimeout(function () {
					
				// 	popPageSectionManager.close(pageSection);

				// 	// After closing, also delete all the messageFeedbacks within. This way, after logging in, it deletes the 'Logged in successful'
				// 	// message for the next time we try to log in. And we close all, so that if a 'Log out unsuccessful' message was there, it will be gone also
				// 	popManager.closeMessageFeedbacks(pageSection);
				// }, closeTime);
			}
		});
	},

	closePageSectionOnTabpaneShown : function(args) {

		var t = this;
		var pageSection = args.pageSection, targets = args.targets;

		targets.each(function() {

			var block = $(this);
			var pageSectionPage = popManager.getPageSectionPage(block);

			pageSectionPage.on('shown.bs.tabpane', function() {

				popPageSectionManager.close(pageSection);
			});
			
			// Execute already since it is mostly used by the replicable blocks, so gotta close also on initialization
			popPageSectionManager.close(pageSection);
		});
	},

	//-------------------------------------------------
	// 'PRIVATE' FUNCTIONS
	//-------------------------------------------------

	timeoutClosePageSection : function(pageSection, closeTime) {

		var t = this;
		setTimeout(function () {
			
			popPageSectionManager.close(pageSection);

			// After closing, also delete all the messageFeedbacks within. This way, after logging in, it deletes the 'Logged in successful'
			// message for the next time we try to log in. And we close all, so that if a 'Log out unsuccessful' message was there, it will be gone also
			popManager.closeMessageFeedbacks(pageSection);
		}, closeTime);
	},

	execDestroyPageOnUserLoggedOut : function(domain, targets) {

		var t = this;

		$(document).one('user:loggedout:'+domain, function(e, source) {

			targets.each(function() {
		
				// To double-check that the object still exists in the DOM and was not removed when doing popManager.destroyPageSectionPage
				var block = $('#'+$(this).attr('id'));
				if (block.length) {
					var pageSection = popManager.getPageSection(block);
					var target = popManager.getFrameTarget(pageSection);
					popManager.triggerDestroyTarget(popManager.getTargetParamsScopeURL(block)/*block.data('paramsscope-url')*/, target);
				}
			});
		});
	},

	execDestroyPageOnUserNoRole : function(domain, pageSection, block) {

		var t = this;		
		var neededRole = block.data('neededrole');
		
		$(document).one('user:updated:'+domain, function(e, updates) {

			// To double-check that the object still exists in the DOM and was not removed when doing popManager.destroyPageSectionPage
			block = $('#'+block.attr('id'));
			if (block.length) {

				// If the roles where updated, check the needed role is still there. If not, destroy the page
				// Needed for when a Community sets "Do you accept members?" in false, then it's not a community anymore, then destroy "My Members" page
				if (updates.roles && updates.roles.indexOf(neededRole) == -1) {
					
					var target = popManager.getFrameTarget(pageSection);
					popManager.triggerDestroyTarget(popManager.getTargetParamsScopeURL(block)/*block.data('paramsscope-url')*/, target);
				}
				else {

					// Re-add the event handler
					t.execDestroyPageOnUserNoRole(domain, pageSection, block);
				}
			}
		});
	},
};
})(jQuery);

//-------------------------------------------------
// Initialize
//-------------------------------------------------
popJSLibraryManager.register(popEventReactions, ['closePageSectionOnTabpaneShown', 'resetOnSuccess', 'resetOnUserLogout', 'closeMessageFeedbacksOnPageSectionOpen', 'closePageSectionOnSuccess', 'destroyPageOnUserLoggedOut', 'destroyPageOnUserNoRole', 'deleteBlockFeedbackValueOnUserLoggedInOut', 'scrollTopOnUserLoggedInOut', 'destroyPageOnSuccess']);
