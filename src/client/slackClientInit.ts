import { App } from '@slack/bolt';
import type { InstallationStore, Installation } from '@slack/bolt';
import clientConfig from '../config/slackClientConfig';
import { db } from './firebaseClient';

const INSTALLATION_PATH = 'slack-workspaces';

const SLACK_AUTH_VERSION = 'v2';

type AuthVersion = typeof SLACK_AUTH_VERSION;

const installStoreHandler: InstallationStore = {
    storeInstallation: async (installation) => {
        console.log('Storing app installation');

        if (installation.isEnterpriseInstall && installation.enterprise) {
            const docId = installation.enterprise.id;
            const workspaceCred = db.collection(INSTALLATION_PATH).doc(docId);
            const installObject = {
                cred: installation,
            };
            // support for org wide app installation
            await workspaceCred.set(installObject);
            console.log('installed bot on a enterprise workspace ' + docId);
            return;
        } else if (installation.team) {
            const docId = installation.team.id;
            const workspaceCred = db.collection(INSTALLATION_PATH).doc(docId);
            const installObject = {
                cred: installation,
            };
            // single team app installation
            await workspaceCred.set(installObject);
            console.log('installed bot on a team workspace ' + docId);
            return;
        }
        throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
        console.log('Fetching installation');

        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId) {
            const installation = db.collection(INSTALLATION_PATH).doc(installQuery.enterpriseId);
            console.log('fetching bot credentials for ' + installQuery.enterpriseId);
            // org wide app installation lookup
            return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
        } else if (installQuery.teamId) {
            const installation = db.collection(INSTALLATION_PATH).doc(installQuery.teamId);
            console.log('fetching bot credentials for ' + installQuery.teamId);
            // single team app installation lookup
            return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
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
        authVersion: SLACK_AUTH_VERSION,
        //userScopes: clientConfig.scopes,
    },
});

const slackWebClient = slackBoltApp.client;

export { slackBoltApp, slackWebClient };
