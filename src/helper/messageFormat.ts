import { SayArguments, Context } from '@slack/bolt';
import { EventContext, Users } from '../model';
import _ from 'lodash';

const TIME_DISPLAY_FORMAT = 'MMM Do ddd, h:mm a';

const dateToUl = (date: EventContext.LocalDateReference) => {
    return `\n- ${date.start.format(TIME_DISPLAY_FORMAT)}${
        date.end ? ' ~ ' + date.end.format(TIME_DISPLAY_FORMAT) : ''
    }`;
};

export const userConfirmationMsgBox = (timeContext: EventContext.MessageTimeContext, channelMembers: Users.User[]) => {
    const dateRef = timeContext.content[0];

    let dateDisplayString = '';

    if (timeContext.content.length > 0) {
        for (let i = 0; i < timeContext.content.length; i++) {
            dateDisplayString = dateDisplayString.concat(dateToUl(timeContext.content[i]));
        }
    } else {
        dateDisplayString = dateToUl(dateRef);
    }

    const messageBlock: SayArguments = {
        text: 'convert date confirmation',
        blocks: [
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
                            text: 'Yes Please',
                        },
                        style: 'primary',
                        value: JSON.stringify({ timeContext, channelMembers }),
                        action_id: 'convert_date',
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            emoji: true,
                            text: 'No Thanks',
                        },
                        style: 'danger',
                        action_id: 'dismiss_convert',
                    },
                ],
            },
        ],
    };

    return messageBlock;
};
