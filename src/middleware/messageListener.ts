import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, Conversations, EventContext } from '../model';
import * as Helpers from '../helper';
import { WebClient } from '@slack/web-api';
import _ from 'lodash';
import moment from 'moment-timezone';

const app = new WebClient();

/**
 * Listener middleware that filters out messages with the `bot_message` subtype.
 */
export const preventBotMessages: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ message, next }) => {
    if (!message.subtype || message.subtype !== 'bot_message') {
        next && (await next());
    }
};

export const messageHasTimeRef: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ body, context, next }) => {
    try {
        if (!body.event.text) throw new Error(`Message ${body.event_id} does not have any content`);

        const userInfo = (await app.users.info({
            token: context.botToken,
            user: body.event.user,
            include_locale: true,
        })) as Users.InfoResponse;

        const senderLocalTime = moment.unix(body.event_time).tz(userInfo.user.tz || 'GMT', true);
        const parsedTime = Helpers.parseTimeReference(body.event.text, senderLocalTime);

        if (!parsedTime) throw new Error(`Message ${body.event_id} does not mention any date`);

        const message = {
            senderId: body.event.user,
            content: parsedTime,
            sentTime: moment.unix(body.event_time), // UTC
        } as EventContext.MessageTimeContext;

        context.message = message;

        // Pass control to the next middleware function
        next && (await next());
    } catch (err) {
        console.log(err.message);
    }
};
