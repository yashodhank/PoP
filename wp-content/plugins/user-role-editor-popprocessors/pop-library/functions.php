<?php

/**---------------------------------------------------------------------------------------------------------------
 *
 * User Role Editor plugin Functions
 *
 * ---------------------------------------------------------------------------------------------------------------*/

// add_filter('GD_TemplateManager_Utils:get_vars', 'gd_ure_templatemanager_utils_vars');
// function gd_ure_templatemanager_utils_vars($vars) {
// 
// 	// Add source param for Organizations: view their profile as Community or Organization
// 	$vars = GD_TemplateManager_Utils::get_vars();
// 	if ($vars['global-state']['is-author']/*is_author()*/) {
// 
// 		$author = $vars['global-state']['author']/*global $author*/;
// 		if (gd_ure_is_organization($author)) {
// 
// 			$source = $_REQUEST[GD_URLPARAM_URECONTENTSOURCE];
// 			$sources = array(
// 				GD_URLPARAM_URECONTENTSOURCE_ORGANIZATION,
// 				GD_URLPARAM_URECONTENTSOURCE_COMMUNITY,
// 			);
// 			if (!in_array($source, $sources)) {
// 				$source = gd_ure_get_default_contentsource();
// 			}
// 			
// 			$vars['source'] = $source;
// 		}
// 	}
// 
// 	return $vars;
// }

add_filter('GD_Template_CacheProcessor:add_vars', 'gd_ure_cacheprocessor_addvars');
function gd_ure_cacheprocessor_addvars($filename) {

	// Add source param for Organizations: view their profile as Community or Organization
	$vars = GD_TemplateManager_Utils::get_vars();
	if ($vars['global-state']['is-author']/*is_author()*/) {

		$author = $vars['global-state']['author']/*global $author*/;
		if (gd_ure_is_organization($author)) {

			$vars = GD_TemplateManager_Utils::get_vars();		
			if ($source = $vars['source']) {
				
				// $filename .= '-source_'.$source;
				$filename .= '-'.$source;
			}
		}
	}

	return $filename;
}

add_filter('GD_Template_Processor_CustomSectionBlocks:get_dataload_source:author', 'gd_ure_add_source_param', 10, 2);
function gd_ure_add_source_param($url, $user_id) {

	if (gd_ure_is_community($user_id)) {

		$vars = GD_TemplateManager_Utils::get_vars();
		$source = $vars['source'];
		$url = GD_URE_TemplateManager_Utils::add_source($url, $source);
	}

	return $url;
}