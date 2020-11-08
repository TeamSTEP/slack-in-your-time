import * as chrono from 'chrono-node';
import moment from 'moment-timezone';
import _ from 'lodash';
import { EventContext } from '../model';

/**
 * Parses the given message string to determine the full date that it is referencing to.
 * The result will contain the full moment.js object with the proper timezone.
 * @param message message string that contains a reference to time
 * @param senderContext message sender's time context which includes the send time and the timezone
 */
export const parseTimeReference = (message: string, senderContext: moment.Moment) => {
    const senderTimezone = senderContext.zoneName();
    const parsedDate = chrono.casual.parse(message, senderContext.toDate());
    if (!parsedDate || parsedDate.length < 1) return undefined;

    const timeContext = _.map(parsedDate, (date) => {
        const start = moment.tz(date.start.date(), senderTimezone);
        const end = date.end && moment.tz(date.end.date(), senderTimezone);
        const tz = senderTimezone;

        return {
            sourceMsg: message,
            start,
            end,
            tz,
        } as EventContext.LocalDateReference;
    });

    return timeContext;
};
