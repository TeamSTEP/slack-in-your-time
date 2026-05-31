import * as Middleware from './middleware';
import * as Controllers from './controller';
import { createSlackApp, createFirebase } from './client';
import { loadEnv, createLogger, setLogger, getLogger } from './config';
import type { App } from '@slack/bolt';

export default async function main() {
    const env = loadEnv();
    const logger = createLogger(env);
    setLogger(logger);

    const db = createFirebase(env, logger);
    const { slackBoltApp } = createSlackApp(db, env, logger);

    await slackBoltApp.start(env.PORT);

    logger.info({ port: env.PORT }, 'Slack app is running');

    registerEventHandlers(slackBoltApp);

    slackBoltApp.error(async (error) => {
        getLogger().error({ err: error }, 'Unhandled Slack app error');
    });
}

const registerEventHandlers = (slackBoltApp: App) => {
    slackBoltApp.event('app_home_opened', Controllers.displayAppHomeTab);

    slackBoltApp.message(Middleware.preventBotMessages, Middleware.messageHasTimeRef, Controllers.promptMsgDateConvert);

    slackBoltApp.action({ action_id: 'convert_date' }, Controllers.convertTimeInChannel);

    slackBoltApp.action({ action_id: 'dismiss_convert' }, async ({ ack, respond }) => {
        await ack();
        await respond({ delete_original: true });
    });
};
