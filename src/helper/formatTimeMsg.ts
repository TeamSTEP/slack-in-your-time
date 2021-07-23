import { EventContext } from '../model';
import moment from 'moment';

const TIME_DISPLAY_FORMAT = 'MMM Do ddd, h:mm a';

const formatDateString = (date: Date) => {
    const parsedDate = moment(date);
    return parsedDate.format(TIME_DISPLAY_FORMAT);
};

/**
 * Converts the given date object into a unordered list in markdown text string.
 * @param date the date to display
 */
export const dateToUl = (date: EventContext.DateReference) => {
    return `\n- ${formatDateString(date.start)}`;
};
