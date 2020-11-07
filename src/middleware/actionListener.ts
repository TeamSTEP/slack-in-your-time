import { Middleware, SlackAction, SlackActionMiddlewareArgs } from '@slack/bolt';
import { Users, Conversations, EventContext } from '../model';
import * as Helpers from '../helper';
import { WebClient } from '@slack/web-api';
import _ from 'lodash';
import moment from 'moment-timezone';

const app = new WebClient();

/**
 * Fetches a list of all the active non-bot members in the channel where the message event was emitted.
 * It adds the `members` property to the event context object, which is in the type of `Users.User`
 */
export const contextChannelMembers: Middleware<SlackActionMiddlewareArgs<SlackAction>> = async ({ context, next }) => {
    //todo: we don't want to make an API requests every time the event fires
    //todo: we need a global storage for saving things to a database or cache it somewhere

    // array of member IDs (ex: U015Y14JKME)
    const { members } = (await app.conversations.members({
        token: context.botToken,
        channel: context.channel,
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
