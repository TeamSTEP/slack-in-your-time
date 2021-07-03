import { App } from '@slack/bolt';
import type { InstallationStore, Installation, StateStore, InstallURLOptions } from '@slack/bolt';
import clientConfig from '../config/slackClientConfig';
import { db } from './firebaseClient';
import { nonceGenerator } from '../helper';

const INSTALLATION_PATH = 'slack-workspaces';

const SLACK_AUTH_VERSION = 'v2';

type AuthVersion = typeof SLACK_AUTH_VERSION;

// a set of functions for storing workspace information to the database when the app is installed
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
            return;
        } else if (installation.team) {
            const docId = installation.team.id;
            const workspaceCred = db.collection(INSTALLATION_PATH).doc(docId);
            const installObject = {
                cred: installation,
            };
            // single team app installation
            await workspaceCred.set(installObject);
            return;
        }
        throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
        console.log('Fetching installation');

        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId) {
            const installation = db.collection(INSTALLATION_PATH).doc(installQuery.enterpriseId);
            // org wide app installation lookup
            return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
        } else if (installQuery.teamId) {
            const installation = db.collection(INSTALLATION_PATH).doc(installQuery.teamId);
            // single team app installation lookup
            return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
        }
        throw new Error('Failed fetching installation');
    },
};

const STATE_STORE = 'installation-states';

// a set of functions to store installation option state to the database
const stateStoreHandler: StateStore = {
    generateStateParam: async (installOptions, now) => {
        const stateToken = nonceGenerator();

        const stateStoreDoc = db.collection(STATE_STORE).doc(stateToken);

        await stateStoreDoc.set({ installOptions, date: now });

        return stateToken;
    },
    verifyStateParam: async (_now, state) => {
        const installOptionsDoc = db.collection(STATE_STORE).doc(state);

        return (await installOptionsDoc.get()).data()?.installOptions as InstallURLOptions;
    },
};

// initializes the slack app with the bot token and the custom receiver
const slackBoltApp = new App({
    ...clientConfig,
    // only pass the installation store if a bot token was not provided
    // todo: make a secure state secret value
    // stateSecret: !clientConfig.token ? 'my-test-state' : undefined,
    installationStore: !clientConfig.token ? installStoreHandler : undefined,
    installerOptions: {
        authVersion: SLACK_AUTH_VERSION,
        stateStore: !clientConfig.token ? stateStoreHandler : undefined,
    },
});

const slackWebClient = slackBoltApp.client;

export { slackBoltApp, slackWebClient };
