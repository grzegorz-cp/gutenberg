/**
 * External dependencies
 */
import * as Ariakit from '@ariakit/react';
import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { COLORS, font, rtl, CONFIG } from '../utils';
import { space } from '../utils/space';
import Icon from '../icon';
import { Truncate } from '../truncate';
import type { DropdownMenuContext } from './types';

const ANIMATION_PARAMS = {
	SLIDE_AMOUNT: '2px',
	DURATION: '400ms',
	EASING: 'cubic-bezier( 0.16, 1, 0.3, 1 )',
};

const CONTENT_WRAPPER_PADDING = space( 1 );
const ITEM_PADDING_BLOCK = space( 2 );
const ITEM_PADDING_INLINE = space( 3 );

// TODO:
// - border color and divider color are different from COLORS.theme variables
// - lighter text color is not defined in COLORS.theme, should it be?
// - lighter background color is not defined in COLORS.theme, should it be?
const DEFAULT_BORDER_COLOR = COLORS.theme.gray[ 300 ];
const DIVIDER_COLOR = COLORS.theme.gray[ 200 ];
const LIGHTER_TEXT_COLOR = COLORS.theme.gray[ 700 ];
const LIGHT_BACKGROUND_COLOR = COLORS.theme.gray[ 100 ];
const TOOLBAR_VARIANT_BORDER_COLOR = COLORS.theme.foreground;
const DEFAULT_BOX_SHADOW = `0 0 0 ${ CONFIG.borderWidth } ${ DEFAULT_BORDER_COLOR }, ${ CONFIG.elevationXSmall }`;
const TOOLBAR_VARIANT_BOX_SHADOW = `0 0 0 ${ CONFIG.borderWidth } ${ TOOLBAR_VARIANT_BORDER_COLOR }`;

const GRID_TEMPLATE_COLS = 'minmax( 0, max-content ) 1fr';

const slideUpAndFade = keyframes( {
	'0%': {
		opacity: 0,
		transform: `translateY(${ ANIMATION_PARAMS.SLIDE_AMOUNT })`,
	},
	'100%': { opacity: 1, transform: 'translateY(0)' },
} );

const slideRightAndFade = keyframes( {
	'0%': {
		opacity: 0,
		transform: `translateX(-${ ANIMATION_PARAMS.SLIDE_AMOUNT })`,
	},
	'100%': { opacity: 1, transform: 'translateX(0)' },
} );

const slideDownAndFade = keyframes( {
	'0%': {
		opacity: 0,
		transform: `translateY(-${ ANIMATION_PARAMS.SLIDE_AMOUNT })`,
	},
	'100%': { opacity: 1, transform: 'translateY(0)' },
} );

const slideLeftAndFade = keyframes( {
	'0%': {
		opacity: 0,
		transform: `translateX(${ ANIMATION_PARAMS.SLIDE_AMOUNT })`,
	},
	'100%': { opacity: 1, transform: 'translateX(0)' },
} );

export const DropdownMenu = styled( Ariakit.Menu )<
	Pick< DropdownMenuContext, 'variant' >
>`
	position: relative;
	/* Same as popover component */
	/* TODO: is there a way to read the sass variable? */
	z-index: 1000000;

	display: grid;
	grid-template-columns: ${ GRID_TEMPLATE_COLS };
	grid-template-rows: auto;

	box-sizing: border-box;
	min-width: 160px;
	max-width: 320px;
	max-height: var( --popover-available-height );
	padding: ${ CONTENT_WRAPPER_PADDING };

	background-color: ${ COLORS.ui.background };
	border-radius: ${ CONFIG.radiusMedium };
	${ ( props ) => css`
		box-shadow: ${ props.variant === 'toolbar'
			? TOOLBAR_VARIANT_BOX_SHADOW
			: DEFAULT_BOX_SHADOW };
	` }

	overscroll-behavior: contain;
	overflow: auto;

	/* Only visible in Windows High Contrast mode */
	outline: 2px solid transparent !important;

	/* Animation */
	&[data-open] {
		@media not ( prefers-reduced-motion ) {
			animation-duration: ${ ANIMATION_PARAMS.DURATION };
			animation-timing-function: ${ ANIMATION_PARAMS.EASING };
			will-change: transform, opacity;
			/* Default animation.*/
			animation-name: ${ slideDownAndFade };
			&[data-side='left'] {
				animation-name: ${ slideLeftAndFade };
			}
			&[data-side='up'] {
				animation-name: ${ slideUpAndFade };
			}
			&[data-side='right'] {
				animation-name: ${ slideRightAndFade };
			}
		}
	}
`;

