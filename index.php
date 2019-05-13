<?php

/**
 * Plugin Name: Table of Contents
 * Plugin URI: https://github.com/WordPress/gutenberg-examples
 * Description: This is a plugin to supply a table of contents block
 * Version: 1.0.0
 * Author: Nicola Heald
 *
 * @package toc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Load all translations for our plugin from the MO file.
*/
add_action( 'init', 'gutenberg_examples_01_esnext_load_textdomain' );

function gutenberg_examples_01_esnext_load_textdomain() {
	load_plugin_textdomain( 'gutenberg-examples', false, basename( __DIR__ ) . '/languages' );
}

/**
 * Registers all block assets so that they can be enqueued through Gutenberg in
 * the corresponding context.
 *
 * Passes translations to JavaScript.
 */
function gutenberg_examples_01_esnext_register_block() {

	if ( ! function_exists( 'register_block_type' ) ) {
		// Gutenberg is not active.
		return;
	}

	wp_register_script(
		'gutenberg-examples-01-esnext',
		plugins_url( 'build/index.js', __FILE__ ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components', 'wp-block-editor' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' )
	);

	wp_register_style(
		'gutenberg-examples-01-esnext-editor',
		plugins_url( 'editor.css', __FILE__ ),
		array( ),
		filemtime( plugin_dir_path( __FILE__ ) . 'editor.css' )
	);

	wp_register_style(
		'gutenberg-examples-01-esnext',
		plugins_url( 'style.css', __FILE__ ),
		array( ),
		filemtime( plugin_dir_path( __FILE__ ) . 'style.css' )
	);

	register_block_type( 'gutenberg-examples/example-01-basic-esnext', array(
		'editor_script' => 'gutenberg-examples-01-esnext',
		'style'         => 'gutenberg-examples-01-esnext',
		'editor_style'  => 'gutenberg-examples-01-esnext-editor',
	) );

  if ( function_exists( 'wp_set_script_translations' ) ) {
    /**
     * May be extended to wp_set_script_translations( 'my-handle', 'my-domain',
     * plugin_dir_path( MY_PLUGIN ) . 'languages' ) ). For details see
     * https://make.wordpress.org/core/2018/11/09/new-javascript-i18n-support-in-wordpress/
     */
    wp_set_script_translations( 'gutenberg-examples-01-esnext', 'gutenberg-examples' );
  }

}
add_action( 'init', 'gutenberg_examples_01_esnext_register_block' );
