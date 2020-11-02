import * as chrono from 'chrono-node';
import moment from 'moment-timezone';
import _ from 'lodash';
import { EventContext } from '../model';

/**
 * A semantic wrapper for moment.js.
 * This function will return the current time based on the given timezone.
 * Refer to https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for details.
 * @param timezone TZ database name (ex: Africa/Abidjan)
 */
export const currentTimeInZone = (timezone: string) => {
    if (!moment.tz(timezone).isValid()) throw new Error(`Invalid timezone ${timezone} was given`);

    // just to be safe, we first get the current time in UTC and convert that to the given timezone
    return moment.utc().tz(timezone);
};

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
