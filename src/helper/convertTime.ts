import _ from 'lodash';
import { EventContext } from '../model';
import { assertValidTimezone, convertInstantToZone } from './timezone';

/** @deprecated Use buildConversionGroups for member-aware output */
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

export const conversionGroupsToLegacyFormat = (
    groups: { times: EventContext.DateReference[] }[],
): EventContext.DateReference[][] => {
    return groups.map((group) => group.times);
};
