import * as admin from 'firebase-admin';
import type { Firestore } from '@google-cloud/firestore';

type FirebaseAdmin = typeof admin;

// firebase project ID
const PROJ_ID = 'slack-in-your-time';
const DB_URL = `https://${PROJ_ID}.firebaseio.com`;

// note: this can be re-assigned outside of the code. It's better to create a wrapper class for member protection
export let firestoreDb: Firestore | undefined;
export let firebaseAdmin: FirebaseAdmin | undefined;

export const initializeFirebase = () => {
    // check if it's already initialized or not
    if (!firestoreDb) {
        // initialize firebase in order to access its services
        // note: the env var for `GOOGLE_APPLICATION_CREDENTIALS` must be set (see: https://firebase.google.com/docs/admin/setup#initialize-sdk)
        const firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: DB_URL,
        });

        // initialize the database and collections
        const db = firebaseApp.firestore();

        // database settings
        db.settings({ ignoreUndefinedProperties: true });

        firestoreDb = db;
        firebaseAdmin = admin;

        return { admin, db };
    } else {
        return { admin: firebaseAdmin, db: firestoreDb };
    }
};
