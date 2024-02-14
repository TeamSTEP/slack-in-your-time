import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, EventContext } from '../model';
import * as Helpers from '../helper';
import { slackWebApiClient } from '../client';
import moment from 'moment-timezone';

/**
 * Listener middleware that filters out messages with the `bot_message` subtype.
 */
export const preventBotMessages: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ message, next }) => {
    if (!message.subtype || message.subtype !== 'bot_message') {
        next && (await next());
    }
};

/**
 * Listener middleware that checks if the message sent contains a string that references time.
 */
export const messageHasTimeRef: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ body, context, next }) => {
    try {
        // note: a normal message submission should have a subtype of undefined
        if (body.event.subtype || !body.event.text) {
            throw new Error(`Message ${body.event_id} does not have any content`);
        }

        if (typeof slackWebApiClient === 'undefined') {
            throw new Error('Slack web client not initialized!');
        }
        const userInfo = (await slackWebApiClient.users.info({
            token: context.botToken,
            user: body.event.user,
            include_locale: true,
        })) as Users.InfoResponse;

        // note: we disable non-null assertion rules because we know Slack timezones are the same as moment tz
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const senderTimezone = moment.tz.zone(userInfo.user.tz || 'Etc/GMT')!;
        const msgText = body.event.text;
        if (!msgText) throw new Error('Could not find any text for event ' + body.event_id);

        const parsedTime = Helpers.parseTimeReference(msgText, body.event_time, senderTimezone.name);

        if (!parsedTime)
            throw new Error(`Message ${body.event_id} does not mention any date.\nFull message: ${msgText}`);

        const messageMeta = {
            senderId: body.event.user,
            sentChannel: body.event.channel,
            content: parsedTime,
            sentTime: body.event_time, // epoch time in seconds
        } as EventContext.MessageTimeContext;

        context.message = messageMeta;

        // Pass control to the next middleware function
        next && (await next());
    } catch (err) {
        console.log(err);
    }
};

// todo: add behavior for when the user references the bot with the `@` symbol
