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

    app.message('echo debug', Middleware.contextChannelMembers, async ({ context, say, body }) => {
        console.log(JSON.stringify({ context, body }));
        await say(`Context:\n${JSON.stringify({ context, body })}`);
    });

    app.message(Middleware.preventBotMessages, Middleware.messageHasTimeRef, Controllers.promptMsgDateConvert);

    app.action('convert_date', async ({ body, ack, say, context }) => {
        console.log(JSON.stringify({ context, body }));
        // Acknowledge the action
        await ack();
        await say(JSON.stringify({ context, body }));
    });

    app.action('dismiss_convert', async ({ body, ack, say }) => {
        // Acknowledge the action
        await ack();
        await say(`no? Really?!`);
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
