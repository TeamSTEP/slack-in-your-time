import { App } from '@slack/bolt';
import type { InstallationStore } from '@slack/bolt';
import clientConfig from '../config/slackClientConfig';

//fixme: only for testing purposes
import MockStore from './mockDatabase';

const database = new MockStore({});

const installStoreHandler = {
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
} as InstallationStore;

// initializes the slack app with the bot token and the custom receiver
const slackBoltApp = new App({
    ...clientConfig,
    socketMode: false,
    // only pass the installation store if a bot token was not provided
    stateSecret: !clientConfig.token ? 'my-test-state' : undefined,
    installationStore: !clientConfig.token ? installStoreHandler : undefined,
});

const slackWebClient = slackBoltApp.client;

export { slackBoltApp, slackWebClient };
