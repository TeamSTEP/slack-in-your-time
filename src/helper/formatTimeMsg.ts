import { EventContext } from '../model';
import { formatInTimezone } from './timezone';

const TIME_DISPLAY_FORMAT = 'LLL d, ccc, h:mm a';

/**
 * Converts the given date object into a unordered list in markdown text string.
 * @param date the date to display
 */
export const dateToUl = (date: EventContext.DateReference) => {
    const formatted = formatInTimezone(date.start, date.tz, TIME_DISPLAY_FORMAT);
    return `\n- ${formatted}`;
};
