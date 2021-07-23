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
        if (!context.message) throw new Error('Message context was not found');
        if (!context.botToken)
            throw new Error('No bot token was found. Please check the database status or the environmental variable');

        const msgWithTime = context.message as EventContext.MessageTimeContext;
        const currentChannel = body.event.channel;

        const channelMembers = await Helpers.getConversationMembers(currentChannel, context.botToken);

        // filter out the timezone that is same as the sender
        const channelTimezones = _.filter(
            Helpers.getUserTimeZones(channelMembers).map((tz) => tz.name),
            (i) => i !== msgWithTime.content[0].tz,
        );

        // there must be at least more than one different timezones in a given channel
        if (channelMembers.length > 0 && channelTimezones.length > 0) {
            const confirmationForm = Views.userConfirmationMsgBox(msgWithTime, channelTimezones);

            await Helpers.sendEphemeralMessage({
                text: 'confirmation message',
                blocks: confirmationForm,
                channel: currentChannel,
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

        // todo: refactor this code so that Slack API calls and time conversion methods are kept separately
        // obtain the full timezone object of the sender
        const senderTimezone = moment.tz.zone(actionData.timeContext.content[0].tz);
        if (!senderTimezone) throw new Error('Failed to get timezone data for ' + actionData.timeContext.content[0].tz);

        // filter out the timezone that is same as the sender
        const channelTimezones = _.filter(actionData.payload, (i) => i !== senderTimezone.name);

        const convertedTimes = channelTimezones.map((tz) => {
            // convert the date referenced in the message to the other channel member's local time
            const localTime = actionData.timeContext.content.map((i) => {
                const start = moment(i.start).tz(tz).toDate();

                return {
                    start,
                    tz,
                } as EventContext.DateReference;
            });
            return localTime;
        });

        const messageContent = Views.convertedTimesBlock(senderTimezone, convertedTimes);

        // remove the confirmation message
        await respond({
            delete_original: true,
        });

        // send a message with the converted times
        await say({
            text: 'time conversion message',
            blocks: messageContent,
        });
    } catch (err) {
        console.error(err);
        await respond({ text: `*[Error]* ${err.message}`, replace_original: true });
    }
};
