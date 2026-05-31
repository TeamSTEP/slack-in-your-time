import * as chrono from 'chrono-node';
import _ from 'lodash';
import { EventContext } from '../model';
import { chronoReferenceFromSenderZone, dateFromChronoInZone } from './timezone';
import { detectTimezoneInText } from './detectTimezoneInText';

/**
 * Parses the given message string to determine the full date that it is referencing to.
 * When the message contains an explicit timezone (IANA label or abbreviation), that zone
 * is used instead of the sender's profile timezone.
 * @param messageText the string message to parse
 * @param sentTime the time when the event was sent. This is the event timestamp in unix epoch
 * @param senderTimezone IANA timezone for the message sender
 */
export const parseTimeReference = (messageText: string, sentTime: number, senderTimezone: string) => {
    const detected = detectTimezoneInText(messageText);
    const effectiveTimezone = detected?.timezone ?? senderTimezone;
    const textToParse = detected?.strippedMessage ?? messageText;

    const referenceDate = chronoReferenceFromSenderZone(sentTime, effectiveTimezone);
    const parsedDate = chrono.casual.parse(textToParse, referenceDate);

    if (!parsedDate || parsedDate.length < 1) return [];

    const timeContext = _.map(parsedDate, (res) => {
        const start = dateFromChronoInZone(res.start.date(), effectiveTimezone);

        return {
            sourceMsg: messageText,
            start,
            tz: effectiveTimezone,
        } as EventContext.LocalDateReference;
    });

    return timeContext;
};
