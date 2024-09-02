/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';

/**
 * WordPress dependencies
 */
import { forwardRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { default as DatePicker } from '../date';
// import { default as TimePicker } from '../time';
import type { DateRangePickerProps } from '../types';

import { inputToDate } from '../utils';

// import { Wrapper } from './styles';
import styled from '@emotion/styled';
export const Wrapper = styled.div`
	box-sizing: border-box;
`;

const noop = () => {};

function UnforwardedDateRangePicker(
	{
		className,
		currentDateStart,
		currentDateEnd,
		isInvalidDate,
		onMonthPreviewedStart = noop,
		onMonthPreviewedEnd = noop,
		onChangeStart,
		onChangeEnd,
		events,
		highlightedRange,
		startOfWeek,
	}: DateRangePickerProps,
	ref: ForwardedRef< any >
) {
	const [ previewDateStart, setPreviewDateStart ] = useState(
		currentDateStart ? inputToDate( currentDateStart ) : new Date()
	);
	const [ previewDateEnd, setPreviewDateEnd ] = useState(
		currentDateEnd ? inputToDate( currentDateEnd ) : new Date() // replace with a next month
	);

	// const udateTheOther = () => {};
	const onStartChange = ( date: string ) => {
		setPreviewDateStart( inputToDate( date ) );
		setPreviewDateEnd( previewDateStart );
	};
	const onEndChange = ( date: string ) => {
		setPreviewDateStart( previewDateEnd );
		setPreviewDateEnd( inputToDate( date ) );
	};

	return (
		<Wrapper
			ref={ ref }
			className={ `${ className } components-datetime` }
			// spacing={ 4 }
		>
			<>
				<DatePicker
					currentDate={ currentDateStart }
					previewDate={ previewDateStart }
					onChange={ onChangeStart }
					isInvalidDate={ isInvalidDate }
					events={ events }
					onMonthPreviewed={ ( date ) => {
						onStartChange( date );
						onMonthPreviewedStart?.( date );
					} }
					startOfWeek={ startOfWeek }
					disableEndNavigation
					highlightedRange={ highlightedRange }
				/>
				<DatePicker
					currentDate={ currentDateEnd }
					previewDate={ previewDateEnd }
					onChange={ onChangeEnd }
					isInvalidDate={ isInvalidDate }
					events={ events }
					onMonthPreviewed={ ( date ) => {
						onEndChange( date );
						onMonthPreviewedEnd?.( date );
					} }
					startOfWeek={ startOfWeek }
					disableStartNavigation
					highlightedRange={ highlightedRange }
				/>
			</>
		</Wrapper>
	);
}

/**
 * DateTimePicker is a React component that renders a calendar and clock for
 * date and time selection. The calendar and clock components can be accessed
 * individually using the `DatePicker` and `TimePicker` components respectively.
 *
 * ```jsx
 * import { DateTimePicker } from '@wordpress/components';
 * import { useState } from '@wordpress/element';
 *
 * const MyDateTimePicker = () => {
 *   const [ date, setDate ] = useState( new Date() );
 *
 *   return (
 *     <DateTimePicker
 *       currentDate={ date }
 *       onChange={ ( newDate ) => setDate( newDate ) }
 *       is12Hour
 *     />
 *   );
 * };
 * ```
 */
export const DateRangePicker = forwardRef( UnforwardedDateRangePicker );

export default DateRangePicker;
