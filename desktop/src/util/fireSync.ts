import { action, reaction, toJS } from 'mobx';

export const fireSync = async <K extends string, T extends { [key in K]: unknown }>(
    key: K,
    store: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docRef: firebase.default.firestore.DocumentReference<any>,
    defaultValue: T[K],
) => {
    const set = action((data: T[K]) => (store[key] = data));

    const update = action(async () => {
        const doc = await docRef.get();
        const data = doc.exists && doc.data();
        set(data || defaultValue);
    });

    const disposeReaction = reaction(
        () => toJS(store[key]),
        (storeData) => {
            docRef.set(storeData);
        },
    );

    const disposeFirestore = docRef.onSnapshot(update);

    await update();

    return () => {
        disposeFirestore();
        disposeReaction();
    };
};