const baseItem = css`
	all: unset;

	position: relative;
	min-height: ${ space( 10 ) };
	box-sizing: border-box;

	/* Occupy the width of all grid columns (ie. full width) */
	grid-column: 1 / -1;

	display: grid;
	grid-template-columns: ${ GRID_TEMPLATE_COLS };
	align-items: center;

	@supports ( grid-template-columns: subgrid ) {
		/*
		 * Define a grid layout which inherits the same columns configuration
		 * from the parent layout (ie. subgrid). This allows the menu
		 * to synchronize the indentation of all its items.
		 */
		grid-template-columns: subgrid;
	}

	font-size: ${ font( 'default.fontSize' ) };
	font-family: inherit;
	font-weight: normal;
	line-height: 20px;

	color: ${ COLORS.theme.foreground };
	border-radius: ${ CONFIG.radiusSmall };

	padding-block: ${ ITEM_PADDING_BLOCK };
	padding-inline: ${ ITEM_PADDING_INLINE };

	/*
	 * Make sure that, when an item is scrolled into view (eg. while using the
	 * keyboard to move focus), the whole item comes into view
	 */
	scroll-margin: ${ CONTENT_WRAPPER_PADDING };

	user-select: none;
	outline: none;

	&[aria-disabled='true'] {
		color: ${ COLORS.ui.textDisabled };
		cursor: not-allowed;
	}

	/* Active item (including hover)
	 * Note: we should be able to remove :focus-visible once
	 * https://github.com/ariakit/ariakit/issues/4083 is fixed and released
	 */
	&[data-active-item]:not( [data-focus-visible] ):not( :focus-visible ):not(
			[aria-disabled='true']
		) {
		background-color: ${ COLORS.theme.accent };
		color: ${ COLORS.white };
	}

	/* Keyboard focus (focus-visible)
	 * Note: we should be able to remove :focus-visible once
	 * https://github.com/ariakit/ariakit/issues/4083 is fixed and released
	 */
	&[data-focus-visible],
	&:focus-visible {
		box-shadow: 0 0 0 1.5px ${ COLORS.theme.accent };

		/* Only visible in Windows High Contrast mode */
		outline: 2px solid transparent;
	}

	/* Active (ie. pressed, mouse down) */
	&:active,
	&[data-active] {
		/* TODO: should there be a visual active state? */
	}

	/* When the item is the trigger of an open submenu */
	${ DropdownMenu }:not(:focus) &:not(:focus)[aria-expanded="true"] {
		background-color: ${ LIGHT_BACKGROUND_COLOR };
		color: ${ COLORS.theme.foreground };
	}

	svg {
		fill: currentColor;
	}
`;

export const DropdownMenuItem = styled( Ariakit.MenuItem )`
	${ baseItem };
`;

export const DropdownMenuCheckboxItem = styled( Ariakit.MenuItemCheckbox )`
	${ baseItem };
`;

export const DropdownMenuRadioItem = styled( Ariakit.MenuItemRadio )`
	${ baseItem };
`;

