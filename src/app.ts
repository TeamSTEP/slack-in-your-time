import * as Middleware from './middleware';
import * as Controllers from './controller';
import { initializeSlackClient, initializeFirebase } from './client';
import type { App } from '@slack/bolt';

export default async function main() {
    if (!process.env.SLACK_SIGNING_SECRET || !process.env.SLACK_CLIENT_ID)
        throw new Error('No Slack client signature was detected from the environment, please provide one');

    const { db } = initializeFirebase();
    const { slackBoltApp } = initializeSlackClient(db);

    // parse the environmental variable of the port number from string or use the default port number
    const ENV_PORT = (process.env.PORT && Number.parseInt(process.env.PORT)) || 3000;

    // start the app
    await slackBoltApp.start(ENV_PORT);

    console.log('⚡️ Slack app is running!');

    // handle home tab
    slackBoltApp.event(
        'app_home_opened',
        async ({ body, context, next }) => {
            // note: a simple debugging middleware
            console.log(`[Opened App Home] ${JSON.stringify({ body, context })}`);
            next && (await next());
        },
        Controllers.displayAppHomeTab,
    );

    // handle public channel message events
    slackBoltApp.message(
        async ({ body, context, next }) => {
            // note: a simple debugging middleware
            console.log(`[Message Event] ${JSON.stringify({ body, context })}`);
            next && (await next());
        },
        Middleware.preventBotMessages,
        Middleware.messageHasTimeRef,
        Controllers.promptMsgDateConvert,
    );

    // handle message actions
    await messageActionHandler(slackBoltApp);

    // error logging
    slackBoltApp.error(async (error) => {
        //todo: Check the details of the error to handle cases where you should retry sending a message or stop the app
        console.error(error);
    });
}

/**
 * Function for grouping all action handlers sent by intractable blocks in messages and views
 * @param slackBoltApp instance of the slack application
 */
const messageActionHandler = async (slackBoltApp: App) => {
    // handle confirmation message options
    slackBoltApp.action({ action_id: 'convert_date' }, Controllers.convertTimeInChannel);

    slackBoltApp.action({ action_id: 'dismiss_convert' }, async ({ ack, respond }) => {
        // acknowledge the action
        await ack();
        await respond({ delete_original: true });
    });
};
