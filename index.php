<?php
/**
 * Plugin Name: WordCamp Bretagne
 * Author: jb Audras
 * Description: Test de différents composants Gutenberg pour le WordCamp Bretagne
 */

/**
 * Déclaration des scripts et des styles utilisés par l'extension.
 */
 function wcbzh_admin_enqueue_scripts( $admin_page ) {
	if ( 'settings_page_wcbzh' !== $admin_page ) { return; }
	$asset_file = plugin_dir_path( __FILE__ ) . 'build/index.asset.php';
	if ( ! file_exists( $asset_file ) ) { return; }
	$asset = include $asset_file;

	wp_enqueue_script(
		'wcbzh-scripts',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset['dependencies'],
		$asset['version'],
		array( 'in_footer' => true )
	);

	wp_enqueue_style(
		'wcbzh-style',
		plugins_url( 'build/index.css', __FILE__ ),
		array_filter(
			$asset['dependencies'],
			function ( $style ) {
				return wp_style_is( $style, 'registered' );
			}
		),
		$asset['version'],
	);
}
add_action( 'admin_enqueue_scripts', 'wcbzh_admin_enqueue_scripts' );

/**
 * Déclaration d'une page d'option personnalisée sous le menu Réglages.
 */
function wcbzh_add_option_page() { 
	add_options_page(
		__( 'WCBZH options', 'wcbzh' ),
		__('WCBZH', 'wcbzh' ),
		'manage_options',
		'wcbzh',
		'wcbzh_options_page'
	);
}
add_action( 'admin_menu', 'wcbzh_add_option_page' );

/**
 * Ajout d'un placeholder au sein de la page de réglages de l'extension.
 */
function wcbzh_options_page() { 
	printf(
		'<h1>' . esc_html__( 'WordCamp Bretagne', 'wcbzh' ) . '</h1>' .
		'<div class="wrap" id="wcbzh-settings">%s</div>',
		esc_html__( 'Chargement de la page…', 'wcbzh' )
	);
}

/**
 * Déclaration des réglages de l'extension au sein du endpoint
 * settings de l'API REST de WordPress.
 */
function wcbzh_settings() {
	$default = array(
		'show'     => false,
		'message'  => __( 'Demat WordCamp Bretagne', 'wpbzh' ),
		'position' => 'top',
		'animate'  => false,
		'color'    => '#000',
	);
	$schema  = array(
		'type' => 'object',
		'properties' => array(
			'show'  => array(
				'type' => 'boolean',
			),
			'message'  => array(
				'type' => 'string',
			),
			'position' => array(
				'type' => 'string',
			),
			'animate' => array(
				'type' => 'boolean',
			),
			'color'    => array(
				'type' => 'string',
			),
		),
	);

	register_setting(
		'options',
		'wpbzh',
		array(
			'type'         => 'object',
			'default'      => $default,
			'show_in_rest' => array(
				'schema' => $schema,
			),
		)
	);
}
add_action( 'init', 'wcbzh_settings' );

/**
 * Gestion de l'affichage du bandeau en front-end en fonction des options choisies.
 */
function wcbzh_display_notice() {
	$wpbzh_options = get_option( 'wpbzh' );
	$show     = isset( $wpbzh_options['show'] ) ? $wpbzh_options['show'] : false;
	$message  = isset( $wpbzh_options['message'] ) ? $wpbzh_options['message'] : '';
	$position = isset( $wpbzh_options['position'] ) ? $wpbzh_options['position'] : '';
	$color    = isset( $wpbzh_options['color'] ) ? $wpbzh_options['color'] : '';
	$animate  = isset( $wpbzh_options['animate'] ) ? $wpbzh_options['animate'] : false;

	if ( ! $show || empty( $message ) ) { return; }

	$style  = '#wpbzh { position: fixed; z-index: 99; width: 100%; padding: 1em 2em; color: #fff; font-size: 2em;';
	$style .= ( 'bottom' === $position ) ? 'bottom: 0;': 'top: 0;';
	$style .= ( $color ) ? 'background-color:' . esc_attr( $color ) . ';': '#fff';
	$style .= '</style>';

	$tag_start = '<div id="wpbzh">';
	$tag_end   = '</div>';
	if ( $animate ) {
		$tag_start = '<marquee id="wpbzh" behavior="alternate" scrolldelay="20" truespeed>';
		$tag_end   = '</marquee>';
	}
	?>
	<style><?php echo esc_html( $style ); ?></style>
	<?php echo $tag_start; ?>
		<?php echo esc_html( $message ); ?>
	<?php echo $tag_end; ?>
	<?php
}
add_action( 'wp_body_open', 'wcbzh_display_notice' );
