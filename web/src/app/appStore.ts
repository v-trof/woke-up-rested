import { action, autorun, observable, reaction, runInAction, toJS } from 'mobx';
import moment from 'moment';

import { app, db, FirebaseUser } from '../api/firebase';
import { push, setupMessaging } from '../api/messaging';
import { fireSync } from '../util/fireSync';

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

    user: {
        name: string;
        email: string;
    };

    alarm: moment.Moment | null;
    time: moment.Moment;
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
    },
    devices: defaultDevices,
    time: moment(),
    alarm: null,
});

reaction(
    () => store.user.email,
    async (email) => {
        if (!email) {
            store.devices = defaultDevices;
            store.alarm = null;
        }

        setupMessaging(email).then((messaging) => {
            messaging.onMessage(console.warn);
        });

        const doc = await db.collection('pair-user-device').doc(email).get();
        const pairs = doc.exists ? (doc.data() as { devices: string[] }) : { devices: [] };

        Object.values(store.devices.dispose).forEach((dispose) => dispose());

        for (const id of pairs.devices) {
            store.devices.dispose[id] = await fireSync(
                id,
                store.devices.status,
                app.firestore().collection('status').doc(id),
                {
                    pressure: false,
                },
            );
        }

        runInAction(() => {
            store.devices.list = pairs.devices;

            const alarmStr = localStorage.getItem(`${email}-alarm`);
            if (alarmStr !== null) {
                const alarm = moment(alarmStr);
                if (alarm.isBefore(store.time)) {
                    alarm.day(store.time.get('day'));
                }
                store.alarm = alarm;
            }
        });
    },
);

reaction(
    () => store.alarm,
    (alarm) => {
        if (!alarm) {
            localStorage.removeItem(`${store.user.email}-alarm`);
            return;
        }
        localStorage.setItem(`${store.user.email}-alarm`, alarm.toString());
    },
);

autorun(() => console.log(toJS(store)));

setInterval(() => {
    if (!store.alarm) {
        return;
    }

    const id = store.devices.list[0];
    const status = store.devices.status[id];
    const wakeUp = store.time.clone().add(8, 'hours');

    if (store.alarm.isBefore(store.time) && status.pressure) {
        push('Wake up samurai, we have a project to submit');
    } else if (store.time.isBefore(store.alarm) && wakeUp.isAfter(store.alarm) && !status.pressure) {
        push('Time to go to sleep. If you want to do anything tomorrow');
    }
}, 7000);
