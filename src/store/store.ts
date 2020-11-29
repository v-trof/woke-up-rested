import { action, autorun, observable, toJS } from 'mobx';

import { app, FirebaseUser } from '../api/firebase';

type Store = {
    readyState: {
        auth: boolean;
        debug: boolean;
        app: boolean;
    };

    user: {
        name: string;
        email: string;
    };
};

app.auth().onAuthStateChanged(
    action(async (user: FirebaseUser) => {
        store.user.name = (user && user.displayName) || '';
        store.user.email = (user && user.email) || '';
        store.readyState.auth = true;
    }),
);

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
});

autorun(() => console.log(toJS(store)));
