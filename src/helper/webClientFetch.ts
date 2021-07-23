import { Users, Conversations } from '../model';
import * as Helpers from '.';
import _ from 'lodash';
import type { ChatPostEphemeralArguments } from '@slack/web-api';
import { slackWebApiClient } from '../client';

export const getConversationMembers = async (conversationId: string, callToken: string) => {
    if (typeof slackWebApiClient === 'undefined') {
        throw new Error('Slack web client not initialized!');
    }

    // array of member IDs (ex: U015Y14JKME)
    const { members } = (await slackWebApiClient.conversations.members({
        token: callToken,
        channel: conversationId,
    })) as Conversations.MembersResponse;

    const membersInfo = await Promise.all(
        members.map(async (user) => {
            // the check in the first line in the function ensures that it is not undefined
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const info = (await slackWebApiClient!.users.info({
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
    if (typeof slackWebApiClient === 'undefined') {
        throw new Error('Slack web client not initialized!');
    }
    const res = await slackWebApiClient.chat.postEphemeral(args);
    return res;
};
