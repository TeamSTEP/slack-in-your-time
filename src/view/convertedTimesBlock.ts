import { EventContext, Users } from '../model';
import { dateToUl } from '../helper';
import { memberMention, type TimezoneMemberGroup } from '../helper/memberTimezones';

const groupSectionBlock = (group: TimezoneMemberGroup) => {
    const memberList = group.members.map((member) => memberMention(member)).join(', ');
    const timeList = group.times.map((entry) => dateToUl(entry)).join('');

    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `*${group.timezone}* (${memberList})${timeList}`,
        },
    };
};

export const convertedTimesBlock = (sourceTimezone: string, groups: TimezoneMemberGroup[]) => {
    const convertedBlocks = groups.map((group) => groupSectionBlock(group));

    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Converted time from *${sourceTimezone}*`,
            },
        },
        ...convertedBlocks,
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: 'Found an issue? Please open a bug report from the *App Home*!',
                },
            ],
        },
    ];
};

export const personalConversionBlock = (
    timeContext: EventContext.MessageTimeContext,
    member: Users.User,
    times: EventContext.DateReference[],
) => {
    const timeList = times.map((entry) => dateToUl(entry)).join('');
    const sourceMsg = timeContext.content[0]?.sourceMsg ?? 'a time reference';

    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Hi ${memberMention(member)}! Someone shared a time in this channel:\n>${sourceMsg}`,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Your local time* (${times[0]?.tz ?? 'unknown'}):${timeList}`,
            },
        },
    ];
};
