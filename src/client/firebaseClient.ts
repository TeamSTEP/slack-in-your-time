import * as admin from 'firebase-admin';

// firebase project ID
const PROJ_ID = 'slack-in-your-time';

// initialize firebase in order to access its services
const firebaseApp = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: `https://${PROJ_ID}.firebaseio.com`,
});

// initialize the database and collections
const db = firebaseApp.firestore();

// export them so it can be globally accessed
export { admin, db };
