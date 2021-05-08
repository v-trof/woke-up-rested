import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/messaging';

import firebase from 'firebase/app';

const firebaseConfig = {
    apiKey: 'AIzaSyDEYRmeEMHU6L2zXjyry51Q_9jTqN8mXtM',
    authDomain: 'full-time-sleep.firebaseapp.com',
    projectId: 'full-time-sleep',
    storageBucket: 'full-time-sleep.appspot.com',
    messagingSenderId: '326608656307',
    appId: '1:326608656307:web:d1ab37dabdfc0ec5891dc6',
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();

export type FirebaseUser = null | { displayName: string | null; email: string | null };

export { app, db, firebase };
