import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, Conversations, EventContext } from '../model';
import * as Helpers from '../helper';
import _ from 'lodash';
import moment from 'moment-timezone';

export const promptMsgDateConvert: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ say, context }) => {
    try {
        if (!context.message) throw new Error(`Message context was not found`);

        const msgWithTime = context.message as EventContext.MessageTimeContext;

        await say(Helpers.userConfirmationMsgBox(msgWithTime));
    } catch (err) {
        console.log(err);
    }
};
