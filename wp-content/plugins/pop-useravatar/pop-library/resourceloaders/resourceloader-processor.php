<?php
/**---------------------------------------------------------------------------------------------------------------
 *
 * Data Load Library
 *
 * ---------------------------------------------------------------------------------------------------------------*/

define ('POP_RESOURCELOADER_FILEUPLOAD', PoP_TemplateIDUtils::get_template_definition('fileupload'));
define ('POP_RESOURCELOADER_FILEUPLOADLOCALE', PoP_TemplateIDUtils::get_template_definition('fileupload-locale'));

class PoP_UserAvatar_ResourceLoaderProcessor extends PoP_ResourceLoaderProcessor {

	function get_resources_to_process() {

		return array(
			POP_RESOURCELOADER_FILEUPLOAD,
			POP_RESOURCELOADER_FILEUPLOADLOCALE,
		);
	}
	
	function get_filename($resource) {

		switch ($resource) {

			case POP_RESOURCELOADER_FILEUPLOADLOCALE:
				
				return pop_useravatar_get_locale_jsfilename();
		}
	
		$filenames = array(
			POP_RESOURCELOADER_FILEUPLOAD => 'fileupload',
		);
		if ($filename = $filenames[$resource]) {
			return $filename;
		}

		return parent::get_filename($resource);
	}
	
	function get_file_url($resource) {
	
		switch ($resource) {

			case POP_RESOURCELOADER_FILEUPLOADLOCALE:
				
				return pop_useravatar_get_locale_jsfile();
		}

		return parent::get_file_url($resource);
	}
	
	function get_suffix($resource) {

		switch ($resource) {

			case POP_RESOURCELOADER_FILEUPLOADLOCALE:
				
				return '';
		}

		return parent::get_suffix($resource);
	}
	
	function get_version($resource) {
	
		return POP_USERAVATAR_VERSION;
	}
	
	function get_dir($resource) {

		switch ($resource) {

			case POP_RESOURCELOADER_FILEUPLOADLOCALE:
				
				return POP_USERAVATAR_DIR.'/js/locales/fileupload/';
		}

		$subpath = PoP_Frontend_ServerUtils::use_minified_resources() ? 'dist/' : '';
		return POP_USERAVATAR_DIR.'/js/'.$subpath.'libraries';
	}
	
	function get_asset_path($resource) {

		switch ($resource) {

			case POP_RESOURCELOADER_FILEUPLOADLOCALE:

				return POP_USERAVATAR_DIR.'/js/locales/fileupload/'.$this->get_filename($resource).'.js';
		}

		return POP_USERAVATAR_DIR.'/js/libraries/'.$this->get_filename($resource).'.js';
	}
	
	function get_path($resource) {

		$subpath = PoP_Frontend_ServerUtils::use_minified_resources() ? 'dist/' : '';
		return POP_USERAVATAR_URI.'/js/'.$subpath.'libraries';
	}

	function get_jsobjects($resource) {

		$objects = array(
			POP_RESOURCELOADER_FILEUPLOAD => array(
				'popFileUpload',
			),
		);
		if ($object = $objects[$resource]) {

			return $object;
		}

		return parent::get_jsobjects($resource);
	}
		
	function extract_mapping($resource) {

		switch ($resource) {

			case POP_RESOURCELOADER_FILEUPLOADLOCALE:
				
				return false;
		}
	
		return parent::extract_mapping($resource);
	}
	
	function get_dependencies($resource) {

		$dependencies = parent::get_dependencies($resource);
	
		switch ($resource) {

			case POP_RESOURCELOADER_FILEUPLOAD:

				// Important: Keep the order below, or it produces a JS error when loading these libraries
				$dependencies[] = POP_RESOURCELOADER_EXTERNAL_FILEUPLOAD;
				$dependencies[] = POP_RESOURCELOADER_EXTERNAL_FILEUPLOADUI;
				$dependencies[] = POP_RESOURCELOADER_EXTERNAL_FILEUPLOADPROCESS;
				$dependencies[] = POP_RESOURCELOADER_EXTERNAL_FILEUPLOADVALIDATE;
				$dependencies[] = POP_RESOURCELOADER_FILEUPLOADLOCALE;
				break;
		}

		return $dependencies;
	}
}

/**---------------------------------------------------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------------------------------------------------------*/
new PoP_UserAvatar_ResourceLoaderProcessor();
