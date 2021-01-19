import * as chrono from 'chrono-node';
import moment from 'moment-timezone';
import _ from 'lodash';
import { EventContext } from '../model';
import { GenericMessageEvent } from '@slack/bolt';

/**
 * Parses the given message string to determine the full date that it is referencing to.
 * The result will contain the full moment.js object with the proper timezone.
 * @param messageEvent message event that we want to parse
 * @param senderTz message sender's timezone object
 */
export const parseTimeReference = (messageEvent: GenericMessageEvent, senderTz: moment.MomentZone) => {
    const message = messageEvent.text;
    if (!message) throw new Error('No message was passed to parse');
    const sentTime = moment.unix(parseInt(messageEvent.ts)).tz(senderTz.name, true);
    //const senderTimezone = senderContext.tz.name;
    const parsedDate = chrono.casual.parse(message, sentTime.toDate());
    if (!parsedDate || parsedDate.length < 1) return undefined;

    const timeContext = _.map(parsedDate, (date) => {
        const start = moment.tz(date.start.date(), senderTz.name);
        const end = date.end && moment.tz(date.end.date(), senderTz.name);
        const tz = senderTz.name;

        return {
            sourceMsg: message,
            start,
            end,
            tz,
        } as EventContext.LocalDateReference;
    });

    return timeContext;
};
