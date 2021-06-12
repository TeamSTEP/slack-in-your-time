import _ from 'lodash';
import * as Middleware from './middleware';
import * as Controllers from './controller';
import express from 'express';
import path from 'path';
import { slackBoltApp, expressApp } from './client';

export default async function main() {
    if (!process.env.SLACK_SIGNING_SECRET || !process.env.SLACK_BOT_TOKEN)
        throw new Error('No Slack bot token was detected from the environment, please provide one');

    // parse the environmental variable of the port number from string or use the default port number
    const ENV_PORT = (process.env.PORT && Number.parseInt(process.env.PORT)) || 3000;

    (async () => {
        // start the app
        await slackBoltApp.start(ENV_PORT);

        console.log('⚡️ Slack app is running!');
    })();

    // import the view file that contains the static pages
    expressApp.use(express.static('view'));

    // render the client page
    expressApp.get('/', (req, res) => {
        //todo: serve the installation button element
        return res.sendFile(path.join(__dirname, 'view', 'index.html'));
    });

    expressApp.get('/slack/oauth_redirect', (req, res) => {
        //todo: add OAuth redirect handler
        //todo: add a remote database to store authenticated workspaces
        console.warn('OAuth redirection not implemented!');
    });

    // handle home tab
    slackBoltApp.event('app_home_opened', Controllers.displayAppHomeTab);

    // handle public channel message events
    slackBoltApp.message(Middleware.preventBotMessages, Middleware.messageHasTimeRef, Controllers.promptMsgDateConvert);

    // handle confirmation message options
    slackBoltApp.action({ action_id: 'convert_date' }, Controllers.convertTimeInChannel);

    slackBoltApp.action({ action_id: 'dismiss_convert' }, async ({ ack, respond }) => {
        // acknowledge the action
        await ack();
        await respond({ delete_original: true });
    });

    slackBoltApp.error(async (error) => {
        //todo: Check the details of the error to handle cases where you should retry sending a message or stop the app
        console.error(error);
    });
}
