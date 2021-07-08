import { EventContext } from '../model';
import _ from 'lodash';
import { dateToUl } from '../helper';

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
                text: 'Hey! Looks like you might have mentioned a date on your message!\nWould you like me to convert this time zone?',
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
