import {
    Middleware,
    SlackEventMiddlewareArgs,
    SlackActionMiddlewareArgs,
    BlockAction,
    ButtonAction,
} from '@slack/bolt';
import { Users, Conversations, EventContext } from '../model';
import * as Helpers from '../helper';
import _ from 'lodash';
import moment from 'moment-timezone';

export const promptMsgDateConvert: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
    context,
    body,
    payload,
}) => {
    try {
        // the message property should have been passed by the previous middleware
        if (!context.message) throw new Error(`Message context was not found`);

        const msgWithTime = context.message as EventContext.MessageTimeContext;
        const channel = body.event.channel;

        console.log(`Prompt Confirmation:\n${JSON.stringify({ context, body, payload })}`);

        const channelMembers = await Helpers.getChannelMembers(channel, context.botToken);

        const confirmationForm = Helpers.userConfirmationMsgBox(msgWithTime, channelMembers);

        await Helpers.sendEphemeralMessage({
            text: 'confirmation message',
            blocks: confirmationForm,
            channel,
            user: msgWithTime.senderId,
            token: context.botToken,
        });
        //await say({ text: 'confirmation message', blocks: confirmationForm });
    } catch (err) {
        console.log(err.message);
    }
};

export const convertTimeInChannel: Middleware<SlackActionMiddlewareArgs<BlockAction<ButtonAction>>> = async ({
    body,
    ack,
    respond,
    context,
    payload,
}) => {
    const action = 'convert_date';
    //body.actions[0].value;
    // we send the acknowledge flag first
    await ack();
    try {
        const channelId = body.channel?.id;
        if (typeof channelId === 'undefined') {
            throw new Error('could not find the channel ID for this action');
        }

        const actionPayload = body.actions.find((i) => i.action_id === action)?.value;
        if (!actionPayload) throw new Error('could not find any data for action ' + action);
        const actionData = JSON.parse(actionPayload) as {
            timeContext: EventContext.MessageTimeContext;
            payload: Users.User[];
        };
        const channelMembers = actionData.payload;

        console.log(`Convert Time:\n${JSON.stringify({ payload, body, channelMembers })}`);

        if (channelMembers.length > 0) {
            const channelTimezones = Helpers.getUserTimeZones(channelMembers).map((tz) => tz.name);

            const convertedTimes = channelTimezones.map((tz) => {
                const localTime = actionData.timeContext.content.map((i) => {
                    // convert the time to everyone's local timezone
                    const start = i.start.tz(tz);
                    const end = i.end?.tz(tz);

                    return {
                        start,
                        end,
                        tz,
                    } as EventContext.DateReference;
                });
                return localTime;
            });
            const senderTimezone = moment.tz.zone(actionData.timeContext.content[0].tz);
            if (!senderTimezone)
                throw new Error('Failed to get timezone data for ' + actionData.timeContext.content[0].tz);

            const messageContent = Helpers.displayConvertedTimes(senderTimezone, convertedTimes);

            await respond({
                blocks: messageContent,
                replace_original: false,
                delete_original: true,
            });
        }
    } catch (err) {
        console.error(err);
        await respond({ text: `*[Error]* ${err.message}`, replace_original: true });
    }
};
