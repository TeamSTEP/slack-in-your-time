import { Users, Conversations } from '../model';
import * as Helpers from '.';
import _ from 'lodash';
import { WebClient, ChatPostEphemeralArguments } from '@slack/web-api';

const app = new WebClient();

export const getChannelMembers = async (channelId: string, callToken: string) => {
    // array of member IDs (ex: U015Y14JKME)
    const { members } = (await app.conversations.members({
        token: callToken,
        channel: channelId,
    })) as Conversations.MembersResponse;

    const membersInfo = await Promise.all(
        members.map(async (user) => {
            const info = (await app.users.info({
                token: callToken,
                user: user,
                include_locale: true,
            })) as Users.InfoResponse;
            return info.user;
        }),
    );

    //console.log(`Channel members:\n${JSON.stringify(membersInfo)}`);

    const activeHumans = Helpers.getOnlyActiveUsers(membersInfo);
    // only proceed to the next function if there are more than one human members
    // if (activeHumans.length < 1) {
    //     throw new Error(`There are no active members in channel ${channelId}`);
    // }

    return activeHumans;
};

/**
 * A semantic wrapper for posting ephemeral messages to a channel.
 * Read this for details: https://api.slack.com/methods/chat.postEphemeral
 * @param args POST request arguments
 */
export const sendEphemeralMessage = async (args: ChatPostEphemeralArguments) => {
    const res = await app.chat.postEphemeral(args);
    return res;
};
