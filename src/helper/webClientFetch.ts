import { webApi } from '@slack/bolt';
import { Conversations, Users } from '../model';
import * as Helpers from '.';

export type SlackWebClient = webApi.WebClient;
export type ChatPostEphemeralArguments = webApi.ChatPostEphemeralArguments;

export const getConversationMembers = async (client: SlackWebClient, conversationId: string, callToken: string) => {
    const { members } = (await client.conversations.members({
        token: callToken,
        channel: conversationId,
    })) as Conversations.MembersResponse;

    const membersInfo = await Promise.all(
        members.map(async (user) => {
            const info = (await client.users.info({
                token: callToken,
                user,
                include_locale: true,
            })) as Users.InfoResponse;
            return info.user;
        }),
    );

    return Helpers.getOnlyActiveUsers(membersInfo);
};

/**
 * A semantic wrapper for posting ephemeral messages to a channel.
 * Read this for details: https://api.slack.com/methods/chat.postEphemeral
 */
export const sendEphemeralMessage = async (client: SlackWebClient, args: ChatPostEphemeralArguments) => {
    return client.chat.postEphemeral(args);
};
