/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DateRangePicker from '../range';
import { daysFromNow } from './utils';

const meta: Meta< typeof DateRangePicker > = {
	title: 'Components/DateRangePicker',
	component: DateRangePicker,
	argTypes: {
		currentDateStart: { control: 'date' },
		currentDateEnd: { control: 'date' },
		onChangeStart: { action: 'onChangeStart', control: { type: null } },
		onChangeEnd: { action: 'onChangeEnd', control: { type: null } },
	},
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const nextMonth = new Date();
nextMonth.setMonth( nextMonth.getMonth() + 1 );

const Template: StoryFn< typeof DateRangePicker > = ( {
	currentDate,
	onChangeStart,
	...args
} ) => {
	const [ date, setDate ] = useState( currentDate );
	useEffect( () => {
		setDate( currentDate );
	}, [ currentDate ] );
	return (
		<DateRangePicker
			{ ...args }
			currentDateStart={ date }
			currentDateEnd={ nextMonth }
			onChangeStart={ ( newDate ) => {
				setDate( newDate );
				onChangeStart?.( newDate );
			} }
		/>
	);
};

export const Default: StoryFn< typeof DateRangePicker > = Template.bind( {} );

export const WithCustomRange: StoryFn< typeof DateRangePicker > = Template.bind(
	{}
);
WithCustomRange.args = {
	currentDateStart: new Date(),
	currentDateEnd: nextMonth,
	highlightedRange: [
		daysFromNow( 1 ),
		daysFromNow( 2 ),
		daysFromNow( 3 ),
		daysFromNow( 4 ),
	],
};
