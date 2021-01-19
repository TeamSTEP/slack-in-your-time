import botPermissionScope from './token-scope.json';

export default {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: botPermissionScope,
};
