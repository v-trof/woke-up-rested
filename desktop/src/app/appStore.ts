import { action, autorun, observable, reaction, runInAction, toJS } from 'mobx';
import moment from 'moment';
import { v4 as uuidV4 } from 'uuid';

import { app, db, FirebaseUser } from '../api/firebase';
import { fireSync } from '../util/fireSync';

declare global {
    interface Window {
        electronAPI: {
            reportUserToken: (token: string) => void;
        };
    }
}

export type Store = {
    readyState: {
        auth: boolean;
        debug: boolean;
        app: boolean;
    };

    devices: {
        list: string[];
        status: { [id: string]: { pressure: boolean } };

        // util
        dispose: { [id: string]: () => void };
        loading: boolean;
    };

    sleepTime: {
        bedtime: string;
        alarm: string;
    };

    user: {
        name: string;
        email: string;
        token: string;
    };
};

app.auth().onAuthStateChanged(
    action((user: FirebaseUser) => {
        store.user.name = (user && user.displayName) || '';
        store.user.email = (user && user.email) || '';
        store.readyState.auth = true;
    }),
);

const defaultDevices = {
    list: [],
    status: {},

    dispose: {},
    loading: false,
};

const defaultSleepTime = {
    bedtime: '23:00',
    alarm: '9:00',
};

export const store: Store = observable({
    readyState: {
        auth: false,
        debug: true,
        get app(): boolean {
            return store.readyState.auth && store.readyState.debug;
        },
    },
    user: {
        name: '',
        email: '',
        token: '',
    },
    devices: defaultDevices,
    sleepTime: defaultSleepTime,
});

const getUserToken = async (email: string) => {
    const doc = db.collection('email2userToken').doc(email);
    const docValue = await doc.get();

    if (docValue.exists) {
        const data = docValue.data() as { token: string };
        return data.token;
    } else {
        const token = uuidV4();
        await doc.set({ token });
        return token;
    }
};

reaction(
    () => store.user.email,
    async (email) => {
        if (!email) {
            store.devices = defaultDevices;
            store.sleepTime = defaultSleepTime;
            return;
        }

        const token = await getUserToken(email);

        window.electronAPI.reportUserToken(token);

        const doc = await db.collection('userToken2deviceId').doc(token).get();
        const userDevices = doc.exists ? (doc.data() as { bed: string }) : { bed: '' };
        const pairs = { devices: userDevices.bed ? [userDevices.bed] : [] };

        Object.values(store.devices.dispose).forEach((dispose) => dispose());

        for (const id of pairs.devices) {
            store.devices.dispose[id] = await fireSync(
                id,
                store.devices.status,
                app.firestore().collection('deviceStatus').doc(id),
                {
                    pressure: false,
                },
            );
        }

        await fireSync(
            'sleepTime',
            store,
            app.firestore().collection('userToken2sleepTime').doc(token),
            defaultSleepTime,
        );

        runInAction(() => {
            store.user.token = token;
            store.devices.list = pairs.devices;
        });
    },
);

autorun(() => console.log(toJS(store)));
