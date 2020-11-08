import { EventContext } from '../model';
import _ from 'lodash';

const TIME_DISPLAY_FORMAT = 'MMM Do ddd, h:mm a';

/**
 * Converts the given date object into a unordered list in markdown text string.
 * @param date the date to display
 */
const dateToUl = (date: EventContext.DateReference) => {
    return `\n- ${date.start.format(TIME_DISPLAY_FORMAT)}${
        date.end ? ' ~ ' + date.end.format(TIME_DISPLAY_FORMAT) : ''
    }`;
};

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

export const displayConvertedTimes = (sourceTime: moment.MomentZone, localTimes: EventContext.DateReference[][]) => {
    const convertedBlocks = _.map(localTimes, (i) => {
        return dateSectionBlock(i[0].tz, i);
    });

    const messageBlock = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Converted time from ${sourceTime.name}`,
            },
        },
        ...convertedBlocks,
    ];
    return messageBlock;
};

export const userConfirmationMsgBox = <T>(timeContext: EventContext.MessageTimeContext, confirmationPayload: T) => {
    const dateRef = timeContext.content[0];

    const ulStringList = _.map(timeContext.content, (i) => {
        return dateToUl(i);
    });

    const dateDisplayString = ulStringList.join('\n');

    const messageBlock = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text:
                    "Hey! Looks like you might have mentioned a date on your message!\nWould you like me to convert this to everyone's time zone?",
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Your Message*:\n> ${dateRef.sourceMsg}\n*Full Date* (${dateRef.tz}):${dateDisplayString}`,
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        emoji: true,
                        text: 'Yes',
                    },
                    style: 'primary',
                    value: JSON.stringify({ timeContext, payload: confirmationPayload }),
                    action_id: 'convert_date',
                },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        emoji: true,
                        text: 'No',
                    },
                    style: 'danger',
                    action_id: 'dismiss_convert',
                },
            ],
        },
    ];

    return messageBlock;
};
