import { Middleware, SlackEventMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import * as Helpers from '../helper';
import * as Views from '../view';
import { getLogger } from '../config';
import { getWorkspaceSettings } from '../service/workspaceSettings';
import _ from 'lodash';

type SlackBlocks = ReturnType<typeof Views.convertedTimesBlock>;
type SlackClient = Parameters<typeof Helpers.getConversationMembers>[0];

const stripBotMention = (text: string): string => {
    return text.replace(/<@[A-Z0-9]+>/g, '').trim();
};

const postConversionResult = async (
    visibility: 'public' | 'ephemeral',
    args: {
        client: SlackClient;
        channel: string;
        userId: string;
        token: string;
        blocks: SlackBlocks;
        say: (message: { text: string; blocks: SlackBlocks }) => Promise<unknown>;
    },
): Promise<void> => {
    const message = { text: 'time conversion message', blocks: args.blocks };

    if (visibility === 'ephemeral') {
        await Helpers.sendEphemeralMessage(args.client, {
            ...message,
            channel: args.channel,
            user: args.userId,
            token: args.token,
        });
        return;
    }

    await args.say(message);
};

/**
 * Converts time references from an app mention and posts the result directly.
 */
export const handleAppMention: Middleware<SlackEventMiddlewareArgs<'app_mention'>> = async ({
    event,
    client,
    context,
    say,
}) => {
    try {
        const userId = event.user;
        const channelId = event.channel;
        const token = context.botToken;

        if (!userId || !channelId || !token) return;

        const text = stripBotMention(event.text);
        if (!text) return;

        const timeContext = await Helpers.createMessageTimeContext(
            client,
            token,
            userId,
            channelId,
            text,
            event.ts ? Math.floor(parseFloat(event.ts)) : Math.floor(Date.now() / 1000),
        );

        if (!timeContext) {
            await Helpers.sendEphemeralMessage(client, {
                text: 'I could not find a time reference in your message. Try something like "meeting at 3pm tomorrow".',
                channel: channelId,
                user: userId,
                token,
            });
            return;
        }

        const channelMembers = await Helpers.getConversationMembers(client, channelId, token);
        const channelTimezones = _.filter(
            Helpers.getUserTimeZones(channelMembers),
            (timezone) => timezone !== timeContext.content[0].tz,
        );

        if (channelTimezones.length === 0) {
            await Helpers.sendEphemeralMessage(client, {
                text: 'Everyone in this channel appears to share the same timezone.',
                channel: channelId,
                user: userId,
                token,
            });
            return;
        }

        const convertedTimes = Helpers.convertTimeAcrossChannel(timeContext, channelTimezones);
        const blocks = Views.convertedTimesBlock(timeContext.content[0].tz, convertedTimes);
        const teamId = context.teamId ?? '';
        const settings = await getWorkspaceSettings(teamId);

        await postConversionResult(settings.conversionVisibility, {
            client,
            channel: channelId,
            userId,
            token,
            blocks,
            say,
        });
    } catch (err) {
        getLogger().error({ err, channel: event.channel }, 'Failed to handle app mention conversion');
    }
};

/**
 * Slash command handler for direct time conversion.
 */
export const handleConvertCommand: Middleware<SlackCommandMiddlewareArgs> = async ({
    command,
    ack,
    client,
    context,
    respond,
}) => {
    await ack();

    try {
        const token = context.botToken;
        if (!token) {
            await respond({ response_type: 'ephemeral', text: 'Bot token not available.' });
            return;
        }

        const text = command.text.trim();
        if (!text) {
            await respond({
                response_type: 'ephemeral',
                text: 'Usage: `/convert <time expression>` — e.g. `/convert 3pm tomorrow EST`',
            });
            return;
        }

        const timeContext = await Helpers.createMessageTimeContext(
            client,
            token,
            command.user_id,
            command.channel_id,
            text,
            Math.floor(Date.now() / 1000),
        );

        if (!timeContext) {
            await respond({
                response_type: 'ephemeral',
                text: 'I could not find a time reference. Try something like `/convert 3pm tomorrow`.',
            });
            return;
        }

        const channelMembers = await Helpers.getConversationMembers(client, command.channel_id, token);
        const channelTimezones = _.filter(
            Helpers.getUserTimeZones(channelMembers),
            (timezone) => timezone !== timeContext.content[0].tz,
        );

        if (channelTimezones.length === 0) {
            await respond({
                response_type: 'ephemeral',
                text: 'Everyone in this channel appears to share the same timezone.',
            });
            return;
        }

        const convertedTimes = Helpers.convertTimeAcrossChannel(timeContext, channelTimezones);
        const blocks = Views.convertedTimesBlock(timeContext.content[0].tz, convertedTimes);
        const teamId = context.teamId ?? command.team_id;
        const settings = await getWorkspaceSettings(teamId);

        if (settings.conversionVisibility === 'ephemeral') {
            await Helpers.sendEphemeralMessage(client, {
                text: 'time conversion message',
                blocks,
                channel: command.channel_id,
                user: command.user_id,
                token,
            });
            return;
        }

        await respond({
            response_type: 'in_channel',
            text: 'time conversion message',
            blocks,
        });
    } catch (err) {
        getLogger().error({ err, channel: command.channel_id }, 'Failed to handle /convert command');
        await respond({
            response_type: 'ephemeral',
            text: `Something went wrong: ${(err as Error).message}`,
        });
    }
};
