<?php
/**---------------------------------------------------------------------------------------------------------------
 *
 * Template Manager (Handlebars)
 *
 * ---------------------------------------------------------------------------------------------------------------*/

define ('GD_TEMPLATE_LAYOUTPOST_TYPEAHEAD_SELECTED', PoP_TemplateIDUtils::get_template_definition('layoutpost-typeahead-selected'));

class GD_Template_Processor_PostTypeaheadSelectedLayouts extends GD_Template_Processor_PostTypeaheadSelectedLayoutsBase {

	function get_templates_to_process() {
	
		return array(
			GD_TEMPLATE_LAYOUTPOST_TYPEAHEAD_SELECTED,
		);
	}
}


/**---------------------------------------------------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------------------------------------------------------*/
new GD_Template_Processor_PostTypeaheadSelectedLayouts();