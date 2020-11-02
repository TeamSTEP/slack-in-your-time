import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, Conversations } from '../model';
import { getOnlyActiveUsers } from '../helper';
import { WebClient } from '@slack/web-api';
import _ from 'lodash';
import moment from 'moment-timezone';

const app = new WebClient();

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

    // Add user's timezone context
    context.members = getOnlyActiveUsers(membersInfo);

    // Pass control to the next middleware function
    next && (await next());
};

export const contextMessageTime: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ body, context, next }) => {
    const message = {
        senderId: body.event.user,
        content: body.event.text,
        sentTime: moment.utc(body.event_time),
    };

    context.message = message;

    // Pass control to the next middleware function
    next && (await next());
};
