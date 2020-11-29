import 'firebase/auth';
import 'firebase/firestore';

import firebase from 'firebase/app';

const firebaseConfig = {
    apiKey: 'AIzaSyBmFvevVP8Nrp5iNsdEPtl01gjTto7Q310',
    authDomain: 'the-bureau-proto.firebaseapp.com',
    databaseURL: 'https://the-bureau-proto.firebaseio.com',
    projectId: 'the-bureau-proto',
    storageBucket: 'the-bureau-proto.appspot.com',
    messagingSenderId: '490885082895',
    appId: '1:490885082895:web:8d19ec230159b6f9d0587a',
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();

export type FirebaseUser = null | { displayName: string | null; email: string | null };

export { app, db, firebase };
