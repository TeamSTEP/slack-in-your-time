import { App } from '@slack/bolt';
import clientConfig from '../config/slackClientConfig';

//fixme: only for testing purposes
import MockStore from './mockDatabase';

const database = new MockStore({});

// initialize a custom express receiver to use express.js and custom OAuth
// const expressReceiver = new ExpressReceiver({
//     signingSecret: clientConfig.signingSecret || '',
//     processBeforeResponse: true,
// });

// initializes the slack app with the bot token and the custom receiver
const slackBoltApp = new App({
    ...clientConfig,
    socketMode: false,
    stateSecret: 'my-test-secret',
    installationStore: {
        storeInstallation: async (installation) => {
            console.log(installation);
            // change the line below so it saves to your database
            if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
                // support for org wide app installation
                return await database.setData(installation.enterprise.id, { installation });
            }
            if (installation.team !== undefined) {
                // single team app installation
                return await database.setData(installation.team.id, { installation });
            }
            throw new Error('Failed saving installation data to installationStore');
        },
        fetchInstallation: async (installQuery) => {
            console.log(installQuery);
            // change the line below so it fetches from your database
            if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
                // org wide app installation lookup
                return (await database.getData(installQuery.enterpriseId)).installation as any;
            }
            if (installQuery.teamId !== undefined) {
                // single team app installation lookup
                return (await database.getData(installQuery.teamId)).installation as any;
            }
            throw new Error('Failed fetching installation');
        },
    },
});

const slackWebClient = slackBoltApp.client;

export { slackBoltApp, slackWebClient };
