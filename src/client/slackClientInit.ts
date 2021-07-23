import { App } from '@slack/bolt';
import type { InstallationStore, Installation, StateStore, InstallURLOptions } from '@slack/bolt';
import type { WebClient } from '@slack/web-api';
import clientConfig from '../config/slackClientConfig';
import type { Firestore } from '@google-cloud/firestore';
import { nonceGenerator } from '../helper';

const INSTALLATION_PATH = 'slack-workspaces';

const SLACK_AUTH_VERSION = 'v2';

type AuthVersion = typeof SLACK_AUTH_VERSION;

const STATE_STORE = 'installation-states';

// note: this can be re-assigned outside of the code. It's better to create a wrapper class for member protection
export let slackAppClient: App | undefined;
export let slackWebApiClient: WebClient | undefined;

export const initializeSlackClient = (db: Firestore) => {
    if (!slackAppClient) {
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
            installationStore: !clientConfig.token ? installStoreHandler : undefined,
            installerOptions: {
                authVersion: SLACK_AUTH_VERSION,
                stateStore: !clientConfig.token ? stateStoreHandler : undefined,
            },
        });

        slackAppClient = slackBoltApp;
        slackWebApiClient = slackBoltApp.client;

        return { slackBoltApp, slackWebClient: slackBoltApp.client };
    } else {
        return { slackBoltApp: slackAppClient, slackWebClient: slackWebApiClient };
    }
};
