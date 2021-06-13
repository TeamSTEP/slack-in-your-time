import botPermissionScope from './token-scope.json';
import type { AppOptions } from '@slack/bolt';
import { LogLevel } from '@slack/bolt';

const clientConfig = {
    clientId: process.env.SLACK_CLIENT_ID,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
    developerMode: process.env.NODE_ENV === 'development',
    scopes: botPermissionScope,
    logLevel: LogLevel.DEBUG,
} as AppOptions;

export default clientConfig;
