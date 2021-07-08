import { EventContext } from '../model';
import _ from 'lodash';
import { dateToUl } from '../helper';

/**
 * Converts the time information into a formatted markdown section block for Slack.
 * @param timezone the timezone label to display
 * @param localTime list of dates to display
 */
const dateSectionBlock = (timezone: string, localTime: EventContext.DateReference[]) => {
    const timeUlMd = _.map(localTime, (i) => dateToUl(i));
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `*${timezone}*${timeUlMd}`,
        },
    };
};

export const convertedTimesBlock = (sourceTime: moment.MomentZone, localTimes: EventContext.DateReference[][]) => {
    const convertedBlocks = _.map(localTimes, (i) => {
        return dateSectionBlock(i[0].tz, i);
    });

    // todo: add the actual time alongside the timezone name for better UX
    const messageBlock = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Converted time from ${sourceTime.name}`,
            },
        },
        ...convertedBlocks,
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: 'Found an issue? Please consider opening a bug report from the *App Home*!',
                },
            ],
        },
    ];
    return messageBlock;
};