export const ItemPrefixWrapper = styled.span`
	/* Always occupy the first column, even when auto-collapsing */
	grid-column: 1;

	/*
	 * Even when the item is not checked, occupy the same screen space to avoid
	 * the space collapside when no items are checked.
	 */
	${ DropdownMenuCheckboxItem } > &,
	${ DropdownMenuRadioItem } > & {
		/* Same width as the check icons */
		min-width: ${ space( 6 ) };
	}

	${ DropdownMenuCheckboxItem } > &,
	${ DropdownMenuRadioItem } > &,
	&:not( :empty ) {
		margin-inline-end: ${ space( 2 ) };
	}

	display: flex;
	align-items: center;
	justify-content: center;

	color: ${ LIGHTER_TEXT_COLOR };

	/*
	* When the parent menu item is active, except when it's a non-focused/hovered
	* submenu trigger (in that case, color should not be inherited)
	*/
	[data-active-item]:not( [data-focus-visible] ) > &,
	/* When the parent menu item is disabled */
	[aria-disabled='true'] > & {
		color: inherit;
	}
`;

export const DropdownMenuItemContentWrapper = styled.div`
	/*
	 * Always occupy the second column, since the first column
	 * is taken by the prefix wrapper (when displayed).
	 */
	grid-column: 2;

	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${ space( 3 ) };

	pointer-events: none;
`;

export const DropdownMenuItemChildrenWrapper = styled.div`
	flex: 1;

	display: inline-flex;
	flex-direction: column;
	gap: ${ space( 1 ) };
`;

export const ItemSuffixWrapper = styled.span`
	flex: 0 1 fit-content;
	min-width: 0;
	width: fit-content;

	display: flex;
	align-items: center;
	justify-content: center;
	gap: ${ space( 3 ) };

	color: ${ LIGHTER_TEXT_COLOR };

	/*
	 * When the parent menu item is active, except when it's a non-focused/hovered
	 * submenu trigger (in that case, color should not be inherited)
	 */
	[data-active-item]:not( [data-focus-visible] ) *:not(${ DropdownMenu }) &,
	/* When the parent menu item is disabled */
	[aria-disabled='true'] *:not(${ DropdownMenu }) & {
		color: inherit;
	}
`;

export const DropdownMenuGroup = styled( Ariakit.MenuGroup )`
	/* Ignore this element when calculating the layout. Useful for subgrid */
	display: contents;
`;

export const DropdownMenuGroupLabel = styled( Ariakit.MenuGroupLabel )`
	/* Occupy the width of all grid columns (ie. full width) */
	grid-column: 1 / -1;

	padding-block-start: ${ space( 3 ) };
	padding-block-end: ${ space( 2 ) };
	padding-inline: ${ ITEM_PADDING_INLINE };
`;

export const DropdownMenuSeparator = styled( Ariakit.MenuSeparator )<
	Pick< DropdownMenuContext, 'variant' >
>`
	/* Occupy the width of all grid columns (ie. full width) */
	grid-column: 1 / -1;

	border: none;
	height: ${ CONFIG.borderWidth };
	background-color: ${ ( props ) =>
		props.variant === 'toolbar'
			? TOOLBAR_VARIANT_BORDER_COLOR
			: DIVIDER_COLOR };
	/* Align with menu items' content */
	margin-block: ${ space( 2 ) };
	margin-inline: ${ ITEM_PADDING_INLINE };

	/* Only visible in Windows High Contrast mode */
	outline: 2px solid transparent;
`;

export const SubmenuChevronIcon = styled( Icon )`
	width: ${ space( 1.5 ) };
	${ rtl(
		{
			transform: `scaleX(1)`,
		},
		{
			transform: `scaleX(-1)`,
		}
	) };
`;

export const DropdownMenuItemLabel = styled( Truncate )`
	font-size: ${ font( 'default.fontSize' ) };
	line-height: 20px;
	color: inherit;
`;

export const DropdownMenuItemHelpText = styled( Truncate )`
	font-size: ${ font( 'helpText.fontSize' ) };
	line-height: 16px;
	color: ${ LIGHTER_TEXT_COLOR };
	word-break: break-all;

	[data-active-item]:not( [data-focus-visible] ) *:not( ${ DropdownMenu } ) &,
	[aria-disabled='true'] *:not( ${ DropdownMenu } ) & {
		color: inherit;
	}
`;
