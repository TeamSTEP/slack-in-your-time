import * as admin from 'firebase-admin';
import type { Firestore } from '@google-cloud/firestore';
import type { Env } from '../config/env';
import type { Logger } from '../config/logger';

export const createFirebase = (env: Env, logger: Logger): Firestore | null => {
    if (env.SLACK_BOT_TOKEN) {
        logger.info('Single-workspace mode enabled; skipping Firebase initialization');
        return null;
    }

    if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required for multi-workspace OAuth mode');
    }

    const dbUrl = `https://${env.FIREBASE_PROJECT_ID}.firebaseio.com`;

    const firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: dbUrl,
    });

    const db = firebaseApp.firestore();
    db.settings({ ignoreUndefinedProperties: true });

    logger.info({ projectId: env.FIREBASE_PROJECT_ID }, 'Firebase initialized');

    return db;
};
