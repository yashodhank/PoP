<?php

/**---------------------------------------------------------------------------------------------------------------
 *
 * Configure the RSS Feed
 *
 * ---------------------------------------------------------------------------------------------------------------*/

define ('GD_CUSTOM_MAILCHIMP_STYLE_ANCHOR', 'word-wrap:break-word;color:#b95a34;font-weight:normal;text-decoration:underline;');
define ('GD_URLPARAM_RSSCAMPAIGN_WEEKLY', 'weekly');
define ('GD_URLPARAM_RSSCAMPAIGN_WEEKLY_IMAGEWIDTH', '132');

/**---------------------------------------------------------------------------------------------------------------
 * How to invoke the feed:
 * Latest posts: 
 * - https://getpop.org/events/feed/?campaign=weekly
 * ---------------------------------------------------------------------------------------------------------------*/

add_filter('the_author', 'gd_rss_author');
function gd_rss_author($output) {

	// If it's a feed, add also the URL of the author, and give it mailchimp's formatting
	if (is_feed() && $_REQUEST[GD_URLPARAM_RSSCAMPAIGN] == GD_URLPARAM_RSSCAMPAIGN_WEEKLY) {

		global $authordata;
		$url = get_author_posts_url($authordata->ID);
		// $url = GD_TemplateManager_Utils::add_tab($url, POP_COREPROCESSORS_PAGE_DESCRIPTION);
		$output = sprintf(
			'<a href="%s" style="%s">%s</a>',
			$url,
			GD_CUSTOM_MAILCHIMP_STYLE_ANCHOR,
			$output
		);
	}

	return $output;
}

add_filter('gd_rss_print_featured_image:img_attr', 'gd_custom_rss_featuredimage_size');
function gd_custom_rss_featuredimage_size($img_attr) {

	// Change the pic dimensions for the weekly campaign
	if ($_REQUEST[GD_URLPARAM_RSSCAMPAIGN] == GD_URLPARAM_RSSCAMPAIGN_WEEKLY) {

		$img_attr[2] = GD_URLPARAM_RSSCAMPAIGN_WEEKLY_IMAGEWIDTH / $img_attr[1] * $img_attr[2];
		$img_attr[1] = GD_URLPARAM_RSSCAMPAIGN_WEEKLY_IMAGEWIDTH;
	}

	return $img_attr;
}
