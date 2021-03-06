(function($){
popDatasetCount = {

	//-------------------------------------------------
	// PUBLIC FUNCTIONS
	//-------------------------------------------------

	displayBlockDatasetCount : function(args) {

		var t = this;
		var domain = args.domain, pageSection = args.pageSection, block = args.block;

		if (block.data('datasetcount-target')) {

			var jsSettings = popManager.getJsSettings(domain, pageSection, block);

			// By default: execute only when the block is created
			var when = jsSettings['display-datasetcount-when'] || ['oncreated'];
			var updateTitle = jsSettings['datasetcount-updatetitle'];

			// Wait until the document has fully loaded, to make sure the target has been added in the DOM
			// Otherwise, when first loading the website, it will fail since the JS executes before the elem is in the DOM
			if (when.indexOf('oncreated') > -1) {
			
				$(document).ready(function($) {
					var target = $(block.data('datasetcount-target'));
					popManager.displayDatasetCount(domain, pageSection, block, target, updateTitle);
				});
			}
			
			// Needed for the Log-in, since we're fetching data and then the block will trigger 'rendered', then execute
			if (when.indexOf('onrendered') > -1) {
				block.on('rendered', function(e) {
					var target = $(block.data('datasetcount-target'));
					popManager.displayDatasetCount(domain, pageSection, block, target, updateTitle);
				});
			}
		}
	},

	clearDatasetCount : function(args) {

		var t = this;
		var pageSection = args.pageSection, block = args.block, targets = args.targets;

		targets.each(function() {
			
			var link = $(this);
			var target = $(link.data('datasetcount-target'));
			// Can't use jsSettings because we don't have the settings for the pageSection notifications link
			// var jsSettings = popManager.getJsSettings(pageSection, block, target);
			// var updateTitle = jsSettings['update-title'];
			var updateTitle = link.data('datasetcount-updatetitle') ? true : false;
			link.click(function(e) {
				e.preventDefault();
				t.execClearDatasetCount(target, updateTitle);
			});
			link.hover(function() {
				t.execClearDatasetCount(target, updateTitle);
			});
		});
	},

	clearDatasetCountOnUserLoggedOut : function(args) {

		var t = this;
		var pageSection = args.pageSection, block = args.block, targets = args.targets;
		targets.each(function() {
			
			var link = $(this);
			var target = $(link.data('datasetcount-target'));
			// Can't use jsSettings because we don't have the settings for the pageSection notifications link
			// var jsSettings = popManager.getJsSettings(pageSection, block, target);
			// var updateTitle = jsSettings['update-title'];
			var updateTitle = link.data('datasetcount-updatetitle') ? true : false;
			$(document).on('user:loggedout', function(e) {
				t.execClearDatasetCount(target, updateTitle);
			});
		});
	},

	//-------------------------------------------------
	// 'PRIVATE' FUNCTIONS
	//-------------------------------------------------

	execClearDatasetCount : function(target, updateTitle) {

		var t = this;
		target.html('').addClass('hidden');

		// Delete the datasetCount from the document title
		if (updateTitle) {
			document.title = popManager.documentTitle;
		}
	},
};
})(jQuery);

//-------------------------------------------------
// Initialize
//-------------------------------------------------
popJSLibraryManager.register(popDatasetCount, ['displayBlockDatasetCount', 'clearDatasetCount', 'clearDatasetCountOnUserLoggedOut']);
