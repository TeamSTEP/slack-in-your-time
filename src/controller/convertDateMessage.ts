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
import _ from 'lodash';

/**
 * Send a ephemeral message to the message sender to ask them if they want to convert their time.
 * The message block confirmation button contains the object for both the list channel members
 * and the message sender's time context.
 */
export const promptMsgDateConvert: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
    context,
    body,
    client,
}) => {
    try {
        if (!context.message) throw new Error('Message context was not found');
        if (!context.botToken)
            throw new Error('No bot token was found. Please check the database status or the environmental variable');

        const msgWithTime = context.message as EventContext.MessageTimeContext;
        const currentChannel = body.event.channel;

        const channelMembers = await Helpers.getConversationMembers(client, currentChannel, context.botToken);

        const channelTimezones = _.filter(
            Helpers.getUserTimeZones(channelMembers),
            (timezone) => timezone !== msgWithTime.content[0].tz,
        );

        if (channelMembers.length > 0 && channelTimezones.length > 0) {
            const confirmationForm = Views.userConfirmationMsgBox(msgWithTime, channelTimezones);

            await Helpers.sendEphemeralMessage(client, {
                text: 'confirmation message',
                blocks: confirmationForm,
                channel: currentChannel,
                user: msgWithTime.senderId,
                token: context.botToken,
            });
        }
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

        const actionData = JSON.parse(actionPayload) as {
            timeContext: EventContext.MessageTimeContext;
            payload: string[];
        };

        const senderTimezone = Helpers.assertValidTimezone(actionData.timeContext.content[0].tz);
        const convertedTimes = Helpers.convertTimeAcrossChannel(actionData.timeContext, actionData.payload);
        const messageContent = Views.convertedTimesBlock(senderTimezone, convertedTimes);

        await respond({
            delete_original: true,
        });

        const teamId = context.teamId ?? body.team?.id ?? '';
        const settings = await getWorkspaceSettings(teamId);
        const channel = actionData.timeContext.sentChannel;
        const userId = actionData.timeContext.senderId;

        if (settings.conversionVisibility === 'ephemeral') {
            await Helpers.sendEphemeralMessage(client, {
                text: 'time conversion message',
                blocks: messageContent,
                channel,
                user: userId,
                token: context.botToken,
            });
            return;
        }

        await say({
            text: 'time conversion message',
            blocks: messageContent,
        });
    } catch (err) {
        getLogger().error({ err }, 'Failed to convert timezone message');
        await respond({ text: `*[Error]* ${(err as Error).message}`, replace_original: true });
    }
};
