import * as chrono from 'chrono-node';
import _ from 'lodash';
import { EventContext } from '../model';
import { chronoReferenceFromSenderZone, dateFromChronoInZone } from './timezone';

/**
 * Parses the given message string to determine the full date that it is referencing to.
 * @param messageText the string message to parse
 * @param sentTime the time when the event was sent. This is the event timestamp in unix epoch
 * @param senderTimezone IANA timezone for the message sender
 */
export const parseTimeReference = (messageText: string, sentTime: number, senderTimezone: string) => {
    const referenceDate = chronoReferenceFromSenderZone(sentTime, senderTimezone);
    const parsedDate = messageToTime(messageText, referenceDate);

    if (!parsedDate || parsedDate.length < 1) return [];

    const timeContext = _.map(parsedDate, (res) => {
        const start = dateFromChronoInZone(res.start.date(), senderTimezone);
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
    const parsedDate = chrono.casual.parse(msg, sourceDate);

    return parsedDate;
};
