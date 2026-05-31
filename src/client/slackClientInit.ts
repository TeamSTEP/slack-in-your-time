import { App, webApi } from '@slack/bolt';
import type { InstallationStore, Installation, StateStore, InstallURLOptions } from '@slack/bolt';
import type { Firestore } from '@google-cloud/firestore';
import { createSlackClientConfig } from '../config/slackClientConfig';
import type { Env } from '../config/env';
import type { Logger } from '../config/logger';
import { nonceGenerator } from '../helper';

const INSTALLATION_PATH = 'slack-workspaces';
const SLACK_AUTH_VERSION = 'v2';
const STATE_STORE = 'installation-states';

type AuthVersion = typeof SLACK_AUTH_VERSION;

export const createSlackApp = (db: Firestore | null, env: Env, logger: Logger) => {
    const clientConfig = createSlackClientConfig(env);

    const installStoreHandler: InstallationStore | undefined = db
        ? {
              storeInstallation: async (installation) => {
                  logger.info('Storing Slack app installation');

                  if (installation.isEnterpriseInstall && installation.enterprise) {
                      const docId = installation.enterprise.id;
                      await db.collection(INSTALLATION_PATH).doc(docId).set({ cred: installation });
                      return;
                  }

                  if (installation.team) {
                      const docId = installation.team.id;
                      await db.collection(INSTALLATION_PATH).doc(docId).set({ cred: installation });
                      return;
                  }

                  throw new Error('Failed saving installation data to installationStore');
              },
              fetchInstallation: async (installQuery) => {
                  logger.debug('Fetching Slack app installation');

                  if (installQuery.isEnterpriseInstall && installQuery.enterpriseId) {
                      const installation = db.collection(INSTALLATION_PATH).doc(installQuery.enterpriseId);
                      return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
                  }

                  if (installQuery.teamId) {
                      const installation = db.collection(INSTALLATION_PATH).doc(installQuery.teamId);
                      return (await installation.get()).data()?.cred as Installation<AuthVersion, boolean>;
                  }

                  throw new Error('Failed fetching installation');
              },
          }
        : undefined;

    const stateStoreHandler: StateStore | undefined = db
        ? {
              generateStateParam: async (installOptions, now) => {
                  const stateToken = nonceGenerator();
                  await db.collection(STATE_STORE).doc(stateToken).set({ installOptions, date: now });
                  return stateToken;
              },
              verifyStateParam: async (_now, state) => {
                  return (await db.collection(STATE_STORE).doc(state).get()).data()
                      ?.installOptions as InstallURLOptions;
              },
          }
        : undefined;

    const slackBoltApp = new App({
        ...clientConfig,
        installationStore: !clientConfig.token ? installStoreHandler : undefined,
        installerOptions: {
            authVersion: SLACK_AUTH_VERSION,
            stateStore: !clientConfig.token ? stateStoreHandler : undefined,
        },
    });

    return {
        slackBoltApp,
        slackWebClient: slackBoltApp.client as webApi.WebClient,
    };
};
