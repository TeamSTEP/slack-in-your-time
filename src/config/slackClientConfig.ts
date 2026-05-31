import botPermissionScope from './token-scope.json';
import type { AppOptions } from '@slack/bolt';
import { LogLevel } from '@slack/bolt';
import { healthRoute } from '../routes/health';
import type { Env } from './env';

export const createSlackClientConfig = (env: Env): AppOptions => {
    return {
        socketMode: false,
        clientId: env.SLACK_CLIENT_ID,
        signingSecret: env.SLACK_SIGNING_SECRET,
        clientSecret: env.SLACK_CLIENT_SECRET,
        token: env.SLACK_BOT_TOKEN,
        scopes: botPermissionScope,
        logLevel: env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
        customRoutes: [healthRoute],
    };
};
