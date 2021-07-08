import { EventContext } from '../model';

const TIME_DISPLAY_FORMAT = 'MMM Do ddd, h:mm a';

/**
 * Converts the given date object into a unordered list in markdown text string.
 * @param date the date to display
 */
export const dateToUl = (date: EventContext.DateReference) => {
    return `\n- ${date.start.format(TIME_DISPLAY_FORMAT)}${
        date.end ? ' ~ ' + date.end.format(TIME_DISPLAY_FORMAT) : ''
    }`;
};
