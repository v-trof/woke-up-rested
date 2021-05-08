import { app, firebase } from './firebase';

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
app.auth().languageCode = 'en';

export const googleAuth = async () => {
    app.auth().signInWithPopup(googleAuthProvider);
};

export const logOut = async () => {
    app.auth().signOut();
};
