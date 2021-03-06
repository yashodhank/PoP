<?php
class PoPFrontend_Installation {

	function system_build() {

		global $pop_frontend_resourceloader_mappinggenerator, $pop_frontend_conversiongenerator;

		// CSS to Styles: generate the database
		$pop_frontend_conversiongenerator->generate();
		
		// Code splitting: extract all the mappings of functions calling other functions from all the .js files
		$pop_frontend_resourceloader_mappinggenerator->generate();
	}

	function system_generate_theme() {

		// ResourceLoader Config files
		if (PoP_Frontend_ServerUtils::use_code_splitting()) {

			// Delete the file containing the cached "abbreviations" from the ResourceLoader
			PoP_ResourceLoaderProcessorUtils::delete_abbreviations();
			
			global $pop_resourceloader_configfile_generator, $pop_resourceloader_resources_configfile_generator, $pop_resourceloader_initialresources_configfile_generator, $pop_resourceloader_hierarchyformatcombinationresources_configfile_generator;
			$pop_resourceloader_configfile_generator->generate();
			$pop_resourceloader_resources_configfile_generator->generate();
			$pop_resourceloader_initialresources_configfile_generator->generate();
			$pop_resourceloader_hierarchyformatcombinationresources_configfile_generator->generate();

	        // Important: run these 2 functions below at the end, so by then we will have created all dynamic resources (eg: initialresources.js)
	        // Generate the bundle(group) file with all the resources inside?
	        if (PoP_Frontend_ServerUtils::generate_bundle_files()) {

				global $pop_resourceloader_multiplefilegenerator_bundles;
				$pop_resourceloader_multiplefilegenerator_bundles->generate();
			}
			if (PoP_Frontend_ServerUtils::generate_bundlegroup_files()) {

				global $pop_resourceloader_multiplefilegenerator_bundlegroups;
				$pop_resourceloader_multiplefilegenerator_bundlegroups->generate();
			}

			// Save a new file containing the cached "abbreviations" from the ResourceLoader
			global $pop_resourceloader_abbreviationsstorage_manager;
			PoP_ResourceLoaderProcessorUtils::save_abbreviations();
		}
		
	}
}