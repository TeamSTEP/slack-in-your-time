import {
    Middleware,
    SlackEventMiddlewareArgs,
    SlackActionMiddlewareArgs,
    BlockAction,
    ButtonAction,
} from '@slack/bolt';
import { EventContext } from '../model';
import * as Helpers from '../helper';
import _ from 'lodash';
import moment from 'moment-timezone';

/**
 * Send a ephemeral message to the message sender to ask them if they want to convert their time.
 * The message block confirmation button contains the object for both the list channel members
 * and the message sender's time context.
 */
export const promptMsgDateConvert: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ context, body }) => {
    try {
        // the message property should have been passed by the previous middleware
        if (!context.message) throw new Error(`Message context was not found`);

        const msgWithTime = context.message as EventContext.MessageTimeContext;
        const channel = body.event.channel;

        const channelMembers = await Helpers.getChannelMembers(channel, context.botToken);

        // filter out the timezone that is same as the sender
        const channelTimezones = _.filter(
            Helpers.getUserTimeZones(channelMembers).map((tz) => tz.name),
            (i) => i !== msgWithTime.content[0].tz,
        );

        // there must be at least more than one different timezones in a given channel
        if (channelMembers.length > 0 && channelTimezones.length > 0) {
            const confirmationForm = Helpers.userConfirmationMsgBox(msgWithTime, channelTimezones);

            await Helpers.sendEphemeralMessage({
                text: 'confirmation message',
                blocks: confirmationForm,
                channel,
                user: msgWithTime.senderId,
                token: context.botToken,
            });
        }
    } catch (err) {
        console.log(err.message);
    }
};

/**
 * Converts a message to a list of all channel timezones and send a message block.
 */
export const convertTimeInChannel: Middleware<SlackActionMiddlewareArgs<BlockAction<ButtonAction>>> = async ({
    body,
    ack,
    respond,
    payload,
    say,
}) => {
    const action = 'convert_date';
    //body.actions[0].value;
    // we send the acknowledge flag first
    await ack();
    try {
        // get the data value (in JSON string) that is stored in the button
        const actionPayload = body.actions.find((i) => i.action_id === action)?.value;
        if (!actionPayload) throw new Error('could not find any data for action ' + action);

        // cast the data into a object
        const actionData = JSON.parse(actionPayload) as {
            timeContext: EventContext.MessageTimeContext;
            payload: string[]; // list of timezone labels
        };

        // obtain the full timezone object of the sender
        const senderTimezone = moment.tz.zone(actionData.timeContext.content[0].tz);
        if (!senderTimezone) throw new Error('Failed to get timezone data for ' + actionData.timeContext.content[0].tz);

        console.log(`Convert Time:\n${JSON.stringify({ payload, body, actionData })}`);

        // filter out the timezone that is same as the sender
        const channelTimezones = _.filter(actionData.payload, (i) => i !== senderTimezone.name);

        const convertedTimes = channelTimezones.map((tz) => {
            // convert the date referenced in the message to the channel member's local time
            const localTime = actionData.timeContext.content.map((i) => {
                const start = moment(i.start).tz(tz);
                const end = i.end && moment(i.end).tz(tz);

                return {
                    start,
                    end,
                    tz,
                } as EventContext.DateReference;
            });
            return localTime;
        });

        const messageContent = Helpers.displayConvertedTimes(senderTimezone, convertedTimes);
        console.log(JSON.stringify(messageContent));
        await respond({
            delete_original: true,
        });

        await say({
            text: 'time conversion message',
            blocks: messageContent,
        });
    } catch (err) {
        console.error(err);
        await respond({ text: `*[Error]* ${err.message}`, replace_original: true });
    }
};
