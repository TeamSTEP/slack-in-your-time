import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, EventContext } from '../model';
import * as Helpers from '../helper';

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
export const messageHasTimeRef: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
    body,
    context,
    client,
    next,
}) => {
    try {
        if (body.event.subtype || !body.event.text) {
            throw new Error(`Message ${body.event_id} does not have any content`);
        }

        const userInfo = (await client.users.info({
            token: context.botToken,
            user: body.event.user,
            include_locale: true,
        })) as Users.InfoResponse;

        const senderTimezone = Helpers.resolveTimezone(userInfo.user.tz);
        const msgText = body.event.text;
        if (!msgText) throw new Error('Could not find any text for event ' + body.event_id);

        const parsedTime = Helpers.parseTimeReference(msgText, body.event_time, senderTimezone);

        if (!parsedTime)
            throw new Error(`Message ${body.event_id} does not mention any date.\nFull message: ${msgText}`);

        const messageMeta = {
            senderId: body.event.user,
            sentChannel: body.event.channel,
            content: parsedTime,
            sentTime: body.event_time,
        } as EventContext.MessageTimeContext;

        context.message = messageMeta;

        next && (await next());
    } catch (err) {
        console.log((err as Error).message);
    }
};

// todo: add behavior for when the user references the bot with the `@` symbol
