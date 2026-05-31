import _ from 'lodash';
import { Users, EventContext } from '../model';
import { assertValidTimezone, convertInstantToZone, resolveTimezone } from './timezone';

export interface TimezoneMemberGroup {
    timezone: string;
    members: Users.User[];
    times: EventContext.DateReference[];
}

export const groupMembersByTimezone = (members: Users.User[]): Map<string, Users.User[]> => {
    const groups = new Map<string, Users.User[]>();

    for (const member of members) {
        try {
            const timezone = resolveTimezone(member.tz);
            const existing = groups.get(timezone) ?? [];
            existing.push(member);
            groups.set(timezone, existing);
        } catch {
            // Skip members with invalid timezone labels
        }
    }

    return groups;
};

export const memberDisplayName = (member: Users.User): string => {
    return member.profile?.display_name || member.real_name || member.name;
};

export const memberMention = (member: Users.User): string => {
    return `<@${member.id}>`;
};

export const buildConversionGroups = (
    timeContext: EventContext.MessageTimeContext,
    channelMembers: Users.User[],
): TimezoneMemberGroup[] => {
    const sourceTimezone = assertValidTimezone(timeContext.content[0].tz);
    const grouped = groupMembersByTimezone(channelMembers);

    return [...grouped.entries()]
        .filter(([timezone]) => timezone !== sourceTimezone)
        .map(([timezone, members]) => ({
            timezone,
            members,
            times: timeContext.content.map((reference) => ({
                start: convertInstantToZone(reference.start, timezone),
                tz: timezone,
            })),
        }))
        .sort((a, b) => a.timezone.localeCompare(b.timezone));
};

export const findMemberTimezone = (member: Users.User): string | null => {
    try {
        return resolveTimezone(member.tz);
    } catch {
        return null;
    }
};

export const getMemberConversionTimes = (
    timeContext: EventContext.MessageTimeContext,
    member: Users.User,
): EventContext.DateReference[] | null => {
    const timezone = findMemberTimezone(member);
    if (!timezone) return null;

    const sourceTimezone = assertValidTimezone(timeContext.content[0].tz);
    if (timezone === sourceTimezone) return null;

    return timeContext.content.map((reference) => ({
        start: convertInstantToZone(reference.start, timezone),
        tz: timezone,
    }));
};

export const uniqueChannelTimezones = (groups: TimezoneMemberGroup[]): string[] => {
    return _.uniq(groups.map((group) => group.timezone));
};
