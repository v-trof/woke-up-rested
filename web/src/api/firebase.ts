import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/messaging';

import firebase from 'firebase/app';

const firebaseConfig = {
    apiKey: 'AIzaSyB6cPOZ9JLUFpd13LNU878GoQOltzUUAMk',
    authDomain: 'woke-up-rested.firebaseapp.com',
    projectId: 'woke-up-rested',
    storageBucket: 'woke-up-rested.appspot.com',
    messagingSenderId: '558131846902',
    appId: '1:558131846902:web:abc839cb50476d730116d7',
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();

export type FirebaseUser = null | { displayName: string | null; email: string | null };

export { app, db, firebase };
