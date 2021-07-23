import * as chrono from 'chrono-node';
import moment from 'moment-timezone';
import _ from 'lodash';
import { EventContext } from '../model';

/**
 * Parses the given message string to determine the full date that it is referencing to.
 * The result will contain the full moment.js object with the proper timezone.
 * @param messageText the string message to parse
 * @param sentTime the time when the event was sent. This is the event timestamp in unix epoch
 * @param senderTimezone the sender's timezone string label available in moment-timezone package https://github.com/moment/moment-timezone/blob/develop/data/packed/latest.json
 */
export const parseTimeReference = (messageText: string, sentTime: number, senderTimezone: string) => {
    // sent time with locale
    const sentTimeString = moment.unix(sentTime).tz(senderTimezone).toLocaleString();

    const parsedDate = messageToTime(messageText, new Date(sentTimeString));

    // no reference to time in the text
    if (!parsedDate || parsedDate.length < 1) return [];

    const timeContext = _.map(parsedDate, (res) => {
        const start = res.start.date();
        const tz = senderTimezone;

        return {
            sourceMsg: messageText,
            start,
            tz,
        } as EventContext.LocalDateReference;
    });

    return timeContext;
};

const messageToTime = (msg: string, sourceDate?: Date) => {
    // todo: improve this function so that if the message contains a timezone label, we can override the source date
    const parsedDate = chrono.en.casual.parse(msg, sourceDate);

    return parsedDate;
};
