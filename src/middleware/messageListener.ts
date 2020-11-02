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

/**
 * Fetches a list of all the active non-bot members in the channel where the message event was emitted.
 * It adds the `members` property to the event context object, which is in the type of `Users.User`
 */
export const contextChannelMembers: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
    payload,
    context,
    next,
}) => {
    //todo: we don't want to make an API requests every time the event fires
    //todo: we need a global storage for saving things to a database or cache it somewhere

    // array of member IDs (ex: U015Y14JKME)
    const { members } = (await app.conversations.members({
        token: context.botToken,
        channel: payload.channel,
    })) as Conversations.MembersResponse;

    const membersInfo = await Promise.all(
        members.map(async (user) => {
            const info = (await app.users.info({
                token: context.botToken,
                user: user,
                include_locale: true,
            })) as Users.InfoResponse;
            return info.user;
        }),
    );

    console.log(`Channel members:\n${JSON.stringify(membersInfo)}`);

    const activeHumans = Helpers.getOnlyActiveUsers(membersInfo);
    // only proceed to the next function if there are more than one human members
    if (activeHumans.length > 0) {
        // add currently active channel members to the context
        context.members = activeHumans;
        // Pass control to the next middleware function
        next && (await next());
    }
};
