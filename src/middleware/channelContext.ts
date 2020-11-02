import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, Conversations } from '../model';
import { getOnlyActiveUsers } from '../helper';
import { WebClient } from '@slack/web-api';
import _ from 'lodash';

const app = new WebClient();

export const contextChannelMembers: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
    payload,
    context,
    next,
}) => {
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
