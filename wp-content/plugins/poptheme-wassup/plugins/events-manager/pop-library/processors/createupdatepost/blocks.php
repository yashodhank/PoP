<?php
/**---------------------------------------------------------------------------------------------------------------
 *
 * Template Manager (Handlebars)
 *
 * ---------------------------------------------------------------------------------------------------------------*/

define ('GD_TEMPLATE_BLOCK_EVENT_UPDATE', PoP_TemplateIDUtils::get_template_definition('block-event-update'));
define ('GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE', PoP_TemplateIDUtils::get_template_definition('block-eventlink-update'));
define ('GD_TEMPLATE_BLOCK_EVENT_CREATE', PoP_TemplateIDUtils::get_template_definition('block-event-create'));
define ('GD_TEMPLATE_BLOCK_EVENTLINK_CREATE', PoP_TemplateIDUtils::get_template_definition('block-eventlink-create'));

class GD_EM_Template_Processor_CreateUpdatePostBlocks extends GD_Template_Processor_BlocksBase {

	function get_templates_to_process() {
	
		return array(
			GD_TEMPLATE_BLOCK_EVENT_UPDATE,
			GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE,
			GD_TEMPLATE_BLOCK_EVENT_CREATE,
			GD_TEMPLATE_BLOCK_EVENTLINK_CREATE,
		);
	}

	protected function get_controlgroup_top($template_id) {

		switch ($template_id) {

			case GD_TEMPLATE_BLOCK_EVENT_CREATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_CREATE:

				return GD_TEMPLATE_CONTROLGROUP_CREATEPOST;

			case GD_TEMPLATE_BLOCK_EVENT_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE:

				return GD_TEMPLATE_CONTROLGROUP_EDITPOST;
		}
		
		return parent::get_controlgroup_top($template_id);
	}

	protected function get_messagefeedback($template_id) {

		$feedbacks = array(
			GD_TEMPLATE_BLOCK_EVENT_CREATE => GD_TEMPLATE_MESSAGEFEEDBACK_EVENT_CREATE,
			GD_TEMPLATE_BLOCK_EVENTLINK_CREATE => GD_TEMPLATE_MESSAGEFEEDBACK_EVENT_CREATE,
			GD_TEMPLATE_BLOCK_EVENT_UPDATE => GD_TEMPLATE_MESSAGEFEEDBACK_EVENT_UPDATE,
			GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE => GD_TEMPLATE_MESSAGEFEEDBACK_EVENT_UPDATE,
		);
	
		if ($feedback = $feedbacks[$template_id]) {

			return $feedback;
		}

		return parent::get_messagefeedback($template_id);
	}

	protected function get_block_inner_templates($template_id) {

		$ret = parent::get_block_inner_templates($template_id);

		$block_inners = array(
			GD_TEMPLATE_BLOCK_EVENT_UPDATE => GD_TEMPLATE_FORM_EVENT_UPDATE,
			GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE => GD_TEMPLATE_FORM_EVENTLINK_UPDATE,
			GD_TEMPLATE_BLOCK_EVENT_CREATE => GD_TEMPLATE_FORM_EVENT_CREATE,
			GD_TEMPLATE_BLOCK_EVENTLINK_CREATE => GD_TEMPLATE_FORM_EVENTLINK_CREATE,
		);

		switch ($template_id) {

			case GD_TEMPLATE_BLOCK_EVENT_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENT_CREATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_CREATE:

				$ret[] = $block_inners[$template_id];
				break;
		}
	
		return $ret;
	}

	function get_block_jsmethod($template_id, $atts) {

		$ret = parent::get_block_jsmethod($template_id, $atts);
		
		switch ($template_id) {

			case GD_TEMPLATE_BLOCK_EVENT_CREATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_CREATE:

				$this->add_jsmethod($ret, 'formCreatePostBlock');
				break;
		}
		switch ($template_id) {
		
			case GD_TEMPLATE_BLOCK_EVENT_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE:

				$this->add_jsmethod($ret, 'destroyPageOnUserLoggedOut');
				$this->add_jsmethod($ret, 'refetchBlockOnUserLoggedIn');
				break;
		}
		
		return $ret;
	}

	function init_atts($template_id, &$atts) {

		switch ($template_id) {

			case GD_TEMPLATE_BLOCK_EVENT_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENT_CREATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_CREATE:

				$updates = array(
					GD_TEMPLATE_BLOCK_EVENT_UPDATE,
					GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE,
				);
				$class = 'pop-block-createupdatepost ';
				if (in_array($template_id, $updates)) {
					$class .= 'pop-block-update-post';
				}
				else {
					$class .= 'pop-block-create-post';
				}
				$this->append_att($template_id, $atts, 'class', $class);
				$this->add_att(GD_TEMPLATE_STATUS, $atts, 'loading-msg', __('Submitting...', 'poptheme-wassup'));
				break;
		}

		switch ($template_id) {

			case GD_TEMPLATE_BLOCK_EVENT_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENT_CREATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_CREATE:

				if (PoPTheme_Wassup_Utils::get_addcontent_target() == GD_URLPARAM_TARGET_ADDONS) {
				
					$this->append_att($template_id, $atts, 'class', 'addons-nocontrols');
				}
				break;
		}
		
		return parent::init_atts($template_id, $atts);
	}

	function get_dataloader($template_id) {
	
		switch ($template_id) {

			case GD_TEMPLATE_BLOCK_EVENT_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE:

				return GD_DATALOADER_EDITEVENT;

			case GD_TEMPLATE_BLOCK_EVENT_CREATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_CREATE:

				return GD_DATALOADER_NOPOSTS;
		}

		return parent::get_dataloader($template_id);
	}

	protected function get_iohandler($template_id) {

		switch ($template_id) {

			case GD_TEMPLATE_BLOCK_EVENT_CREATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_CREATE:

				return GD_DATALOAD_IOHANDLER_ADDPOST;
					
			case GD_TEMPLATE_BLOCK_EVENT_UPDATE:
			case GD_TEMPLATE_BLOCK_EVENTLINK_UPDATE:

				return GD_DATALOAD_IOHANDLER_EDITPOST;
		}
		
		return parent::get_iohandler($template_id);
	}
}


/**---------------------------------------------------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------------------------------------------------------*/
new GD_EM_Template_Processor_CreateUpdatePostBlocks();