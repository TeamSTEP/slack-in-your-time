import {
    Middleware,
    SlackEventMiddlewareArgs,
    SlackActionMiddlewareArgs,
    BlockAction,
    ButtonAction,
} from '@slack/bolt';
import { EventContext } from '../model';
import * as Helpers from '../helper';
import * as Views from '../view';
import { getLogger } from '../config';
import { getWorkspaceSettings } from '../service/workspaceSettings';
import { deliverConversion, prepareChannelConversion } from '../service/conversionDelivery';

/**
 * Send a ephemeral message to the message sender to ask them if they want to convert their time.
 * When auto-convert is enabled, performs conversion immediately without prompting.
 */
export const promptMsgDateConvert: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
    context,
    body,
    client,
    say,
}) => {
    try {
        if (!context.message) throw new Error('Message context was not found');
        if (!context.botToken)
            throw new Error('No bot token was found. Please check the database status or the environmental variable');

        const msgWithTime = context.message as EventContext.MessageTimeContext;
        const currentChannel = body.event.channel;
        const teamId = context.teamId ?? body.team_id ?? '';

        const channelMembers = await Helpers.getConversationMembers(client, currentChannel, context.botToken);
        const settings = await getWorkspaceSettings(teamId);

        const prepared = prepareChannelConversion(msgWithTime, channelMembers);
        if (!prepared) return;

        if (settings.autoConvert) {
            await deliverConversion(settings.conversionVisibility, {
                client,
                channel: currentChannel,
                triggerUserId: msgWithTime.senderId,
                token: context.botToken,
                timeContext: msgWithTime,
                members: channelMembers,
                sourceTimezone: prepared.sourceTimezone,
                groups: prepared.groups,
                blocks: prepared.blocks,
                say,
            });
            return;
        }

        const channelTimezones = Helpers.uniqueChannelTimezones(prepared.groups);
        const confirmationForm = Views.userConfirmationMsgBox(msgWithTime, channelTimezones);

        await Helpers.sendEphemeralMessage(client, {
            text: 'confirmation message',
            blocks: confirmationForm,
            channel: currentChannel,
            user: msgWithTime.senderId,
            token: context.botToken,
        });
    } catch (err) {
        getLogger().warn({ err, channel: body.event.channel }, 'Failed to prompt timezone conversion');
    }
};

/**
 * Converts a message to a list of all channel timezones and send a message block.
 */
export const convertTimeInChannel: Middleware<SlackActionMiddlewareArgs<BlockAction<ButtonAction>>> = async ({
    body,
    ack,
    respond,
    say,
    client,
    context,
}) => {
    const action = 'convert_date';
    await ack();
    try {
        const actionPayload = body.actions.find((i) => i.action_id === action)?.value;
        if (!actionPayload) throw new Error('could not find any data for action ' + action);
        if (!context.botToken) throw new Error('No bot token was found');

        const actionData = JSON.parse(actionPayload) as {
            timeContext: EventContext.MessageTimeContext;
            payload: string[];
        };

        const channelMembers = await Helpers.getConversationMembers(
            client,
            actionData.timeContext.sentChannel,
            context.botToken,
        );

        const prepared = prepareChannelConversion(actionData.timeContext, channelMembers);
        if (!prepared) throw new Error('No timezone conversions available for this channel');

        await respond({ delete_original: true });

        const teamId = context.teamId ?? body.team?.id ?? '';
        const settings = await getWorkspaceSettings(teamId);

        await deliverConversion(settings.conversionVisibility, {
            client,
            channel: actionData.timeContext.sentChannel,
            triggerUserId: actionData.timeContext.senderId,
            token: context.botToken,
            timeContext: actionData.timeContext,
            members: channelMembers,
            sourceTimezone: prepared.sourceTimezone,
            groups: prepared.groups,
            blocks: prepared.blocks,
            say,
        });
    } catch (err) {
        getLogger().error({ err }, 'Failed to convert timezone message');
        await respond({ text: `*[Error]* ${(err as Error).message}`, replace_original: true });
    }
};
