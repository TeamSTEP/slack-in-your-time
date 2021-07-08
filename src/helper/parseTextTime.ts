import * as chrono from 'chrono-node';
import moment from 'moment-timezone';
import type { MomentZone } from 'moment-timezone';
import _ from 'lodash';
import { EventContext } from '../model';

/**
 * Parses the given message string to determine the full date that it is referencing to.
 * The result will contain the full moment.js object with the proper timezone.
 * @param messageText the string message to parse
 * @param eventTimestamp the timestamp for the event in unix epoch
 * @param senderTz message sender's timezone object
 */
export const parseTimeReference = (messageText: string, eventTimestamp: number, senderTz: MomentZone) => {
    const sentTime = moment.unix(eventTimestamp).tz(senderTz.name, true);
    //const senderTimezone = senderContext.tz.name;
    const parsedDate = messageToTime(messageText, sentTime.toDate());

    // no reference to time in the text
    if (!parsedDate || parsedDate.length < 1) return [];

    const timeContext = _.map(parsedDate, (res) => {
        const start = moment.tz(res.start.date(), senderTz.name);
        const end = res.end && moment.tz(res.end.date(), senderTz.name);
        const tz = senderTz.name;

        return {
            sourceMsg: messageText,
            start,
            end,
            tz,
        } as EventContext.LocalDateReference;
    });

    return timeContext;
};

const messageToTime = (msg: string, sourceDate?: Date) => {
    // todo: improve this function so that if the message contains a timezone label, we can override the source date
    const parsedDate = chrono.casual.parse(msg, sourceDate);

    return parsedDate;
};
