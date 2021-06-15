import { App } from '@slack/bolt';
import type { InstallationStore } from '@slack/bolt';
import clientConfig from '../config/slackClientConfig';
import { db } from './firebaseClient';

const INSTALLATION_PATH = 'slack-client/workspaces';

const installStoreHandler: InstallationStore = {
    storeInstallation: async (installation) => {
        console.log(installation);
        const workspaceCred = db.collection(INSTALLATION_PATH).doc();

        if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
            const installObject = {
                id: installation.enterprise.id,
                cred: installation,
            };
            // support for org wide app installation
            await workspaceCred.set(installObject);

            // return await database.setData(installation.enterprise.id, { installation });
        }
        if (installation.team !== undefined) {
            const installObject = {
                id: installation.team.id,
                cred: installation,
            };
            // single team app installation
            await workspaceCred.set(installObject);

            // return await database.setData(installation.team.id, { installation });
        }
        throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
        console.log(installQuery);

        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
            const installation = db.collection(INSTALLATION_PATH).doc(installQuery.enterpriseId);
            // org wide app installation lookup
            return (await installation.get()).data()?.cred;
        }
        if (installQuery.teamId !== undefined) {
            const installation = db.collection(INSTALLATION_PATH).doc(installQuery.teamId);
            // single team app installation lookup
            return (await installation.get()).data()?.cred;
        }
        throw new Error('Failed fetching installation');
    },
};

// initializes the slack app with the bot token and the custom receiver
const slackBoltApp = new App({
    ...clientConfig,
    socketMode: false,
    // only pass the installation store if a bot token was not provided
    stateSecret: !clientConfig.token ? 'my-test-state' : undefined,
    installationStore: !clientConfig.token ? installStoreHandler : undefined,
    installerOptions: {
        authVersion: 'v2',
        userScopes: clientConfig.scopes,
    },
});

const slackWebClient = slackBoltApp.client;

export { slackBoltApp, slackWebClient };
