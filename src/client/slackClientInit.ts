import { App, webApi } from '@slack/bolt';
import type { InstallationStore, Installation, StateStore, InstallURLOptions } from '@slack/bolt';
import clientConfig from '../config/slackClientConfig';
import type { Firestore } from '@google-cloud/firestore';
import { nonceGenerator } from '../helper';

const INSTALLATION_PATH = 'slack-workspaces';

const SLACK_AUTH_VERSION = 'v2';

type AuthVersion = typeof SLACK_AUTH_VERSION;

const STATE_STORE = 'installation-states';

export let slackAppClient: App | undefined;

export const initializeSlackClient = (db: Firestore) => {
    if (!slackAppClient) {
        const installStoreHandler: InstallationStore = {
            storeInstallation: async (installation) => {
                console.log('Storing app installation');

                if (installation.isEnterpriseInstall && installation.enterprise) {
                    const docId = installation.enterprise.id;
                    const workspaceCred = db.collection(INSTALLATION_PATH).doc(docId);
                    const installObject = {
                        cred: installation,
                    };
                    await workspaceCred.set(installObject);
                    return;
                } else if (installation.team) {
                    const docId = installation.team.id;
                    const workspaceCred = db.collection(INSTALLATION_PATH).doc(docId);
                    const installObject = {
                        cred: installation,
                    };
                    await workspaceCred.set(installObject);
                    return;
                }
                throw new Error('Failed saving installation data to installationStore');
            },
            fetchInstallation: async (installQuery) => {
                console.log('Fetching installation');

                if (installQuery.isEnterpriseInstall && installQuery.enterpriseId) {
                    const installation = db.collection(INSTALLATION_PATH).doc(installQuery.enterpriseId);
                    return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
                } else if (installQuery.teamId) {
                    const installation = db.collection(INSTALLATION_PATH).doc(installQuery.teamId);
                    return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
                }
                throw new Error('Failed fetching installation');
            },
        };

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

        const slackBoltApp = new App({
            ...clientConfig,
            installationStore: !clientConfig.token ? installStoreHandler : undefined,
            installerOptions: {
                authVersion: SLACK_AUTH_VERSION,
                stateStore: !clientConfig.token ? stateStoreHandler : undefined,
            },
        });

        slackAppClient = slackBoltApp;

        return { slackBoltApp, slackWebClient: slackBoltApp.client as webApi.WebClient };
    } else {
        return { slackBoltApp: slackAppClient, slackWebClient: slackAppClient.client as webApi.WebClient };
    }
};
