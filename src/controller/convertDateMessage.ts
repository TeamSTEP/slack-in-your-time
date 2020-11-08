import { Middleware, SlackEventMiddlewareArgs, SlackActionMiddlewareArgs, SlackAction } from '@slack/bolt';
import { Users, Conversations, EventContext } from '../model';
import * as Helpers from '../helper';
import _ from 'lodash';
import moment from 'moment-timezone';

export const promptMsgDateConvert: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ say, context, body }) => {
    try {
        // the message property should have been passed by the previous middleware
        if (!context.message) throw new Error(`Message context was not found`);

        const msgWithTime = context.message as EventContext.MessageTimeContext;
        const channel = body.event.channel;

        const channelMembers = await Helpers.getChannelMembers(channel, context.botToken);

        await say(Helpers.userConfirmationMsgBox(msgWithTime, channelMembers));
    } catch (err) {
        console.log(err.message);
    }
};

export const convertTimeInChannel: Middleware<SlackActionMiddlewareArgs<SlackAction>> = async ({
    body,
    ack,
    respond,
    context,
}) => {
    // we send the acknowledge flag first
    await ack();
    try {
        const channelId = body.channel?.id;
        if (typeof channelId === 'undefined') {
            throw new Error('could not find the channel ID for this action');
        }

        const channelMembers = await Helpers.getChannelMembers(channelId, context.botToken);
        const channelTimezones = Helpers.getUserTimeZones(channelMembers).map((tz) => tz.name);
        await respond({ text: JSON.stringify({ context, body, channelTimezones }), replace_original: true });
    } catch (err) {
        console.error(err);
        await respond({ text: `*[Error]* ${err.message}`, replace_original: true });
    }
};
