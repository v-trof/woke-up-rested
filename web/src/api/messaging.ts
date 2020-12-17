import { app, db } from './firebase';

const messaging = app.messaging();

const swUrl = '/firebase-messaging-sw.js';
export const setupMessaging = async (email: string) => {
    const currentToken = await messaging.getToken({
        vapidKey: 'BHsqXp2QlxF67PazIzF-AR3vfskStHb8NH-KRvYFUC2hi4EVDLFdiOYtQaJDoJUn8h12DP6ge802qAC_g9kIRLM',
        serviceWorkerRegistration: await navigator.serviceWorker.register(swUrl),
    });

    const doc = await db.collection('user').doc(email).get();
    const user = doc.exists ? (doc.data() as { tokens: string[] }) : { tokens: [] };
    if (!user.tokens.includes(currentToken)) {
        user.tokens.push(currentToken);
        await db.collection('user').doc(email).set(user);
    }

    return messaging;
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function (registration) {
        console.log('A service worker is active:', registration.active);

        // At this point, you can call methods that require an active
        // service worker, like registration.pushManager.subscribe()
    });
} else {
    console.log('Service workers are not supported.');
}

export const push = async (message: string) => {
    navigator.serviceWorker.ready.then((registration) => {
        console.log('SW NAW');
        if (registration.active === null) {
            return;
        }
        registration.showNotification(message, { icon: '../icons/icon.png' });
    });
};
