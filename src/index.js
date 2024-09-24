import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import { ToggleControl } from '@wordpress/components';
import { TextareaControl } from '@wordpress/components';
import { SelectControl } from '@wordpress/components';
import { ColorPicker } from '@wordpress/components';
import { Button } from '@wordpress/components';

import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useEffect } from '@wordpress/element';

import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { NoticeList } from '@wordpress/components';

import './index.scss';

const useSettings = () => {
	const [ show, setShow ] = useState();
	const [ message, setMessage ] = useState();
	const [ position, setPosition ] = useState();
	const [ animate, setAnimate ] = useState();
	const [ color, setColor ] = useState();

	const { createSuccessNotice } = useDispatch( noticesStore );

	useEffect( () => {
		apiFetch( { path: '/wp/v2/settings' } ).then( ( settings ) => {
			setShow( settings.wpbzh.show );
			setMessage( settings.wpbzh.message );
			setPosition( settings.wpbzh.position );
			setAnimate( settings.wpbzh.animate );
			setColor( settings.wpbzh.color );
		} );
	}, [] );

	const saveSettings = () => {
		apiFetch( {
			path: '/wp/v2/settings',
			method: 'POST',
			data: {
				wpbzh: {
					show,
					message,
					position,
					animate,
					color,
				},
			},
		} ).then( () => {
			createSuccessNotice(
				__( 'Réglages enregistrés.', 'wpbzh' )
			);
		} );
	};

	return {
		show,
		setShow,
		message,
		setMessage,
		position,
		setPosition,
		animate,
		setAnimate,
		color,
		setColor,
		saveSettings,
	};
};

const ShowControl = ( { value, onChange } ) => {
	return (
		<ToggleControl
			label={ __( 'Afficher sur le site', 'wpbzh' ) }
			checked={ value }
			onChange={ onChange }
			__nextHasNoMarginBottom
		/>
	);
};

const MessageControl = ( { value, onChange } ) => {
	return (
		<TextareaControl
			label={ __( 'Mon message', 'wcbzh' ) }
			help={ __('Indiquer ici le message à afficher dans le bandeau WCBZH', 'wcbzh' ) }
			value={ value }
			onChange={ onChange }
			__nextHasNoMarginBottom
		/>
	);
};

const PositionControl = ( { value, onChange } ) => {
	return (
		<SelectControl
			label={ __( 'Position du message', 'wpbzh' ) }
			options={ [
				{
					label: __( 'Haut', 'wpbzh' ),
					value: 'top'
				}, {
					label: __( 'Bas', 'wpbzh' ),
					value: 'bottom'
				},
			] }
			value={ value }
			onChange={ onChange }
			__nextHasNoMarginBottom
		/>
	);
};

const AnimateControl = ( { value, onChange } ) => {
	return (
		<ToggleControl
			label={ __( 'Utiliser une animation moderne pour mettre en valeur le bandeau ?', 'wpbzh' ) }
			checked={ value }
			onChange={ onChange }
			__nextHasNoMarginBottom
		/>
	);
};

const ColorControl = ( { color, onChange } ) => {
	return (
		<ColorPicker
			color={ color }
			copyFormat="hex"
			onChange={ onChange }
		/>
	);
};

const SaveButton = ( { onClick } ) => {
	return (
		<Button variant="primary" onClick={ onClick } __next40pxDefaultSize>
			{ __( 'Enregistrer les modifs', 'wpbzh' ) }
		</Button>
	);
};

const Notices = () => {
	const { removeNotice } = useDispatch( noticesStore );
	const notices = useSelect( ( select ) =>
		select( noticesStore ).getNotices()
	);

	if ( notices.length === 0 ) {
		return null;
	}

	return <NoticeList notices={ notices } onRemove={ removeNotice } />;
};

const SettingsPage = () => {
	const {
		show,
		setShow,
		message,
		setMessage,
		position,
		setPosition,
		animate,
		setAnimate,
		color,
		setColor,
		saveSettings,
	} = useSettings();

	return (
	<>
		<Panel>
			<PanelBody>
				<PanelRow>
					<ShowControl
						value={ show }
						onChange={ ( value ) => setShow( value ) }
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={ 'Contenu du message' }
				initialOpen={ false }
			>
				<PanelRow>
					<MessageControl
						value={ message }
						onChange={ ( value ) => setMessage( value ) }
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={ 'Apparence du message' }
				initialOpen={ false }
			>
				<PanelRow>
					<PositionControl
						__nextHasNoMarginBottom
						onChange={ ( value ) => setPosition( value ) }
						value={position}
						options={[
							{
								label: __( 'Haut', 'wpbzh' ),
								value: 'top'
							}, {
								label: __( 'Bas', 'wpbzh' ),
								value: 'bottom'
							}
						]}
					/>
				</PanelRow>
				<PanelRow>
					<AnimateControl
						value={ animate }
						onChange={ ( value ) => setAnimate( value ) }
					/>
				</PanelRow>
				<PanelRow>
						<label class="components-base-control__label custom-label">{ __( 'Couleur de fond du bandeau', 'wpbzh' ) }</label>
					</PanelRow>
					<PanelRow>
						<ColorControl
							color={ color }
							onChange={ ( color ) => setColor( color ) }
						/>
					</PanelRow>
			</PanelBody>
		</Panel>
		<SaveButton onClick={ saveSettings } />
		<Notices />
	</>
	);
};

domReady( () => {
	const root = createRoot(
		document.getElementById( 'wcbzh-settings' )
	);

	root.render( <SettingsPage /> );
} );
