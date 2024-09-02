/**
 * External dependencies
 */
import { useLilius } from 'use-lilius';
import {
	format,
	isSameDay,
	subMonths,
	addMonths,
	startOfDay,
	isEqual,
	addDays,
	subWeeks,
	addWeeks,
	isSameMonth,
	startOfWeek,
	endOfWeek,
} from 'date-fns';
import type { KeyboardEventHandler } from 'react';

/**
 * WordPress dependencies
 */
import { __, _n, sprintf, isRTL } from '@wordpress/i18n';
import { arrowLeft, arrowRight } from '@wordpress/icons';
import { dateI18n, getSettings } from '@wordpress/date';
import { useState, useRef, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { DatePickerProps } from '../types';
import {
	Wrapper,
	Navigator,
	NavigatorHeading,
	Calendar,
	DayOfWeek,
	DayButton,
} from './styles';
import { inputToDate } from '../utils';
import Button from '../../button';
import { TIMEZONELESS_FORMAT } from '../constants';

/**
 * DatePicker is a React component that renders a calendar for date selection.
 *
 * ```jsx
 * import { DatePicker } from '@wordpress/components';
 * import { useState } from '@wordpress/element';
 *
 * const MyDatePicker = () => {
 *   const [ date, setDate ] = useState( new Date() );
 *
 *   return (
 *     <DatePicker
 *       currentDate={ date }
 *       onChange={ ( newDate ) => setDate( newDate ) }
 *     />
 *   );
 * };
 * ```
 */
export function DatePicker( {
	currentDate, // either highlight a visible day with selecting or use previewDate
	previewDate, // current date without a selection
	onChange,
	events = [],
	dayProps = [],
	highlightedRange = [],
	isInvalidDate,
	onMonthPreviewed,
	startOfWeek: weekStartsOn = 0,
	disableStartNavigation,
	disableEndNavigation,
}: DatePickerProps ) {
	let date = currentDate ? inputToDate( currentDate ) : new Date();
	date = previewDate ? inputToDate( previewDate ) : new Date();

	const {
		calendar,
		viewing,
		setSelected,
		setViewing,
		isSelected,
		viewPreviousMonth,
		viewNextMonth,
	} = useLilius( {
		selected: !! previewDate ? [] : [ startOfDay( date ) ],
		viewing: startOfDay( date ),
		weekStartsOn,
	} );

	// Used to implement a roving tab index. Tracks the day that receives focus
	// when the user tabs into the calendar.
	const [ focusable, setFocusable ] = useState( startOfDay( date ) );

	// Allows us to only programmatically focus() a day when focus was already
	// within the calendar. This stops us stealing focus from e.g. a TimePicker
	// input.
	const [ isFocusWithinCalendar, setIsFocusWithinCalendar ] =
		useState( false );

	// Update internal state when currentDate prop changes.
	const [ prevCurrentDate, setPrevCurrentDate ] = useState( currentDate );
	const [ prevPreviewDate, setPrevPreviewDate ] = useState( previewDate );
	if ( currentDate !== prevCurrentDate ) {
		setPrevCurrentDate( currentDate );
		setSelected( [ startOfDay( date ) ] );
		setViewing( startOfDay( date ) );
		setFocusable( startOfDay( date ) );
	}
	// looks like useEffect walkaround
	if ( previewDate !== prevPreviewDate ) {
		setPrevPreviewDate( previewDate );
		setSelected( !! previewDate ? [] : [ startOfDay( date ) ] );
		setViewing( startOfDay( date ) );
	}

	return (
		<Wrapper
			className="components-datetime__date"
			role="application"
			aria-label={ __( 'Calendar' ) }
		>
			<Navigator>
				{ ! disableStartNavigation && (
					<Button
						icon={ isRTL() ? arrowRight : arrowLeft }
						variant="tertiary"
						aria-label={ __( 'View previous month' ) }
						onClick={ () => {
							viewPreviousMonth();
							setFocusable( subMonths( focusable, 1 ) );
							onMonthPreviewed?.(
								format(
									subMonths( viewing, 1 ),
									TIMEZONELESS_FORMAT
								)
							);
						} }
					/>
				) }
				<NavigatorHeading level={ 3 }>
					<strong>
						{ dateI18n(
							'F',
							viewing,
							-viewing.getTimezoneOffset()
						) }
					</strong>{ ' ' }
					{ dateI18n( 'Y', viewing, -viewing.getTimezoneOffset() ) }
				</NavigatorHeading>
				{ ! disableEndNavigation && (
					<Button
						icon={ isRTL() ? arrowLeft : arrowRight }
						variant="tertiary"
						aria-label={ __( 'View next month' ) }
						onClick={ () => {
							viewNextMonth();
							setFocusable( addMonths( focusable, 1 ) );
							onMonthPreviewed?.(
								format(
									addMonths( viewing, 1 ),
									TIMEZONELESS_FORMAT
								)
							);
						} }
					/>
				) }
			</Navigator>
			<Calendar
				onFocus={ () => setIsFocusWithinCalendar( true ) }
				onBlur={ () => setIsFocusWithinCalendar( false ) }
			>
				{ calendar[ 0 ][ 0 ].map( ( day ) => (
					<DayOfWeek key={ day.toString() }>
						{ dateI18n( 'D', day, -day.getTimezoneOffset() ) }
					</DayOfWeek>
				) ) }
				{ calendar[ 0 ].map( ( week ) =>
					week.map( ( day, index ) => {
						if ( ! isSameMonth( day, viewing ) ) {
							return null;
						}
						return (
							<Day
								key={ day.toString() }
								day={ day }
								column={ index + 1 }
								className={
									dayProps.filter( ( dayProp ) =>
										isSameDay( dayProp.date, day )
									)?.[ 0 ]?.className
								}
								isSelected={ isSelected( day ) }
								isHighlighted={
									!! highlightedRange?.find( ( item ) =>
										isSameDay( item, day )
									)
								}
								isFocusable={ isEqual( day, focusable ) }
								isFocusAllowed={ isFocusWithinCalendar }
								isToday={ isSameDay( day, new Date() ) }
								isInvalid={
									isInvalidDate ? isInvalidDate( day ) : false
								}
								numEvents={
									events.filter( ( event ) =>
										isSameDay( event.date, day )
									).length
								}
								onClick={ () => {
									setSelected( [ day ] );
									setFocusable( day );
									onChange?.(
										format(
											// Don't change the selected date's time fields.
											new Date(
												day.getFullYear(),
												day.getMonth(),
												day.getDate(),
												date.getHours(),
												date.getMinutes(),
												date.getSeconds(),
												date.getMilliseconds()
											),
											TIMEZONELESS_FORMAT
										)
									);
								} }
								onKeyDown={ ( event ) => {
									let nextFocusable;
									if ( event.key === 'ArrowLeft' ) {
										nextFocusable = addDays(
											day,
											isRTL() ? 1 : -1
										);
									}
									if ( event.key === 'ArrowRight' ) {
										nextFocusable = addDays(
											day,
											isRTL() ? -1 : 1
										);
									}
									if ( event.key === 'ArrowUp' ) {
										nextFocusable = subWeeks( day, 1 );
									}
									if ( event.key === 'ArrowDown' ) {
										nextFocusable = addWeeks( day, 1 );
									}
									if ( event.key === 'PageUp' ) {
										nextFocusable = subMonths( day, 1 );
									}
									if ( event.key === 'PageDown' ) {
										nextFocusable = addMonths( day, 1 );
									}
									if ( event.key === 'Home' ) {
										nextFocusable = startOfWeek( day );
									}
									if ( event.key === 'End' ) {
										nextFocusable = startOfDay(
											endOfWeek( day )
										);
									}
									if ( nextFocusable ) {
										event.preventDefault();
										setFocusable( nextFocusable );
										if (
											! isSameMonth(
												nextFocusable,
												viewing
											)
										) {
											setViewing( nextFocusable );
											onMonthPreviewed?.(
												format(
													nextFocusable,
													TIMEZONELESS_FORMAT
												)
											);
										}
									}
								} }
							/>
						);
					} )
				) }
			</Calendar>
		</Wrapper>
	);
}

type DayProps = {
	day: Date;
	column: number;
	className?: string;
	isSelected: boolean;
	isHighlighted: boolean;
	isFocusable: boolean;
	isFocusAllowed: boolean;
	isToday: boolean;
	numEvents: number;
	isInvalid: boolean;
	onClick: () => void;
	onKeyDown: KeyboardEventHandler;
};

function Day( {
	day,
	column,
	className,
	isSelected,
	isHighlighted,
	isFocusable,
	isFocusAllowed,
	isToday,
	isInvalid,
	numEvents,
	onClick,
	onKeyDown,
}: DayProps ) {
	const ref = useRef< HTMLButtonElement >();

	// Focus the day when it becomes focusable, e.g. because an arrow key is
	// pressed. Only do this if focus is allowed - this stops us stealing focus
	// from e.g. a TimePicker input.
	useEffect( () => {
		if ( ref.current && isFocusable && isFocusAllowed ) {
			ref.current.focus();
		}
		// isFocusAllowed is not a dep as there is no point calling focus() on
		// an already focused element.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isFocusable ] );

	return (
		<DayButton
			ref={ ref }
			style={ isHighlighted ? { background: 'steelblue' } : {} } // convert to a class and apply CSS
			className={ `components-datetime__date__day ${ className }` }
			disabled={ isInvalid }
			tabIndex={ isFocusable ? 0 : -1 }
			aria-label={ getDayLabel( day, isSelected, numEvents ) }
			column={ column }
			isSelected={ isSelected }
			isToday={ isToday }
			hasEvents={ numEvents > 0 }
			onClick={ onClick }
			onKeyDown={ onKeyDown }
		>
			{ dateI18n( 'j', day, -day.getTimezoneOffset() ) }
		</DayButton>
	);
}

function getDayLabel( date: Date, isSelected: boolean, numEvents: number ) {
	const { formats } = getSettings();
	const localizedDate = dateI18n(
		formats.date,
		date,
		-date.getTimezoneOffset()
	);
	if ( isSelected && numEvents > 0 ) {
		return sprintf(
			// translators: 1: The calendar date. 2: Number of events on the calendar date.
			_n(
				'%1$s. Selected. There is %2$d event',
				'%1$s. Selected. There are %2$d events',
				numEvents
			),
			localizedDate,
			numEvents
		);
	} else if ( isSelected ) {
		return sprintf(
			// translators: %s: The calendar date.
			__( '%1$s. Selected' ),
			localizedDate
		);
	} else if ( numEvents > 0 ) {
		return sprintf(
			// translators: 1: The calendar date. 2: Number of events on the calendar date.
			_n(
				'%1$s. There is %2$d event',
				'%1$s. There are %2$d events',
				numEvents
			),
			localizedDate,
			numEvents
		);
	}
	return localizedDate;
}

export default DatePicker;
