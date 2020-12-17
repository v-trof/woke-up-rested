import functions = require('firebase-functions');
import admin = require('firebase-admin');
admin.initializeApp();

type Status = { pressure: boolean };

const sendDeviceStatus = async (deviceId: string, status: Status) => {
    const pairDoc = await admin.firestore().collection(`/pair-device-user/`).doc(deviceId).get();
    const user = pairDoc.data() as { email: string };
    if (!user || !user.email) {
        functions.logger.log(`[${deviceId}] unowned device, skipping state push`);
        return null;
    }

    functions.logger.log(`[${deviceId}] got user = ${user.email}`);

    const userDoc = await admin.firestore().collection(`/user/`).doc(user.email).get();
    const userData = userDoc.data() as { tokens: string[] };
    if (!userData || !userData.tokens || userData.tokens.length === 0) {
        functions.logger.log(`[${deviceId}] user hasn't opened the app yet`);
        return null;
    }

    const payload = {
        data: {
            deviceId,
            status: JSON.stringify(status),
        },
    };

    const response = await admin.messaging().sendToDevice(userData.tokens, payload);

    const tokensToRemove = new Set<string>();
    response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
            const badToken = userData.tokens[index];
            functions.logger.error('Failure sending notification to', badToken, error);
            // Cleanup the tokens who are not registered anymore.
            if (
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered'
            ) {
                tokensToRemove.add(badToken);
            }
        }
    });

    userData.tokens = userData.tokens.filter((token) => !tokensToRemove.has(token));

    return userDoc.ref.set(userData);
};

exports.reportStatus = functions.firestore.document('/status/{deviceId}').onUpdate(async (snap, context) => {
    const status = snap.after.data() as Status;
    const deviceId = context.params.deviceId;

    functions.logger.log(`[${deviceId}] Status changed form ${JSON.stringify(snap.before.data())} to ${status}`);

    return sendDeviceStatus(deviceId, status);
});

exports.reportInitialStatus = functions.firestore.document('/status/{deviceId}').onCreate((snap, context) => {
    const status = snap.data() as Status;
    const deviceId = context.params.deviceId;

    functions.logger.log(`[${deviceId}] Status created ${status}`);

    return sendDeviceStatus(deviceId, status);
});
