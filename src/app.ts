import { App, LogLevel } from '@slack/bolt';
import _ from 'lodash';
import * as Middleware from './middleware';
import * as Controllers from './controller';

export default async function main() {
    // Initializes your app with your bot token and signing secret
    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        logLevel: LogLevel.DEBUG,
    });

    app.event('app_home_opened', Controllers.displayAppHomeTab);

    app.message(Middleware.preventBotMessages, Middleware.messageHasTimeRef, Controllers.promptMsgDateConvert);

    app.action({ action_id: 'convert_date' }, Controllers.convertTimeInChannel);

    app.action({ action_id: 'dismiss_convert' }, async ({ ack, respond }) => {
        // Acknowledge the action
        await ack();
        await respond({ delete_original: true });
    });

    app.error(async (error) => {
        //todo: Check the details of the error to handle cases where you should retry sending a message or stop the app
        console.error(error);
    });

    (async () => {
        // start the app
        await app.start(process.env.PORT || 3000);

        console.log('⚡️ Slack app is running!');
    })();
}
