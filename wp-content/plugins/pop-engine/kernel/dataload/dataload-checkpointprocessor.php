<?php
/**---------------------------------------------------------------------------------------------------------------
 *
 * Template Configuration
 *
 * ---------------------------------------------------------------------------------------------------------------*/

class GD_Dataload_CheckpointProcessor {

	function __construct() {

		add_action('init', array($this, 'init'));
	}

	function init() {

		global $gd_dataload_checkpointprocessor_manager;
		$gd_dataload_checkpointprocessor_manager->add($this, $this->get_checkpoints_to_process());
	}
	
	function get_checkpoints_to_process() {
	
		return array();
	}

	function process($checkpoint) {
	
		// By default, no problem at all, so always return true
		return true;
	}
}