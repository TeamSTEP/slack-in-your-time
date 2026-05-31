import { Middleware, SlackEventMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import * as Helpers from '../helper';
import { getLogger } from '../config';
import { getWorkspaceSettings } from '../service/workspaceSettings';
import { deliverConversion, prepareChannelConversion } from '../service/conversionDelivery';

const stripBotMention = (text: string): string => {
    return text.replace(/<@[A-Z0-9]+>/g, '').trim();
};

const noConversionMessage = async (
    client: Helpers.SlackWebClient,
    channel: string,
    userId: string,
    token: string,
    text: string,
): Promise<void> => {
    await Helpers.sendEphemeralMessage(client, { text, channel, user: userId, token });
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
            await noConversionMessage(
                client,
                channelId,
                userId,
                token,
                'I could not find a time reference in your message. Try something like "meeting at 3pm tomorrow".',
            );
            return;
        }

        const channelMembers = await Helpers.getConversationMembers(client, channelId, token);
        const prepared = prepareChannelConversion(timeContext, channelMembers);

        if (!prepared) {
            await noConversionMessage(
                client,
                channelId,
                userId,
                token,
                'Everyone in this channel appears to share the same timezone.',
            );
            return;
        }

        const teamId = context.teamId ?? '';
        const settings = await getWorkspaceSettings(teamId);

        await deliverConversion(settings.conversionVisibility, {
            client,
            channel: channelId,
            triggerUserId: userId,
            token,
            timeContext,
            members: channelMembers,
            sourceTimezone: prepared.sourceTimezone,
            groups: prepared.groups,
            blocks: prepared.blocks,
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
        const prepared = prepareChannelConversion(timeContext, channelMembers);

        if (!prepared) {
            await respond({
                response_type: 'ephemeral',
                text: 'Everyone in this channel appears to share the same timezone.',
            });
            return;
        }

        const teamId = context.teamId ?? command.team_id;
        const settings = await getWorkspaceSettings(teamId);

        await deliverConversion(settings.conversionVisibility, {
            client,
            channel: command.channel_id,
            triggerUserId: command.user_id,
            token,
            timeContext,
            members: channelMembers,
            sourceTimezone: prepared.sourceTimezone,
            groups: prepared.groups,
            blocks: prepared.blocks,
            respond,
        });
    } catch (err) {
        getLogger().error({ err, channel: command.channel_id }, 'Failed to handle /convert command');
        await respond({
            response_type: 'ephemeral',
            text: `Something went wrong: ${(err as Error).message}`,
        });
    }
};
