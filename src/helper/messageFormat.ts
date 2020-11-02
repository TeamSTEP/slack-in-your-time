import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, Conversations, EventContext } from '../model';
import * as Helpers from '../helper';
import _ from 'lodash';
import moment from 'moment-timezone';

const TIME_DISPLAY_FORMAT = 'MMM Do ddd, h:mm a';

const dateToUl = (date: EventContext.LocalDateReference) => {
    return `\n- ${date.start.format(TIME_DISPLAY_FORMAT)}${
        date.end ? ' ~ ' + date.end.format(TIME_DISPLAY_FORMAT) : ''
    }`;
};

export const userConfirmationMsgBox = (context: EventContext.MessageTimeContext) => {
    const dateRef = context.content[0];

    let dateDisplayString = '';

    if (context.content.length > 0) {
        for (let i = 0; i < context.content.length; i++) {
            dateDisplayString = dateDisplayString.concat(dateToUl(context.content[i]));
        }
    } else {
        dateDisplayString = dateToUl(dateRef);
    }

    const messageBlock = {
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
                        value: 'btn_approve',
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
                        value: 'btn_decline',
                        action_id: 'dismiss_convert',
                    },
                ],
            },
        ],
    };

    return messageBlock;
};
