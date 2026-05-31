import _ from 'lodash';
import { EventContext } from '../model';
import { assertValidTimezone, convertInstantToZone } from './timezone';

export const convertTimeAcrossChannel = (
    timeContext: EventContext.MessageTimeContext,
    channelTimezones: string[],
): EventContext.DateReference[][] => {
    const senderTimezone = assertValidTimezone(timeContext.content[0].tz);
    const targetTimezones = _.filter(channelTimezones, (timezone) => timezone !== senderTimezone);

    return targetTimezones.map((timezone) =>
        timeContext.content.map((reference) => ({
            start: convertInstantToZone(reference.start, timezone),
            tz: timezone,
        })),
    );
};
