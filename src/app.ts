import { App, LogLevel, ExpressReceiver } from '@slack/bolt';
import _ from 'lodash';
import * as Middleware from './middleware';
import * as Controllers from './controller';
import express from 'express';
import path from 'path';

export default async function main() {
    if (!process.env.SLACK_SIGNING_SECRET || !process.env.SLACK_BOT_TOKEN)
        throw new Error('No Slack bot token was detected from the environment, please provide one');

    // initialize a custom express receiver to use express.js
    const expressReceiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
    const expressApp = expressReceiver.app;

    // import the view file that contains the static pages
    expressApp.use(express.static('view'));

    // render the client page
    expressApp.get('/', (req, res) => {
        return res.sendFile(path.join(__dirname, 'view', 'index.html'));
    });

    // initializes your app with the bot token and the custom receiver
    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        receiver: expressReceiver,
        logLevel: LogLevel.DEBUG,
    });

    // handle home tab
    app.event('app_home_opened', Controllers.displayAppHomeTab);

    // handle public channel message events
    app.message(Middleware.preventBotMessages, Middleware.messageHasTimeRef, Controllers.promptMsgDateConvert);

    // handle confirmation message options
    app.action({ action_id: 'convert_date' }, Controllers.convertTimeInChannel);

    app.action({ action_id: 'dismiss_convert' }, async ({ ack, respond }) => {
        // acknowledge the action
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
